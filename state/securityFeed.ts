export type SecurityTone = 'clear' | 'watch' | 'danger' | 'unavailable';

export type AirQualityReading = {
  aqi: number | null;
  pm25: number | null;
  label: string;
  guidance: string;
  tone: SecurityTone;
  progress: number;
};

export type SecurityWarning = {
  id: 'flood' | 'earthquake' | 'weather';
  title: string;
  status: string;
  detail: string;
  tone: SecurityTone;
};

export type WarningLocation = {
  label: string;
  terms: string[];
  isMalaysia: boolean;
};

type JsonRecord = Record<string, unknown>;

const DATA_GOV_BASE = 'https://api.data.gov.my';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const REQUEST_TIMEOUT_MS = 12_000;

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function records(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is JsonRecord => Boolean(item) && typeof item === 'object');
  if (value && typeof value === 'object' && Array.isArray((value as JsonRecord).data)) {
    return ((value as JsonRecord).data as unknown[]).filter((item): item is JsonRecord => Boolean(item) && typeof item === 'object');
  }
  return [];
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function airQualityBand(aqi: number): Omit<AirQualityReading, 'aqi' | 'pm25' | 'progress'> {
  if (aqi <= 50) return { label: 'Good', guidance: 'Air quality is suitable for normal outdoor activity.', tone: 'clear' };
  if (aqi <= 100) return { label: 'Moderate', guidance: 'Sensitive groups may prefer shorter outdoor activity.', tone: 'watch' };
  if (aqi <= 150) return { label: 'Sensitive groups', guidance: 'Sensitive groups should reduce prolonged outdoor activity.', tone: 'watch' };
  if (aqi <= 200) return { label: 'Unhealthy', guidance: 'Consider reducing prolonged or strenuous outdoor activity.', tone: 'danger' };
  if (aqi <= 300) return { label: 'Very unhealthy', guidance: 'Avoid prolonged outdoor activity where possible.', tone: 'danger' };
  return { label: 'Hazardous', guidance: 'Stay indoors and follow official health advice.', tone: 'danger' };
}

export async function loadAirQuality(latitude: number, longitude: number): Promise<AirQualityReading> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'us_aqi,pm2_5',
    timezone: 'auto',
  });
  const payload = await fetchJson(`${AIR_QUALITY_BASE}?${params.toString()}`) as JsonRecord;
  const current = payload.current && typeof payload.current === 'object' ? payload.current as JsonRecord : {};
  const aqi = numberValue(current.us_aqi);
  if (aqi === null) throw new Error('AQI is missing from the response');

  return {
    aqi: Math.round(aqi),
    pm25: numberValue(current.pm2_5),
    progress: Math.min(Math.max(aqi / 300, 0.04), 1),
    ...airQualityBand(aqi),
  };
}

function unavailable(id: SecurityWarning['id'], title: string): SecurityWarning {
  return { id, title, status: 'Unavailable', detail: 'Could not refresh this public feed. Pull down to try again.', tone: 'unavailable' };
}

async function loadWeatherWarning(location: WarningLocation): Promise<SecurityWarning> {
  const payload = await fetchJson(`${DATA_GOV_BASE}/weather/warning?sort=-warning_issue__issued&limit=20`);
  const now = Date.now();
  const current = records(payload).filter((item) => {
    const validTo = stringValue(item.valid_to);
    return validTo ? new Date(validTo).getTime() >= now : false;
  });
  const active = current.filter((item) => {
    const issue = item.warning_issue && typeof item.warning_issue === 'object' ? item.warning_issue as JsonRecord : {};
    const searchable = [item.heading_en, item.text_en, item.heading_bm, item.text_bm, issue.title_en, issue.title_bm]
      .map((value) => stringValue(value)?.toLowerCase() ?? '').join(' ');
    return location.terms.some((term) => searchable.includes(term.toLowerCase()));
  });

  if (!active.length) {
    return { id: 'weather', title: 'Severe weather', status: 'No local warning', detail: `No current MET Malaysia warning mentions ${location.label}.`, tone: 'clear' };
  }

  const latest = active[0];
  const issue = latest.warning_issue && typeof latest.warning_issue === 'object' ? latest.warning_issue as JsonRecord : {};
  const heading = stringValue(latest.heading_en) ?? stringValue(issue.title_en) ?? 'Weather warning in effect';
  return {
    id: 'weather',
    title: 'Severe weather',
    status: active.length === 1 ? 'Active warning' : `${active.length} active`,
    detail: heading.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
    tone: 'danger',
  };
}

function relativeEventTime(value: string) {
  const hours = Math.max(0, (Date.now() - new Date(value).getTime()) / 3_600_000);
  if (hours < 1) return 'Less than an hour ago';
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function loadEarthquakeWarning(latitude: number, longitude: number): Promise<SecurityWarning> {
  const payload = await fetchJson(`${DATA_GOV_BASE}/weather/warning/earthquake?sort=-utcdatetime&limit=20`);
  const recent = records(payload).filter((item) => {
    const occurredAt = stringValue(item.utcdatetime);
    return occurredAt ? Date.now() - new Date(occurredAt).getTime() <= 7 * 24 * 3_600_000 : false;
  }).sort((a, b) => distanceKm(latitude, longitude, a, 'lat', 'lon') - distanceKm(latitude, longitude, b, 'lat', 'lon'));
  const latest = recent[0];
  const occurredAt = latest && stringValue(latest.utcdatetime);
  if (!latest || !occurredAt) {
    return { id: 'earthquake', title: 'Earthquake', status: 'No nearby alert', detail: 'No earthquake was reported near this location in the past 7 days.', tone: 'clear' };
  }

  const magnitude = numberValue(latest.magdefault);
  const location = stringValue(latest.location_original) ?? stringValue(latest.location) ?? 'the region';
  const distance = distanceKm(latitude, longitude, latest, 'lat', 'lon');
  if (distance > 1000) {
    return { id: 'earthquake', title: 'Earthquake', status: 'No nearby alert', detail: 'No earthquake was reported within 1,000 km in the past 7 days.', tone: 'clear' };
  }

  return {
    id: 'earthquake',
    title: 'Earthquake',
    status: magnitude !== null ? `M${magnitude.toFixed(1)} reported` : 'Recent event',
    detail: `${location} · ${Math.round(distance)} km away · ${relativeEventTime(occurredAt)}`,
    tone: 'watch',
  };
}

function distanceKm(latitude: number, longitude: number, item: JsonRecord, latitudeKey = 'latitude', longitudeKey = 'longitude') {
  const itemLatitude = numberValue(item[latitudeKey]);
  const itemLongitude = numberValue(item[longitudeKey]);
  if (itemLatitude === null || itemLongitude === null) return Number.POSITIVE_INFINITY;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLatitude = radians(itemLatitude - latitude);
  const dLongitude = radians(itemLongitude - longitude);
  const a = Math.sin(dLatitude / 2) ** 2 + Math.cos(radians(latitude)) * Math.cos(radians(itemLatitude)) * Math.sin(dLongitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function loadFloodWarning(latitude: number, longitude: number): Promise<SecurityWarning> {
  const payload = await fetchJson(`${DATA_GOV_BASE}/flood-warning?sort=-water_level_update_datetime&limit=100`);
  const freshCutoff = Date.now() - 24 * 3_600_000;
  const fresh = records(payload).filter((item) => {
    const updatedAt = stringValue(item.water_level_update_datetime);
    return updatedAt ? new Date(updatedAt.replace(' ', 'T')).getTime() >= freshCutoff : false;
  });
  if (!fresh.length) {
    return { id: 'flood', title: 'Flood', status: 'Feed not current', detail: 'No station update was published in the past 24 hours.', tone: 'unavailable' };
  }

  const active = fresh.filter((item) => {
    const indicator = stringValue(item.water_level_indicator)?.toUpperCase();
    return indicator === 'ALERT' || indicator === 'WARNING' || indicator === 'DANGER';
  }).sort((a, b) => distanceKm(latitude, longitude, a) - distanceKm(latitude, longitude, b));

  if (!active.length) {
    return { id: 'flood', title: 'Flood', status: 'No active warning', detail: 'No alert-level station appears in the current public feed.', tone: 'clear' };
  }

  const nearest = active[0];
  const distance = distanceKm(latitude, longitude, nearest);
  if (distance > 100) {
    return { id: 'flood', title: 'Flood', status: 'No nearby warning', detail: 'No alert-level flood station is within 100 km of this location.', tone: 'clear' };
  }
  const indicator = stringValue(nearest.water_level_indicator)?.toLowerCase() ?? 'alert';
  const station = stringValue(nearest.station_name) ?? stringValue(nearest.district) ?? 'monitoring station';
  return {
    id: 'flood',
    title: 'Flood',
    status: `${indicator.charAt(0).toUpperCase()}${indicator.slice(1)}`,
    detail: `${station} · ${Number.isFinite(distance) ? `${Math.round(distance)} km away` : stringValue(nearest.state) ?? 'Malaysia'}`,
    tone: indicator === 'danger' ? 'danger' : 'watch',
  };
}

export async function loadSecurityWarnings(latitude: number, longitude: number, location: WarningLocation): Promise<SecurityWarning[]> {
  if (!location.isMalaysia) {
    return [
      { id: 'flood', title: 'Flood', status: 'Outside coverage', detail: 'Government warning coverage is currently limited to Malaysia.', tone: 'unavailable' },
      { id: 'earthquake', title: 'Earthquake', status: 'Outside coverage', detail: 'Government warning coverage is currently limited to Malaysia.', tone: 'unavailable' },
      { id: 'weather', title: 'Severe weather', status: 'Outside coverage', detail: 'Government warning coverage is currently limited to Malaysia.', tone: 'unavailable' },
    ];
  }
  const results = await Promise.allSettled([
    loadFloodWarning(latitude, longitude),
    loadEarthquakeWarning(latitude, longitude),
    loadWeatherWarning(location),
  ]);
  const fallbacks = [unavailable('flood', 'Flood'), unavailable('earthquake', 'Earthquake'), unavailable('weather', 'Severe weather')];
  return results.map((result, index) => result.status === 'fulfilled' ? result.value : fallbacks[index]);
}
