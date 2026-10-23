import { useState, type ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import ProfileAvatar from '../components/ProfileAvatar';
import { useProfile } from '../state/ProfileContext';
import { useChooseProfilePhoto } from '../state/useChooseProfilePhoto';
import { styles } from '../Styling/ProfileStyles';

type SettingRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress: () => void;
};

function SettingRow({ icon, label, value, onPress }: SettingRowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.settingRow}>
      <Ionicons name={icon} size={19} color="#202525" style={styles.settingIcon} />
      <Text style={styles.settingLabel}>{label}</Text>
      {value ? <Text style={styles.settingValue}>{value}</Text> : null}
    </Pressable>
  );
}

export default function ProfilePage() {
  const { name, setName } = useProfile();
  const choosePhoto = useChooseProfilePhoto();
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const startEditing = () => {
    setDraftName(name);
    setEditingName(true);
  };

  const saveName = () => {
    if (!draftName.trim()) {
      Alert.alert('Name required', 'Please enter a name for your profile.');
      return;
    }
    setName(draftName);
    setEditingName(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroBackground} />
            <View style={styles.topActions}>
              <Pressable
                accessibilityLabel="Notifications"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color="#252B2B" />
              </Pressable>
              <View style={styles.rightActions}>
                <Pressable
                  accessibilityLabel="Recent activity"
                  accessibilityRole="button"
                  hitSlop={12}
                  onPress={() => Alert.alert('Recent activity', 'There is no recent activity yet.')}
                >
                  <Ionicons name="time-outline" size={22} color="#252B2B" />
                </Pressable>
                <Pressable
                  accessibilityLabel="More options"
                  accessibilityRole="button"
                  hitSlop={12}
                  onPress={() => Alert.alert('More options', undefined, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go to Home', onPress: () => router.dismissTo('/home') },
                  ])}
                >
                  <Ionicons name="ellipsis-vertical" size={21} color="#252B2B" />
                </Pressable>
              </View>
            </View>

            <Pressable accessibilityLabel="Change profile picture" accessibilityRole="button" onPress={choosePhoto} style={styles.avatarButton}>
              <ProfileAvatar size={90} />
              <View style={styles.editBadge}>
                <Ionicons name="pencil-outline" size={15} color="#202525" />
              </View>
            </Pressable>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.contact}>+60173041487</Text>
          </View>

          <View style={styles.groups}>
            <View style={styles.settingsCard}>
              <SettingRow icon="id-card-outline" label="Edit profile information" onPress={startEditing} />
              {editingName ? (
                <View style={styles.editPanel}>
                  <TextInput
                    accessibilityLabel="Display name"
                    autoCapitalize="words"
                    onChangeText={setDraftName}
                    onSubmitEditing={saveName}
                    placeholder="Your name"
                    returnKeyType="done"
                    style={styles.nameInput}
                    value={draftName}
                  />
                  <View style={styles.editActions}>
                    <Pressable onPress={() => setEditingName(false)} style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={saveName} style={styles.saveButton}>
                      <Text style={styles.saveText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <SettingRow icon="notifications-outline" label="Notifications" value={notificationsOn ? 'ON' : 'OFF'} onPress={() => setNotificationsOn((current) => !current)} />
              <SettingRow icon="language-outline" label="Language" value="English" onPress={() => Alert.alert('Language', 'English is the current app language.')} />
            </View>

            <View style={styles.settingsCard}>
              <SettingRow icon="card-outline" label="Security" onPress={() => Alert.alert('Security', 'Security settings are coming soon.')} />
              <SettingRow icon="color-palette-outline" label="Theme" value="Light mode" onPress={() => Alert.alert('Theme', 'Light mode is active.')} />
            </View>

            <View style={styles.settingsCard}>
              <SettingRow icon="people-outline" label="Help & Support" onPress={() => Alert.alert('Help & Support', 'Support options are coming soon.')} />
              <SettingRow icon="chatbubble-ellipses-outline" label="Contact us" onPress={() => Alert.alert('Contact us', 'Contact options are coming soon.')} />
              <SettingRow icon="lock-closed-outline" label="Privacy policy" onPress={() => Alert.alert('Privacy policy', 'The privacy policy is coming soon.')} />
              <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/')} style={styles.logoutRow}>
                <Ionicons name="log-out-outline" size={19} color="#D93E42" style={styles.settingIcon} />
                <Text style={styles.logoutLabel}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
