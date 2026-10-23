import { Image } from 'expo-image';
import { View } from 'react-native';
import { useProfile } from '../state/ProfileContext';
import { brand } from '../Styling/BrandColors';
import { imageCachePolicy } from '../Styling/ImageCache';

export default function ProfileAvatar({ size = 42 }: { size?: number }) {
  const { name, photoUri } = useProfile();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: brand.blueLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: size, height: size }} contentFit="cover" cachePolicy={imageCachePolicy} accessibilityLabel={`${name}'s profile photo`} />
      ) : (
        <Image source={require('../assets/Brand/default-cat-avatar.webp')} style={{ width: size, height: size }} contentFit="cover" cachePolicy={imageCachePolicy} accessibilityLabel={`${name}'s cat profile avatar`} />
      )}
    </View>
  );
}
