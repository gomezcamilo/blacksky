import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Unlock,
  Globe,
  BookOpen,
  Send,
  MoreHorizontal,
  MousePointer,
  ThumbsDown,
  HelpCircle,
  UserPlus,
  UserMinus,
} from 'lucide-react-native';
import GlassCard from '@/components/ui/GlassCard';
import { PlayButton, ExpandedPlayer, usePlayerColor, Thought } from '@/components/thoughts';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useUsersStore } from '@/stores/usersStore';

const zondaGif = require('@/assets/images/zonda.gif');

const categoryLabels: Record<string, string> = {
  reflexion: 'Reflexión',
  poema: 'Poema',
  historia: 'Historia',
  diario: 'Diario',
  pensamiento: 'Pensamiento',
};

const categoryColors: Record<string, string> = {
  reflexion: Colors.neonBlue,
  poema: Colors.neonPurple,
  historia: Colors.neonGreen,
  diario: '#FFD700',
  pensamiento: Colors.neonRed,
};

const encryptionColors: Record<string, string> = {
  binary: Colors.neonGreen,
  aes: Colors.neonBlue,
  reverse: Colors.neonPurple,
};

// Mock comments
const mockComments = [
  {
    id: '1',
    author: { nickname: 'cyber_reader', avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100' },
    content: 'Esto me llegó al alma. Gracias por compartir.',
    likes: 12,
    dislikes: 1,
    doubts: 2,
    createdAt: '1h',
  },
  {
    id: '2',
    author: { nickname: 'void_listener' },
    content: 'Increíble forma de expresar lo que muchos sentimos.',
    likes: 8,
    dislikes: 0,
    doubts: 1,
    createdAt: '2h',
  },
  {
    id: '3',
    author: { nickname: 'neon_soul' },
    content: '🔥🔥🔥',
    likes: 5,
    dislikes: 0,
    doubts: 0,
    createdAt: '3h',
  },
];

export default function BoardDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isDoubtful, setIsDoubtful] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [doubtsCount, setDoubtsCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);

  const isTablet = width >= 768;
  const contentPadding = isTablet ? Layout.moderateScale(32) : Layout.spacing.md;

  // Parse thought data from params
  let thought: Thought | null = null;
  try {
    if (params.data) {
      thought = JSON.parse(params.data as string);
      if (thought && likesCount === 0) {
        // Initialize likes count only once
      }
    }
  } catch (e) {
    console.error('Error parsing thought data:', e);
  }

  // Get user follow state - need to do this after thought is parsed
  const authorHandle = thought?.author?.nickname || '';
  const isFollowingUser = useUsersStore((state) => state.isFollowing(authorHandle));
  const followUser = useUsersStore((state) => state.followUser);
  const unfollowUser = useUsersStore((state) => state.unfollowUser);
  const getUser = useUsersStore((state) => state.getUser);
  const user = getUser(authorHandle);

  const handleFollowToggle = () => {
    if (isFollowingUser) {
      unfollowUser(authorHandle);
    } else {
      followUser(authorHandle);
    }
  };

  const handleUserPress = () => {
    if (authorHandle) {
      router.push(`/user/${authorHandle}`);
    }
  };

  if (!thought) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Publicación no encontrada</Text>
      </View>
    );
  }

  const categoryColor = categoryColors[thought.category] || Colors.neonBlue;
  const encryptionType = thought.encryptionType || 'binary';
  const encryptionColor = encryptionColors[encryptionType];

  const getEncryptedContent = (text: string) => {
    switch (encryptionType) {
      case 'binary':
        return text.replace(/[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, () => 
          Math.round(Math.random()).toString()
        );
      case 'reverse':
        return text.split('').reverse().join('');
      case 'aes':
      default:
        return text.replace(/[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, () => 
          String.fromCharCode(Math.floor(Math.random() * 26) + 65)
        );
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikesCount(prev => prev - 1);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
      setDislikesCount(prev => prev - 1);
    } else {
      setIsDisliked(true);
      setDislikesCount(prev => prev + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    }
  };

  const handleDoubt = () => {
    setIsDoubtful(!isDoubtful);
    setDoubtsCount(prev => isDoubtful ? prev - 1 : prev + 1);
  };

  const handleDecrypt = () => {
    setTapCount(prev => prev + 1);
    setIsDecrypted(!isDecrypted);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      author: { nickname: 'tu_usuario' },
      content: newComment,
      likes: 0,
      dislikes: 0,
      doubts: 0,
      createdAt: 'ahora',
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const displayContent = isDecrypted ? thought.content : getEncryptedContent(thought.content);
  const displayTitle = thought.title 
    ? (isDecrypted ? thought.title : getEncryptedContent(thought.title))
    : null;

  const musicColor = thought.musicUrl ? usePlayerColor(thought.musicUrl) : Colors.neonPurple;

  const handleMusicToggle = () => {
    setIsMusicExpanded(!isMusicExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Background GIF */}
      <Image
        source={zondaGif}
        style={styles.backgroundGif}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 80,
            maxWidth: isTablet ? 700 : '100%',
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: contentPadding }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
          <View style={[styles.encryptionTag, { backgroundColor: encryptionColor }]}>
            <Lock size={12} color={Colors.background} />
            <Text style={styles.encryptionTagText}>{encryptionType.toUpperCase()}</Text>
          </View>
          <Pressable style={styles.moreButton}>
            <MoreHorizontal size={24} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Cover Image */}
        {thought.coverImage && (
          <View style={styles.coverContainer}>
            <Image source={{ uri: thought.coverImage }} style={styles.coverImage} />
            <LinearGradient
              colors={['transparent', Colors.background]}
              style={styles.coverGradient}
            />
          </View>
        )}

        {/* Author Info */}
        <View style={[styles.authorSection, { paddingHorizontal: contentPadding }]}>
          <Pressable style={styles.authorInfo} onPress={handleUserPress}>
            {thought.author.avatar ? (
              <Image source={{ uri: thought.author.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { borderColor: categoryColor }]}>
                <Text style={styles.avatarText}>
                  {thought.author.nickname.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <View style={styles.nicknameRow}>
                <Text style={styles.nickname}>@{thought.author.nickname}</Text>
                {user && (
                  <Text style={styles.followersBadge}>{user.followersCount}</Text>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.timestamp}>{thought.createdAt}</Text>
                {thought.isPrivate ? (
                  <Lock size={12} color={Colors.textMuted} />
                ) : (
                  <Globe size={12} color={Colors.textMuted} />
                )}
              </View>
            </View>
          </Pressable>
          <View style={styles.authorActions}>
            <Pressable 
              style={[styles.followButton, isFollowingUser && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              {isFollowingUser ? (
                <UserMinus size={14} color={Colors.neonGreen} />
              ) : (
                <UserPlus size={14} color={Colors.neonPurple} />
              )}
            </Pressable>
            <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
              <BookOpen size={12} color={Colors.background} />
              <Text style={styles.categoryTagText}>{categoryLabels[thought.category]}</Text>
            </View>
          </View>
        </View>

        {/* Title with Music Player */}
        {displayTitle && (
          <View style={[styles.titleSection, { paddingHorizontal: contentPadding }]}>
            <Text style={[styles.title, { color: isDecrypted ? categoryColor : Colors.textMuted, flex: 1 }]}>
              {displayTitle}
            </Text>
            {thought.musicUrl && isDecrypted && (
              <PlayButton 
                onPress={handleMusicToggle} 
                isPlaying={isMusicExpanded} 
                color={musicColor} 
              />
            )}
          </View>
        )}

        {/* Music label when no title but has music */}
        {!displayTitle && thought.musicUrl && isDecrypted && (
          <View style={[styles.titleSection, { paddingHorizontal: contentPadding }]}>
            <Text style={[styles.musicLabel, { color: categoryColor }]}>
              🎵 Música adjunta
            </Text>
            <PlayButton 
              onPress={handleMusicToggle} 
              isPlaying={isMusicExpanded} 
              color={musicColor} 
            />
          </View>
        )}

        {/* Content */}
        <Pressable 
          onPress={handleDecrypt}
          style={[styles.contentSection, { paddingHorizontal: contentPadding }]}
        >
          <GlassCard 
            style={styles.contentCard}
            glowColor={isDecrypted ? Colors.neonGreen : encryptionColor}
            showGlow={isDecrypted}
          >
            {/* Music Player inside content - at the top */}
            {thought.musicUrl && isDecrypted && isMusicExpanded && (
              <ExpandedPlayer 
                url={thought.musicUrl} 
                onClose={() => setIsMusicExpanded(false)} 
              />
            )}

            <Text style={[styles.content, !isDecrypted && styles.encryptedContent]}>
              {displayContent}
            </Text>
            
            {!isDecrypted && (
              <View style={styles.decryptOverlay}>
                <Lock size={24} color={encryptionColor} />
                <Text style={[styles.decryptText, { color: encryptionColor }]}>
                  TAP TO DECRYPT
                </Text>
              </View>
            )}
            
            {isDecrypted && (
              <View style={styles.decryptedIndicator}>
                <Unlock size={14} color={Colors.neonGreen} />
                <Text style={styles.decryptedText}>decrypted · tap to encrypt</Text>
              </View>
            )}
          </GlassCard>
        </Pressable>

        {/* Tap Counter */}
        <View style={[styles.tapCounterSection, { paddingHorizontal: contentPadding }]}>
          <View style={styles.tapCounter}>
            <MousePointer size={16} color={Colors.neonPurple} />
            <Text style={styles.tapCounterText}>{tapCount} taps para descifrar</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actionsSection, { paddingHorizontal: contentPadding }]}>
          <Pressable style={styles.actionButton} onPress={handleLike}>
            <Heart 
              size={22} 
              color={isLiked ? Colors.neonRed : Colors.textSecondary}
              fill={isLiked ? Colors.neonRed : 'transparent'}
            />
            <Text style={[styles.actionText, isLiked && { color: Colors.neonRed }]}>
              {thought.likes + likesCount}
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleDoubt}>
            <HelpCircle 
              size={22} 
              color={isDoubtful ? '#FFA500' : Colors.textSecondary}
              fill={isDoubtful ? 'rgba(255, 165, 0, 0.2)' : 'transparent'}
            />
            <Text style={[styles.actionText, isDoubtful && { color: '#FFA500' }]}>
              {doubtsCount}
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleDislike}>
            <ThumbsDown 
              size={22} 
              color={isDisliked ? Colors.neonBlue : Colors.textSecondary}
              fill={isDisliked ? Colors.neonBlue : 'transparent'}
            />
            <Text style={[styles.actionText, isDisliked && { color: Colors.neonBlue }]}>
              {dislikesCount}
            </Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <MessageCircle size={22} color={Colors.textSecondary} />
            <Text style={styles.actionText}>{thought.comments + comments.length - 3}</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Share2 size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Comments Section */}
        <View style={[styles.commentsSection, { paddingHorizontal: contentPadding }]}>
          <Text style={styles.commentsTitle}>COMENTARIOS</Text>
          
          {comments.map((comment) => (
            <GlassCard key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                {comment.author.avatar ? (
                  <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={styles.commentAvatarPlaceholder}>
                    <Text style={styles.commentAvatarText}>
                      {comment.author.nickname.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.commentInfo}>
                  <Text style={styles.commentNickname}>@{comment.author.nickname}</Text>
                  <Text style={styles.commentTime}>{comment.createdAt}</Text>
                </View>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <View style={styles.commentActions}>
                <Pressable style={styles.commentAction}>
                  <Heart size={14} color={Colors.textMuted} />
                  <Text style={styles.commentActionText}>{comment.likes}</Text>
                </Pressable>
                <Pressable style={styles.commentAction}>
                  <HelpCircle size={14} color={Colors.textMuted} />
                  <Text style={styles.commentActionText}>{comment.doubts}</Text>
                </Pressable>
                <Pressable style={styles.commentAction}>
                  <ThumbsDown size={14} color={Colors.textMuted} />
                  <Text style={styles.commentActionText}>{comment.dislikes}</Text>
                </Pressable>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={styles.commentInput}
          placeholder="Escribe un comentario..."
          placeholderTextColor={Colors.textMuted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <Pressable 
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Send size={20} color={newComment.trim() ? Colors.background : Colors.textMuted} />
        </Pressable>
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
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
  },
  backButton: {
    padding: 8,
  },
  encryptionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.borderRadius.sm,
  },
  encryptionTagText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: Colors.background,
  },
  moreButton: {
    padding: 8,
  },
  coverContainer: {
    height: 250,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.neonPurple,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'MajorMono',
    fontSize: 18,
    color: Colors.neonPurple,
  },
  nickname: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    color: Colors.text,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followersBadge: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  timestamp: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textMuted,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.borderRadius.sm,
  },
  categoryTagText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: Colors.background,
  },
  authorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  followingButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderColor: Colors.neonGreen,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    zIndex: 100,
  },
  title: {
    fontFamily: 'MajorMono',
    fontSize: 24,
  },
  musicLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    flex: 1,
  },
  contentSection: {
    marginBottom: Layout.spacing.lg,
  },
  contentCard: {
    padding: Layout.spacing.lg,
  },
  content: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
  encryptedContent: {
    color: Colors.textMuted,
    opacity: 0.7,
  },
  decryptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.8)',
    borderRadius: Layout.borderRadius.lg,
  },
  decryptText: {
    fontFamily: 'MajorMono',
    fontSize: 14,
    marginTop: 8,
  },
  decryptedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  decryptedText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonGreen,
    opacity: 0.7,
  },
  musicSection: {
    marginBottom: Layout.spacing.lg,
  },
  tapCounterSection: {
    marginBottom: Layout.spacing.md,
  },
  tapCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  tapCounterText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.neonPurple,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Layout.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: Layout.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  commentsSection: {
    marginBottom: Layout.spacing.xl,
  },
  commentsTitle: {
    fontFamily: 'MajorMono',
    fontSize: 14,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  commentCard: {
    marginBottom: Layout.spacing.sm,
    padding: Layout.spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Layout.spacing.sm,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  commentAvatarText: {
    fontFamily: 'MajorMono',
    fontSize: 12,
    color: Colors.neonPurple,
  },
  commentInfo: {
    flex: 1,
  },
  commentNickname: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    color: Colors.text,
  },
  commentTime: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  commentContent: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: Layout.spacing.sm,
    gap: Layout.spacing.md,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Layout.spacing.md,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: Layout.spacing.sm,
  },
  commentInput: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
