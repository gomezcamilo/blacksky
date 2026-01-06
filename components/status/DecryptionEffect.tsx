import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface DecryptionEffectProps {
  text: string;
  encryptionType: 'binary' | 'aes' | 'reverse';
  onComplete?: () => void;
  speed?: 'slow' | 'medium' | 'fast';
}

export default function DecryptionEffect({
  text,
  encryptionType,
  onComplete,
  speed = 'medium',
}: DecryptionEffectProps) {
  const [currentText, setCurrentText] = React.useState(text);
  const [isComplete, setIsComplete] = React.useState(false);
  const opacity = useSharedValue(1);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const getEncryptedChar = (char: string) => {
    if (char === ' ' || char === '\n') return char;
    
    switch (encryptionType) {
      case 'binary':
        return Math.round(Math.random()).toString();
      case 'aes':
        return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      case 'reverse':
        return char;
      default:
        return char;
    }
  };

  const getEncryptedText = () => {
    if (encryptionType === 'reverse') {
      return text.split('').reverse().join('');
    }
    return text.split('').map(getEncryptedChar).join('');
  };

  const getDecryptionSpeed = () => {
    switch (speed) {
      case 'slow':
        return 1500;
      case 'fast':
        return 400;
      default:
        return 800;
    }
  };

  const startDecryption = () => {
    // Limpiar timeouts anteriores
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const encrypted = getEncryptedText();
    setCurrentText(encrypted);
    setIsComplete(false);

    const finalText = text;
    const duration = getDecryptionSpeed();
    const steps = 8;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      const timeout = setTimeout(() => {
        const progress = i / steps;

        // Generar texto parcialmente desencriptado
        let result = '';
        for (let j = 0; j < finalText.length; j++) {
          const charProgress = j / finalText.length;
          if (charProgress < progress) {
            result += finalText[j];
          } else {
            // Mantener espacios y saltos de línea
            if (finalText[j] === ' ' || finalText[j] === '\n') {
              result += finalText[j];
            } else {
              result += getEncryptedChar(finalText[j]);
            }
          }
        }

        setCurrentText(result);

        if (i === steps) {
          setCurrentText(finalText);
          setIsComplete(true);
          onComplete?.();
        }
      }, stepDuration * i);

      timeoutsRef.current.push(timeout);
    }
  };

  useEffect(() => {
    startDecryption();

    // Animate the glitching effect
    opacity.value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withTiming(1, { duration: 80 }),
      withTiming(0.8, { duration: 60 }),
      withTiming(1, { duration: 100 })
    );
  }, [text, encryptionType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const getColor = () => {
    if (isComplete) return Colors.text;
    
    switch (encryptionType) {
      case 'binary':
        return Colors.binaryColor;
      case 'aes':
        return Colors.aesColor;
      case 'reverse':
        return Colors.reverseColor;
      default:
        return Colors.text;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text
        style={[styles.text, { color: getColor() }]}
        numberOfLines={4}
      >
        {currentText}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 18,
  },
});
