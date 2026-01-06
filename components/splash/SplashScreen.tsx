import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import NeonText from '@/components/ui/NeonText';
import Colors from '@/constants/Colors';

const moloCorpLogo = require('@/assets/images/molocorp.png');
const zondaGif = require('@/assets/images/zonda.gif');

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const binaryOpacity = useSharedValue(0);

  // Tamaños responsivos
  const logoSize = isDesktop ? Math.min(width * 0.25, 280) : isTablet ? width * 0.4 : width * 0.6;
  const titleSize = isDesktop ? 36 : isTablet ? 42 : 40;
  const subtitleSize = isDesktop ? 14 : isTablet ? 15 : 14;

  useEffect(() => {
    // Animate splash screen elements
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Animate text after image
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
    }, 400);

    // Animate subtitle
    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 500 });
      binaryOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 200 }),
        withTiming(1, { duration: 300 })
      );
    }, 800);

    // Hide splash screen after 3.5 seconds
    setTimeout(() => {
      opacity.value = withTiming(
        0,
        {
          duration: 500,
          easing: Easing.in(Easing.cubic),
        },
        () => {
          runOnJS(onComplete)();
        }
      );
    }, 3500);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const binaryStyle = useAnimatedStyle(() => ({
    opacity: binaryOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background GIF */}
      <Image
        source={zondaGif}
        style={styles.backgroundGif}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.imageContainer,
          imageStyle,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: logoSize / 2,
          },
        ]}
      >
        <Image source={moloCorpLogo} style={styles.image} />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <NeonText
          text="BLACK SKY"
          color={Colors.neonPurple}
          fontSize={titleSize}
          glow={true}
          glowIntensity={1}
        />
      </Animated.View>

      <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
        <NeonText
          text="LIBRE EXPRESIÓN ANÓNIMA"
          color={Colors.neonBlue}
          fontSize={subtitleSize}
          glow={true}
          glowIntensity={0.6}
        />
      </Animated.View>

      <Animated.Text style={[styles.binaryText, binaryStyle]}>
        01000010 01001100 01000001 01000011 01001011
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backgroundGif: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 5, 5, 0.7)',
  },
  imageContainer: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.neonPurple,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    marginTop: 32,
  },
  subtitleContainer: {
    marginTop: 12,
  },
  binaryText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonPurple,
    marginTop: 24,
    opacity: 0.6,
    letterSpacing: 1,
  },
});
