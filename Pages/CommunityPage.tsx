import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Animated, BackHandler, Easing, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import BottomSheetModal from '../components/BottomSheetModal';
import ProfileAvatar from '../components/ProfileAvatar';
import { styles } from '../Styling/CommunityStyles';
import { brand } from '../Styling/BrandColors';
import { imageCachePolicy } from '../Styling/ImageCache';

type EntryKind = 'Sell' | 'Buy' | 'Request' | 'Offer' | 'Discussion';
type Entry = { id: string; communityId: string; kind: EntryKind; title: string; detail: string; author: string; price?: string; contact?: string; categoryId?: string; image?: number };
type Poll = { id: string; communityId: string; question: string; options: string[]; votes: number[] };

const communities = [
  { id: 'elmina', name: 'Elmina Neighbours', place: 'Shah Alam, Selangor', initials: 'EL', tint: '#FBE9EA', image: require('../assets/Communities/elmina.jpg') },
  { id: 'setia', name: 'Setia Alam Circle', place: 'Shah Alam, Selangor', initials: 'SA', tint: '#FCE9DC', image: require('../assets/Communities/setia.jpg') },
  { id: 'bangsar', name: 'Bangsar Together', place: 'Kuala Lumpur', initials: 'BA', tint: '#E8E2F7', image: require('../assets/Communities/bangsar.jpg') },
  { id: 'cyber', name: 'Cyberjaya Connect', place: 'Cyberjaya, Selangor', initials: 'CY', tint: '#DEF0E9', image: require('../assets/Communities/cyberjaya.jpg') },
] as const;

const initialEntries: Entry[] = [
  { id: 'e1', communityId: 'elmina', kind: 'Sell', title: 'Solid wood coffee table', detail: 'Well kept. Self pickup near Elmina Lakeside Mall.', author: 'Aina', price: 'RM 180', image: require('../assets/Marketplace/coffee-table.webp') },
  { id: 'e6', communityId: 'elmina', kind: 'Sell', title: 'Pair of ceramic table lamps', detail: 'Both work well. Warm white bulbs included.', author: 'Sofia', price: 'RM 85', image: require('../assets/Marketplace/table-lamps.webp') },
  { id: 'e2', communityId: 'elmina', kind: 'Buy', title: 'Looking for a kids bicycle', detail: 'Suitable for ages 6–8. Happy to collect nearby.', author: 'Farid' },
  { id: 'e3', communityId: 'elmina', kind: 'Request', title: 'Help with garden trimming', detail: 'Small front garden, preferably this weekend.', author: 'Nadia' },
  { id: 'e4', communityId: 'elmina', kind: 'Offer', title: 'Weekend maths tutoring', detail: 'Primary school lessons in English or Bahasa Melayu.', author: 'Hakim', categoryId: 'tutoring', price: 'RM 45 / hour', contact: 'hakim@example.com' },
  { id: 'e5', communityId: 'elmina', kind: 'Discussion', title: 'Favourite family spots around Elmina?', detail: 'Share your favourite parks, cafes, and weekend ideas for families.', author: 'Mira' },
  { id: 's1', communityId: 'setia', kind: 'Sell', title: 'Compact white bookshelf', detail: 'Good condition. Pickup around Setia Alam.', author: 'Mei', price: 'RM 90', image: require('../assets/Marketplace/bookshelf.webp') },
  { id: 's6', communityId: 'setia', kind: 'Sell', title: 'Kids bicycle, 6–8 years', detail: 'Recently serviced with working brakes and bell.', author: 'Hafiz', price: 'RM 150', image: require('../assets/Marketplace/kids-bicycle.webp') },
  { id: 's2', communityId: 'setia', kind: 'Buy', title: 'Looking for a study desk', detail: 'Compact size preferred.', author: 'Amir' },
  { id: 's3', communityId: 'setia', kind: 'Request', title: 'Need a pet sitter', detail: 'For a friendly cat over one weekend.', author: 'Liyana' },
  { id: 's4', communityId: 'setia', kind: 'Offer', title: 'Basic bicycle repairs', detail: 'Can help with tyres and brakes.', author: 'Jason', categoryId: 'bicycle', price: 'From RM 25', contact: 'jason@example.com' },
  { id: 's5', communityId: 'setia', kind: 'Discussion', title: 'Weekend activities in Setia Alam', detail: 'What is everyone planning with the family this weekend?', author: 'Siti' },
  { id: 'b1', communityId: 'bangsar', kind: 'Sell', title: 'Indoor plant set', detail: 'Three healthy, easy-care plants with pots.', author: 'Rina', price: 'RM 65', image: require('../assets/Marketplace/indoor-plants.webp') },
  { id: 'b6', communityId: 'bangsar', kind: 'Sell', title: 'Minimal black floor lamp', detail: 'Warm bulb included. Small signs of use on the base.', author: 'Adrian', price: 'RM 75', image: require('../assets/Marketplace/floor-lamp.webp') },
  { id: 'b2', communityId: 'bangsar', kind: 'Buy', title: 'Looking for a floor lamp', detail: 'Any neutral colour is fine.', author: 'Daniel' },
  { id: 'b3', communityId: 'bangsar', kind: 'Request', title: 'Need a language tutor', detail: 'Conversational Bahasa Melayu lessons.', author: 'Chloe' },
  { id: 'b4', communityId: 'bangsar', kind: 'Offer', title: 'Weekend dog walking', detail: 'Available Saturday mornings.', author: 'Arif' },
  { id: 'b5', communityId: 'bangsar', kind: 'Discussion', title: 'Good places for a neighbourhood meetup?', detail: 'Looking for a relaxed spot to meet fellow neighbours.', author: 'Izzah' },
  { id: 'c1', communityId: 'cyber', kind: 'Sell', title: 'Ergonomic mesh office chair', detail: 'Clean and comfortable. Pickup in Cyberjaya.', author: 'Wei', price: 'RM 120', image: require('../assets/Marketplace/office-chair.webp') },
  { id: 'c6', communityId: 'cyber', kind: 'Sell', title: 'Dual monitor arm', detail: 'Desk clamp and mounting screws included.', author: 'Fatin', price: 'RM 70', image: require('../assets/Marketplace/monitor-arm.webp') },
  { id: 'c2', communityId: 'cyber', kind: 'Buy', title: 'Looking for a monitor stand', detail: 'Wood or metal both work.', author: 'Aqil' },
  { id: 'c3', communityId: 'cyber', kind: 'Request', title: 'Laptop setup help', detail: 'Need help moving files to a new laptop.', author: 'Sara' },
  { id: 'c4', communityId: 'cyber', kind: 'Offer', title: 'Resume review', detail: 'Happy to review one page resumes this week.', author: 'Naufal' },
  { id: 'c5', communityId: 'cyber', kind: 'Discussion', title: 'Best walking routes around Cyberjaya?', detail: 'Share your favourite evening route.', author: 'Priya' },
];

const initialPolls: Poll[] = [
  { id: 'p1', communityId: 'elmina', question: 'What should our next neighbourhood meetup be?', options: ['Park picnic', 'Weekend market', 'Morning walk'], votes: [8, 5, 4] },
  { id: 'p2', communityId: 'setia', question: 'Which activity sounds best for the weekend?', options: ['Food swap', 'Family games', 'Community cleanup'], votes: [4, 7, 3] },
  { id: 'p3', communityId: 'bangsar', question: 'What should we discuss next?', options: ['Local cafes', 'Pet friendly places', 'Recycling tips'], votes: [6, 3, 5] },
  { id: 'p4', communityId: 'cyber', question: 'Pick a topic for the next meetup', options: ['Tech sharing', 'Cycling', 'Board games'], votes: [5, 4, 6] },
];

type Section = 'Forum' | 'Marketplace' | 'Services';
type DraftType = 'Marketplace' | 'Services' | 'Forum' | 'Poll';

const sections: Section[] = ['Forum', 'Marketplace', 'Services'];
let sessionCommunityId: string | null = null;

const serviceCategories = [
  { id: 'plumbing', name: 'Plumbing Services', image: require('../assets/Services/plumbing.jpg') },
  { id: 'babysitting', name: 'Babysitter Services', image: require('../assets/Services/babysitting.jpg') },
  { id: 'tutoring', name: 'Tutor Services', image: require('../assets/Services/tutoring.jpg') },
  { id: 'gardening', name: 'Gardening Services', image: require('../assets/Services/gardening.jpg') },
  { id: 'bicycle', name: 'Bicycle Repairs', image: require('../assets/Services/bicycle.jpg') },
] as const;

type ServiceProfile = { id: string; categoryId: string; communityId: string; name: string; title: string; description: string; price: string; contact: string };
const sampleProfiles: ServiceProfile[] = [
  { id: 'azlan', categoryId: 'plumbing', communityId: 'elmina', name: 'Azlan', title: 'Home plumbing repairs', description: 'Tap, sink, and small pipe repairs around the neighbourhood.', price: 'From RM 80', contact: 'azlan@example.com' },
  { id: 'faizal', categoryId: 'plumbing', communityId: 'setia', name: 'Faizal', title: 'Plumbing & leak checks', description: 'Leak checks and basic fixture replacements by appointment.', price: 'From RM 70', contact: 'faizal@example.com' },
  { id: 'nur', categoryId: 'babysitting', communityId: 'elmina', name: 'Nur', title: 'Evening babysitting', description: 'Childcare for short evening visits and weekends.', price: 'From RM 25 / hour', contact: 'nur@example.com' },
  { id: 'mei', categoryId: 'babysitting', communityId: 'setia', name: 'Mei', title: 'Weekend childcare', description: 'Weekend childcare for families in Setia Alam.', price: 'From RM 30 / hour', contact: 'mei@example.com' },
  { id: 'priya', categoryId: 'tutoring', communityId: 'cyber', name: 'Priya', title: 'English tutoring', description: 'One-to-one English lessons for primary school students.', price: 'RM 50 / hour', contact: 'priya@example.com' },
  { id: 'rahim', categoryId: 'gardening', communityId: 'elmina', name: 'Rahim', title: 'Garden care', description: 'Lawn trimming and basic garden maintenance.', price: 'From RM 60', contact: 'rahim@example.com' },
  { id: 'suri', categoryId: 'gardening', communityId: 'bangsar', name: 'Suri', title: 'Plant care', description: 'Help with home plants and small garden spaces.', price: 'From RM 45', contact: 'suri@example.com' },
  { id: 'aqil', categoryId: 'bicycle', communityId: 'cyber', name: 'Aqil', title: 'Bike tune-ups', description: 'Tyre, brake, and chain checks for everyday rides.', price: 'From RM 30', contact: 'aqil@example.com' },
];

function PollOption({ option, percent, voted, selected, onPress }: { option: string; percent: number; voted: boolean; selected: boolean; onPress: () => void }) {
  const fill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fill.stopAnimation();
    fill.setValue(0);
    if (voted) Animated.timing(fill, { toValue: percent, duration: 540, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [fill, percent, voted]);
  return <Pressable style={[styles.pollOption, selected && styles.pollOptionSelected]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Vote for ${option}`} accessibilityState={{ selected }}>
    {voted && <Animated.View style={[styles.pollFill, { width: fill.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />}
    <Text style={styles.pollOptionText}>{option}</Text>
    {voted && <Text style={styles.pollPercent}>{percent}%</Text>}
  </Pressable>;
}

export default function CommunityPage() {
  const [communityId, setCommunityId] = useState<string>(sessionCommunityId ?? 'elmina');
  const [communityFilterId, setCommunityFilterId] = useState<string | null>(sessionCommunityId);
  const [choosingCommunity, setChoosingCommunity] = useState(sessionCommunityId === null);
  const [section, setSection] = useState<Section>('Forum');
  const [entries, setEntries] = useState(initialEntries);
  const [polls, setPolls] = useState(initialPolls);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftType, setDraftType] = useState<DraftType>('Forum');
  const [draftKind, setDraftKind] = useState<EntryKind>('Discussion');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDetail, setDraftDetail] = useState('');
  const [draftPrice, setDraftPrice] = useState('');
  const [draftContact, setDraftContact] = useState('');
  const [draftServiceCategoryId, setDraftServiceCategoryId] = useState<string>('plumbing');
  const [draftOptionA, setDraftOptionA] = useState('');
  const [draftOptionB, setDraftOptionB] = useState('');

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (choosingCommunity && communityFilterId) { setChoosingCommunity(false); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [choosingCommunity, communityFilterId]);

  const community = communities.find((item) => item.id === communityId)!;
  const allProfiles: ServiceProfile[] = [
    ...sampleProfiles,
    ...entries.filter((entry) => entry.kind === 'Offer' && entry.categoryId).map((entry) => ({ id: entry.id, categoryId: entry.categoryId!, communityId: entry.communityId, name: entry.author, title: entry.title, description: entry.detail, price: entry.price ?? 'Ask for a quote', contact: entry.contact ?? 'Contact not provided' })),
  ];
  const inScope = (id: string) => communityFilterId === null || id === communityFilterId;
  const visibleProfiles = allProfiles.filter((profile) => inScope(profile.communityId));
  const visibleEntries = entries.filter((entry) => inScope(entry.communityId) && (
    (section === 'Marketplace' && entry.kind === 'Sell') ||
    (section === 'Forum' && entry.kind === 'Discussion')
  ));
  const visiblePolls = polls.filter((poll) => inScope(poll.communityId));

  const selectCommunity = (id: string) => {
    sessionCommunityId = id;
    setCommunityId(id);
    setCommunityFilterId(id);
    setChoosingCommunity(false);
    setOpenThreadId(null);
  };
  const openComposer = (type?: DraftType) => {
    const nextType = type ?? section;
    setDraftType(nextType);
    setDraftKind(nextType === 'Marketplace' ? 'Sell' : nextType === 'Services' ? 'Offer' : 'Discussion');
    setDraftServiceCategoryId('plumbing');
    setDraftTitle(''); setDraftDetail(''); setDraftPrice(''); setDraftContact(''); setDraftOptionA(''); setDraftOptionB('');
    setComposerOpen(true);
  };
  const saveDraft = () => {
    if (draftType === 'Poll') {
      if (!draftTitle.trim() || !draftOptionA.trim() || !draftOptionB.trim()) { Alert.alert('Add a question and two options'); return; }
      setPolls((current) => [{ id: `poll-${Date.now()}`, communityId, question: draftTitle.trim(), options: [draftOptionA.trim(), draftOptionB.trim()], votes: [0, 0] }, ...current]);
      setSection('Forum');
    } else {
      if (!draftTitle.trim() || !draftDetail.trim()) { Alert.alert('Add a title and description'); return; }
      if (draftType === 'Services' && !draftContact.trim()) { Alert.alert('Add contact details'); return; }
      setEntries((current) => [{ id: `entry-${Date.now()}`, communityId, kind: draftKind, title: draftTitle.trim(), detail: draftDetail.trim(), author: 'You', ...(draftPrice.trim() ? { price: `RM ${draftPrice.trim()}` } : {}), ...(draftType === 'Services' ? { categoryId: draftServiceCategoryId, contact: draftContact.trim() } : {}) }, ...current]);
      setSection(draftType === 'Forum' ? 'Forum' : draftType);
    }
    setCommunityFilterId(communityId);
    setComposerOpen(false);
  };
  const addReply = (entryId: string) => {
    if (!replyText.trim()) return;
    setReplies((current) => ({ ...current, [entryId]: [...(current[entryId] ?? []), replyText.trim()] }));
    setReplyText('');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => { if (choosingCommunity && communityFilterId) setChoosingCommunity(false); else router.back(); }} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color="#202126" /></Pressable>
          <Text style={styles.topBarTitle}>Communities</Text>
          <View style={styles.topBarSpacer} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {choosingCommunity ? (
            <View style={styles.communityPicker}>
              <Text style={styles.pickerTitle}>Select a community</Text>
              <Text style={styles.pickerSubtitle}>Choose your neighbourhood to see local posts and services.</Text>
              {communities.map((item) => <Pressable key={item.id} style={styles.communityPickCard} onPress={() => selectCommunity(item.id)} accessibilityRole="button" accessibilityLabel={`Select ${item.name}, ${item.place}`}>
                <Image source={item.image} style={styles.fillImage} contentFit="cover" cachePolicy={imageCachePolicy} />
                <LinearGradient colors={['#07122233', '#07122255', '#071222D9']} style={styles.fillImage} />
                <View style={styles.communityPickCopy}><Text style={styles.communityPickName}>{item.name}</Text><Text style={styles.communityPickPlace}>{item.place}</Text></View>
                <View style={styles.communityPickArrow}><Ionicons name="arrow-forward" size={23} color="#FFFFFF" /></View>
              </Pressable>)}
            </View>
          ) : <>
            <View style={styles.selectedCommunity}>
              <Image source={community.image} style={styles.selectedCommunityPhoto} contentFit="cover" cachePolicy={imageCachePolicy} />
              <View style={styles.selectedCommunityCopy}><Text style={styles.selectedCommunityName}>{community.name}</Text><Text style={styles.selectedCommunityPlace}>{community.place}</Text></View>
              <Pressable style={styles.selectCommunityButton} onPress={() => setChoosingCommunity(true)} accessibilityRole="button" accessibilityLabel="Select Community"><Text style={styles.selectCommunityText}>Select Community</Text></Pressable>
            </View>
            <View style={styles.sectionTabs} accessibilityRole="tablist">
              {sections.map((item) => <Pressable key={item} style={[styles.sectionTab, section === item && styles.sectionTabActive]} onPress={() => { setSection(item); setOpenThreadId(null); }} accessibilityRole="tab" accessibilityState={{ selected: section === item }}><Text style={[styles.sectionTabText, section === item && styles.sectionTabTextActive]}>{item}</Text></Pressable>)}
            </View>

            {section === 'Forum' && <>
              <Pressable style={styles.threadComposer} onPress={() => openComposer('Forum')} accessibilityRole="button" accessibilityLabel="Start a thread"><ProfileAvatar size={34} /><Text style={styles.threadComposerText}>Start a thread...</Text><Ionicons name="create-outline" size={20} color={brand.blue} /></Pressable>
              <View style={styles.threadList}>
                {visibleEntries.map((entry) => {
                  const entryCommunity = communities.find((item) => item.id === entry.communityId)!;
                  return <View key={entry.id} style={styles.thread}>
                    <View style={styles.threadRail}><View style={[styles.threadAvatar, { backgroundColor: entryCommunity.tint }]}><Text style={styles.threadAvatarText}>{entry.author.charAt(0)}</Text></View></View>
                    <View style={styles.threadContent}>
                      <Text style={styles.threadAuthor}>{entry.author} <Text style={styles.threadMeta}>· {entryCommunity.name}</Text></Text>
                      <Text style={styles.threadTitle}>{entry.title}</Text>
                      <Text style={styles.threadBody}>{entry.detail}</Text>
                      <View style={styles.threadActions}>
                        <Pressable style={styles.threadAction} onPress={() => setLikes((current) => ({ ...current, [entry.id]: !current[entry.id] }))} accessibilityRole="button" accessibilityLabel={`${likes[entry.id] ? 'Unlike' : 'Like'} post`} accessibilityState={{ selected: !!likes[entry.id] }}><Ionicons name={likes[entry.id] ? 'heart' : 'heart-outline'} size={19} color={likes[entry.id] ? '#E44957' : '#68778A'} /><Text style={styles.threadActionText}>{likes[entry.id] ? 1 : 0}</Text></Pressable>
                        <Pressable style={styles.threadAction} onPress={() => { setOpenThreadId(openThreadId === entry.id ? null : entry.id); setReplyText(''); }} accessibilityRole="button" accessibilityLabel="View comments" accessibilityState={{ expanded: openThreadId === entry.id }}><Ionicons name="chatbubble-outline" size={18} color="#68778A" /><Text style={styles.threadActionText}>{replies[entry.id]?.length ?? 0}</Text></Pressable>
                      </View>
                      {openThreadId === entry.id && <View style={styles.replyArea}>
                        {(replies[entry.id] ?? []).map((reply, index) => <View key={`${entry.id}-${index}`} style={styles.replyBubble}><Text style={styles.replyAuthor}>You</Text><Text style={styles.replyBody}>{reply}</Text></View>)}
                        <View style={styles.replyInputRow}><TextInput style={styles.replyInput} value={replyText} onChangeText={setReplyText} placeholder="Write a reply..." placeholderTextColor="#929BA9" accessibilityLabel="Write a reply" /><Pressable style={styles.sendButton} onPress={() => addReply(entry.id)} accessibilityRole="button" accessibilityLabel="Send reply"><Ionicons name="arrow-up" size={18} color="#FFFFFF" /></Pressable></View>
                      </View>}
                    </View>
                  </View>;
                })}
                {visiblePolls.map((poll) => {
                  const pollCommunity = communities.find((item) => item.id === poll.communityId)!;
                  const selected = votes[poll.id];
                  const total = poll.votes.reduce((sum, count) => sum + count, 0) + (selected === undefined ? 0 : 1);
                  return <View key={poll.id} style={styles.thread}>
                    <View style={styles.threadRail}><View style={styles.threadAvatar}><Image source={pollCommunity.image} style={styles.threadAvatarPhoto} contentFit="cover" cachePolicy={imageCachePolicy} /></View></View>
                    <View style={styles.threadContent}>
                      <Text style={styles.threadAuthor}>{pollCommunity.name} <Text style={styles.threadMeta}>· Poll</Text></Text>
                      <Text style={styles.threadTitle}>{poll.question}</Text>
                      <View style={styles.pollOptions}>{poll.options.map((option, index) => {
                        const count = poll.votes[index] + (selected === index ? 1 : 0);
                        const percent = total > 0 ? Math.round(count / total * 100) : 0;
                        return <PollOption key={`${poll.id}-${index}`} option={option} percent={percent} voted={selected !== undefined} selected={selected === index} onPress={() => setVotes((current) => ({ ...current, [poll.id]: index }))} />;
                      })}</View>
                      <Text style={styles.pollFootnote}>{selected === undefined ? 'Tap an option to vote' : `${total} votes · tap to change yours`}</Text>
                      <View style={styles.threadActions}>
                        <Pressable style={styles.threadAction} onPress={() => setLikes((current) => ({ ...current, [poll.id]: !current[poll.id] }))} accessibilityRole="button" accessibilityLabel={`${likes[poll.id] ? 'Unlike' : 'Like'} poll`} accessibilityState={{ selected: !!likes[poll.id] }}><Ionicons name={likes[poll.id] ? 'heart' : 'heart-outline'} size={19} color={likes[poll.id] ? '#E44957' : '#68778A'} /><Text style={styles.threadActionText}>{likes[poll.id] ? 1 : 0}</Text></Pressable>
                        <Pressable style={styles.threadAction} onPress={() => { setOpenThreadId(openThreadId === poll.id ? null : poll.id); setReplyText(''); }} accessibilityRole="button" accessibilityLabel="View comments" accessibilityState={{ expanded: openThreadId === poll.id }}><Ionicons name="chatbubble-outline" size={18} color="#68778A" /><Text style={styles.threadActionText}>{replies[poll.id]?.length ?? 0}</Text></Pressable>
                      </View>
                      {openThreadId === poll.id && <View style={styles.replyArea}>
                        {(replies[poll.id] ?? []).map((reply, index) => <View key={`${poll.id}-${index}`} style={styles.replyBubble}><Text style={styles.replyAuthor}>You</Text><Text style={styles.replyBody}>{reply}</Text></View>)}
                        <View style={styles.replyInputRow}><TextInput style={styles.replyInput} value={replyText} onChangeText={setReplyText} placeholder="Write a comment..." placeholderTextColor="#929BA9" accessibilityLabel="Write a comment" /><Pressable style={styles.sendButton} onPress={() => addReply(poll.id)} accessibilityRole="button" accessibilityLabel="Send comment"><Ionicons name="arrow-up" size={18} color="#FFFFFF" /></Pressable></View>
                      </View>}
                    </View>
                  </View>;
                })}
              </View>
            </>}

            {section === 'Marketplace' && <>
              <View style={styles.sectionActionRow}><View><Text style={styles.sectionHeading}>Marketplace</Text><Text style={styles.sectionDescription}>From your neighbours</Text></View><Pressable style={styles.sectionAddButton} onPress={() => openComposer('Marketplace')} accessibilityRole="button" accessibilityLabel="Create listing"><Ionicons name="add" size={22} color="#FFFFFF" /></Pressable></View>
              <View style={styles.marketGrid}>{visibleEntries.map((entry) => (
                <View key={entry.id} style={styles.marketCard}>
                  <View style={styles.marketImage}>{entry.image ? <Image source={entry.image} style={styles.fillImage} contentFit="cover" cachePolicy={imageCachePolicy} accessibilityLabel={entry.title} /> : <Ionicons name="image-outline" size={27} color="#B5BFCA" />}</View>
                  <View style={styles.marketBody}><Text style={styles.marketTitle} numberOfLines={2}>{entry.title}</Text><Text style={styles.marketPrice}>{entry.price ?? 'Ask for price'}</Text><View style={styles.marketFooter}><View style={styles.marketSellerAvatar}><Text style={styles.marketSellerInitial}>{entry.author.charAt(0)}</Text></View><Text style={styles.marketSellerName} numberOfLines={1}>{entry.author}</Text></View></View>
                </View>
              ))}</View>
            </>}

            {section === 'Services' && <>
              <View style={styles.sectionActionRow}><View><Text style={styles.sectionHeading}>Find a service</Text><Text style={styles.sectionDescription}>Help from people nearby</Text></View><Pressable style={styles.sectionAddButton} onPress={() => openComposer('Services')} accessibilityRole="button" accessibilityLabel="Offer a service"><Ionicons name="add" size={22} color="#FFFFFF" /></Pressable></View>
              <View style={styles.servicePosts}>{visibleProfiles.map((profile) => {
                const category = serviceCategories.find((item) => item.id === profile.categoryId);
                return <View key={profile.id} style={styles.servicePost}>
                  <View style={styles.servicePostImage}>
                    {category && <Image source={category.image} style={styles.fillImage} contentFit="cover" cachePolicy={imageCachePolicy} />}
                    <LinearGradient colors={['#00000000', '#061425AA']} style={styles.fillImage} />
                    <Text style={styles.servicePostCategory}>{category?.name ?? 'Neighbourhood Service'}</Text>
                  </View>
                  <View style={styles.servicePostBody}>
                    <View style={styles.servicePostPerson}><View style={styles.servicePostAvatar}><Text style={styles.servicePostInitial}>{profile.name.charAt(0)}</Text></View><View><Text style={styles.servicePostName}>{profile.name}</Text><Text style={styles.servicePostLocation}>{community.name}</Text></View></View>
                    <Text style={styles.servicePostTitle}>{profile.title}</Text>
                    <Text style={styles.servicePostDescription}>{profile.description}</Text>
                    <View style={styles.servicePostFooter}><Text style={styles.servicePostPrice}>{profile.price}</Text><View style={styles.servicePostContact}><Ionicons name="chatbubble-outline" size={15} color={brand.blueDark} /><Text style={styles.servicePostContactText} numberOfLines={1}>{profile.contact}</Text></View></View>
                  </View>
                </View>;
              })}</View>
              {visibleProfiles.length === 0 && <Text style={styles.emptyProfiles}>No service posts in this community yet.</Text>}
            </>}
          </>}
        </ScrollView>
      </SafeAreaView>

      <BottomSheetModal visible={composerOpen} onClose={() => setComposerOpen(false)} sheetStyle={styles.modalSheet} closeLabel="Close composer">
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{draftType === 'Poll' ? 'Create a poll' : 'Write a post'}</Text>
              <Pressable onPress={() => setComposerOpen(false)} accessibilityRole="button" accessibilityLabel="Close"><Ionicons name="close" size={23} color={brand.black} /></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>POST TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.draftKinds}>
                {(['Marketplace', 'Services', 'Forum', 'Poll'] as const).map((item) => <Pressable key={item} style={[styles.draftKind, draftType === item && styles.draftKindSelected]} onPress={() => { setDraftType(item); setDraftKind(item === 'Marketplace' ? 'Sell' : item === 'Services' ? 'Offer' : 'Discussion'); }} accessibilityRole="button" accessibilityState={{ selected: draftType === item }}><Text style={[styles.draftKindText, draftType === item && styles.draftKindTextSelected]}>{item === 'Poll' ? 'Community Poll' : item}</Text></Pressable>)}
              </ScrollView>
              {draftType === 'Services' && <><Text style={styles.fieldLabel}>SERVICE CATEGORY</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.draftKinds}>{serviceCategories.map((item) => <Pressable key={item.id} style={[styles.draftKind, draftServiceCategoryId === item.id && styles.draftKindSelected]} onPress={() => setDraftServiceCategoryId(item.id)} accessibilityRole="button" accessibilityState={{ selected: draftServiceCategoryId === item.id }}><Text style={[styles.draftKindText, draftServiceCategoryId === item.id && styles.draftKindTextSelected]}>{item.name}</Text></Pressable>)}</ScrollView></>}
              <Text style={styles.fieldLabel}>{draftType === 'Poll' ? 'QUESTION' : 'TITLE'}</Text>
              <TextInput style={styles.fieldInput} value={draftTitle} onChangeText={setDraftTitle} placeholder={draftType === 'Poll' ? 'What would you like to ask?' : draftType === 'Marketplace' ? 'Item name' : draftType === 'Services' ? 'What service do you offer?' : 'What is on your mind?'} placeholderTextColor="#939EAD" maxLength={100} accessibilityLabel={draftType === 'Poll' ? 'Poll question' : 'Post title'} />
              {draftType === 'Poll' ? <>
                <Text style={styles.fieldLabel}>OPTION 1</Text>
                <TextInput style={styles.fieldInput} value={draftOptionA} onChangeText={setDraftOptionA} placeholder="First option" placeholderTextColor="#939EAD" maxLength={60} />
                <Text style={styles.fieldLabel}>OPTION 2</Text>
                <TextInput style={styles.fieldInput} value={draftOptionB} onChangeText={setDraftOptionB} placeholder="Second option" placeholderTextColor="#939EAD" maxLength={60} />
              </> : <>
                <Text style={styles.fieldLabel}>DESCRIPTION</Text>
                <TextInput style={[styles.fieldInput, styles.fieldMultiline]} value={draftDetail} onChangeText={setDraftDetail} placeholder="Share a few details..." placeholderTextColor="#939EAD" multiline textAlignVertical="top" maxLength={500} accessibilityLabel="Post description" />
                {((draftKind === 'Sell' && draftType === 'Marketplace') || draftType === 'Services') && <>
                  <Text style={styles.fieldLabel}>PRICING (RM, OPTIONAL)</Text>
                  <TextInput style={styles.fieldInput} value={draftPrice} onChangeText={setDraftPrice} placeholder="0" placeholderTextColor="#939EAD" keyboardType="decimal-pad" maxLength={10} accessibilityLabel="Price in ringgit" />
                </>}
                {draftType === 'Services' && <>
                  <Text style={styles.fieldLabel}>CONTACT DETAILS</Text>
                  <TextInput style={styles.fieldInput} value={draftContact} onChangeText={setDraftContact} placeholder="How can neighbours reach you?" placeholderTextColor="#939EAD" maxLength={80} accessibilityLabel="Service contact details" />
                </>}
              </>}
              <Text style={styles.modalNote}>Posting in {community.name}. Posts are kept for this session.</Text>
              <Pressable style={styles.modalPublish} onPress={saveDraft} accessibilityRole="button"><Text style={styles.publishText}>{draftType === 'Poll' ? 'Create Poll' : 'Publish Post'}</Text></Pressable>
            </ScrollView>
      </BottomSheetModal>
    </View>
  );
}
