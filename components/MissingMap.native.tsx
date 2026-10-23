import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import type { MissingMapProps } from './MissingMap';

export default function MissingMap({ initialCoordinate, focusCoordinate, selectedCoordinate, markers = [], selectedMarkerId, onSelectCoordinate, onSelectMarker }: MissingMapProps) {
  const map = useRef<MapView>(null);

  useEffect(() => {
    if (focusCoordinate) map.current?.animateToRegion({ ...focusCoordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 350);
  }, [focusCoordinate]);

  const fitMarkers = () => {
    if (!focusCoordinate && markers.length > 1) map.current?.fitToCoordinates(markers.map((marker) => marker.coordinate), { edgePadding: { top: 35, right: 35, bottom: 35, left: 35 }, animated: false });
  };

  return (
    <MapView
      ref={map}
      style={{ flex: 1 }}
      initialRegion={{ ...initialCoordinate, latitudeDelta: 0.045, longitudeDelta: 0.045 }}
      onMapReady={() => { if (focusCoordinate) map.current?.animateToRegion({ ...focusCoordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 350); else fitMarkers(); }}
      onPress={onSelectCoordinate ? (event) => onSelectCoordinate(event.nativeEvent.coordinate) : undefined}
    >
      {markers.map((marker) => <Marker key={marker.id} coordinate={marker.coordinate} title={marker.title} description={marker.description} pinColor={selectedMarkerId === marker.id ? '#CD2026' : '#D9554B'} onPress={() => onSelectMarker?.(marker.id)} />)}
      {selectedCoordinate ? <Marker coordinate={selectedCoordinate} title="Last seen here" pinColor="#CD2026" /> : null}
    </MapView>
  );
}
