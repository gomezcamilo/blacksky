import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

interface GlowingBorderProps {
  color: string;
  width?: number;
  intensity?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export default function GlowingBorder({ 
  color, 
  width = 1, 
  intensity = 0.8, 
  style, 
  children 
}: GlowingBorderProps) {
  const glowOpacity = useSharedValue(intensity * 0.5);
  
  // Create a subtle pulsing effect for the glow
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(intensity, { 
        duration: 2000, 
        easing: Easing.inOut(Easing.sin) 
      }),
      -1,
      true
    );
  }, []);
  
  const glowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: glowOpacity.value,
    };
  });
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.border,
          {
            borderColor: color,
            borderWidth: width,
            shadowColor: color,
          },
          glowStyle,
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 6,
  },
});