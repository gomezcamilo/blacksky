import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

interface NeonTextProps extends TextProps {
  text: string;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  glow?: boolean;
  glowIntensity?: number;
  style?: TextStyle;
}

export default function NeonText({ 
  text, 
  color, 
  fontSize = 24, 
  fontFamily = 'MajorMono',
  glow = true,
  glowIntensity = 0.8,
  style,
  ...props 
}: NeonTextProps) {
  const glowOpacity = useSharedValue(glowIntensity * 0.7);
  
  // Create a subtle pulsing effect for the glow
  React.useEffect(() => {
    if (glow) {
      glowOpacity.value = withRepeat(
        withTiming(glowIntensity, { 
          duration: 2000, 
          easing: Easing.inOut(Easing.sin) 
        }),
        -1,
        true
      );
    }
  }, [glow]);
  
  const glowStyle = useAnimatedStyle(() => {
    return {
      textShadowRadius: 12,
      textShadowOffset: { width: 0, height: 0 },
      textShadowColor: color,
      shadowOpacity: glowOpacity.value,
    };
  });
  
  return (
    <Animated.Text
      style={[
        styles.text,
        {
          color,
          fontSize,
          fontFamily,
        },
        glow && glowStyle,
        style,
      ]}
      {...props}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    letterSpacing: 1,
  },
});