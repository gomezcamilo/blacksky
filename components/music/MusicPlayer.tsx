import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  ListMusic, 
  Share2 
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface MusicPlayerProps {
  albumArt: string;
  title: string;
  artist: string;
  isPlaying?: boolean;
  progress?: number;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export default function MusicPlayer({
  albumArt,
  title,
  artist,
  isPlaying = false,
  progress = 0.3,
  onPlayPause,
  onNext,
  onPrevious,
  onExpand,
  isExpanded = false,
}: MusicPlayerProps) {
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const progressWidth = useSharedValue(progress);
  const visualizerHeight1 = useSharedValue(0.3);
  const visualizerHeight2 = useSharedValue(0.7);
  const visualizerHeight3 = useSharedValue(0.5);
  const visualizerHeight4 = useSharedValue(0.8);
  const visualizerHeight5 = useSharedValue(0.4);

  // Update progress bar width
  React.useEffect(() => {
    progressWidth.value = withTiming(progress, {
      duration: Layout.animation.medium,
      easing: Easing.linear,
    });
  }, [progress]);
  
  // Animate visualizers when playing
  React.useEffect(() => {
    if (localIsPlaying) {
      const animate = () => {
        visualizerHeight1.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 300 });
        visualizerHeight2.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 400 });
        visualizerHeight3.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 350 });
        visualizerHeight4.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 450 });
        visualizerHeight5.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 320 });
      };
      
      animate();
      const interval = setInterval(animate, 500);
      return () => clearInterval(interval);
    } else {
      visualizerHeight1.value = withTiming(0.3, { duration: 300 });
      visualizerHeight2.value = withTiming(0.5, { duration: 300 });
      visualizerHeight3.value = withTiming(0.4, { duration: 300 });
      visualizerHeight4.value = withTiming(0.2, { duration: 300 });
      visualizerHeight5.value = withTiming(0.6, { duration: 300 });
    }
  }, [localIsPlaying]);
  
  const handlePlayPause = () => {
    setLocalIsPlaying(!localIsPlaying);
    onPlayPause?.();
  };
  
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
    };
  });
  
  const visualizerStyle1 = useAnimatedStyle(() => ({
    height: `${visualizerHeight1.value * 100}%`,
  }));
  
  const visualizerStyle2 = useAnimatedStyle(() => ({
    height: `${visualizerHeight2.value * 100}%`,
  }));
  
  const visualizerStyle3 = useAnimatedStyle(() => ({
    height: `${visualizerHeight3.value * 100}%`,
  }));
  
  const visualizerStyle4 = useAnimatedStyle(() => ({
    height: `${visualizerHeight4.value * 100}%`,
  }));
  
  const visualizerStyle5 = useAnimatedStyle(() => ({
    height: `${visualizerHeight5.value * 100}%`,
  }));

  
  if (isExpanded) {
    return (
      <GlassCard style={styles.expandedContainer} intensity={40}>
        <View style={styles.expandedContent}>
          <Pressable style={styles.closeButton} onPress={onExpand}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          
          <Image source={{ uri: albumArt }} style={styles.expandedAlbumArt} />
          
          <View style={styles.visualizer}>
            <Animated.View style={[styles.visualizerBar, visualizerStyle1]} />
            <Animated.View style={[styles.visualizerBar, visualizerStyle2]} />
            <Animated.View style={[styles.visualizerBar, visualizerStyle3]} />
            <Animated.View style={[styles.visualizerBar, visualizerStyle4]} />
            <Animated.View style={[styles.visualizerBar, visualizerStyle5]} />
          </View>
          
          <View style={styles.expandedInfo}>
            <Text style={styles.expandedTitle}>{title}</Text>
            <Text style={styles.expandedArtist}>{artist}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[styles.progressForeground, progressBarStyle]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>1:23</Text>
              <Text style={styles.timeText}>3:45</Text>
            </View>
          </View>
          
          <View style={styles.expandedControls}>
            <Pressable onPress={onPrevious}>
              <SkipBack size={Layout.isTablet ? 40 : 32} color={Colors.text} />
            </Pressable>
            <Pressable 
              style={styles.playPauseButton} 
              onPress={handlePlayPause}
            >
              {localIsPlaying ? (
                <Pause size={Layout.isTablet ? 40 : 32} color={Colors.background} />
              ) : (
                <Play size={Layout.isTablet ? 40 : 32} color={Colors.background} />
              )}
            </Pressable>
            <Pressable onPress={onNext}>
              <SkipForward size={Layout.isTablet ? 40 : 32} color={Colors.text} />
            </Pressable>
          </View>
          
          <View style={styles.extraControls}>
            <Pressable style={styles.extraButton}>
              <Volume2 size={Layout.moderateScale(24, 0.3)} color={Colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.extraButton}>
              <ListMusic size={Layout.moderateScale(24, 0.3)} color={Colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.extraButton}>
              <Share2 size={Layout.moderateScale(24, 0.3)} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </GlassCard>
    );
  }
  
  return (
    <Pressable onPress={onExpand}>
      <GlassCard style={styles.container} intensity={60}>
        <Image source={{ uri: albumArt }} style={styles.albumArt} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
          
          <View style={styles.miniProgressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[styles.progressForeground, progressBarStyle]} 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.controls}>
          <Pressable onPress={handlePlayPause}>
            {localIsPlaying ? (
              <Pause size={Layout.moderateScale(24, 0.3)} color={Colors.text} />
            ) : (
              <Play size={Layout.moderateScale(24, 0.3)} color={Colors.text} />
            )}
          </Pressable>
        </View>
      </GlassCard>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  // Mini player styles
  container: {
    height: Layout.musicPlayer.miniHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    borderColor: 'rgba(191, 0, 255, 0.3)',
    borderTopWidth: 1,
  },
  albumArt: {
    width: Layout.moderateScale(40, 0.3),
    height: Layout.moderateScale(40, 0.3),
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: Layout.typography.body.tiny,
    color: Colors.text,
  },
  artist: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.isSmallDevice ? 9 : 10,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  miniProgressContainer: {
    width: '100%',
  },
  progressContainer: {
    width: Layout.isTablet ? '70%' : '80%',
  },
  progressBackground: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
  },
  progressForeground: {
    height: '100%',
    backgroundColor: Colors.neonPurple,
    borderRadius: 1,
  },
  controls: {
    marginLeft: Layout.spacing.sm,
    padding: Layout.spacing.sm,
  },
  
  // Expanded player styles
  expandedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 5, 5, 0.95)',
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  expandedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.contentPadding.horizontal,
  },
  closeButton: {
    position: 'absolute',
    top: Layout.spacing.lg,
    right: Layout.spacing.lg,
    zIndex: 1,
  },
  closeText: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.typography.body.small,
    color: Colors.textSecondary,
  },
  expandedAlbumArt: {
    width: Layout.musicPlayer.albumArtSize,
    height: Layout.musicPlayer.albumArtSize,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.5)',
  },
  expandedInfo: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  expandedTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: Layout.typography.body.large,
    color: Colors.text,
    textAlign: 'center',
  },
  expandedArtist: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.typography.body.small,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Layout.spacing.xs,
  },
  timeText: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.typography.body.tiny,
    color: Colors.textMuted,
  },
  expandedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Layout.spacing.xl,
    width: Layout.isTablet ? '60%' : '80%',
  },
  playPauseButton: {
    width: Layout.isTablet ? 80 : Layout.moderateScale(64, 0.3),
    height: Layout.isTablet ? 80 : Layout.moderateScale(64, 0.3),
    borderRadius: Layout.isTablet ? 40 : Layout.moderateScale(32, 0.3),
    backgroundColor: Colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Layout.spacing.xl,
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  extraButton: {
    marginHorizontal: Layout.spacing.lg,
  },
  visualizer: {
    flexDirection: 'row',
    height: Layout.moderateScale(40, 0.3),
    alignItems: 'flex-end',
    marginBottom: Layout.spacing.lg,
    width: Layout.isTablet ? '40%' : '60%',
    justifyContent: 'center',
  },
  visualizerBar: {
    width: Layout.moderateScale(4, 0.3),
    backgroundColor: Colors.neonPurple,
    marginHorizontal: Layout.moderateScale(3, 0.3),
    borderRadius: 2,
  },
});
