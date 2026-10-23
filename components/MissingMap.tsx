import { Linking, Pressable, Text, View } from 'react-native';
import { styles } from '../Styling/LostFoundStyles';

export type MapCoordinate = { latitude: number; longitude: number };
export type MissingMapMarker = { id: string; title: string; description: string; coordinate: MapCoordinate };
export type MissingMapProps = {
  initialCoordinate: MapCoordinate;
  focusCoordinate?: MapCoordinate | null;
  selectedCoordinate?: MapCoordinate | null;
  markers?: MissingMapMarker[];
  selectedMarkerId?: string | null;
  onSelectCoordinate?: (coordinate: MapCoordinate) => void;
  onSelectMarker?: (id: string) => void;
};

// The native implementation uses Google Maps or Apple Maps in Expo Go.
// The web fallback keeps the page usable when the native map is unavailable.
export default function MissingMap({ initialCoordinate, markers = [], onSelectMarker }: MissingMapProps) {
  const url = `https://www.openstreetmap.org/#map=15/${initialCoordinate.latitude}/${initialCoordinate.longitude}`;
  return (
    <View style={styles.webMapFallback}>
      <Text style={styles.webMapTitle}>Missing item locations</Text>
      <Text style={styles.webMapDescription}>Open the map to view this area. Use Expo Go to place pins on the map.</Text>
      <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="button" style={styles.webMapButton}><Text style={styles.webMapButtonText}>Open map</Text></Pressable>
      {markers.map((marker) => <Pressable key={marker.id} onPress={() => onSelectMarker?.(marker.id)} accessibilityRole="button" style={styles.webMarker}><Text style={styles.webMarkerText}>{marker.title}</Text></Pressable>)}
    </View>
  );
}
