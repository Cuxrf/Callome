import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheetModal from '../components/BottomSheetModal';
import SecurityLocationMap, { SecurityMapCoordinate } from '../components/SecurityLocationMap';
import { styles } from '../Styling/SecurityStyles';
import { AirQualityReading, loadAirQuality, loadSecurityWarnings, SecurityWarning, WarningLocation } from '../state/securityFeed';

const warningIcons = {
  flood: require('../assets/Icons/Security/flood.webp'),
  earthquake: require('../assets/Icons/Security/earthquake.webp'),
  weather: require('../assets/Icons/Security/severe-weather.webp'),
};

const fallbackWarnings: SecurityWarning[] = [
  { id: 'flood', title: 'Flood', status: 'Loading', detail: 'Checking the public flood feed…', tone: 'unavailable' },
  { id: 'earthquake', title: 'Earthquake', status: 'Loading', detail: 'Checking MET Malaysia updates…', tone: 'unavailable' },
  { id: 'weather', title: 'Severe weather', status: 'Loading', detail: 'Checking MET Malaysia warnings…', tone: 'unavailable' },
];

type SecurityPlace = SecurityMapCoordinate & WarningLocation;

const fallbackPlace: SecurityPlace = {
  latitude: 3.139,
  longitude: 101.6869,
  label: 'Kuala Lumpur',
  terms: ['Kuala Lumpur'],
  isMalaysia: true,
};

function coordinateLabel(coordinate: SecurityMapCoordinate) {
  return `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`;
}

function looksLikeMalaysia(coordinate: SecurityMapCoordinate) {
  return coordinate.latitude >= 0.8 && coordinate.latitude <= 7.6 && coordinate.longitude >= 99.5 && coordinate.longitude <= 119.5;
}

async function describePlace(coordinate: SecurityMapCoordinate): Promise<SecurityPlace> {
  try {
    const address = (await Location.reverseGeocodeAsync(coordinate))[0];
    if (!address) throw new Error('No address returned');
    const terms = [address.city, address.district, address.subregion, address.region]
      .filter((value): value is string => Boolean(value?.trim()));
    const uniqueTerms = [...new Set(terms)];
    const primary = address.city ?? address.district ?? address.subregion ?? address.region;
    const labelParts = [primary, address.region].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
    const isMalaysia = address.isoCountryCode?.toUpperCase() === 'MY' || address.country?.toLowerCase() === 'malaysia';
    return { ...coordinate, label: labelParts.join(', ') || coordinateLabel(coordinate), terms: uniqueTerms, isMalaysia };
  } catch {
    return { ...coordinate, label: coordinateLabel(coordinate), terms: [], isMalaysia: looksLikeMalaysia(coordinate) };
  }
}

export default function SecurityPage() {
  const [airQuality, setAirQuality] = useState<AirQualityReading | null>(null);
  const [warnings, setWarnings] = useState<SecurityWarning[]>(fallbackWarnings);
  const [refreshing, setRefreshing] = useState(false);
  const [activePlace, setActivePlace] = useState<SecurityPlace>(fallbackPlace);
  const [draftCoordinate, setDraftCoordinate] = useState<SecurityMapCoordinate>(fallbackPlace);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetchPlaceData = useCallback(async (place: SecurityPlace) => {
    setRefreshing(true);
    const [airResult, warningResult] = await Promise.allSettled([
      loadAirQuality(place.latitude, place.longitude),
      loadSecurityWarnings(place.latitude, place.longitude, place),
    ]);
    setAirQuality(airResult.status === 'fulfilled' ? airResult.value : null);
    if (warningResult.status === 'fulfilled') setWarnings(warningResult.value);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const loadInitialLocation = async () => {
      let coordinate: SecurityMapCoordinate = fallbackPlace;
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.granted) {
          const position = await Location.getLastKnownPositionAsync({ maxAge: 15 * 60 * 1000 })
            ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coordinate = position.coords;
        }
      } catch {
        // Use the clearly labelled Kuala Lumpur default when device location is unavailable.
      }
      const place = coordinate === fallbackPlace ? fallbackPlace : await describePlace(coordinate);
      setActivePlace(place);
      setDraftCoordinate(place);
      await fetchPlaceData(place);
    };
    void loadInitialLocation();
  }, [fetchPlaceData]);

  const callEmergency = () => {
    Alert.alert('Call emergency services?', 'This will open your phone dialler with Malaysia’s emergency number, 999.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 999', style: 'destructive', onPress: () => void Linking.openURL('tel:999') },
    ]);
  };

  const callGuard = () => Alert.alert('Guard contact unavailable', 'No neighbourhood guard number has been assigned yet.');

  const useCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Location unavailable', 'Allow location access, or tap a point on the map.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setDraftCoordinate(position.coords);
    } catch {
      Alert.alert('Location unavailable', 'Tap a point on the map instead.');
    } finally {
      setLocating(false);
    }
  };

  const confirmLocation = async () => {
    setLocationPickerOpen(false);
    const place = await describePlace(draftCoordinate);
    setActivePlace(place);
    await fetchPlaceData(place);
  };

  const airTone = airQuality?.tone ?? 'unavailable';

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color="#202631" /></Pressable>
          <Text style={styles.topBarTitle}>Security</Text>
          <View style={styles.topBarSpacer} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void fetchPlaceData(activePlace)} tintColor="#CD2026" colors={['#CD2026']} />}
        >
          <Text style={styles.title}>Security</Text>

          <View style={styles.locationCard}>
            <View style={styles.locationCopy}><Text style={styles.locationEyebrow}>SHOWING DATA FOR</Text><Text style={styles.locationName} numberOfLines={1}>{activePlace.label}</Text><Text style={styles.locationCoordinates}>{coordinateLabel(activePlace)}</Text></View>
            <Pressable onPress={() => { setDraftCoordinate(activePlace); setLocationPickerOpen(true); }} style={styles.selectLocationButton} accessibilityRole="button" accessibilityLabel="Select location on map"><Ionicons name="map-outline" size={17} color="#CD2026" /><Text style={styles.selectLocationText}>Select Location</Text></Pressable>
          </View>

          <View style={styles.emergencyActions}>
            <Pressable onPress={callEmergency} style={styles.emergencyButton} accessibilityRole="button" accessibilityLabel="SOS, call emergency services"><View style={styles.emergencyButtonTop}><Ionicons name="warning-outline" size={23} color="#CD2026" /><Ionicons name="call-outline" size={19} color="#CD2026" /></View><Text style={styles.sosTitle}>SOS</Text><Text style={styles.emergencyDescription}>Call emergency services</Text></Pressable>
            <Pressable onPress={callGuard} style={styles.emergencyButton} accessibilityRole="button" accessibilityLabel="Call nearby guard"><View style={styles.emergencyButtonTop}><Ionicons name="shield-checkmark-outline" size={23} color="#CD2026" /><Ionicons name="call-outline" size={19} color="#CD2026" /></View><Text style={styles.guardTitle}>Call Nearby Guard</Text><Text style={styles.emergencyDescription}>Contact neighbourhood security</Text></Pressable>
          </View>

          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Air quality</Text><Text style={styles.locationLabel}>SELECTED LOCATION</Text></View>
          <View style={[styles.airCard, airTone === 'danger' && styles.airCardDanger]}>
            <Image source={require('../assets/Icons/Security/air-quality.webp')} style={styles.airIcon} contentFit="contain" accessibilityLabel="Air quality" />
            <View style={styles.airCopy}>
              <View style={styles.airStatusRow}><Text style={styles.airValue}>{airQuality?.aqi ?? '—'}</Text><View><Text style={styles.airUnit}>US AQI</Text><Text style={[styles.airStatus, airTone === 'danger' && styles.dangerText]}>{airQuality?.label ?? 'Unavailable'}</Text></View></View>
              <Text style={styles.airDescription}>{airQuality?.guidance ?? 'Could not refresh air quality. Pull down to try again.'}</Text>
              <View style={styles.airTrack}><View style={[styles.airFill, airTone === 'danger' && styles.airFillDanger, { width: `${Math.round((airQuality?.progress ?? 0) * 100)}%` }]} /></View>
              {airQuality?.pm25 !== null && airQuality?.pm25 !== undefined && <Text style={styles.pmText}>PM2.5 {airQuality.pm25.toFixed(1)} µg/m³</Text>}
            </View>
          </View>

          <View style={styles.warningHeading}><Text style={styles.sectionTitle}>Warnings</Text><Text style={styles.warningCaption}>{activePlace.isMalaysia ? 'SELECTED AREA' : 'MALAYSIA ONLY'}</Text></View>
          <View style={styles.warningList}>
            {warnings.map((warning) => {
              const isWatch = warning.tone === 'watch';
              const isDanger = warning.tone === 'danger';
              const isUnavailable = warning.tone === 'unavailable';
              return <View key={warning.id} style={styles.warningCard}><Image source={warningIcons[warning.id]} style={styles.warningIcon} contentFit="contain" accessibilityLabel={`${warning.title} status`} /><View style={styles.warningCopy}><View style={styles.warningTitleRow}><Text style={styles.warningTitle}>{warning.title}</Text><View style={[styles.statusPill, isWatch && styles.statusPillWatch, isDanger && styles.statusPillDanger, isUnavailable && styles.statusPillUnavailable]}><Text style={[styles.statusText, isWatch && styles.statusTextWatch, isDanger && styles.statusTextDanger, isUnavailable && styles.statusTextUnavailable]}>{warning.status}</Text></View></View><Text style={styles.warningDetail} numberOfLines={2}>{warning.detail}</Text></View></View>;
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomSheetModal visible={locationPickerOpen} onClose={() => setLocationPickerOpen(false)} sheetStyle={styles.locationSheet} closeLabel="Close location picker">
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>Select location</Text><Text style={styles.sheetSubtitle}>Tap anywhere on the map to place the pin.</Text></View><Pressable onPress={() => setLocationPickerOpen(false)} style={styles.sheetClose} accessibilityRole="button" accessibilityLabel="Close"><Ionicons name="close" size={22} color="#273449" /></Pressable></View>
        <View style={styles.mapWrap}><SecurityLocationMap coordinate={draftCoordinate} onSelectCoordinate={setDraftCoordinate} /></View>
        <View style={styles.sheetLocationRow}><View style={styles.sheetCoordinateCopy}><Text style={styles.sheetCoordinateLabel}>SELECTED POINT</Text><Text style={styles.sheetCoordinate}>{coordinateLabel(draftCoordinate)}</Text></View><Pressable onPress={() => void useCurrentLocation()} style={styles.currentLocationButton} accessibilityRole="button"><Ionicons name="locate-outline" size={17} color="#CD2026" /><Text style={styles.currentLocationText}>{locating ? 'Locating…' : 'Use my location'}</Text></Pressable></View>
        <Pressable onPress={() => void confirmLocation()} style={styles.confirmLocationButton} accessibilityRole="button"><Text style={styles.confirmLocationText}>Use This Location</Text></Pressable>
      </BottomSheetModal>
    </View>
  );
}
