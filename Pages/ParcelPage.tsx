import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../Styling/ParcelStyles';
import { brand } from '../Styling/BrandColors';

const activePackages = [
  { id: 'PRCL-9319', phone: '+60 12-*** 4812', arrived: '21 Oct 2026', time: '10:42 AM' },
  { id: 'PRCL-6842', phone: '+60 11-*** 2750', arrived: '21 Oct 2026', time: '09:18 AM' },
  { id: 'PRCL-5076', phone: '+60 17-*** 6304', arrived: '20 Oct 2026', time: '04:35 PM' },
  { id: 'PRCL-2185', phone: '+60 13-*** 9126', arrived: '20 Oct 2026', time: '11:06 AM' },
] as const;

const claimedPackages = [
  { id: 'PRCL-1042', detail: 'Claimed in Kuala Lumpur', date: '12 Oct 2026' },
  { id: 'PRCL-0971', detail: 'Claimed in Shah Alam', date: '04 Oct 2026' },
  { id: 'PRCL-0835', detail: 'Claimed in Petaling Jaya', date: '22 Sep 2026' },
] as const;

const parcelImage = require('../assets/Icons/parcel.webp');

export default function ParcelPage() {
  const [selectedList, setSelectedList] = useState<'active' | 'history'>('active');
  const [codes] = useState(() => activePackages.map(() => String(Math.floor(100000 + Math.random() * 900000))));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color="#202126" />
          </Pressable>
          <Text style={styles.topBarTitle}>Parcel</Text>
          <View style={styles.topBarSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.heading}>Parcel</Text>
              <Text style={styles.subtitle}>Your collection box</Text>
            </View>
            <Pressable style={styles.roundButton} onPress={() => router.push('/notifications')} accessibilityRole="button" accessibilityLabel="Parcel notifications">
              <Ionicons name="notifications-outline" size={21} color={brand.black} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.listTabs} accessibilityRole="tablist">
            <Pressable style={[styles.listTab, selectedList === 'active' && styles.listTabSelected]} onPress={() => setSelectedList('active')} accessibilityRole="tab" accessibilityState={{ selected: selectedList === 'active' }}>
              <Text style={[styles.listTabText, selectedList === 'active' && styles.listTabTextSelected]}>Active</Text>
            </Pressable>
            <Pressable style={[styles.listTab, selectedList === 'history' && styles.listTabSelected]} onPress={() => setSelectedList('history')} accessibilityRole="tab" accessibilityState={{ selected: selectedList === 'history' }}>
              <Text style={[styles.listTabText, selectedList === 'history' && styles.listTabTextSelected]}>History</Text>
            </Pressable>
          </View>

          <Text style={styles.listCaption}>{selectedList === 'active' ? `${activePackages.length} Uncollected Parcels` : `${claimedPackages.length} claimed parcels`}</Text>

          {selectedList === 'active' ? activePackages.map((item, index) => (
            <View style={styles.listRow} key={item.id}>
              <Image source={parcelImage} style={styles.parcelIcon} resizeMode="contain" accessibilityIgnoresInvertColors />
              <View style={styles.rowCopy}>
                <Text style={styles.parcelId}>{item.id}</Text>
                <Text style={styles.rowDetail}>{item.phone}</Text>
                <Text style={styles.rowDetail}>{item.arrived} · {item.time}</Text>
              </View>
              <View style={styles.codeColumn}>
                <Text style={styles.codeLabel}>CODE</Text>
                <Text style={styles.codeValue}>{codes[index]}</Text>
              </View>
            </View>
          )) : claimedPackages.map((item) => (
            <View style={styles.listRow} key={item.id}>
              <Image source={parcelImage} style={styles.parcelIcon} resizeMode="contain" accessibilityIgnoresInvertColors />
              <View style={styles.rowCopy}>
                <Text style={styles.parcelId}>{item.id}</Text>
                <Text style={styles.rowDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
