import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import NavigationBar from '../../components/NavigationBar';
import { ProfileProvider } from '../../state/ProfileContext';
import { preloadHomeAssets } from '../../state/preloadHomeAssets';

export default function RootLayout() {
  useEffect(() => { void preloadHomeAssets(); }, []);
  return (
    <ProfileProvider>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
        <NavigationBar />
      </View>
    </ProfileProvider>
  );
}
