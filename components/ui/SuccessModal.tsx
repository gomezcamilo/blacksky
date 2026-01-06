import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { CheckCircle, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import Colors from '@/constants/Colors';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  encryptionType?: 'binary' | 'aes' | 'reverse';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  visible,
  onClose,
  title = '¡Publicación exitosa!',
  message = 'Tu mensaje ha sido encriptado y transmitido al void.',
  encryptionType = 'aes',
  autoClose = true,
  autoCloseDelay = 2500,
}: SuccessModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);

  const modalWidth = isDesktop ? 380 : Math.min(width - 48, 340);

  const getEncryptionColor = () => {
    switch (encryptionType) {
      case 'binary':
        return Colors.binaryColor;
      case 'aes':
        return Colors.aesColor;
      case 'reverse':
        return Colors.reverseColor;
      default:
        return Colors.neonPurple;
    }
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      iconRotation.value = withSequence(
        withTiming(360, { duration: 600 }),
        withTiming(360, { duration: 0 })
      );

      // Sparkle animations
      sparkle1.value = withDelay(200, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));
      sparkle2.value = withDelay(400, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));
      sparkle3.value = withDelay(600, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.8, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1.value,
    transform: [{ scale: sparkle1.value }, { translateX: -30 }, { translateY: -20 }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2.value,
    transform: [{ scale: sparkle2.value }, { translateX: 30 }, { translateY: -30 }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3.value,
    transform: [{ scale: sparkle3.value }, { translateX: 0 }, { translateY: 30 }],
  }));

  const encryptionColor = getEncryptionColor();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, containerStyle]}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <Animated.View style={[styles.modalContainer, modalStyle, { width: modalWidth }]}>
          <GlassCard style={[styles.modal, { borderColor: encryptionColor }]}>
            {/* Sparkles */}
            <Animated.View style={[styles.sparkle, sparkle1Style]}>
              <Sparkles size={20} color={encryptionColor} />
            </Animated.View>
            <Animated.View style={[styles.sparkle, sparkle2Style]}>
              <Sparkles size={16} color={Colors.neonPurple} />
            </Animated.View>
            <Animated.View style={[styles.sparkle, sparkle3Style]}>
              <Sparkles size={18} color={Colors.neonBlue} />
            </Animated.View>

            {/* Icon */}
            <Animated.View style={[styles.iconContainer, iconStyle]}>
              <View style={[styles.iconBg, { backgroundColor: `${encryptionColor}20`, borderColor: encryptionColor }]}>
                <CheckCircle size={48} color={encryptionColor} />
              </View>
            </Animated.View>

            {/* Title */}
            <NeonText
              text={title}
              color={encryptionColor}
              fontSize={isDesktop ? 18 : 20}
              glow
              glowIntensity={0.8}
              style={styles.title}
            />

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Encryption indicator */}
            <View style={[styles.encryptionBadge, { borderColor: encryptionColor }]}>
              <Text style={[styles.encryptionText, { color: encryptionColor }]}>
                {encryptionType === 'binary' ? '01010101' : encryptionType === 'aes' ? 'AES-256' : 'REVERSED'}
              </Text>
            </View>

            {/* Close button */}
            <Pressable style={[styles.closeButton, { backgroundColor: encryptionColor }]} onPress={handleClose}>
              <Text style={styles.closeButtonText}>CONTINUAR</Text>
            </Pressable>
          </GlassCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    alignItems: 'center',
  },
  modal: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    overflow: 'visible',
  },
  sparkle: {
    position: 'absolute',
    top: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  encryptionBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  encryptionText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  closeButtonText: {
    fontFamily: 'MajorMono',
    fontSize: 13,
    color: Colors.background,
  },
});
