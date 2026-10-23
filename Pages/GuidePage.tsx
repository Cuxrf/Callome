import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recyclingCategories, recyclingItems } from '../state/guideContent';
import { styles } from '../Styling/GuideStyles';
import { imageCachePolicy } from '../Styling/ImageCache';

const categoryIcons = {
  paper: require('../assets/Icons/Recycling/paper.webp'),
  glass: require('../assets/Icons/Recycling/glass.webp'),
  containers: require('../assets/Icons/Recycling/containers.webp'),
} as const;

export default function GuidePage() {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recyclingItems.slice(0, 6);
    return recyclingItems.filter((item) => `${item.name} ${item.keywords ?? ''}`.toLowerCase().includes(term));
  }, [search]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color="#17283F" />
          </Pressable>
          <Text style={styles.topTitle}>Recycling Guide</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.simpleIntro}>
            <Text style={styles.simpleTitle}>Recycle it right</Text>
            <Text style={styles.simpleDescription}>See the main categories or search for an everyday item.</Text>
          </View>

          <Text style={styles.sectionTitle}>Recycling categories</Text>
          <View style={styles.categoryGrid}>
            {recyclingCategories.map((category) => (
              <View key={category.id} style={styles.categoryTile}>
                <Image source={categoryIcons[category.id]} style={styles.categoryImage} contentFit="contain" cachePolicy={imageCachePolicy} />
                <Text style={styles.categoryTileTitle}>{category.title}</Text>
                <Text style={styles.categoryTileBin}>{category.bin}</Text>
              </View>
            ))}
          </View>

          <View style={styles.lookupHeading}><Text style={styles.sectionTitle}>Where does it go?</Text></View>
          <View style={styles.searchBox}><Ionicons name="search-outline" size={20} color="#64758A" /><TextInput value={search} onChangeText={setSearch} placeholder="Search battery, bottle, pizza box..." placeholderTextColor="#9BA6B3" style={styles.searchInput} accessibilityLabel="Search recycling items" returnKeyType="search" />{search ? <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search"><Ionicons name="close-circle" size={19} color="#9BA6B3" /></Pressable> : null}</View>
          <Text style={styles.resultsLabel}>{search.trim() ? `${results.length} MATCH${results.length === 1 ? '' : 'ES'}` : 'COMMON ITEMS'}</Text>
          {results.length ? results.map((item) => {
            const category = recyclingCategories.find((entry) => entry.id === item.category);
            const label = category?.title ?? (item.category === 'special' ? 'Special collection' : 'General waste');
            const color = category?.color ?? (item.category === 'special' ? '#7A669D' : '#697684');
            return <View key={item.name} style={styles.resultRow}><View style={[styles.resultDot, { backgroundColor: color }]} /><View style={styles.resultCopy}><Text style={styles.resultName}>{item.name}</Text><Text style={styles.resultNote}>{item.note}</Text></View><Text style={[styles.resultCategory, { color }]}>{label}</Text></View>;
          }) : <View style={styles.emptyBox}><Ionicons name="search-outline" size={25} color="#8794A3" /><Text style={styles.emptyTitle}>No item found</Text><Text style={styles.emptyDescription}>Try a simpler name or check your local collection rules.</Text></View>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
