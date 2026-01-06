import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import StatusCard from '@/components/status/StatusCard';
import NeonText from '@/components/ui/NeonText';
import MusicPlayer from '@/components/music/MusicPlayer';
import InboxButton from '@/components/ui/InboxButton';
import Colors from '@/constants/Colors';
import { usePostsStore } from '@/stores/postsStore';

const wavesGif = require('@/assets/images/waves.gif');

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const posts = usePostsStore((state) => state.posts);
  const deletePost = usePostsStore((state) => state.deletePost);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const getContentWidth = () => {
    if (isDesktop) return Math.min(520, width * 0.4);
    if (isTablet) return Math.min(480, width * 0.65);
    return width;
  };

  const contentWidth = getContentWidth();
  const headerHeight = isDesktop ? 48 : 52;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  const renderStatusCard = ({ item }: { item: (typeof posts)[0] }) => (
    <View style={{ width: isMobile ? '100%' : contentWidth, alignSelf: 'center' }}>
      <StatusCard
        id={item.id}
        username={item.username}
        handle={item.handle}
        avatar={item.avatar}
        content={item.content}
        encryptionType={item.encryptionType}
        timestamp={item.timestamp}
        likes={item.likes}
        comments={item.comments}
        shares={item.shares}
        hasMusic={item.hasMusic}
        musicTitle={item.musicTitle}
        musicArtist={item.musicArtist}
        musicUrl={item.musicUrl}
        imageUrl={item.imageUrl}
        isOwn={item.isOwn}
        onDelete={handleDeletePost}
      />
    </View>
  );

  if (isPlayerExpanded) {
    return (
      <MusicPlayer
        albumArt="https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=640"
        title="Cybernetic Dreams"
        artist="Neon Synthesis"
        isPlaying={true}
        progress={0.3}
        isExpanded={true}
        onExpand={() => setIsPlayerExpanded(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Background GIF */}
      <Image
        source={wavesGif}
        style={styles.backgroundGif}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      
      {/* Animated Header */}
      <Animated.View
        style={[styles.header, { paddingTop: insets.top, opacity: headerOpacity }]}
      >
        {Platform.OS === 'web' ? (
          <View style={[styles.headerWebFallback, { height: headerHeight }]}>
            <View style={styles.headerLeft} />
            <NeonText
              text="BLACK SKY"
              color={Colors.neonBlue}
              fontSize={isDesktop ? 18 : 20}
              style={styles.headerTitle}
            />
            <View style={styles.headerRight}>
              <InboxButton notificationCount={3} messageCount={2} />
            </View>
          </View>
        ) : (
          <BlurView intensity={80} tint="dark" style={[styles.headerBlur, { height: headerHeight }]}>
            <View style={styles.headerLeft} />
            <NeonText
              text="BLACK SKY"
              color={Colors.neonBlue}
              fontSize={isDesktop ? 18 : 20}
              style={styles.headerTitle}
            />
            <View style={styles.headerRight}>
              <InboxButton notificationCount={3} messageCount={2} />
            </View>
          </BlurView>
        )}
      </Animated.View>

      {/* Main Content */}
      <Animated.FlatList
        data={posts}
        renderItem={renderStatusCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (isDesktop ? 16 : 20),
            paddingBottom: isDesktop ? 70 : 90,
            paddingHorizontal: isMobile ? 8 : 0,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      />

      {/* Fixed Music Player */}
      <View
        style={[
          styles.playerContainer,
          {
            paddingBottom: insets.bottom,
            maxWidth: isDesktop ? 600 : '100%',
            alignSelf: 'center',
            left: isDesktop ? '50%' : 0,
            right: isDesktop ? 'auto' : 0,
            transform: isDesktop ? [{ translateX: -300 }] : [],
            width: isDesktop ? 600 : '100%',
          },
        ]}
      >
        <MusicPlayer
          albumArt="https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=640"
          title="Cybernetic Dreams"
          artist="Neon Synthesis"
          isPlaying={false}
          progress={0.3}
          onExpand={() => setIsPlayerExpanded(true)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 114, 255, 0.3)',
    paddingHorizontal: 16,
  },
  headerWebFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 114, 255, 0.3)',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    paddingHorizontal: 16,
  },
  headerLeft: {
    width: 44,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    letterSpacing: 2,
  },
  scrollContent: {
    alignItems: 'center',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
  },
});
