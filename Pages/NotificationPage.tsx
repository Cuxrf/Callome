import { useState, type ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../Styling/NotificationStyles';

type Notice = {
  id: string;
  title: string;
  body: string;
  category: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const notices: Notice[] = [
  {
    id: 'road', title: 'Road closure', category: 'Neighbourhood',
    body: 'Example notice: An access road is temporarily closed. Check your community updates before travelling.',
    icon: 'car-outline',
  },
  {
    id: 'parcel', title: 'Parcel ready for collection', category: 'Parcel',
    body: 'Example notice: A parcel has arrived in your collection box and is ready to pick up.',
    icon: 'cube-outline',
  },
  {
    id: 'lift', title: 'Lift maintenance', category: 'Facilities',
    body: 'Example notice: Scheduled maintenance may affect lift access in your building.',
    icon: 'construct-outline',
  },
  {
    id: 'community', title: 'Community announcement', category: 'Community',
    body: 'Example notice: Your management team has shared a new neighbourhood update.',
    icon: 'people-outline',
  },
];

export default function NotificationPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const unreadCount = notices.length - readIds.length;
  const visible = filter === 'all' ? notices : notices.filter((notice) => !readIds.includes(notice.id));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#202631" />
          </Pressable>
          <Text style={styles.topBarTitle}>Notifications</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.heading}>Your updates</Text>
              <Text style={styles.subtitle}>Preview notifications for your neighbourhood</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <View style={styles.filters} accessibilityRole="tablist">
              <Pressable accessibilityRole="tab" accessibilityState={{ selected: filter === 'all' }} onPress={() => setFilter('all')} style={[styles.filter, filter === 'all' && styles.filterSelected]}>
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextSelected]}>All</Text>
              </Pressable>
              <Pressable accessibilityRole="tab" accessibilityState={{ selected: filter === 'unread' }} onPress={() => setFilter('unread')} style={[styles.filter, filter === 'unread' && styles.filterSelected]}>
                <Text style={[styles.filterText, filter === 'unread' && styles.filterTextSelected]}>Unread {unreadCount}</Text>
              </Pressable>
            </View>
            {unreadCount > 0 ? (
              <Pressable accessibilityRole="button" onPress={() => setReadIds(notices.map((notice) => notice.id))}>
                <Text style={styles.markAll}>Mark all read</Text>
              </Pressable>
            ) : null}
          </View>

          {visible.length ? visible.map((notice) => {
            const isRead = readIds.includes(notice.id);
            return (
              <Pressable
                key={notice.id}
                accessibilityRole="button"
                accessibilityLabel={`${notice.title}, ${isRead ? 'read' : 'unread'}`}
                onPress={() => setReadIds((current) => current.includes(notice.id) ? current : [...current, notice.id])}
                style={[styles.notice, isRead && styles.noticeRead]}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={notice.icon} size={23} color="#202631" />
                </View>
                <View style={styles.noticeCopy}>
                  <View style={styles.noticeTop}>
                    <Text style={styles.category}>{notice.category}</Text>
                    {!isRead ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeBody}>{notice.body}</Text>
                </View>
              </Pressable>
            );
          }) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={33} color="#CD2026" />
              <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
              <Text style={styles.emptyBody}>There are no unread updates right now.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
