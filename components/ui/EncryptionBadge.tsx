import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import Colors from '@/constants/Colors';

type EncryptionType = 'binary' | 'aes' | 'reverse';

interface EncryptionBadgeProps {
  type: EncryptionType;
  size?: 'small' | 'medium' | 'large';
}

export default function EncryptionBadge({ 
  type, 
  size = 'medium' 
}: EncryptionBadgeProps) {
  const getColor = () => {
    switch (type) {
      case 'binary':
        return Colors.binaryColor;
      case 'aes':
        return Colors.aesColor;
      case 'reverse':
        return Colors.reverseColor;
      default:
        return Colors.neonBlue;
    }
  };
  
  const getLabel = () => {
    switch (type) {
      case 'binary':
        return 'BINARY';
      case 'aes':
        return 'AES-256';
      case 'reverse':
        return 'REVERSE';
      default:
        return 'ENCRYPTED';
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { height: 20, paddingHorizontal: 6 },
          text: { fontSize: 8 },
          icon: 10,
        };
      case 'large':
        return {
          container: { height: 32, paddingHorizontal: 12 },
          text: { fontSize: 14 },
          icon: 18,
        };
      default:
        return {
          container: { height: 24, paddingHorizontal: 8 },
          text: { fontSize: 10 },
          icon: 14,
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  const color = getColor();
  
  return (
    <View 
      style={[
        styles.container, 
        { borderColor: color },
        sizeStyles.container
      ]}
    >
      <Lock size={sizeStyles.icon} color={color} />
      <Text 
        style={[
          styles.text, 
          { color }, 
          sizeStyles.text
        ]}
      >
        {getLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 4,
  },
  text: {
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});