import { useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { TransitMapProps } from './TransitMap';

export default function TransitMap({ points, stops, selectedStopId, color, onSelectStop }: TransitMapProps) {
  const map = useRef<MapView>(null);
  const selected = stops.find((stop) => stop.id === selectedStopId);

  useEffect(() => {
    if (selected) map.current?.animateToRegion({ ...selected.coordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 350);
    else if (points.length > 1) map.current?.fitToCoordinates(points, { edgePadding: { top: 35, right: 35, bottom: 35, left: 35 }, animated: true });
  }, [points, selected]);

  return <MapView ref={map} style={{ flex: 1 }} initialRegion={{ ...(points[0] ?? stops[0]?.coordinate ?? { latitude: 3.139, longitude: 101.6869 }), latitudeDelta: 0.11, longitudeDelta: 0.11 }} onMapReady={() => { if (points.length > 1) map.current?.fitToCoordinates(points, { edgePadding: { top: 35, right: 35, bottom: 35, left: 35 }, animated: false }); }}>
    {points.length > 1 ? <Polyline coordinates={points} strokeColor={color} strokeWidth={5} /> : null}
    {stops.map((stop) => <Marker key={stop.id} coordinate={stop.coordinate} title={stop.name} description={stop.nextTime ? `Next scheduled: ${stop.nextTime}` : 'No upcoming scheduled arrival'} pinColor={stop.id === selectedStopId ? '#E1A91C' : color} onPress={() => onSelectStop(stop.id)} />)}
  </MapView>;
}
