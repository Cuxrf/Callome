import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from '../Styling/ReportStyles';
import { imageCachePolicy } from '../Styling/ImageCache';

const reportTypes = [
  { id: 'maintenance', label: 'Maintenance & Repairs', icon: require('../assets/Icons/Reports/maintenance.webp') },
  { id: 'noise', label: 'Noise & Neighbour Complaints', icon: require('../assets/Icons/Reports/noise.webp') },
  { id: 'facilities', label: 'Facilities', icon: require('../assets/Icons/Reports/facilities.webp') },
  { id: 'security', label: 'Securities', icon: require('../assets/Icons/Reports/security.webp') },
  { id: 'structural', label: 'Building & Structural', icon: require('../assets/Icons/Reports/structural.webp') },
  { id: 'community', label: 'Community & Neighbourhood', icon: require('../assets/Icons/Reports/community.webp') },
  { id: 'general', label: 'General Request & Suggestion', icon: require('../assets/Icons/Reports/general.webp') },
] as const;

type ReportScreen = 'select' | 'details' | 'history';
type SavedReport = { id: string; name: string; phone: string; type: string; description: string; createdAt: string };

const reportsStorageKey = '@callome/reports';
const reporterName = 'Cuxrf';
const reporterPhone = '+60173041487';

function isSavedReport(value: unknown): value is SavedReport {
  if (!value || typeof value !== 'object') return false;
  const report = value as Partial<SavedReport>;
  return typeof report.id === 'string' && typeof report.type === 'string' && typeof report.description === 'string' && typeof report.createdAt === 'string';
}

function parseReports(stored: string | null): SavedReport[] {
  if (!stored) return [];
  const value: unknown = JSON.parse(stored);
  return Array.isArray(value) ? value.filter(isSavedReport) : [];
}

export default function ReportPage() {
  const [screen, setScreen] = useState<ReportScreen>('select');
  const [search, setSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [recentId, setRecentId] = useState<string | null>(null);

  const selectedType = reportTypes.find((item) => item.id === selectedTypeId);
  const filteredTypes = reportTypes.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()));

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'select') return false;
      setScreen('select');
      return true;
    });
    return () => subscription.remove();
  }, [screen]);

  const goBack = () => {
    if (screen === 'select') router.back();
    else setScreen('select');
  };

  const openHistory = async () => {
    setScreen('history');
    setLoadingHistory(true);
    try {
      setReports(parseReports(await AsyncStorage.getItem(reportsStorageKey)));
    } catch {
      Alert.alert('Could not load reports', 'Please try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const submit = async () => {
    if (saving || !selectedType) return;
    if (!description.trim()) { setShowError(true); return; }
    setSaving(true);
    try {
      const existing = parseReports(await AsyncStorage.getItem(reportsStorageKey));
      const report: SavedReport = {
        id: `RPT-${Date.now().toString().slice(-8)}`,
        name: reporterName,
        phone: reporterPhone,
        type: selectedType.label,
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };
      const updated = [report, ...existing];
      await AsyncStorage.setItem(reportsStorageKey, JSON.stringify(updated));
      setReports(updated);
      setRecentId(report.id);
      setDescription('');
      setShowError(false);
      setScreen('history');
    } catch {
      Alert.alert('Could not save report', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={23} color="#172437" /></Pressable>
          <Text style={styles.topBarTitle}>{screen === 'history' ? 'Previous Reports' : 'Report'}</Text>
          {screen === 'select' ? <Pressable style={styles.historyButton} onPress={openHistory} accessibilityRole="button" accessibilityLabel="View previous reports"><Ionicons name="list" size={18} color="#FFFFFF" /><Text style={styles.historyButtonText}>Previous Reports</Text></Pressable> : <View style={styles.topBarSpacer} />}
        </View>

        {screen === 'select' && <ScrollView style={styles.scroll} contentContainerStyle={styles.pickerContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.searchBox}><TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search" placeholderTextColor="#9AA3AD" returnKeyType="search" accessibilityLabel="Search report types" />{search ? <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search"><Ionicons name="close-circle" size={20} color="#9AA3AD" /></Pressable> : <Ionicons name="search-outline" size={22} color="#929BA6" />}</View>
          <Text style={styles.pickerHeading}>What would you like to report?</Text>
          <View style={styles.categoryGrid}>{filteredTypes.map((item) => <Pressable key={item.id} style={styles.categoryCard} onPress={() => { setSelectedTypeId(item.id); setShowError(false); setScreen('details'); }} accessibilityRole="button" accessibilityLabel={`Report ${item.label}`}><Image source={item.icon} style={styles.categoryIcon} contentFit="contain" cachePolicy={imageCachePolicy} /><Text style={styles.categoryLabel}>{item.label}</Text></Pressable>)}</View>
          {filteredTypes.length === 0 && <Text style={styles.emptySearch}>No report types match “{search}”.</Text>}
        </ScrollView>}

        {screen === 'details' && selectedType && <KeyboardAvoidingView style={styles.scroll} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.detailsContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.selectedCategory}><Image source={selectedType.icon} style={styles.selectedIcon} contentFit="contain" cachePolicy={imageCachePolicy} /><View style={styles.selectedCopy}><Text style={styles.selectedEyebrow}>REPORT TYPE</Text><Text style={styles.selectedTitle}>{selectedType.label}</Text></View><Pressable style={styles.changeButton} onPress={() => setScreen('select')} accessibilityRole="button" accessibilityLabel="Change report type"><Text style={styles.changeText}>Change</Text></Pressable></View>
          <Text style={styles.sectionLabel}>YOUR DETAILS</Text>
          <View style={styles.detailsCard}>
            <View style={styles.lockedField}><View style={styles.lockedHeading}><Text style={styles.fieldLabel}>Name</Text><Ionicons name="lock-closed-outline" size={14} color="#9BA8B8" /></View><TextInput style={styles.lockedInput} value={reporterName} editable={false} accessibilityLabel="Name, Cuxrf, locked" /></View>
            <View style={styles.fieldDivider} />
            <View style={styles.lockedField}><View style={styles.lockedHeading}><Text style={styles.fieldLabel}>Phone number</Text><Ionicons name="lock-closed-outline" size={14} color="#9BA8B8" /></View><TextInput style={styles.lockedInput} value={reporterPhone} editable={false} accessibilityLabel="Phone number, +60173041487, locked" /></View>
          </View>
          <Text style={styles.sectionLabel}>REPORT DETAILS</Text>
          <Text style={styles.fieldLabel}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.descriptionInput, showError && !description.trim() && styles.fieldError]} value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="Describe what happened and where..." placeholderTextColor="#9BA8B8" maxLength={1000} accessibilityLabel="Report description" />
          <View style={styles.descriptionFoot}><Text style={styles.helperText}>Include a location if it helps identify the issue.</Text><Text style={styles.characterCount}>{description.length}/1000</Text></View>
          {showError && !description.trim() && <Text style={styles.errorText}>Add a description.</Text>}
          <Pressable style={[styles.submitButton, saving && styles.submitButtonBusy]} onPress={submit} accessibilityRole="button" accessibilityLabel="Submit report" accessibilityState={{ disabled: saving }}><Text style={styles.submitText}>{saving ? 'Saving...' : 'Submit Report'}</Text><Ionicons name="arrow-forward" size={20} color="#FFFFFF" /></Pressable>
        </ScrollView></KeyboardAvoidingView>}

        {screen === 'history' && <ScrollView style={styles.scroll} contentContainerStyle={styles.historyContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.historyHeading}>Your reports</Text>
          <Text style={styles.historyIntro}>Reports saved on this device</Text>
          {loadingHistory ? <ActivityIndicator style={styles.loading} color="#CD2026" /> : reports.length === 0 ? <View style={styles.emptyHistory}><Ionicons name="document-text-outline" size={36} color="#9AA8B8" /><Text style={styles.emptyHistoryTitle}>No reports yet</Text><Text style={styles.emptyHistoryBody}>Choose a problem to create your first report.</Text><Pressable style={styles.emptyHistoryButton} onPress={() => setScreen('select')} accessibilityRole="button"><Text style={styles.emptyHistoryButtonText}>Create a report</Text></Pressable></View> : reports.map((report) => {
            const icon = reportTypes.find((item) => item.label === report.type)?.icon ?? reportTypes[6].icon;
            return <View key={report.id} style={styles.reportCard}><View style={styles.reportCardTop}><View style={styles.reportCardIconWrap}><Image source={icon} style={styles.reportCardIcon} contentFit="contain" cachePolicy={imageCachePolicy} /></View><View style={styles.reportCardHeading}><Text style={styles.reportCardType}>{report.type}</Text><Text style={styles.reportCardId}>{report.id}</Text></View></View><Text style={styles.reportCardDescription}>{report.description}</Text><View style={styles.reportCardFooter}><Text style={styles.reportCardDate}>{new Date(report.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</Text><Text style={styles.reportCardStatus}>{report.id === recentId ? 'Just saved · Local only' : 'Saved locally'}</Text></View></View>;
          })}
        </ScrollView>}
      </SafeAreaView>
    </View>
  );
}
