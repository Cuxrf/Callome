import { strFromU8, unzipSync } from 'fflate';

export type TransitMode = 'lrt' | 'bus';
type Row = Record<string, string>;
export type TransitRoute = { id: string; shortName: string; name: string; color: string };
export type TransitCoordinate = { latitude: number; longitude: number };
export type TransitStop = { id: string; name: string; coordinate: TransitCoordinate | null };
type TransitTrip = { id: string; routeId: string; serviceId: string; directionId: string; shapeId: string };
type StopTime = { stopId: string; arrival: number; departure: number; sequence: number };
type Frequency = { start: number; end: number; headway: number };

export type TransitFeed = {
  mode: TransitMode;
  routes: TransitRoute[];
  stops: Map<string, TransitStop>;
  trips: TransitTrip[];
  shapes: Map<string, TransitCoordinate[]>;
  stopTimes: Map<string, StopTime[]>;
  frequencies: Map<string, Frequency[]>;
  calendars: Map<string, Row>;
  checkedAt: Date;
};

const feedUrls: Record<TransitMode, string> = {
  lrt: 'https://api.data.gov.my/gtfs-static/prasarana?category=rapid-rail-kl',
  bus: 'https://api.data.gov.my/gtfs-static/prasarana?category=rapid-bus-kl',
};
const cache: Partial<Record<TransitMode, Promise<TransitFeed>>> = {};
const resolvedFeeds: Partial<Record<TransitMode, TransitFeed>> = {};
const routeStopCache = new WeakMap<TransitFeed, Map<string, TransitStop[]>>();
const dailyArrivalCache = new WeakMap<TransitFeed, Map<string, string[]>>();

function serviceDateKey(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

function parseCsv(text: string): Row[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some(Boolean)) lines.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); lines.push(row); }
  const headers = lines.shift()?.map((item) => item.replace(/^\uFEFF/, '')) ?? [];
  return lines.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

function seconds(value: string): number {
  const [hours, minutes, secs] = value.split(':').map(Number);
  return hours * 3600 + minutes * 60 + (secs || 0);
}

async function downloadFeed(mode: TransitMode): Promise<TransitFeed> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(feedUrls[mode], { signal: controller.signal });
    if (!response.ok) throw new Error(`Transit feed returned ${response.status}`);
    const requiredFiles = new Set(['routes.txt', 'stops.txt', 'trips.txt', 'stop_times.txt', 'frequencies.txt', 'calendar.txt']);
    const zipped = unzipSync(new Uint8Array(await response.arrayBuffer()), { filter: (entry) => requiredFiles.has(entry.name) });
    const file = (name: string) => {
      const bytes = zipped[name];
      if (!bytes) throw new Error(`${name} is missing from the transit feed`);
      return parseCsv(strFromU8(bytes));
    };
    const routes = file('routes.txt')
      .filter((row) => mode === 'bus' || row.category === 'LRT')
      .map((row) => ({ id: row.route_id, shortName: row.route_short_name || row.route_id, name: row.route_long_name || row.route_short_name, color: row.route_color || '20579B' }))
      .sort((a, b) => a.shortName.localeCompare(b.shortName, undefined, { numeric: true }));
    const stops = new Map(file('stops.txt').map((row) => {
      const latitude = Number(row.stop_lat);
      const longitude = Number(row.stop_lon);
      return [row.stop_id, { id: row.stop_id, name: row.stop_name, coordinate: Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null }];
    }));
    const trips = file('trips.txt').map((row) => ({ id: row.trip_id, routeId: row.route_id, serviceId: row.service_id, directionId: row.direction_id, shapeId: row.shape_id }));
    // The transit screens use a stop list, so parsing the large route shapes file only delays Bus loading.
    const orderedShapes = new Map<string, TransitCoordinate[]>();
    const stopTimes = new Map<string, StopTime[]>();
    for (const row of file('stop_times.txt')) {
      const times = stopTimes.get(row.trip_id) ?? [];
      times.push({ stopId: row.stop_id, arrival: seconds(row.arrival_time || row.departure_time), departure: seconds(row.departure_time || row.arrival_time), sequence: Number(row.stop_sequence) });
      stopTimes.set(row.trip_id, times);
    }
    for (const times of stopTimes.values()) times.sort((a, b) => a.sequence - b.sequence);
    const frequencies = new Map<string, Frequency[]>();
    for (const row of file('frequencies.txt')) {
      const entries = frequencies.get(row.trip_id) ?? [];
      entries.push({ start: seconds(row.start_time), end: seconds(row.end_time), headway: Number(row.headway_secs) });
      frequencies.set(row.trip_id, entries);
    }
    return { mode, routes, stops, trips, shapes: orderedShapes, stopTimes, frequencies, calendars: new Map(file('calendar.txt').map((row) => [row.service_id, row])), checkedAt: new Date() };
  } finally { clearTimeout(timeout); }
}

export function loadTransitFeed(mode: TransitMode): Promise<TransitFeed> {
  if (!cache[mode]) cache[mode] = downloadFeed(mode).then((feed) => { resolvedFeeds[mode] = feed; return feed; }).catch((error: unknown) => { delete cache[mode]; throw error; });
  return cache[mode];
}

export function getCachedTransitFeed(mode: TransitMode): TransitFeed | undefined {
  return resolvedFeeds[mode];
}

function activeService(feed: TransitFeed, serviceId: string, date: Date): boolean {
  const calendar = feed.calendars.get(serviceId);
  if (!calendar) return false;
  const localDate = serviceDateKey(date);
  if (calendar.start_date && localDate < calendar.start_date) return false;
  if (calendar.end_date && localDate > calendar.end_date) return false;
  const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  return calendar[day] === '1';
}

export function getRouteStops(feed: TransitFeed, routeId: string): TransitStop[] {
  const today = new Date();
  const key = `${serviceDateKey(today)}:${routeId}`;
  const cached = routeStopCache.get(feed)?.get(key);
  if (cached) return cached;
  const routeTrips = feed.trips.filter((trip) => trip.routeId === routeId);
  const sample = routeTrips.find((trip) => trip.directionId === '0' && activeService(feed, trip.serviceId, today))
    ?? routeTrips.find((trip) => trip.directionId === '0') ?? routeTrips[0];
  if (!sample) return [];
  const seen = new Set<string>();
  const ordered = (feed.stopTimes.get(sample.id) ?? []).flatMap((time) => {
    const stop = feed.stops.get(time.stopId);
    if (!stop || seen.has(stop.id)) return [];
    seen.add(stop.id);
    return [stop];
  });
  const entries = routeStopCache.get(feed) ?? new Map<string, TransitStop[]>();
  entries.set(key, ordered);
  routeStopCache.set(feed, entries);
  return ordered;
}

export function getRouteShape(feed: TransitFeed, routeId: string): TransitCoordinate[] {
  const trip = feed.trips.find((item) => item.routeId === routeId && item.directionId === '0' && feed.shapes.has(item.shapeId))
    ?? feed.trips.find((item) => item.routeId === routeId && feed.shapes.has(item.shapeId));
  const points = trip ? feed.shapes.get(trip.shapeId) ?? [] : [];
  if (points.length < 2) return getRouteStops(feed, routeId).flatMap((stop) => stop.coordinate ? [stop.coordinate] : []);
  const step = Math.max(1, Math.ceil(points.length / 300));
  const sampled = points.filter((_, index) => index % step === 0);
  if (sampled[sampled.length - 1] !== points[points.length - 1]) sampled.push(points[points.length - 1]);
  return sampled;
}

export function getNextArrivals(feed: TransitFeed, routeId: string, stopId: string, now = new Date()): string[] {
  const current = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const departures: number[] = [];
  for (const trip of feed.trips) {
    if (trip.routeId !== routeId || !activeService(feed, trip.serviceId, now)) continue;
    const times = feed.stopTimes.get(trip.id);
    if (!times?.length) continue;
    const atStop = times.find((time) => time.stopId === stopId);
    if (!atStop) continue;
    const frequencyWindows = feed.frequencies.get(trip.id);
    if (frequencyWindows?.length) {
      const offset = atStop.arrival - times[0].departure;
      for (const window of frequencyWindows) {
        if (!window.headway || window.headway < 1) continue;
        const first = Math.max(0, Math.ceil((current - window.start - offset) / window.headway));
        for (let index = first; index < first + 12; index += 1) {
          const time = window.start + index * window.headway + offset;
          if (window.start + index * window.headway >= window.end || time > current + 4 * 3600) break;
          if (time >= current) departures.push(time);
        }
      }
    } else if (atStop.arrival >= current && atStop.arrival <= current + 4 * 3600) departures.push(atStop.arrival);
  }
  return [...new Set([...new Set(departures)].sort((a, b) => a - b).map((time) => {
    const hours = Math.floor(time / 3600) % 24;
    const minutes = Math.floor((time % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }))].slice(0, 5);
}

/** Scheduled arrivals for one station across the selected local service day. */
export function getDailyArrivals(feed: TransitFeed, routeId: string, stopId: string, date = new Date()): string[] {
  const key = `${serviceDateKey(date)}:${routeId}:${stopId}`;
  const cached = dailyArrivalCache.get(feed)?.get(key);
  if (cached) return cached;
  const endOfDay = 24 * 3600;
  const arrivals: number[] = [];
  for (const trip of feed.trips) {
    if (trip.routeId !== routeId || !activeService(feed, trip.serviceId, date)) continue;
    const times = feed.stopTimes.get(trip.id);
    if (!times?.length) continue;
    const atStop = times.find((time) => time.stopId === stopId);
    if (!atStop) continue;
    const windows = feed.frequencies.get(trip.id);
    if (windows?.length) {
      const offset = atStop.arrival - times[0].departure;
      for (const window of windows) {
        if (window.headway < 1) continue;
        for (let departure = window.start; departure < window.end; departure += window.headway) {
          const arrival = departure + offset;
          if (arrival >= 0 && arrival < endOfDay) arrivals.push(arrival);
        }
      }
    } else if (atStop.arrival >= 0 && atStop.arrival < endOfDay) {
      arrivals.push(atStop.arrival);
    }
  }
  const result = [...new Set(arrivals.map((time) => `${String(Math.floor(time / 3600)).padStart(2, '0')}:${String(Math.floor(time % 3600 / 60)).padStart(2, '0')}`))].sort();
  const entries = dailyArrivalCache.get(feed) ?? new Map<string, string[]>();
  entries.set(key, result);
  dailyArrivalCache.set(feed, entries);
  return result;
}
