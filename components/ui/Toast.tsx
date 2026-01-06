import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
}

export default function Toast({
  visible,
  message,
  type = 'error',
  duration = 4000,
  onClose,
  actionText,
  onAction,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideToast = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    const size = 20;
    switch (type) {
      case 'error':
        return <AlertCircle size={size} color={Colors.neonRed} />;
      case 'success':
        return <CheckCircle size={size} color={Colors.neonGreen} />;
      case 'warning':
        return <AlertCircle size={size} color="#ff9f43" />;
      case 'info':
      default:
        return <Info size={size} color={Colors.neonBlue} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return Colors.neonRed;
      case 'success':
        return Colors.neonGreen;
      case 'warning':
        return '#ff9f43';
      case 'info':
      default:
        return Colors.neonBlue;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, { borderLeftColor: getBorderColor() }]}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
          {actionText && onAction && (
            <TouchableOpacity onPress={onAction} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: getBorderColor() }]}>
                {actionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <X size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundMedium,
    borderRadius: 12,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 4,
    maxWidth: 500,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginRight: Layout.spacing.sm,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: Layout.spacing.sm,
  },
});
