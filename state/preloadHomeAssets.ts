import { Image } from 'expo-image';

const homeAssets = [
  require('../assets/Illustrations/home-neighborhood.webp'),
  require('../assets/Icons/parcel.webp'),
  require('../assets/Icons/book.webp'),
  require('../assets/Icons/community.webp'),
  require('../assets/Icons/report.webp'),
  require('../assets/Icons/bus.webp'),
  require('../assets/Icons/lost-found.webp'),
  require('../assets/Icons/guide.webp'),
  require('../assets/Icons/view-all.webp'),
];

let loadedAssets: ReturnType<typeof Image.loadAsync>[] | null = null;

export function preloadHomeAssets() {
  if (!loadedAssets) loadedAssets = homeAssets.map((source) => Image.loadAsync(source));
  return Promise.allSettled(loadedAssets);
}
