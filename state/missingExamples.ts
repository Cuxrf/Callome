export type MissingExample = {
  id: string;
  title: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  image: number;
  contentFit?: 'cover' | 'contain';
};

// Example posts make the browse and map views useful before residents add real posts.
export const missingExamples: MissingExample[] = [
  { id: 'example-cat-milo', title: 'Missing cat — Milo', description: 'Black-and-white cat with white paws and a red collar. Shy but responds to his name.', locationName: 'Taman U Thant', latitude: 3.1584, longitude: 101.7297, image: require('../assets/LostFound/cat-milo.webp'), contentFit: 'cover' },
  { id: 'example-dog-mochi', title: 'Missing dog — Mochi', description: 'Small apricot poodle wearing a red harness. Friendly and may approach for treats.', locationName: 'Mont Kiara', latitude: 3.1718, longitude: 101.6527, image: require('../assets/LostFound/dog-mochi.webp'), contentFit: 'cover' },
  { id: 'example-cat-poppy', title: 'Missing cat — Poppy', description: 'Petite calico cat with a green collar and bell. Usually cautious around strangers.', locationName: 'Desa ParkCity', latitude: 3.1867, longitude: 101.6281, image: require('../assets/LostFound/cat-poppy.webp'), contentFit: 'cover' },
  { id: 'example-dog-bruno', title: 'Missing dog — Bruno', description: 'Medium black-and-tan dog with floppy ears and an orange collar. Gentle and food-motivated.', locationName: 'Titiwangsa Lake Gardens', latitude: 3.1776, longitude: 101.7069, image: require('../assets/LostFound/dog-bruno.webp'), contentFit: 'cover' },
  { id: 'example-watch', title: 'Metal watch', description: 'Round face with a metal strap.', locationName: 'KLCC Park', latitude: 3.1557, longitude: 101.7164, image: require('../assets/LostFound/watch.webp') },
  { id: 'example-bottle', title: 'Blue water bottle', description: 'Blue insulated bottle with a handle.', locationName: 'Suria KLCC', latitude: 3.1576, longitude: 101.7121, image: require('../assets/LostFound/bottle.webp') },
  { id: 'example-necklace', title: 'Gold necklace', description: 'Gold chain with dangling pendants.', locationName: 'Avenue K', latitude: 3.1598, longitude: 101.7142, image: require('../assets/LostFound/necklace.webp') },
  { id: 'example-wallet', title: 'Brown wallet', description: 'Brown leather wallet.', locationName: 'Kampung Baru', latitude: 3.1641, longitude: 101.7073, image: require('../assets/LostFound/wallet.webp') },
  { id: 'example-keys', title: 'House keys', description: 'Set of metal keys on a ring.', locationName: 'Bukit Bintang', latitude: 3.1478, longitude: 101.7119, image: require('../assets/LostFound/keys.webp') },
  { id: 'example-earbuds', title: 'Wireless earbuds', description: 'Black earbuds and charging case.', locationName: 'Pavilion KL', latitude: 3.1493, longitude: 101.7134, image: require('../assets/LostFound/earbuds.webp') },
  { id: 'example-glasses', title: 'Black glasses', description: 'Black rectangular frames.', locationName: 'Merdeka Square', latitude: 3.1486, longitude: 101.6933, image: require('../assets/LostFound/glasses.webp') },
  { id: 'example-umbrella', title: 'Yellow umbrella', description: 'Bright yellow umbrella.', locationName: 'Central Market', latitude: 3.1453, longitude: 101.6954, image: require('../assets/LostFound/umbrella.webp') },
  { id: 'example-backpack', title: 'Grey backpack', description: 'Canvas backpack with a front pocket.', locationName: 'KL Sentral', latitude: 3.1343, longitude: 101.6868, image: require('../assets/LostFound/backpack.webp') },
  { id: 'example-phone', title: 'Mobile phone', description: 'Black smartphone.', locationName: 'NU Sentral', latitude: 3.1339, longitude: 101.6867, image: require('../assets/LostFound/phone.webp') },
  { id: 'example-book', title: 'Notebook', description: 'Green notebook with pens.', locationName: 'National Library', latitude: 3.1712, longitude: 101.7099, image: require('../assets/LostFound/book.webp') },
  { id: 'example-camera', title: 'Compact camera', description: 'Black compact digital camera.', locationName: 'Titiwangsa Park', latitude: 3.1787, longitude: 101.7073, image: require('../assets/LostFound/camera.webp') },
  { id: 'example-bracelet', title: 'Beaded bracelet', description: 'Colourful beaded bracelet.', locationName: 'TRX Exchange', latitude: 3.143, longitude: 101.718, image: require('../assets/LostFound/bracelet.webp') },
  { id: 'example-cap', title: 'Navy cap', description: 'Plain baseball cap.', locationName: 'Merdeka 118', latitude: 3.1418, longitude: 101.7006, image: require('../assets/LostFound/cap.webp') },
  { id: 'example-lunchbox', title: 'Lunch box', description: 'Clear food containers with green lids.', locationName: 'Masjid Jamek', latitude: 3.1493, longitude: 101.6965, image: require('../assets/LostFound/lunchbox.webp') },
  { id: 'example-scarf', title: 'Patterned scarf', description: 'Soft scarf with a floral print.', locationName: 'Petaling Street', latitude: 3.1452, longitude: 101.6987, image: require('../assets/LostFound/scarf.webp') },
  { id: 'example-ring', title: 'Silver ring', description: 'Silver band with an opal stone.', locationName: 'The Gardens Mall', latitude: 3.1183, longitude: 101.6763, image: require('../assets/LostFound/ring.webp') },
  { id: 'example-toy', title: 'Teddy bear', description: 'Small brown soft toy.', locationName: 'Mid Valley Megamall', latitude: 3.1176, longitude: 101.6776, image: require('../assets/LostFound/toy.webp') },
];
