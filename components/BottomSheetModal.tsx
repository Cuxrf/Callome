import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
  closeLabel?: string;
};

export default function BottomSheetModal({ visible, onClose, children, sheetStyle, closeLabel = 'Close bottom sheet' }: Props) {
  const [offset] = useState(() => new Animated.Value(Dimensions.get('window').height));

  useEffect(() => {
    if (!visible) {
      offset.setValue(Dimensions.get('window').height);
      return;
    }
    const animation = Animated.timing(offset, { toValue: 0, duration: 260, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [visible, offset]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel} />
        <Animated.View style={[sheetStyle, { transform: [{ translateY: offset }] }]}>{children}</Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10, 24, 44, 0.48)' },
});
