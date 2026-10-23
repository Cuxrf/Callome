import { StyleSheet } from 'react-native';
import { brand } from './BrandColors';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E9EBEF' },
  bar: { height: 67, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 39, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  profileRing: { width: 31, height: 31, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  profileRingSelected: { borderColor: brand.blue },
  label: { color: '#55606D', fontSize: 11, fontWeight: '600' },
  labelSelected: { color: brand.blue, fontWeight: '800' },
});
