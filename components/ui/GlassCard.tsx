import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface GlassCardProps {
  style?: ViewStyle;
  intensity?: number;
  children: React.ReactNode;
  glowColor?: string;
  showGlow?: boolean;
}

export default function GlassCard({ 
  style, 
  intensity = 80, 
  children,
  glowColor = Colors.neonBlue,
  showGlow = false,
}: GlassCardProps) {
  return (
    <View 
      style={[
        styles.container, 
        style,
        showGlow && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 10,
        }
      ]}
    >
      {Platform.OS === 'web' ? (
        <View style={styles.webBlurFallback}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      ) : (
        <BlurView 
          intensity={intensity} 
          tint="dark" 
          style={styles.blurContainer}
        >
          <View style={styles.content}>
            {children}
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 30, 0.3)',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
  },
  webBlurFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    backdropFilter: 'blur(10px)',
  },
  content: {
    flex: 1,
    padding: Layout.spacing.md,
  },
});
