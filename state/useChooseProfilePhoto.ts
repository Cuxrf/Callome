import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { useProfile } from './ProfileContext';

export function useChooseProfilePhoto() {
  const { setPhotoUri } = useProfile();

  return async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (result.canceled || !result.assets[0]) return;
      const folder = FileSystem.documentDirectory;
      if (!folder) throw new Error('Photo storage is unavailable');
      const destination = `${folder}profile-photo-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: result.assets[0].uri, to: destination });
      setPhotoUri(destination);
    } catch {
      Alert.alert('Photo unavailable', 'Please try choosing your photo again.');
    }
  };
}
