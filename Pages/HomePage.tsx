import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import ProfileAvatar from '../components/ProfileAvatar';
import { useProfile } from '../state/ProfileContext';
import { useChooseProfilePhoto } from '../state/useChooseProfilePhoto';
import { styles } from '../Styling/HomeStyles';
import { imageCachePolicy } from '../Styling/ImageCache';

const homeServices = [
  { id: 'parcel', title: 'Parcel', image: require('../assets/Icons/parcel.webp') },
  { id: 'book', title: 'Book', image: require('../assets/Icons/book.webp') },
  { id: 'community', title: 'Community', image: require('../assets/Icons/community.webp') },
  { id: 'report', title: 'Report', image: require('../assets/Icons/report.webp') },
  { id: 'transport', title: 'Transport', image: require('../assets/Icons/bus.webp') },
  { id: 'lost-found', title: 'Lost & Found', image: require('../assets/Icons/lost-found.webp') },
  { id: 'guide', title: 'Guide', image: require('../assets/Icons/guide.webp') },
] as const;

function openService(id: string, title: string) {
  if (id === 'parcel') router.push('/parcel');
  else if (id === 'book') router.push('/book');
  else if (id === 'community') router.push('/community');
  else if (id === 'report') router.push('/report');
  else if (id === 'transport') router.push('/transport');
  else if (id === 'lost-found') router.push('/lost-found');
  else if (id === 'guide') router.push('/guide');
  else Alert.alert(`${title} is coming soon`, 'This service is being prepared.');
}

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const { name } = useProfile();
  const choosePhoto = useChooseProfilePhoto();
  const searchRef = useRef<TextInput>(null);
  const { focusSearch } = useLocalSearchParams<{ focusSearch?: string }>();
  useEffect(() => { if (focusSearch) searchRef.current?.focus(); }, [focusSearch]);
  const [search, setSearch] = useState('');
  const matchingServices = homeServices.filter((service) => service.title.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="never">
          <LinearGradient colors={['#050505', '#141414', '#2A2A2A', '#777777', '#FFFFFF']} locations={[0, 0.28, 0.52, 0.8, 1]} style={[styles.hero, { height: 280 + insets.top, paddingTop: 13 + insets.top }]}>
            <Image source={require('../assets/Illustrations/home-neighborhood.webp')} style={styles.heroBackground} contentFit="cover" blurRadius={8} cachePolicy={imageCachePolicy} priority="high" accessibilityIgnoresInvertColors />
            <LinearGradient colors={['rgba(0, 0, 0, 0.62)', 'rgba(0, 0, 0, 0.46)', 'rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.10)']} locations={[0, 0.36, 0.7, 1]} style={styles.heroTint} pointerEvents="none" />
            <View style={styles.profileRow}>
              <View style={styles.profileIdentity}>
                <Pressable style={styles.avatarCircle} onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Choose profile photo"><ProfileAvatar size={26} /></Pressable>
                <Text style={styles.greeting} numberOfLines={1}>Hello, {name}</Text>
              </View>
              <Pressable style={styles.notificationButton} onPress={() => router.push('/notifications')} accessibilityRole="button" accessibilityLabel="Notifications">
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </Pressable>
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={22} color="#6A7078" />
              <TextInput
                ref={searchRef}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search services..."
                placeholderTextColor="#989DA4"
                returnKeyType="search"
                onSubmitEditing={() => matchingServices.length === 1 ? openService(matchingServices[0].id, matchingServices[0].title) : undefined}
                accessibilityLabel="Search services"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={19} color="#989DA4" />
                </Pressable>
              )}
            </View>
          </LinearGradient>

          <View style={styles.servicesArea}>
            <Text style={styles.servicesHeading}>Accessibility</Text>
            <View style={styles.serviceGrid}>
              {matchingServices.map((service) => (
                <Pressable key={service.id} style={styles.serviceTile} onPress={() => openService(service.id, service.title)} accessibilityRole="button" accessibilityLabel={`Open ${service.title}`}>
                  <Image source={service.image} style={styles.serviceImage} contentFit="contain" cachePolicy={imageCachePolicy} priority="high" accessibilityIgnoresInvertColors />
                  <Text style={styles.serviceLabel} numberOfLines={2}>{service.title}</Text>
                </Pressable>
              ))}
              {search.length === 0 && (
                <Pressable style={styles.serviceTile} onPress={() => Alert.alert('All services', 'Explore the services shown on this page.')} accessibilityRole="button" accessibilityLabel="View all services">
                  <Image source={require('../assets/Icons/view-all.webp')} style={styles.serviceImage} contentFit="contain" cachePolicy={imageCachePolicy} priority="high" accessibilityIgnoresInvertColors />
                  <Text style={styles.serviceLabel}>View All</Text>
                </Pressable>
              )}
            </View>
            {matchingServices.length === 0 && <Text style={styles.emptySearch}>No services match “{search}”.</Text>}
          </View>
        </ScrollView>
    </View>
  );
}
