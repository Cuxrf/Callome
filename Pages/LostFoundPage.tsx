import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import BottomSheetModal from '../components/BottomSheetModal';
import { styles } from '../Styling/LostFoundStyles';
import MissingMap, { type MapCoordinate } from '../components/MissingMap';
import { missingExamples, type MissingExample } from '../state/missingExamples';

type Category = 'missing' | 'seek';
type Listing = { id: string; category: Category; title: string; description: string; phone: string; imageUri: string; createdAt: string; latitude?: number; longitude?: number };
const storageKey = '@callome/lost-found';
const defaultCoordinate = { latitude: 3.139, longitude: 101.6869 };
function coordinateOf(item: Listing | MissingExample): MapCoordinate | null {
  return typeof item.latitude === 'number' && typeof item.longitude === 'number' && Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
    ? { latitude: item.latitude, longitude: item.longitude } : null;
}

function readListings(stored: string | null): Listing[] {
  if (!stored) return [];
  const value: unknown = JSON.parse(stored);
  return Array.isArray(value) ? value.filter((item): item is Listing => !!item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.imageUri === 'string') : [];
}

export default function LostFoundPage() {
  const [category, setCategory] = useState<'missing' | 'map'>('missing');
  const [listings, setListings] = useState<Listing[]>([]);
  const [posting, setPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftCoordinate, setDraftCoordinate] = useState<MapCoordinate | null>(null);
  const [mapFocus, setMapFocus] = useState<MapCoordinate | null>(null);
  const [addingLocationForId, setAddingLocationForId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => setListings(readListings(stored))).catch(() => Alert.alert('Lost & Found', 'Could not load saved items.'));
  }, []);

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.75 });
      if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
    } catch { Alert.alert('Photo unavailable', 'Please try choosing an image again.'); }
  };

  const useCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') { Alert.alert('Location unavailable', 'Allow location access, or tap the map to place a pin.'); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinate = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setDraftCoordinate(coordinate);
      setMapFocus(coordinate);
    } catch { Alert.alert('Location unavailable', 'Tap the map to place a pin instead.'); }
    finally { setLocating(false); }
  };

  const submit = async () => {
    if (saving) return;
    if (!title.trim() || !description.trim() || !phone.trim() || !photoUri || !draftCoordinate) {
      Alert.alert('Complete your post', 'Add a photo, title, description, contact number, and last-seen map pin.');
      return;
    }
    const folder = FileSystem.documentDirectory;
    if (!folder) { Alert.alert('Storage unavailable', 'Could not save the item photo.'); return; }
    setSaving(true);
    const id = `item-${Date.now()}`;
    const destination = `${folder}${id}.jpg`;
    try {
      await FileSystem.copyAsync({ from: photoUri, to: destination });
      const listing: Listing = { id, category: 'missing', title: title.trim(), description: description.trim(), phone: phone.trim(), imageUri: destination, createdAt: new Date().toISOString(), ...draftCoordinate };
      const updated = [listing, ...listings];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      setListings(updated); setPosting(false); setTitle(''); setDescription(''); setPhone(''); setPhotoUri(null); setDraftCoordinate(null); setMapFocus(null);
    } catch { Alert.alert('Could not save item', 'Please try again.'); }
    finally { setSaving(false); }
  };

  const saveLocation = async (id: string) => {
    if (!draftCoordinate || saving) return;
    setSaving(true);
    try {
      const updated = listings.map((item) => item.id === id ? { ...item, ...draftCoordinate } : item);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      setListings(updated);
      setAddingLocationForId(null);
      setDraftCoordinate(null);
      setMapFocus(null);
    } catch { Alert.alert('Could not save location', 'Please try again.'); }
    finally { setSaving(false); }
  };

  const visible: (Listing | MissingExample)[] = [...listings.filter((item) => item.category === 'missing'), ...missingExamples];
  const pinned = visible.flatMap((item) => {
    const coordinate = coordinateOf(item);
    return coordinate ? [{ id: item.id, title: item.title, description: 'image' in item ? item.locationName : item.description, coordinate }] : [];
  });
  const selected = visible.find((item) => item.id === selectedListingId);
  const locationPicker = (height: number) => <>
    <View style={[styles.mapPicker, { height }]}><MissingMap initialCoordinate={mapFocus ?? draftCoordinate ?? pinned[0]?.coordinate ?? defaultCoordinate} focusCoordinate={mapFocus} selectedCoordinate={draftCoordinate} onSelectCoordinate={setDraftCoordinate} /></View>
    <View style={styles.locationFooter}><Text style={styles.locationHint}>{draftCoordinate ? 'Pin placed on map' : 'Tap the map to pin the last-seen spot'}</Text><Pressable onPress={useCurrentLocation} accessibilityRole="button" style={styles.currentLocationButton}><Ionicons name="locate-outline" size={16} color="#CD2026" /><Text style={styles.currentLocationText}>{locating ? 'Locating...' : 'Use my location'}</Text></Pressable></View>
  </>;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#202631" /></Pressable><Text style={styles.topBarTitle}>Lost & Found</Text></View>
        <ScrollView key={category} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Lost & Found</Text>
          <Text style={styles.subtitle}>Help a neighbour reunite with what matters.</Text>
          <View style={styles.tabs} accessibilityRole="tablist">
            <Pressable onPress={() => { setCategory('missing'); setSelectedListingId(null); }} accessibilityRole="tab" accessibilityState={{ selected: category === 'missing' }} style={[styles.tab, category === 'missing' && styles.tabSelected]}><Ionicons name="search-outline" size={17} color={category === 'missing' ? '#FFFFFF' : '#657287'} /><Text style={[styles.tabText, category === 'missing' && styles.tabTextSelected]}>Missing Item</Text></Pressable>
            <Pressable onPress={() => { setCategory('map'); setPosting(false); setAddingLocationForId(null); setDraftCoordinate(null); }} accessibilityRole="tab" accessibilityState={{ selected: category === 'map' }} style={[styles.tab, category === 'map' && styles.tabSelected]}><Ionicons name="map-outline" size={17} color={category === 'map' ? '#FFFFFF' : '#657287'} /><Text style={[styles.tabText, category === 'map' && styles.tabTextSelected]}>Missing Map</Text></Pressable>
          </View>
          {category === 'map' ? <>
            <View style={styles.mapHeader}><Text style={styles.boardTitle}>Missing Map</Text></View>
            <View style={styles.mapCanvas}><MissingMap initialCoordinate={pinned[0]?.coordinate ?? defaultCoordinate} focusCoordinate={selected ? coordinateOf(selected) : null} markers={pinned} selectedMarkerId={selectedListingId} onSelectMarker={setSelectedListingId} /></View>
            {selected ? <View style={styles.selectedCard}>{'image' in selected ? <Image source={selected.image} style={styles.selectedImage} contentFit={selected.contentFit ?? 'contain'} /> : <Image source={{ uri: selected.imageUri }} style={styles.selectedImage} contentFit="cover" />}<View style={styles.selectedCopy}><Text style={styles.posterTitle} numberOfLines={1}>{selected.title}</Text><Text style={styles.posterDescription} numberOfLines={2}>{selected.description}</Text>{'image' in selected ? <Text style={styles.exampleLocation}>{selected.locationName}</Text> : <Pressable onPress={() => Linking.openURL(`tel:${selected.phone.replace(/[^+\d]/g, '')}`)} accessibilityRole="button" style={styles.phoneRow}><Ionicons name="call-outline" size={14} color="#CD2026" /><Text style={styles.phoneText}>{selected.phone}</Text></Pressable>}</View></View> : <Text style={styles.mapTip}>Tap a pin to see its item details.</Text>}
          </> : <>
          <View style={styles.boardHeader}><View><Text style={styles.boardTitle}>Missing items</Text><Text style={styles.boardSubtitle}>Keep an eye out for these.</Text></View><Pressable onPress={() => { setPosting(true); setAddingLocationForId(null); setDraftCoordinate(null); }} accessibilityRole="button" style={styles.postButton}><Ionicons name="add" size={19} color="#FFFFFF" /><Text style={styles.postButtonText}>Post item</Text></Pressable></View>
          <View style={styles.list}>
            {visible.map((item) => <View key={item.id}>
              <View style={styles.poster}>
              <View style={styles.pin} />
              {'image' in item ? <Image source={item.image} style={styles.posterImage} contentFit={item.contentFit ?? 'contain'} /> : <Image source={{ uri: item.imageUri }} style={styles.posterImage} contentFit="cover" />}
              <View style={styles.posterCopy}>
                <Text style={styles.posterTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.posterDescription} numberOfLines={3}>{item.description}</Text>
                {'image' in item ? <Text style={styles.exampleLocation} numberOfLines={1}>{item.locationName}</Text> : <Pressable onPress={() => Linking.openURL(`tel:${item.phone.replace(/[^+\d]/g, '')}`)} accessibilityRole="button" style={styles.phoneRow}><Ionicons name="call-outline" size={14} color="#CD2026" /><Text style={styles.phoneText} numberOfLines={1}>{item.phone}</Text></Pressable>}
                {coordinateOf(item) ? <Pressable onPress={() => { setCategory('map'); setSelectedListingId(item.id); }} accessibilityRole="button" style={styles.viewLocationButton}><Ionicons name="location-outline" size={14} color="#FFFFFF" /><Text style={styles.viewLocationText}>View Location</Text></Pressable> : <Pressable onPress={() => { setPosting(false); setAddingLocationForId(item.id); setDraftCoordinate(null); }} accessibilityRole="button" style={styles.pinLink}><Ionicons name="location-outline" size={13} color="#CD2026" /><Text style={styles.pinLinkText}>Add map pin</Text></Pressable>}
              </View>
              </View>
              {addingLocationForId === item.id && !('image' in item) ? <View style={styles.legacyPicker}><Text style={styles.locationLabel}>Pin where you last saw this item</Text>{locationPicker(200)}<Pressable onPress={() => saveLocation(item.id)} disabled={!draftCoordinate || saving} style={[styles.submitButton, (!draftCoordinate || saving) && styles.disabledButton]}><Text style={styles.submitText}>Save location</Text></Pressable></View> : null}
            </View>)}
          </View>
          </>}
        </ScrollView>
      </SafeAreaView>
      <BottomSheetModal visible={posting} onClose={() => setPosting(false)} sheetStyle={styles.sheet} closeLabel="Close post item form">
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}><Text style={styles.formTitle}>Report a missing item</Text><Pressable onPress={() => setPosting(false)} accessibilityRole="button" accessibilityLabel="Close" style={styles.sheetClose}><Ionicons name="close" size={22} color="#273449" /></Pressable></View>
            <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Pressable onPress={pickPhoto} accessibilityRole="button" style={styles.photoPicker}>{photoUri ? <Image source={{ uri: photoUri }} style={styles.pickedPhoto} contentFit="cover" /> : <><Ionicons name="camera-outline" size={27} color="#7B8BA0" /><Text style={styles.photoPickerText}>Add item photo</Text></>}</Pressable>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Item title" placeholderTextColor="#9AA2AA" accessibilityLabel="Item title" />
              <TextInput style={[styles.input, styles.descriptionInput]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#9AA2AA" accessibilityLabel="Item description" multiline textAlignVertical="top" />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Contact number" placeholderTextColor="#9AA2AA" keyboardType="phone-pad" accessibilityLabel="Contact number" />
              <Text style={styles.locationLabel}>Last seen location</Text>
              {locationPicker(220)}
              <Pressable onPress={submit} disabled={saving} accessibilityRole="button" style={styles.submitButton}><Text style={styles.submitText}>{saving ? 'Saving...' : 'Post item'}</Text></Pressable>
            </ScrollView>
      </BottomSheetModal>
    </View>
  );
}
