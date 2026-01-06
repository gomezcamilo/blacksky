import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import {
  Lock,
  Music,
  Image as ImageIcon,
  X,
  Send,
  Camera,
  Link,
  Youtube,
  Radio,
  CheckCircle,
  Play,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import NeonText from '@/components/ui/NeonText';
import GlassCard from '@/components/ui/GlassCard';
import EncryptionBadge from '@/components/ui/EncryptionBadge';
import SuccessModal from '@/components/ui/SuccessModal';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { usePostsStore } from '@/stores/postsStore';

type EncryptionType = 'binary' | 'aes' | 'reverse';
type MusicPlatform = 'youtube' | 'spotify' | 'soundcloud' | null;

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const addPost = usePostsStore((state) => state.addPost);

  const [status, setStatus] = useState('');
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('aes');
  const [addingMusic, setAddingMusic] = useState(false);
  const [musicUrl, setMusicUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<MusicPlatform>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const contentPadding = isDesktop ? 24 : isTablet ? 20 : 16;
  const maxWidth = isDesktop ? 500 : isTablet ? 550 : width;

  const buttonScale = useSharedValue(1);

  const sizes = {
    title: isDesktop ? 20 : 22,
    input: isDesktop ? 13 : 14,
    label: isDesktop ? 11 : 12,
    button: isDesktop ? 13 : 14,
    icon: isDesktop ? 18 : 20,
  };

  // Detectar plataforma de música
  const detectPlatform = (url: string): MusicPlatform => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    return null;
  };

  const handleMusicUrlChange = (url: string) => {
    setMusicUrl(url);
    setDetectedPlatform(detectPlatform(url));
  };

  const getPlatformInfo = (platform: MusicPlatform) => {
    switch (platform) {
      case 'youtube':
        return { name: 'YouTube', color: '#FF0000', icon: Youtube };
      case 'spotify':
        return { name: 'Spotify', color: '#1DB954', icon: Radio };
      case 'soundcloud':
        return { name: 'SoundCloud', color: '#FF5500', icon: Music };
      default:
        return null;
    }
  };

  // Obtener URL de embed para preview
  const getEmbedUrl = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
      return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`;
    }
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&hide_related=true`;
    }
    return null;
  };

  const handleEncryptionTypeChange = (type: EncryptionType) => {
    setEncryptionType(type);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 100, easing: Easing.inOut(Easing.quad) })
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!status.trim() || isPublishing) return;

    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    addPost({
      username: 'VOID RUNNER',
      handle: 'void_runner',
      avatar: 'https://images.pexels.com/photos/4456996/pexels-photo-4456996.jpeg?auto=compress&cs=tinysrgb&w=640',
      content: status,
      encryptionType,
      hasMusic: !!musicUrl && !!detectedPlatform,
      musicTitle: detectedPlatform ? getPlatformInfo(detectedPlatform)?.name : undefined,
      musicArtist: musicUrl || undefined,
      musicUrl: musicUrl || undefined,
      imageUrl: selectedImage || undefined,
      isOwn: true,
    });

    setIsPublishing(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setStatus('');
    setMusicUrl('');
    setDetectedPlatform(null);
    setAddingMusic(false);
    setSelectedImage(null);
    router.push('/(tabs)');
  };

  const handleRemoveMusic = () => {
    setMusicUrl('');
    setDetectedPlatform(null);
    setAddingMusic(false);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const encryptionOptions: { type: EncryptionType; label: string; color: string }[] = [
    { type: 'binary', label: 'BINARY', color: Colors.binaryColor },
    { type: 'aes', label: 'AES-256', color: Colors.aesColor },
    { type: 'reverse', label: 'REVERSE', color: Colors.reverseColor },
  ];

  const platformInfo = detectedPlatform ? getPlatformInfo(detectedPlatform) : null;
  const embedUrl = musicUrl ? getEmbedUrl(musicUrl) : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 100,
            paddingHorizontal: contentPadding,
            maxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <NeonText text="CREATE STATUS" color={Colors.neonBlue} fontSize={sizes.title} />
          <EncryptionBadge type={encryptionType} size="medium" />
        </View>

        {/* Input Card */}
        <GlassCard style={styles.inputCard}>
          <TextInput
            style={[styles.input, { fontSize: sizes.input }]}
            placeholder="What's on your mind?"
            placeholderTextColor={Colors.textMuted}
            multiline
            value={status}
            onChangeText={setStatus}
            maxLength={500}
          />
          <Text style={styles.charCount}>{status.length}/500</Text>
        </GlassCard>

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <Pressable style={styles.removeImage} onPress={() => setSelectedImage(null)}>
              <X size={18} color={Colors.text} />
            </Pressable>
          </View>
        )}

        {/* Music URL Preview - cuando ya hay una URL válida */}
        {musicUrl && detectedPlatform && !addingMusic && platformInfo && (
          <View style={styles.musicPreviewSection}>
            <View style={[styles.musicPreview, { borderLeftColor: platformInfo.color }]}>
              <View style={styles.musicPreviewContent}>
                <platformInfo.icon size={20} color={platformInfo.color} />
                <View style={styles.musicPreviewInfo}>
                  <Text style={[styles.musicPreviewPlatform, { color: platformInfo.color }]}>
                    {platformInfo.name}
                  </Text>
                  <Text style={styles.musicPreviewUrl} numberOfLines={1}>
                    {musicUrl}
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleRemoveMusic} style={styles.musicRemoveBtn}>
                <X size={16} color={Colors.textMuted} />
              </Pressable>
            </View>
            {/* Embedded Preview */}
            {embedUrl && (
              <View style={[styles.embedPreview, { height: detectedPlatform === 'youtube' ? 180 : 80 }]}>
                {Platform.OS === 'web' ? (
                  <iframe
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <WebView
                    source={{ uri: embedUrl }}
                    style={styles.webview}
                    allowsInlineMediaPlayback
                    javaScriptEnabled
                    domStorageEnabled
                  />
                )}
              </View>
            )}
          </View>
        )}

        {/* Encryption Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sizes.label }]}>ENCRYPTION TYPE</Text>
          <View style={styles.encryptionOptions}>
            {encryptionOptions.map((option) => (
              <Animated.View
                key={option.type}
                style={encryptionType === option.type ? buttonAnimatedStyle : undefined}
              >
                <Pressable
                  style={[
                    styles.encryptionOption,
                    encryptionType === option.type && {
                      borderColor: option.color,
                      backgroundColor: `${option.color}15`,
                    },
                  ]}
                  onPress={() => handleEncryptionTypeChange(option.type)}
                >
                  <Lock
                    size={sizes.icon}
                    color={encryptionType === option.type ? option.color : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.encryptionLabel,
                      { fontSize: sizes.label - 1 },
                      encryptionType === option.type && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Music URL Input */}
        {addingMusic ? (
          <GlassCard style={styles.musicCard}>
            <View style={styles.musicHeader}>
              <View style={styles.musicHeaderTitle}>
                <Link size={16} color={Colors.neonPurple} />
                <Text style={[styles.sectionTitle, { fontSize: sizes.label, marginBottom: 0, marginLeft: 8 }]}>
                  MUSIC URL
                </Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setAddingMusic(false)}>
                <X size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Platform badges */}
            <View style={styles.platformBadges}>
              <View style={[styles.platformBadge, { borderColor: '#FF0000' }]}>
                <Youtube size={12} color="#FF0000" />
                <Text style={[styles.platformBadgeText, { color: '#FF0000' }]}>YouTube</Text>
              </View>
              <View style={[styles.platformBadge, { borderColor: '#1DB954' }]}>
                <Radio size={12} color="#1DB954" />
                <Text style={[styles.platformBadgeText, { color: '#1DB954' }]}>Spotify</Text>
              </View>
              <View style={[styles.platformBadge, { borderColor: '#FF5500' }]}>
                <Music size={12} color="#FF5500" />
                <Text style={[styles.platformBadgeText, { color: '#FF5500' }]}>SoundCloud</Text>
              </View>
            </View>

            {/* URL Input */}
            <View style={styles.urlInputContainer}>
              <TextInput
                style={[styles.urlInput, { fontSize: sizes.input }]}
                placeholder="Paste YouTube, Spotify or SoundCloud URL..."
                placeholderTextColor={Colors.textMuted}
                value={musicUrl}
                onChangeText={handleMusicUrlChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {detectedPlatform && platformInfo && (
                <View style={[styles.detectedBadge, { backgroundColor: platformInfo.color }]}>
                  <CheckCircle size={12} color="#FFF" />
                  <Text style={styles.detectedBadgeText}>{platformInfo.name}</Text>
                </View>
              )}
            </View>

            {/* Confirm Button */}
            <Pressable
              style={[
                styles.confirmMusicBtn,
                !detectedPlatform && styles.confirmMusicBtnDisabled,
              ]}
              onPress={() => detectedPlatform && setAddingMusic(false)}
              disabled={!detectedPlatform}
            >
              <Text style={[styles.confirmMusicText, !detectedPlatform && { color: Colors.textMuted }]}>
                {detectedPlatform ? 'ATTACH MUSIC' : 'PASTE A VALID URL'}
              </Text>
            </Pressable>
          </GlassCard>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: sizes.label }]}>ATTACHMENTS</Text>
            <View style={styles.attachmentOptions}>
              <Pressable 
                style={[
                  styles.attachmentOption,
                  musicUrl && detectedPlatform && styles.attachmentOptionActive,
                ]} 
                onPress={() => setAddingMusic(true)}
              >
                <Music size={sizes.icon + 2} color={musicUrl && detectedPlatform ? Colors.neonGreen : Colors.neonPurple} />
                <Text style={[styles.attachmentLabel, { fontSize: sizes.label - 1 }]}>MUSIC</Text>
                {musicUrl && detectedPlatform && (
                  <View style={styles.attachmentCheck}>
                    <CheckCircle size={12} color={Colors.neonGreen} />
                  </View>
                )}
              </Pressable>

              <Pressable 
                style={[
                  styles.attachmentOption,
                  selectedImage && styles.attachmentOptionActive,
                ]} 
                onPress={pickImage}
              >
                <ImageIcon size={sizes.icon + 2} color={selectedImage ? Colors.neonGreen : Colors.neonBlue} />
                <Text style={[styles.attachmentLabel, { fontSize: sizes.label - 1 }]}>IMAGE</Text>
                {selectedImage && (
                  <View style={styles.attachmentCheck}>
                    <CheckCircle size={12} color={Colors.neonGreen} />
                  </View>
                )}
              </Pressable>

              <Pressable style={styles.attachmentOption} onPress={pickImage}>
                <Camera size={sizes.icon + 2} color={Colors.neonGreen} />
                <Text style={[styles.attachmentLabel, { fontSize: sizes.label - 1 }]}>CAMERA</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Publish Button */}
        <Pressable
          style={[styles.sendButton, !status.trim() && styles.sendButtonDisabled]}
          onPress={handlePublish}
          disabled={!status.trim() || isPublishing}
        >
          <Send size={sizes.icon} color={!status.trim() ? Colors.textMuted : Colors.background} />
          <Text style={[styles.sendButtonText, { fontSize: sizes.button }, !status.trim() && styles.sendButtonTextDisabled]}>
            {isPublishing ? 'BROADCASTING...' : 'BROADCAST'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="¡Publicación exitosa!"
        message="Tu mensaje ha sido encriptado y transmitido al void. Ahora es parte de la red anónima."
        encryptionType={encryptionType}
      />
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  inputCard: {
    marginBottom: 20,
  },
  input: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 6,
  },
  musicPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 20,
  },
  musicPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  musicPreviewInfo: {
    flex: 1,
  },
  musicPreviewPlatform: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
  },
  musicPreviewUrl: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  musicRemoveBtn: {
    padding: 6,
  },
  musicPreviewSection: {
    marginBottom: 20,
  },
  embedPreview: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  encryptionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  encryptionOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  encryptionLabel: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  attachmentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentOption: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    minWidth: 80,
    position: 'relative',
  },
  attachmentOptionActive: {
    borderColor: Colors.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  attachmentLabel: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  attachmentCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  musicCard: {
    marginBottom: 24,
  },
  musicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  musicHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  platformBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  platformBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
  },
  urlInputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  urlInput: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 100,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
  },
  detectedBadge: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detectedBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: '#FFF',
  },
  confirmMusicBtn: {
    backgroundColor: Colors.neonPurple,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmMusicBtnDisabled: {
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
  },
  confirmMusicText: {
    fontFamily: 'MajorMono',
    fontSize: 12,
    color: Colors.background,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonPurple,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
  },
  sendButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.background,
    marginLeft: 8,
  },
  sendButtonTextDisabled: {
    color: Colors.textMuted,
  },
});
