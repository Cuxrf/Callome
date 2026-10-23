import { StyleSheet } from 'react-native';
import { brand } from './BrandColors';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, backgroundColor: '#050505' },
  content: { flexGrow: 1, backgroundColor: '#050505' },
  hero: { height: 280, paddingHorizontal: 21, paddingTop: 13, overflow: 'hidden' },
  heroBackground: { position: 'absolute', top: -10, right: -10, bottom: -10, left: -10, opacity: 0.78 },
  heroTint: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  profileRow: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  greeting: { flex: 1, color: '#FFFFFF', fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: -0.3 },
  notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: brand.red, top: 8, right: 8 },
  searchBar: { height: 52, backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, marginTop: 117, borderWidth: 1, borderColor: '#F0DCDD', shadowColor: '#6B1216', shadowOpacity: 0.08, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  searchInput: { flex: 1, color: brand.black, fontSize: 15, paddingVertical: 0 },
  servicesArea: { flex: 1, paddingTop: 20, paddingHorizontal: 13, paddingBottom: 30, marginTop: -1, backgroundColor: '#FFFFFF' },
  servicesHeading: { color: brand.black, fontSize: 20, fontWeight: '800', letterSpacing: -0.4, marginBottom: 20, paddingHorizontal: 5 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 32 },
  serviceTile: { width: '25%', minHeight: 105, alignItems: 'center', justifyContent: 'flex-start' },
  serviceImage: { width: 71, height: 71 },
  serviceLabel: { color: '#22252A', fontSize: 12, lineHeight: 16, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  emptySearch: { color: '#79808B', fontSize: 14, textAlign: 'center', marginTop: 25 },
});
