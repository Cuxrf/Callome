import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import BottomSheetModal from '../components/BottomSheetModal';
import TransitDisplay from '../components/TransitDisplay';
import TransitTransition from '../components/TransitTransition';
import { useProfile } from '../state/ProfileContext';
import { getCachedTransitFeed, getDailyArrivals, getRouteStops, loadTransitFeed, type TransitFeed, type TransitMode } from '../state/transitFeed';
import { imageCachePolicy } from '../Styling/ImageCache';
import { styles } from '../Styling/TransportStyles';

type Section = TransitMode | 'carpool';
type Ride = { id: string; from: string; to: string; when: string; price: string; seats: string; phone: string; driver?: string; joined?: number };
const ridesKey = '@callome/carpool-rides';
const demoAvatars = [
  require('../assets/Carpool/driver-1.webp'),
  require('../assets/Carpool/driver-2.webp'),
  require('../assets/Carpool/driver-3.webp'),
  require('../assets/Carpool/driver-4.webp'),
  require('../assets/Carpool/driver-5.webp'),
  require('../assets/Carpool/driver-6.webp'),
  require('../assets/Carpool/driver-7.webp'),
  require('../assets/Carpool/driver-8.webp'),
  require('../assets/Carpool/driver-9.webp'),
  require('../assets/Carpool/driver-10.webp'),
];
const demoRides: Ride[] = [
  { id: 'demo-1', driver: 'Aiman', from: 'Elmina', to: 'KL Sentral', when: 'Weekdays · 7:15 AM', price: '8.00', seats: '2', phone: '', joined: 1 },
  { id: 'demo-2', driver: 'Nurul', from: 'Setia Alam', to: 'Shah Alam', when: 'Weekdays · 8:00 AM', price: '6.00', seats: '4', phone: '', joined: 2 },
  { id: 'demo-3', driver: 'Daniel', from: 'Bangsar South', to: 'Mid Valley', when: 'Weekdays · 8:30 AM', price: '5.00', seats: '3', phone: '', joined: 1 },
  { id: 'demo-4', driver: 'Kavitha', from: 'Subang Jaya', to: 'Sunway Pyramid', when: 'Weekdays · 9:00 AM', price: '5.00', seats: '4', phone: '', joined: 3 },
  { id: 'demo-5', driver: 'Mei', from: 'Cyberjaya', to: 'Putrajaya Sentral', when: 'Weekdays · 7:45 AM', price: '7.00', seats: '3', phone: '', joined: 2 },
  { id: 'demo-6', driver: 'Hafiz', from: 'Kota Damansara', to: '1 Utama', when: 'Saturday · 10:30 AM', price: '5.00', seats: '4', phone: '', joined: 1 },
  { id: 'demo-7', driver: 'Sara', from: 'Cheras', to: 'KLCC', when: 'Weekdays · 7:30 AM', price: '9.00', seats: '2', phone: '', joined: 1 },
  { id: 'demo-8', driver: 'Jason', from: 'Petaling Jaya', to: 'KL Sentral', when: 'Weekdays · 8:15 AM', price: '7.00', seats: '4', phone: '', joined: 2 },
  { id: 'demo-9', driver: 'Farah', from: 'Puchong', to: 'Bandar Sunway', when: 'Weekdays · 7:50 AM', price: '6.00', seats: '3', phone: '', joined: 1 },
  { id: 'demo-10', driver: 'Arif', from: 'Ampang', to: 'TRX', when: 'Friday · 6:00 PM', price: '8.00', seats: '4', phone: '', joined: 3 },
];

function readRides(stored: string | null): Ride[] {
  if (!stored) return [];
  const value: unknown = JSON.parse(stored);
  return Array.isArray(value) ? value.filter((ride): ride is Ride => !!ride && typeof ride.id === 'string' && typeof ride.from === 'string' && typeof ride.to === 'string') : [];
}

function stationName(name: string): string {
  return name.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase()).replace(/\b(Klcc|Usj|Ss|Kl)\b/g, (word) => word.toUpperCase());
}

export default function TransportPage() {
  const { name, photoUri } = useProfile();
  const [section, setSection] = useState<Section>('lrt');
  const [feeds, setFeeds] = useState<Partial<Record<TransitMode, TransitFeed>>>(() => ({ lrt: getCachedTransitFeed('lrt'), bus: getCachedTransitFeed('bus') }));
  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [routeIds, setRouteIds] = useState<Partial<Record<TransitMode, string>>>({ lrt: 'KJ' });
  const [stopId, setStopId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [posting, setPosting] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [demoJoined, setDemoJoined] = useState<Record<string, number>>({});
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [when, setWhen] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');
  const [scheduleDate, setScheduleDate] = useState(() => new Date());

  useEffect(() => {
    AsyncStorage.getItem(ridesKey).then((stored) => setRides(readRides(stored))).catch(() => Alert.alert('Carpooling', 'Could not load saved rides.'));
  }, []);

  useEffect(() => {
    if (section === 'carpool' || feeds[section]) return;
    let mounted = true;
    setLoading(true);
    setFeedError(false);
    loadTransitFeed(section).then((feed) => {
      if (mounted) { setFeeds((current) => ({ ...current, [section]: feed })); setLoading(false); }
    }).catch(() => { if (mounted) { setFeedError(true); setLoading(false); } });
    return () => { mounted = false; };
  }, [section, feeds, attempt]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      loadTransitFeed('bus').then((bus) => {
        if (!cancelled) setFeeds((current) => ({ ...current, bus }));
      }).catch(() => { /* The Bus tab can retry if preloading fails. */ });
    }, 450);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const feed = section === 'carpool' ? undefined : feeds[section];
  const routes = useMemo(() => feed?.routes.filter((route) => `${route.shortName} ${route.name}`.toLowerCase().includes(query.trim().toLowerCase())) ?? [], [feed, query]);
  const selectedRoute = feed?.routes.find((route) => route.id === routeIds[section as TransitMode]) ?? feed?.routes[0];
  const routeId = selectedRoute?.id ?? null;
  const stops = useMemo(() => feed && routeId ? getRouteStops(feed, routeId) : [], [feed, routeId]);
  const selectedStop = stops.find((stop) => stop.id === stopId);
  const serviceDate = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}T12:00:00`;
  const dailyArrivals = useMemo(() => scheduleOpen && feed && routeId && stopId ? getDailyArrivals(feed, routeId, stopId, new Date(serviceDate)) : [], [scheduleOpen, feed, routeId, stopId, serviceDate]);
  const scheduleHours = useMemo(() => {
    const hours = new Map<string, string[]>();
    for (const time of dailyArrivals) {
      const hour = time.slice(0, 2);
      hours.set(hour, [...(hours.get(hour) ?? []), time]);
    }
    return [...hours];
  }, [dailyArrivals]);
  const routeStops = useMemo(() => {
    const first = Number(stops[0]?.id.match(/\d+$/)?.[0]);
    const last = Number(stops[stops.length - 1]?.id.match(/\d+$/)?.[0]);
    return section === 'lrt' && first > last ? [...stops].reverse() : stops;
  }, [section, stops]);
  const allRides = [...rides, ...demoRides];
  const selectedRide = allRides.find((ride) => ride.id === selectedRideId);
  const selectedRideIndex = selectedRide ? allRides.findIndex((ride) => ride.id === selectedRide.id) : -1;
  const selectedRideJoined = selectedRide ? (demoJoined[selectedRide.id] ?? selectedRide.joined ?? 1) : 0;

  const chooseSection = (next: Section) => {
    if (next === section) return;
    setSection(next); setQuery(''); setStopId(null); setScheduleOpen(false); setPosting(false); setSelectedRideId(null);
  };

  const submitRide = async () => {
    if (!from.trim() || !to.trim() || !when.trim() || !phone.trim() || !Number(price) || !Number(seats)) {
      Alert.alert('Complete your ride', 'Add the locations, departure, price, seats, and contact number.');
      return;
    }
    const ride: Ride = { id: `ride-${Date.now()}`, driver: name, from: from.trim(), to: to.trim(), when: when.trim(), price: Number(price).toFixed(2), seats: seats.trim(), phone: phone.trim(), joined: 1 };
    try {
      const updated = [ride, ...rides];
      await AsyncStorage.setItem(ridesKey, JSON.stringify(updated));
      setRides(updated); setPosting(false);
      setFrom(''); setTo(''); setWhen(''); setPrice(''); setSeats(''); setPhone('');
    } catch { Alert.alert('Could not save ride', 'Please try again.'); }
  };

  const joinRide = async () => {
    if (!selectedRide) return;
    const capacity = Math.max(1, Number(selectedRide.seats) || 1);
    if (selectedRideJoined >= capacity) return;
    const nextJoined = selectedRideJoined + 1;
    if (selectedRide.id.startsWith('demo-')) {
      setDemoJoined((current) => ({ ...current, [selectedRide.id]: nextJoined }));
    } else {
      const updated = rides.map((ride) => ride.id === selectedRide.id ? { ...ride, joined: nextJoined } : ride);
      setRides(updated);
      try { await AsyncStorage.setItem(ridesKey, JSON.stringify(updated)); }
      catch { Alert.alert('Could not join ride', 'Please try again.'); return; }
    }
    setSelectedRideId(null);
    Alert.alert('Ride joined', `You joined the ride to ${selectedRide.to}.`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#202631" /></Pressable>
          <Text style={styles.topBarTitle}>Transport</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Find your way</Text>
          <Text style={styles.subtitle}>Rail, bus, and rides with your neighbours.</Text>
          <View style={styles.sectionTabs} accessibilityRole="tablist">
            {([['lrt', 'LRT', 'train-outline'], ['bus', 'Bus', 'bus-outline'], ['carpool', 'Carpooling', 'car-outline']] as const).map(([id, label, icon]) => (
              <Pressable key={id} onPress={() => chooseSection(id)} accessibilityRole="tab" accessibilityState={{ selected: section === id }} style={[styles.sectionTab, section === id && styles.sectionTabSelected]}>
                <Ionicons name={icon} size={18} color={section === id ? '#FFFFFF' : '#677589'} />
                <Text style={[styles.sectionTabText, section === id && styles.sectionTabTextSelected]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {section !== 'carpool' ? (
            <TransitTransition key={section}>
              {loading && !feed ? <View style={styles.centerState}><ActivityIndicator color="#CD2026" /><Text style={styles.stateText}>Loading {section.toUpperCase()} schedules...</Text></View> : null}
              {feedError && !feed ? <View style={styles.centerState}><Text style={styles.stateText}>Schedules are unavailable right now.</Text><Pressable onPress={() => setAttempt((value) => value + 1)} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable></View> : null}
              {feed ? <>
                <Text style={styles.sectionHeading}>Choose a {section === 'lrt' ? 'line' : 'bus route'}</Text>
                <View style={styles.searchBox}><Ionicons name="search-outline" size={19} color="#7B8795" /><TextInput value={query} onChangeText={setQuery} placeholder="Search routes" placeholderTextColor="#929BA6" style={styles.searchInput} accessibilityLabel="Search transit routes" /></View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeScroller} contentContainerStyle={styles.routeList}>
                  {routes.slice(0, 40).map((route) => <Pressable key={route.id} onPress={() => { if (route.id === routeId) return; setRouteIds((current) => ({ ...current, [section]: route.id })); setStopId(null); setScheduleOpen(false); }} style={styles.vehicleChip} accessibilityRole="button" accessibilityState={{ selected: routeId === route.id }} accessibilityLabel={`${route.name} route`}>
                    <View style={[section === 'lrt' ? styles.trainOutline : styles.busOutline, { borderColor: routeId === route.id ? `#${route.color}` : '#A6B3C3' }]}>
                      {section === 'bus' ? <View style={[styles.busWindow, { borderColor: routeId === route.id ? `#${route.color}` : '#A6B3C3' }]} /> : <View style={styles.trainWindowRow}><View style={[styles.trainWindow, { borderColor: routeId === route.id ? `#${route.color}` : '#A6B3C3' }]} /><View style={[styles.trainWindow, { borderColor: routeId === route.id ? `#${route.color}` : '#A6B3C3' }]} /></View>}
                      <Text style={[styles.vehicleText, { color: routeId === route.id ? `#${route.color}` : '#647184' }]} numberOfLines={1}>{route.shortName}</Text>
                    </View>
                    <View style={styles.vehicleWheels}><View style={[styles.vehicleWheel, { borderColor: routeId === route.id ? `#${route.color}` : '#A6B3C3' }]} /><View style={[styles.vehicleWheel, { borderColor: routeId === route.id ? `#${route.color}` : '#A6B3C3' }]} /></View>
                  </Pressable>)}
                </ScrollView>
                {routes.length === 0 ? <Text style={styles.stateText}>No routes match your search.</Text> : null}
                {selectedRoute ? <TransitTransition key={`${section}-${routeId}`}>
                  <TransitDisplay key={selectedRoute.id} name={selectedRoute.name} color={section === 'lrt' ? `#${selectedRoute.color}` : '#61B7FA'} />
                  <Text style={styles.sectionHeading}>{section === 'lrt' ? 'Stations' : 'Stops'}</Text>
                  <View style={styles.railList}>
                    {routeStops.map((stop, index) => <Pressable key={`${stop.id}-${index}`} onPress={() => { setScheduleDate(new Date()); setStopId(stop.id); setScheduleOpen(true); }} accessibilityRole="button" accessibilityLabel={`${section === 'lrt' ? stop.id : `Stop ${index + 1}`} ${stop.name}, view today's timetable`} style={[styles.railRow, index % 2 === 0 && styles.railRowAlternate]}>
                      <View style={styles.railCodeColumn}><View style={[styles.railTrack, { backgroundColor: `#${selectedRoute.color}`, top: index === 0 ? 27 : 0, bottom: index === routeStops.length - 1 ? 27 : 0 }]} /><View style={[styles.railCode, { backgroundColor: `#${selectedRoute.color}` }]}><Text style={styles.railCodeText}>{section === 'lrt' ? stop.id : String(index + 1)}</Text></View></View>
                      <Text style={styles.railName} numberOfLines={2}>{stationName(stop.name)}</Text>
                      <Ionicons name="chevron-forward" size={17} color="#8792A0" />
                    </Pressable>)}
                  </View>
                </TransitTransition> : null}
              </> : null}
            </TransitTransition>
          ) : (
            <TransitTransition key={section}>
              <View style={styles.carpoolHeadingRow}><View><Text style={styles.sectionHeading}>Neighbourhood rides</Text><Text style={styles.carpoolIntro}>Share a seat and split the journey.</Text></View><Pressable onPress={() => setPosting(true)} style={styles.addButton} accessibilityRole="button"><Ionicons name="add" size={19} color="#FFFFFF" /><Text style={styles.addButtonText}>Post ride</Text></Pressable></View>
              {allRides.map((ride, index) => {
                const isSavedRide = index < rides.length;
                const avatar = isSavedRide
                  ? (photoUri ? { uri: photoUri } : demoAvatars[0])
                  : demoAvatars[index - rides.length];
                const capacity = Math.max(1, Number(ride.seats) || 1);
                const joined = Math.min(capacity, demoJoined[ride.id] ?? ride.joined ?? 1);
                return (
                  <Pressable key={ride.id} style={({ pressed }) => [styles.rideCard, pressed && styles.rideCardPressed]} onPress={() => setSelectedRideId(ride.id)} accessibilityRole="button" accessibilityLabel={`View ride from ${ride.from} to ${ride.to}`}>
                    <View style={styles.rideAvatarWrap}>
                      <Image source={avatar} style={styles.rideAvatar} contentFit="cover" cachePolicy={imageCachePolicy} />
                    </View>
                    <View style={styles.rideCopy}>
                      <Text style={styles.rideDriver}>{ride.driver ?? name}</Text>
                      <Text style={styles.rideRoute}>{ride.from} → {ride.to}</Text>
                      <Text style={styles.rideMeta}>{ride.when}</Text>
                      <Text style={styles.ridePrice}>RM {ride.price} / person</Text>
                      <View style={styles.seatProgressRow}><View style={styles.seatProgressTrack}><View style={[styles.seatProgressFill, { width: `${joined / capacity * 100}%` }]} /></View><Text style={styles.seatProgressText}>{joined}/{capacity}</Text></View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#8995A3" />
                  </Pressable>
                );
              })}
            </TransitTransition>
          )}
        </ScrollView>
        <BottomSheetModal visible={posting && section === 'carpool'} onClose={() => setPosting(false)} sheetStyle={styles.carpoolSheet} closeLabel="Close post ride form">
          <View style={styles.scheduleHandle} />
          <View style={styles.carpoolSheetHeader}><Text style={styles.formTitle}>Offer a ride</Text><Pressable onPress={() => setPosting(false)} style={styles.scheduleClose} accessibilityRole="button" accessibilityLabel="Close post ride form"><Ionicons name="close" size={21} color="#233246" /></Pressable></View>
          <ScrollView contentContainerStyle={styles.carpoolForm} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TextInput style={styles.input} value={from} onChangeText={setFrom} placeholder="Leaving from" placeholderTextColor="#929BA6" accessibilityLabel="Leaving from" />
            <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="Going to" placeholderTextColor="#929BA6" accessibilityLabel="Going to" />
            <TextInput style={styles.input} value={when} onChangeText={setWhen} placeholder="Date and time, e.g. Sat 9:00 AM" placeholderTextColor="#929BA6" accessibilityLabel="Departure date and time" />
            <View style={styles.formRow}><TextInput style={[styles.input, styles.halfInput]} value={price} onChangeText={setPrice} placeholder="RM per person" placeholderTextColor="#929BA6" keyboardType="decimal-pad" accessibilityLabel="Price per person" /><TextInput style={[styles.input, styles.halfInput]} value={seats} onChangeText={setSeats} placeholder="Total seats" placeholderTextColor="#929BA6" keyboardType="number-pad" accessibilityLabel="Total seats" /></View>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Contact number" placeholderTextColor="#929BA6" keyboardType="phone-pad" accessibilityLabel="Contact number" />
            <Pressable onPress={submitRide} style={styles.submitButton} accessibilityRole="button"><Text style={styles.submitText}>Publish ride</Text></Pressable>
          </ScrollView>
        </BottomSheetModal>
        <BottomSheetModal visible={!!selectedRide} onClose={() => setSelectedRideId(null)} sheetStyle={styles.rideDetailSheet} closeLabel="Close ride details">
          {selectedRide ? <>
            <View style={styles.scheduleHandle} />
            <View style={styles.rideDetailHeader}><View style={styles.rideAvatarWrap}><Image source={selectedRideIndex < rides.length ? (photoUri ? { uri: photoUri } : demoAvatars[0]) : demoAvatars[selectedRideIndex - rides.length]} style={styles.rideAvatar} contentFit="cover" cachePolicy={imageCachePolicy} /></View><View style={styles.rideDetailHeading}><Text style={styles.rideDriver}>{selectedRide.driver ?? name}</Text><Text style={styles.rideDetailTitle}>{selectedRide.from} → {selectedRide.to}</Text></View><Pressable onPress={() => setSelectedRideId(null)} style={styles.scheduleClose} accessibilityRole="button" accessibilityLabel="Close ride details"><Ionicons name="close" size={21} color="#233246" /></Pressable></View>
            <View style={styles.rideDetailBody}>
              <View style={styles.detailRow}><Ionicons name="time-outline" size={20} color="#CD2026" /><View><Text style={styles.detailLabel}>Departure</Text><Text style={styles.detailValue}>{selectedRide.when}</Text></View></View>
              <View style={styles.detailRow}><Ionicons name="cash-outline" size={20} color="#CD2026" /><View><Text style={styles.detailLabel}>Price</Text><Text style={styles.detailValue}>RM {selectedRide.price} per person</Text></View></View>
              <View style={styles.detailRow}><Ionicons name="people-outline" size={20} color="#CD2026" /><View style={styles.detailGrow}><Text style={styles.detailLabel}>Seats filled</Text><Text style={styles.detailValue}>{selectedRideJoined} of {Math.max(1, Number(selectedRide.seats) || 1)}</Text><View style={styles.detailProgressTrack}><View style={[styles.seatProgressFill, { width: `${Math.min(1, selectedRideJoined / Math.max(1, Number(selectedRide.seats) || 1)) * 100}%` }]} /></View></View></View>
              {selectedRide.phone ? <Pressable onPress={() => Linking.openURL(`tel:${selectedRide.phone.replace(/[^+\d]/g, '')}`)} accessibilityRole="button" style={styles.phoneDetailButton}><Ionicons name="call-outline" size={18} color="#CD2026" /><Text style={styles.phoneDetailText}>{selectedRide.phone}</Text></Pressable> : null}
              <Pressable onPress={joinRide} disabled={selectedRideJoined >= Math.max(1, Number(selectedRide.seats) || 1)} style={[styles.joinButton, selectedRideJoined >= Math.max(1, Number(selectedRide.seats) || 1) && styles.joinButtonDisabled]} accessibilityRole="button"><Text style={styles.joinButtonText}>{selectedRideJoined >= Math.max(1, Number(selectedRide.seats) || 1) ? 'RIDE FULL' : 'JOIN'}</Text></Pressable>
            </View>
          </> : null}
        </BottomSheetModal>
        <BottomSheetModal visible={scheduleOpen && section !== 'carpool'} onClose={() => setScheduleOpen(false)} sheetStyle={styles.scheduleSheet} closeLabel="Close timetable">
              <View style={styles.scheduleHandle} />
              <View style={styles.scheduleSheetHeader}>
                <View style={styles.scheduleSheetTitleBlock}>
                  <Text style={styles.scheduleSheetEyebrow}>TODAY'S SCHEDULE · {scheduleDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</Text>
                  <Text style={styles.scheduleSheetTitle}>{selectedStop ? stationName(selectedStop.name) : 'Station'}</Text>
                  <Text style={styles.scheduleSheetSubtitle}>{section === 'lrt' ? `${selectedStop?.id} · ` : ''}{selectedRoute?.name}</Text>
                </View>
                <Pressable onPress={() => setScheduleOpen(false)} style={styles.scheduleClose} accessibilityRole="button" accessibilityLabel="Close timetable"><Ionicons name="close" size={21} color="#233246" /></Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.scheduleScroll} showsVerticalScrollIndicator={false}>
                {scheduleHours.length ? scheduleHours.map(([hour, times]) => <View key={hour} style={styles.scheduleHourBlock}>
                  <Text style={styles.scheduleHour}>{hour}:00 – {hour}:59</Text>
                  <View style={styles.scheduleTimes}>{times.map((time) => <View key={time} style={styles.scheduleTimePill}><Text style={styles.scheduleTimeText}>{time}</Text></View>)}</View>
                </View>) : <Text style={styles.noDepartures}>No {section === 'lrt' ? 'trains' : 'buses'} are scheduled for this stop today.</Text>}
                <Text style={styles.scheduleDisclaimer}>Published schedule · Times may change during service disruptions.</Text>
              </ScrollView>
        </BottomSheetModal>
      </SafeAreaView>
    </View>
  );
}
