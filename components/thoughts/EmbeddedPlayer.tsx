import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Music,
  Play,
  Pause,
  ExternalLink,
  X,
  Link as LinkIcon,
  Youtube,
  Radio,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface EmbeddedPlayerProps {
  url?: string;
  onUrlChange?: (url: string) => void;
  editable?: boolean;
  compact?: boolean;
}

type MusicPlatform = 'youtube' | 'spotify' | 'soundcloud' | 'unknown';

interface ParsedUrl {
  platform: MusicPlatform;
  embedUrl: string;
  displayName: string;
  icon: React.ReactNode;
  color: string;
  videoId?: string;
}

export default function EmbeddedPlayer({
  url = '',
  onUrlChange,
  editable = false,
  compact = false,
}: EmbeddedPlayerProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const parseUrl = useCallback((urlString: string): ParsedUrl | null => {
    if (!urlString) return null;

    // YouTube
    const youtubeMatch = urlString.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&playsinline=1`,
        displayName: 'YouTube',
        icon: <Youtube size={16} color="#FF0000" />,
        color: '#FF0000',
        videoId: youtubeMatch[1],
      };
    }

    // Spotify
    const spotifyMatch = urlString.match(
      /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
    );
    if (spotifyMatch) {
      return {
        platform: 'spotify',
        embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`,
        displayName: 'Spotify',
        icon: <Radio size={16} color="#1DB954" />,
        color: '#1DB954',
      };
    }

    // SoundCloud
    const soundcloudMatch = urlString.match(/soundcloud\.com\/([^\/]+\/[^\/]+)/);
    if (soundcloudMatch) {
      return {
        platform: 'soundcloud',
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(urlString)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
        displayName: 'SoundCloud',
        icon: <Music size={16} color="#FF5500" />,
        color: '#FF5500',
      };
    }

    return null;
  }, []);

  const parsedUrl = parseUrl(inputUrl);

  const handleSubmitUrl = () => {
    onUrlChange?.(inputUrl);
    setShowInput(false);
  };

  const handleOpenExternal = () => {
    if (inputUrl) {
      Linking.openURL(inputUrl);
    }
  };

  const handleClearUrl = () => {
    setInputUrl('');
    onUrlChange?.('');
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsPlaying(true);
  };

  if (editable && !inputUrl && !showInput) {
    return (
      <Pressable onPress={() => setShowInput(true)}>
        <GlassCard style={styles.addMusicCard}>
          <Music size={20} color={Colors.neonPurple} />
          <Text style={styles.addMusicText}>Adjuntar música</Text>
          <LinkIcon size={14} color={Colors.textMuted} />
        </GlassCard>
      </Pressable>
    );
  }

  if (editable && showInput && !inputUrl) {
    return (
      <GlassCard style={styles.inputCard}>
        <View style={styles.inputHeader}>
          <Music size={16} color={Colors.neonPurple} />
          <Text style={styles.inputLabel}>Pega el enlace de la canción</Text>
          <Pressable onPress={() => setShowInput(false)}>
            <X size={18} color={Colors.textMuted} />
          </Pressable>
        </View>
        <TextInput
          style={styles.urlInput}
          placeholder="YouTube, Spotify o SoundCloud URL..."
          placeholderTextColor={Colors.textMuted}
          value={inputUrl}
          onChangeText={setInputUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.platformHints}>
          <View style={[styles.platformBadge, { borderColor: '#FF0000' }]}>
            <Youtube size={12} color="#FF0000" />
            <Text style={[styles.platformText, { color: '#FF0000' }]}>YouTube</Text>
          </View>
          <View style={[styles.platformBadge, { borderColor: '#1DB954' }]}>
            <Radio size={12} color="#1DB954" />
            <Text style={[styles.platformText, { color: '#1DB954' }]}>Spotify</Text>
          </View>
          <View style={[styles.platformBadge, { borderColor: '#FF5500' }]}>
            <Music size={12} color="#FF5500" />
            <Text style={[styles.platformText, { color: '#FF5500' }]}>SoundCloud</Text>
          </View>
        </View>
        <Pressable
          style={[styles.submitButton, !inputUrl && styles.submitButtonDisabled]}
          onPress={handleSubmitUrl}
          disabled={!inputUrl}
        >
          <Text style={styles.submitButtonText}>ADJUNTAR</Text>
        </Pressable>
      </GlassCard>
    );
  }

  if (!parsedUrl && inputUrl) {
    return (
      <GlassCard style={styles.errorCard}>
        <Text style={styles.errorText}>URL no reconocida</Text>
        {editable && (
          <Pressable onPress={handleClearUrl}>
            <X size={16} color={Colors.textMuted} />
          </Pressable>
        )}
      </GlassCard>
    );
  }

  if (!parsedUrl) return null;

  // Render inline player
  const renderInlinePlayer = () => {
    if (!isPlaying) {
      return (
        <View style={[styles.playerBody, { borderLeftColor: parsedUrl.color }]}>
          <Pressable
            style={[styles.playButton, { backgroundColor: parsedUrl.color }]}
            onPress={handlePlay}
          >
            <Play size={18} color="#FFF" />
          </Pressable>
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              Reproducir en {parsedUrl.displayName}
            </Text>
            <Text style={styles.trackUrl} numberOfLines={1}>
              {inputUrl}
            </Text>
          </View>
        </View>
      );
    }

    // Show embedded player
    const playerHeight = compact ? 80 : parsedUrl.platform === 'youtube' ? 200 : 152;

    return (
      <View style={[styles.webviewContainer, { height: playerHeight }]}>
        {Platform.OS === 'web' ? (
          <iframe
            src={parsedUrl.embedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 8,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <WebView
            source={{ uri: parsedUrl.embedUrl }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  return (
    <>
      <GlassCard style={[styles.playerCard, compact && styles.playerCardCompact]}>
        <View style={styles.playerHeader}>
          <View style={styles.platformInfo}>
            {parsedUrl.icon}
            <Text style={[styles.platformName, { color: parsedUrl.color }]}>
              {parsedUrl.displayName}
            </Text>
          </View>
          <View style={styles.playerActions}>
            {isPlaying && (
              <Pressable onPress={() => setIsPlaying(false)} style={styles.actionButton}>
                <Pause size={14} color={Colors.textSecondary} />
              </Pressable>
            )}
            {isPlaying && parsedUrl.platform === 'youtube' && (
              <Pressable onPress={handleExpand} style={styles.actionButton}>
                <Maximize2 size={14} color={Colors.textSecondary} />
              </Pressable>
            )}
            <Pressable onPress={handleOpenExternal} style={styles.actionButton}>
              <ExternalLink size={14} color={Colors.textSecondary} />
            </Pressable>
            {editable && (
              <Pressable onPress={handleClearUrl} style={styles.actionButton}>
                <X size={14} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {renderInlinePlayer()}
      </GlassCard>

      {/* Fullscreen Modal for YouTube */}
      <Modal
        visible={isExpanded}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsExpanded(false)}
      >
        <View style={styles.fullscreenContainer}>
          <View style={styles.fullscreenHeader}>
            <Pressable
              onPress={() => setIsExpanded(false)}
              style={styles.closeFullscreenButton}
            >
              <Minimize2 size={24} color={Colors.text} />
              <Text style={styles.closeFullscreenText}>Minimizar</Text>
            </Pressable>
          </View>
          <View style={styles.fullscreenPlayer}>
            {Platform.OS === 'web' ? (
              <iframe
                src={parsedUrl.embedUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <WebView
                source={{ uri: parsedUrl.embedUrl }}
                style={styles.fullscreenWebview}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  addMusicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
    borderStyle: 'dashed',
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  addMusicText: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(12, 0.3),
    color: Colors.textSecondary,
  },
  inputCard: {
    padding: Layout.spacing.md,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  inputLabel: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.textSecondary,
    flex: 1,
  },
  urlInput: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(12, 0.3),
    color: Colors.text,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
    marginBottom: Layout.spacing.sm,
  },
  platformHints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.md,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  platformText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
  },
  submitButton: {
    backgroundColor: Colors.neonPurple,
    borderRadius: Layout.borderRadius.sm,
    paddingVertical: Layout.spacing.sm,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: 'MajorMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.background,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.sm,
    borderColor: 'rgba(255, 0, 60, 0.3)',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.neonRed,
  },
  playerCard: {
    padding: Layout.spacing.sm,
  },
  playerCardCompact: {
    padding: Layout.spacing.xs,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  platformName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: Layout.moderateScale(10, 0.3),
  },
  playerActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    padding: 4,
  },
  playerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    borderLeftWidth: 3,
    paddingLeft: Layout.spacing.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.text,
  },
  trackUrl: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(9, 0.3),
    color: Colors.textMuted,
  },
  webviewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullscreenHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeFullscreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeFullscreenText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.text,
  },
  fullscreenPlayer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenWebview: {
    flex: 1,
  },
});
