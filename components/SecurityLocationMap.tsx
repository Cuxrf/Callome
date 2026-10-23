import { Linking, Pressable, Text, View } from 'react-native';

export type SecurityMapCoordinate = { latitude: number; longitude: number };

export type SecurityLocationMapProps = {
  coordinate: SecurityMapCoordinate;
  onSelectCoordinate: (coordinate: SecurityMapCoordinate) => void;
};

export default function SecurityLocationMap({ coordinate }: SecurityLocationMapProps) {
  const url = `https://www.openstreetmap.org/#map=14/${coordinate.latitude}/${coordinate.longitude}`;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#E9EFF3' }}>
      <Text style={{ color: '#1C2C40', fontSize: 15, fontWeight: '800', textAlign: 'center' }}>Map selection is available on mobile</Text>
      <Text style={{ color: '#6E7D8D', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6 }}>Open this area in OpenStreetMap, or use the mobile app to tap an exact point.</Text>
      <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="button" style={{ marginTop: 12, borderRadius: 9, backgroundColor: '#CD2026', paddingHorizontal: 14, paddingVertical: 9 }}><Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Open map</Text></Pressable>
    </View>
  );
}
