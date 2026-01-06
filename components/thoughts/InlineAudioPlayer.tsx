import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Music,
  X,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import Colors from '@/constants/Colors';

interface InlineAudioPlayerProps {
  url: string;
  title?: string;
}

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

// Componente del botón de play (para usar al lado del título)
export function PlayButton({ 
  onPress, 
  isPlaying, 
  color 
}: { 
  onPress: () => void; 
  isPlaying: boolean; 
  color: string;
}) {
  return (
    <Pressable
      style={[styles.playButtonInline, { backgroundColor: color }]}
      onPress={onPress}
    >
      {isPlaying ? (
        <Pause size={14} color="#FFF" />
      ) : (
        <Play size={14} color="#FFF" style={{ marginLeft: 1 }} />
      )}
    </Pressable>
  );
}

// Componente del reproductor expandido (para usar dentro del contenido)
export function ExpandedPlayer({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const getEmbedUrl = () => {
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&playsinline=1`,
        color: '#FF0000',
        name: 'YouTube',
      };
    }

    const spotifyMatch = url.match(
      /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
    );
    if (spotifyMatch) {
      return {
        platform: 'spotify',
        embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`,
        color: '#1DB954',
        name: 'Spotify',
      };
    }

    if (url.includes('soundcloud.com')) {
      return {
        platform: 'soundcloud',
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false`,
        color: '#FF5500',
        name: 'SoundCloud',
      };
    }

    return null;
  };

  const parsedUrl = getEmbedUrl();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + playbackSpeed;
          if (newTime >= duration) {
            setIsPlaying(false);
            return 0;
          }
          setProgress(newTime / duration);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    setProgress(newTime / duration);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    setProgress(newTime / duration);
  };

  const handleSpeedChange = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  if (!parsedUrl) return null;

  const playerHeight = parsedUrl.platform === 'youtube' ? 160 : 80;

  return (
    <View style={[styles.expandedPlayer, { borderLeftColor: parsedUrl.color }]}>
      {/* Header */}
      <View style={styles.playerHeader}>
        <View style={styles.playerTitleRow}>
          <Music size={14} color={parsedUrl.color} />
          <Text style={[styles.playerTitle, { color: parsedUrl.color }]}>
            {parsedUrl.name}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <X size={16} color={Colors.textMuted} />
        </Pressable>
      </View>

      {/* Embedded Player */}
      <View style={[styles.embedContainer, { height: playerHeight }]}>
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
          />
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <Pressable style={styles.controlBtn} onPress={handleRestart}>
          <RotateCcw size={14} color={Colors.text} />
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={handleSkipBack}>
          <SkipBack size={14} color={Colors.text} />
        </Pressable>

        <Pressable
          style={[styles.playPauseBtn, { backgroundColor: parsedUrl.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause size={16} color="#FFF" />
          ) : (
            <Play size={16} color="#FFF" style={{ marginLeft: 1 }} />
          )}
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={handleSkipForward}>
          <SkipForward size={14} color={Colors.text} />
        </Pressable>

        <Pressable style={styles.speedBtn} onPress={handleSpeedChange}>
          <Text style={[styles.speedText, { color: parsedUrl.color }]}>
            {playbackSpeed}x
          </Text>
        </Pressable>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: parsedUrl.color }]}
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

// Hook para obtener el color de la plataforma
export function usePlayerColor(url: string): string {
  if (url.includes('youtube') || url.includes('youtu.be')) return '#FF0000';
  if (url.includes('spotify')) return '#1DB954';
  if (url.includes('soundcloud')) return '#FF5500';
  return Colors.neonPurple;
}

// Componente principal (mantiene compatibilidad)
export default function InlineAudioPlayer({ url, title }: InlineAudioPlayerProps) {
  const color = usePlayerColor(url);
  return <PlayButton onPress={() => {}} isPlaying={false} color={color} />;
}

const styles = StyleSheet.create({
  playButtonInline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  expandedPlayer: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
  },
  closeButton: {
    padding: 4,
  },
  embedContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 10,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  controlBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  speedText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
    width: 28,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
