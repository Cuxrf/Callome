import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Props = { name: string; color: string };

export default function TransitDisplay({ name, color }: Props) {
  const [progress] = useState(() => new Animated.Value(0));
  const { width } = useWindowDimensions();
  const travel = Math.max(width - 40, 260);

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.loop(Animated.timing(progress, { toValue: 1, duration: 7800, easing: Easing.linear, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [progress, name]);

  return (
    <View style={styles.frame}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <View style={styles.display}>
        <View style={styles.topLine}><Text style={styles.microText}>NEXT LINE</Text><Text style={styles.microText}>● ● ●</Text></View>
        <View style={styles.marquee}>
          <Animated.Text numberOfLines={1} style={[styles.name, { transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-travel, travel] }) }] }]}>{name.toUpperCase()}</Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { marginTop: 18, padding: 6, borderRadius: 14, backgroundColor: '#313A42', flexDirection: 'row', height: 92, gap: 6 },
  indicator: { width: 5, borderRadius: 4 },
  display: { flex: 1, borderRadius: 8, borderWidth: 2, borderColor: '#4A535B', backgroundColor: '#121A1C', overflow: 'hidden' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 11, paddingTop: 7 },
  microText: { color: '#9CA995', fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, fontWeight: '700' },
  marquee: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
  name: { position: 'absolute', color: '#FFBB51', fontFamily: 'monospace', fontWeight: '900', fontSize: 19, letterSpacing: 2.2, textShadowColor: '#FFBB5177', textShadowRadius: 5, minWidth: 220 },
});
