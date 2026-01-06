import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Lock,
  Unlock,
  Globe,
  BookOpen,
  MousePointer,
  ThumbsDown,
  HelpCircle,
  UserPlus,
  UserMinus,
} from 'lucide-react-native';
import GlassCard from '@/components/ui/GlassCard';
import EmbeddedPlayer from './EmbeddedPlayer';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useUsersStore } from '@/stores/usersStore';

export interface Thought {
  id: string;
  author: {
    nickname: string;
    avatar?: string;
  };
  coverImage?: string;
  title?: string;
  content: string;
  category: 'reflexion' | 'poema' | 'historia' | 'diario' | 'pensamiento';
  encryptionType?: 'binary' | 'aes' | 'reverse';
  musicUrl?: string;
  isPrivate: boolean;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
}

interface ThoughtCardProps {
  thought: Thought;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

const categoryLabels: Record<Thought['category'], string> = {
  reflexion: 'Reflexión',
  poema: 'Poema',
  historia: 'Historia',
  diario: 'Diario',
  pensamiento: 'Pensamiento',
};

const categoryColors: Record<Thought['category'], string> = {
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

export default function ThoughtCard({
  thought,
  onPress,
  onLike,
  onComment,
  onShare,
}: ThoughtCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(thought.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isDoubtful, setIsDoubtful] = useState(false);
  const [likesCount, setLikesCount] = useState(thought.likes);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [doubtsCount, setDoubtsCount] = useState(0);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const isFollowingUser = useUsersStore((state) => state.isFollowing(thought.author.nickname));
  const followUser = useUsersStore((state) => state.followUser);
  const unfollowUser = useUsersStore((state) => state.unfollowUser);
  const getUser = useUsersStore((state) => state.getUser);
  const user = getUser(thought.author.nickname);

  const handleFollowToggle = () => {
    if (isFollowingUser) {
      unfollowUser(thought.author.nickname);
    } else {
      followUser(thought.author.nickname);
    }
  };

  const handleUserPress = () => {
    router.push(`/user/${thought.author.nickname}`);
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
    onLike?.();
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

  const categoryColor = categoryColors[thought.category];
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

  const displayContent = isDecrypted ? thought.content : getEncryptedContent(thought.content);
  const displayTitle = thought.title 
    ? (isDecrypted ? thought.title : getEncryptedContent(thought.title))
    : null;

  return (
    <Pressable onPress={onPress}>
      <GlassCard 
        style={styles.container}
        glowColor={isDecrypted ? Colors.neonGreen : encryptionColor}
        showGlow={isDecrypted}
      >
        {/* Cover Image */}
        {thought.coverImage && (
          <View style={styles.coverContainer}>
            <Image 
              source={{ uri: thought.coverImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <BookOpen size={10} color={Colors.background} />
              <Text style={styles.categoryText}>{categoryLabels[thought.category]}</Text>
            </View>
            <View style={[styles.encryptionBadge, { backgroundColor: encryptionColor }]}>
              <Lock size={10} color={Colors.background} />
              <Text style={styles.encryptionBadgeText}>{encryptionType.toUpperCase()}</Text>
            </View>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
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
                  <Lock size={10} color={Colors.textMuted} />
                ) : (
                  <Globe size={10} color={Colors.textMuted} />
                )}
                {!thought.coverImage && (
                  <View style={[styles.inlineEncryption, { borderColor: encryptionColor }]}>
                    <Lock size={8} color={encryptionColor} />
                    <Text style={[styles.inlineEncryptionText, { color: encryptionColor }]}>
                      {encryptionType.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable 
              style={[styles.followButton, isFollowingUser && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              {isFollowingUser ? (
                <UserMinus size={12} color={Colors.neonGreen} />
              ) : (
                <UserPlus size={12} color={Colors.neonPurple} />
              )}
            </Pressable>
            <Pressable style={styles.moreButton}>
              <MoreHorizontal size={18} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Title */}
        {displayTitle && (
          <Text style={[styles.title, { color: isDecrypted ? categoryColor : Colors.textMuted }]}>
            {displayTitle}
          </Text>
        )}

        {/* Content with encryption */}
        <Pressable onPress={handleDecrypt} style={styles.contentContainer}>
          <Text 
            style={[
              styles.content, 
              !isDecrypted && styles.encryptedContent
            ]} 
            numberOfLines={isDecrypted ? 8 : 4}
          >
            {displayContent}
          </Text>
          
          {!isDecrypted && (
            <View style={styles.decryptOverlay}>
              <Lock size={16} color={encryptionColor} />
              <Text style={[styles.decryptText, { color: encryptionColor }]}>
                TAP TO DECRYPT
              </Text>
            </View>
          )}
          
          {isDecrypted && (
            <View style={styles.decryptedIndicator}>
              <Unlock size={12} color={Colors.neonGreen} />
              <Text style={styles.decryptedText}>decrypted · tap to encrypt</Text>
              <View style={styles.tapCounterInline}>
                <MousePointer size={10} color={Colors.neonPurple} />
                <Text style={styles.tapCounterText}>{tapCount}</Text>
              </View>
            </View>
          )}
        </Pressable>

        {/* Music Player */}
        {thought.musicUrl && isDecrypted && (
          <View style={styles.musicContainer}>
            <EmbeddedPlayer url={thought.musicUrl} compact />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleLike}>
            <Heart 
              size={18} 
              color={isLiked ? Colors.neonRed : Colors.textSecondary}
              fill={isLiked ? Colors.neonRed : 'transparent'}
            />
            <Text style={[styles.actionText, isLiked && { color: Colors.neonRed }]}>
              {likesCount}
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleDoubt}>
            <HelpCircle 
              size={18} 
              color={isDoubtful ? '#FFA500' : Colors.textSecondary}
              fill={isDoubtful ? 'rgba(255, 165, 0, 0.2)' : 'transparent'}
            />
            <Text style={[styles.actionText, isDoubtful && { color: '#FFA500' }]}>
              {doubtsCount}
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleDislike}>
            <ThumbsDown 
              size={18} 
              color={isDisliked ? Colors.neonBlue : Colors.textSecondary}
              fill={isDisliked ? Colors.neonBlue : 'transparent'}
            />
            <Text style={[styles.actionText, isDisliked && { color: Colors.neonBlue }]}>
              {dislikesCount}
            </Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={onComment}>
            <MessageCircle size={18} color={Colors.textSecondary} />
            <Text style={styles.actionText}>{thought.comments}</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={onShare}>
            <Share2 size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </GlassCard>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  coverContainer: {
    position: 'relative',
    height: Layout.moderateScale(160, 0.4),
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
  },
  categoryText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: Colors.background,
  },
  encryptionBadge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
  },
  encryptionBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 8,
    color: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'MajorMono',
    fontSize: 14,
    color: Colors.neonPurple,
  },
  nickname: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: Layout.moderateScale(12, 0.3),
    color: Colors.text,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followersBadge: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(10, 0.3),
    color: Colors.textMuted,
  },
  inlineEncryption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    marginLeft: 4,
  },
  inlineEncryptionText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 7,
  },
  moreButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  title: {
    fontFamily: 'MajorMono',
    fontSize: Layout.moderateScale(16, 0.3),
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  contentContainer: {
    position: 'relative',
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  content: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(12, 0.3),
    color: Colors.text,
    lineHeight: 20,
  },
  encryptedContent: {
    color: Colors.textMuted,
    opacity: 0.7,
  },
  decryptOverlay: {
    position: 'absolute',
    top: 0,
    left: Layout.spacing.md,
    right: Layout.spacing.md,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.7)',
    borderRadius: Layout.borderRadius.sm,
  },
  decryptText: {
    fontFamily: 'MajorMono',
    fontSize: 11,
    marginTop: 4,
  },
  decryptedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  decryptedText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.neonGreen,
    opacity: 0.7,
    flex: 1,
  },
  tapCounterInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tapCounterText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: Colors.neonPurple,
  },
  musicContainer: {
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: Layout.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.textSecondary,
  },
});
