import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Profile = { name: string; photoUri: string | null };
type ProfileContextValue = Profile & {
  setName: (name: string) => void;
  setPhotoUri: (uri: string) => void;
};

const STORAGE_KEY = 'callome.profile';
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({ name: 'Cuxrf', photoUri: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const saved = JSON.parse(stored) as Partial<Profile>;
          setProfile({
            name: typeof saved.name === 'string' && saved.name.trim() && saved.name !== 'there' ? saved.name : 'Cuxrf',
            photoUri: typeof saved.photoUri === 'string' ? saved.photoUri : null,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => undefined);
  }, [profile, ready]);

  if (!ready) return null;

  return (
    <ProfileContext.Provider value={{
      ...profile,
      setName: (name) => setProfile((current) => ({ ...current, name: name.trim() || 'Cuxrf' })),
      setPhotoUri: (photoUri) => setProfile((current) => ({ ...current, photoUri })),
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
