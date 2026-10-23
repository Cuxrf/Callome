import { Linking, Pressable, Text, View } from 'react-native';
import type { TransitCoordinate } from '../state/transitFeed';

export type TransitMapStop = { id: string; name: string; coordinate: TransitCoordinate; nextTime?: string };
export type TransitMapProps = {
  points: TransitCoordinate[];
  stops: TransitMapStop[];
  selectedStopId?: string | null;
  color: string;
  onSelectStop: (id: string) => void;
};

export default function TransitMap({ points, stops, onSelectStop }: TransitMapProps) {
  const center = points[0] ?? stops[0]?.coordinate ?? { latitude: 3.139, longitude: 101.6869 };
  return <View style={{ flex: 1, backgroundColor: '#EAF1F7', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
    <Text style={{ color: '#52657B', fontSize: 12, textAlign: 'center' }}>Open the route map in your browser, or use Expo Go for an interactive map.</Text>
    <Pressable onPress={() => Linking.openURL(`https://www.openstreetmap.org/#map=13/${center.latitude}/${center.longitude}`)} style={{ backgroundColor: '#CD2026', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9, marginTop: 12 }}><Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Open map</Text></Pressable>
    {stops.slice(0, 3).map((stop) => <Pressable key={stop.id} onPress={() => onSelectStop(stop.id)} style={{ paddingTop: 8 }}><Text style={{ color: '#CD2026', fontSize: 11 }}>{stop.name}</Text></Pressable>)}
  </View>;
}
