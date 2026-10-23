import { useEffect, useRef } from 'react';
import { router, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../Styling/NavigationBarStyles';
import { brand } from '../Styling/BrandColors';
import ProfileAvatar from './ProfileAvatar';

const tabs = [
  { label: 'Home', icon: 'home-outline', selectedIcon: 'home' },
  { label: 'Security', icon: 'shield-outline', selectedIcon: 'shield' },
  { label: 'Search', icon: 'search-outline', selectedIcon: 'search' },
  { label: 'Profile', icon: 'person-outline', selectedIcon: 'person' },
] as const;

export default function NavigationBar() {
  const pathname = usePathname();
  const navigating = useRef(false);
  const searchSequence = useRef(0);

  useEffect(() => { navigating.current = false; }, [pathname]);

  const goTo = (target: '/home' | '/profile' | '/security') => {
    if (pathname === target || navigating.current) return;
    navigating.current = true;
    if (target === '/home') router.dismissTo('/home');
    else router.push(target);
  };

  const search = () => {
    searchSequence.current += 1;
    const focusSearch = String(searchSequence.current);
    if (pathname === '/home') router.setParams({ focusSearch });
    else if (!navigating.current) {
      navigating.current = true;
      router.dismissTo(`/home?focusSearch=${focusSearch}`);
    }
  };

  if (pathname === '/') return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const selected = (pathname === '/home' && tab.label === 'Home') || (pathname === '/profile' && tab.label === 'Profile') || (pathname === '/security' && tab.label === 'Security');
          const onPress = () => {
            if (tab.label === 'Home') goTo('/home');
            else if (tab.label === 'Profile') goTo('/profile');
            else if (tab.label === 'Security') goTo('/security');
            else if (tab.label === 'Search') search();
          };
          return (
            <Pressable
              key={tab.label}
              style={styles.tab}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconWrap}>
                {tab.label === 'Profile' ? (
                  <View style={[styles.profileRing, selected && styles.profileRingSelected]}><ProfileAvatar size={27} /></View>
                ) : tab.label === 'Security' ? (
                  <MaterialCommunityIcons name={selected ? 'account-tie-hat' : 'account-tie-hat-outline'} size={24} color={selected ? brand.blue : '#7E8791'} />
                ) : (
                  <Ionicons name={selected ? tab.selectedIcon : tab.icon} size={23} color={selected ? brand.blue : '#7E8791'} />
                )}
              </View>
              <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
