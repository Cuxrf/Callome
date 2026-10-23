import { useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../Styling/BookStyles';
import { imageCachePolicy } from '../Styling/ImageCache';

const malls = [
  { id: 'suria', name: 'Suria KLCC', location: 'Kuala Lumpur', image: require('../assets/Malls/suria.webp') },
  { id: 'midvalley', name: 'Mid Valley Megamall', location: 'Kuala Lumpur', image: require('../assets/Malls/midvalley.webp') },
  { id: 'sunway', name: 'Sunway Pyramid', location: 'Bandar Sunway', image: require('../assets/Malls/sunway.webp') },
  { id: 'ioi', name: 'IOI City Mall', location: 'Putrajaya', image: require('../assets/Malls/ioi.webp') },
  { id: 'gurney', name: 'Gurney Plaza', location: 'George Town, Penang', image: require('../assets/Malls/gurney.webp') },
  { id: 'citysquare', name: 'Johor Bahru City Square', location: 'Johor Bahru', image: require('../assets/Malls/citysquare.webp') },
] as const;

const times = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
type Step = 'mall' | 'date' | 'time' | 'review';

function getDates() {
  const today = new Date();
  return Array.from({ length: 14 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset + 1);
    return {
      id: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      day: new Intl.DateTimeFormat('en-MY', { weekday: 'short' }).format(date),
      number: date.getDate(),
      month: new Intl.DateTimeFormat('en-MY', { month: 'short' }).format(date),
      full: new Intl.DateTimeFormat('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date),
    };
  });
}

export default function BookPage() {
  const dates = useMemo(getDates, []);
  const [step, setStep] = useState<Step>('mall');
  const [selectedMallId, setSelectedMallId] = useState<string | null>(null);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const transitioning = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const selectedMall = malls.find((mall) => mall.id === selectedMallId);
  const selectedDate = dates.find((date) => date.id === selectedDateId);
  const currentStep = step === 'mall' ? 1 : step === 'date' ? 2 : 3;

  const transitionTo = (next: Step, backwards = false) => {
    if (transitioning.current || next === step) return;
    transitioning.current = true;
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(slide, { toValue: backwards ? 22 : -22, duration: 130, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) { transitioning.current = false; return; }
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      slide.setValue(backwards ? -22 : 22);
      setStep(next);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 230, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 230, useNativeDriver: true }),
      ]).start(() => { transitioning.current = false; });
    });
  };

  const goBack = () => {
    if (step === 'review') transitionTo('time', true);
    else if (step === 'time') transitionTo('date', true);
    else if (step === 'date') transitionTo('mall', true);
    else router.back();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color="#202126" />
          </Pressable>
          <Text style={styles.topBarTitle}>Book</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fade, transform: [{ translateX: slide }] }}>
          <Text style={styles.heading}>{step === 'mall' ? 'Book Parking' : step === 'date' ? 'Choose a date' : step === 'time' ? 'Choose a time' : 'Booking Preview'}</Text>
          {step !== 'mall' && <Text style={styles.description}>
            {step === 'date' ? selectedMall?.name : step === 'time' ? `${selectedMall?.name} · ${selectedDate?.full}` : 'Review your parking plans.'}
          </Text>}

          <View style={styles.progressRow} accessibilityLabel={`Step ${currentStep} of 3`}>
            {['Mall', 'Date', 'Time'].map((label, index) => (
              <View key={label} style={styles.progressItem}>
                <View style={[styles.progressCircle, index + 1 <= currentStep && styles.progressCircleActive]}>
                  {index + 1 < currentStep || step === 'review' ? <Ionicons name="checkmark" size={17} color="#FFFFFF" /> : <Text style={[styles.progressNumber, index + 1 <= currentStep && styles.progressNumberActive]}>{index + 1}</Text>}
                </View>
                <Text style={[styles.progressLabel, index + 1 <= currentStep && styles.progressLabelActive]}>{label}</Text>
                {index < 2 && <View style={[styles.progressLine, index + 1 < currentStep && styles.progressLineActive]} />}
              </View>
            ))}
          </View>

          {step === 'mall' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location In Malaysia</Text>
              <View style={styles.mallList}>
                {malls.map((mall) => (
                  <Pressable
                    key={mall.id}
                    style={[styles.mallRow, selectedMallId === mall.id && styles.mallRowSelected]}
                    onPress={() => { setSelectedMallId(mall.id); setSelectedDateId(null); setSelectedTime(null); transitionTo('date'); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${mall.name}, ${mall.location}`}
                    accessibilityState={{ selected: selectedMallId === mall.id }}
                  >
                    <Image source={mall.image} style={styles.mallPhoto} contentFit="cover" cachePolicy={imageCachePolicy} />
                    <LinearGradient colors={['transparent', 'rgba(5,14,29,0.30)', 'rgba(5,14,29,0.83)']} locations={[0, 0.48, 1]} style={styles.mallShade} />
                    <View style={styles.mallCopy}>
                      <Text style={styles.mallName}>{mall.name}</Text>
                      <Text style={styles.mallLocation}><Ionicons name="location-outline" size={13} /> {mall.location}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 'date' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a date</Text>
              <Text style={styles.sectionHint}>Next 14 days</Text>
              <View style={styles.dateGrid}>
                {dates.map((date) => (
                  <Pressable
                    key={date.id}
                    style={[styles.dateCell, selectedDateId === date.id && styles.dateCellSelected]}
                    onPress={() => { setSelectedDateId(date.id); setSelectedTime(null); transitionTo('time'); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${date.full}`}
                    accessibilityState={{ selected: selectedDateId === date.id }}
                  >
                    <Text style={[styles.dateDay, selectedDateId === date.id && styles.dateTextSelected]}>{date.day}</Text>
                    <Text style={[styles.dateNumber, selectedDateId === date.id && styles.dateTextSelected]}>{date.number}</Text>
                    <Text style={[styles.dateMonth, selectedDateId === date.id && styles.dateTextSelected]}>{date.month}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 'time' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Arrival time</Text>
              <View style={styles.timeGrid}>
                {times.map((time) => (
                  <Pressable
                    key={time}
                    style={[styles.timeCell, selectedTime === time && styles.timeCellSelected]}
                    onPress={() => setSelectedTime(time)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${time}`}
                    accessibilityState={{ selected: selectedTime === time }}
                  >
                    <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>{time}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 'review' && (
            <View style={styles.reviewCard}>
              <View style={styles.reviewImageWrap}>
                {selectedMall && <Image source={selectedMall.image} style={styles.reviewImage} contentFit="cover" cachePolicy={imageCachePolicy} />}
                <LinearGradient colors={['transparent', 'rgba(5,14,29,0.7)']} style={styles.reviewImageShade} />
                <Text style={styles.reviewImageName}>{selectedMall?.name}</Text>
              </View>
              <View style={styles.reviewDetails}>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Mall</Text><Text style={styles.reviewValue}>{selectedMall?.name}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Date</Text><Text style={styles.reviewValue}>{selectedDate?.full}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Arrival</Text><Text style={styles.reviewValue}>{selectedTime}</Text></View>
              </View>
            </View>
          )}
          </Animated.View>
        </ScrollView>

        {(step === 'time' || step === 'review') && (
          <View style={styles.footer}>
            <Pressable
              style={[styles.primaryButton, step === 'time' && !selectedTime && styles.primaryButtonDisabled]}
              onPress={() => step === 'time' ? transitionTo('review') : router.dismissTo('/home')}
              disabled={step === 'time' && !selectedTime}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{step === 'time' ? 'Review selection' : 'Back to Home'}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
