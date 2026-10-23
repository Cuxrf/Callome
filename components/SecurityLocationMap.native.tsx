import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import type { SecurityLocationMapProps } from './SecurityLocationMap';

export default function SecurityLocationMap({ coordinate, onSelectCoordinate }: SecurityLocationMapProps) {
  const map = useRef<MapView>(null);

  useEffect(() => {
    map.current?.animateToRegion({ ...coordinate, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 300);
  }, [coordinate]);

  return (
    <MapView
      ref={map}
      style={{ flex: 1 }}
      initialRegion={{ ...coordinate, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
      onPress={(event) => onSelectCoordinate(event.nativeEvent.coordinate)}
    >
      <Marker coordinate={coordinate} title="Selected location" pinColor="#CD2026" />
    </MapView>
  );
}
