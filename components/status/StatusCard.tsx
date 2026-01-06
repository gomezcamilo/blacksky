import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import {
  Lock,
  Unlock,
  Music,
  Heart,
  MessageCircle,
  Share,
  Eye,
  MousePointer,
  MoreVertical,
  Trash2,
  Flag,
  BookmarkPlus,
  BookmarkCheck,
  Play,
  Pause,
  Youtube,
  Radio,
  X,
  UserPlus,
  UserMinus,
} from 'lucide-react-native';
import GlassCard from '@/components/ui/GlassCard';
import EncryptionBadge from '@/components/ui/EncryptionBadge';
import DecryptionEffect from '@/components/status/DecryptionEffect';
import CommentsModal from '@/components/status/CommentsModal';
import ShareModal from '@/components/status/ShareModal';
import Colors from '@/constants/Colors';
import { usePostsStore } from '@/stores/postsStore';
import { useUsersStore } from '@/stores/usersStore';
import { useSavedPostsStore } from '@/stores/savedPostsStore';

interface StatusCardProps {
  id?: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  encryptionType: 'binary' | 'aes' | 'reverse';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  hasMusic?: boolean;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  imageUrl?: string;
  isOwn?: boolean;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

// Mock comments data
const mockComments = [
  {
    id: '1',
    userId: 'u1',
    username: 'CyberNinja',
    avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Esto es increíble! 🔥',
    likes: 5,
    isLiked: false,
    timestamp: '2h',
    isOwn: false,
    replies: [],
  },
];

// Helper para parsear URLs de música
const parseMusicUrl = (url: string) => {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&playsinline=1`,
      color: '#FF0000',
      name: 'YouTube',
      icon: Youtube,
    };
  }

  const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return {
      platform: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`,
      color: '#1DB954',
      name: 'Spotify',
      icon: Radio,
    };
  }

  if (url.includes('soundcloud.com')) {
    return {
      platform: 'soundcloud',
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=true`,
      color: '#FF5500',
      name: 'SoundCloud',
      icon: Music,
    };
  }

  return null;
};

export default function StatusCard({
  id = Date.now().toString(),
  username,
  handle,
  avatar,
  content,
  encryptionType,
  timestamp,
  likes,
  comments,
  shares,
  views = Math.floor(Math.random() * 500) + 100,
  hasMusic = false,
  musicTitle,
  musicArtist,
  musicUrl,
  imageUrl,
  isOwn = false,
  onPress,
  onDelete,
}: StatusCardProps) {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [viewCount] = useState(views);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [commentsList, setCommentsList] = useState(mockComments);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const repostPost = usePostsStore((state) => state.repostPost);
  const repostToCommunity = usePostsStore((state) => state.repostToCommunity);

  const isFollowingUser = useUsersStore((state) => state.isFollowing(handle));
  const followUser = useUsersStore((state) => state.followUser);
  const unfollowUser = useUsersStore((state) => state.unfollowUser);
  const getUser = useUsersStore((state) => state.getUser);
  const user = getUser(handle);

  const savePost = useSavedPostsStore((state) => state.savePost);
  const unsavePost = useSavedPostsStore((state) => state.unsavePost);
  const isPostSaved = useSavedPostsStore((state) => state.isPostSaved(id));

  const handleFollowToggle = () => {
    if (isFollowingUser) {
      unfollowUser(handle);
    } else {
      followUser(handle);
    }
  };

  const handleUserPress = () => {
    if (!isOwn) {
      router.push(`/user/${handle}`);
    }
  };

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const sizes = {
    avatar: isDesktop ? 32 : isTablet ? 34 : 36,
    username: isDesktop ? 12 : isTablet ? 12 : 13,
    handle: isDesktop ? 10 : isTablet ? 10 : 11,
    content: isDesktop ? 12 : isTablet ? 12 : 13,
    lineHeight: isDesktop ? 17 : isTablet ? 17 : 18,
    icon: isDesktop ? 16 : isTablet ? 17 : 18,
    smallIcon: isDesktop ? 11 : 12,
    actionText: isDesktop ? 10 : 11,
    padding: isDesktop ? 10 : 12,
    smallPadding: isDesktop ? 6 : 8,
  };

  const parsedMusic = musicUrl ? parseMusicUrl(musicUrl) : null;

  const handleContentPress = () => {
    setTapCount((prev) => prev + 1);
    if (isDecrypting) return;
    if (isDecrypted) {
      setIsDecrypted(false);
    } else {
      setIsDecrypting(true);
    }
  };

  const handleDecryptionComplete = () => {
    setIsDecrypted(true);
    setIsDecrypting(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setShowMenu(false) },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setShowMenu(false);
            setIsDeleted(true);
            if (onDelete) onDelete(id);
          },
        },
      ]
    );
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleRepost = (comment?: string) => {
    repostPost(id, comment);
  };

  const handleRepostToCommunity = (communityId: string, comment?: string) => {
    repostToCommunity(id, communityId, comment);
  };

  const handleSave = () => {
    setShowMenu(false);
    if (isPostSaved) {
      unsavePost(id);
      Alert.alert('Eliminado', 'Publicación eliminada de guardados');
    } else {
      savePost({
        id,
        username,
        handle,
        avatar,
        content,
        encryptionType,
        timestamp,
        likes,
        comments,
        shares,
        hasMusic,
        musicTitle,
        musicArtist,
        musicUrl,
        imageUrl,
      });
      Alert.alert('Guardado', 'Publicación guardada en tus favoritos');
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    Alert.alert('Reportar', 'Gracias por tu reporte.');
  };

  if (isDeleted) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getEncryptedContent = () => {
    switch (encryptionType) {
      case 'binary':
        return content.replace(/[a-zA-Z0-9]/g, () => Math.round(Math.random()).toString());
      case 'reverse':
        return content.split('').reverse().join('');
      default:
        return content.replace(/[a-zA-Z0-9]/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65));
    }
  };

  const handleAddComment = (text: string) => {
    const newComment = {
      id: Date.now().toString(),
      userId: 'me',
      username: 'Tu',
      avatar: 'https://images.pexels.com/photos/4456996/pexels-photo-4456996.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: text,
      likes: 0,
      isLiked: false,
      timestamp: 'ahora',
      isOwn: true,
      replies: [],
    };
    setCommentsList([newComment, ...commentsList]);
  };

  const handleLikeComment = (commentId: string) => {
    setCommentsList(commentsList.map(c => 
      c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentsList(commentsList.filter(c => c.id !== commentId));
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    setCommentsList(commentsList.map(c => c.id === commentId ? { ...c, content: newContent } : c));
  };

  const handleAddReply = (commentId: string, text: string) => {
    const newReply = {
      id: Date.now().toString(),
      userId: 'me',
      username: 'Tu',
      avatar: 'https://images.pexels.com/photos/4456996/pexels-photo-4456996.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: text,
      likes: 0,
      isLiked: false,
      timestamp: 'ahora',
      isOwn: true,
    };
    setCommentsList(commentsList.map(c => 
      c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
    ));
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    setCommentsList(commentsList.map(c => 
      c.id === commentId ? {
        ...c,
        replies: c.replies.map(r => r.id === replyId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r)
      } : c
    ));
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    setCommentsList(commentsList.map(c => 
      c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c
    ));
  };

  const handleEditReply = (commentId: string, replyId: string, newContent: string) => {
    setCommentsList(commentsList.map(c => 
      c.id === commentId ? {
        ...c,
        replies: c.replies.map(r => r.id === replyId ? { ...r, content: newContent } : r)
      } : c
    ));
  };

  const IconComponent = parsedMusic?.icon || Music;

  return (
    <>
      <Pressable onPress={onPress} style={styles.pressable}>
        <GlassCard
          style={[styles.card, { marginVertical: isDesktop ? 6 : 8 }]}
          glowColor={isDecrypted ? Colors.neonGreen : encryptionType === 'binary' ? Colors.binaryColor : encryptionType === 'aes' ? Colors.aesColor : Colors.reverseColor}
          showGlow={isDecrypted}
        >
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(10,10,10,0.3)']} style={styles.gradient} />

          {/* Header */}
          <View style={[styles.header, { padding: sizes.padding }]}>
            <Pressable onPress={handleUserPress}>
              <Image source={{ uri: avatar }} style={[styles.avatar, { width: sizes.avatar, height: sizes.avatar, borderRadius: sizes.avatar / 2 }]} />
            </Pressable>
            <Pressable style={styles.userInfo} onPress={handleUserPress}>
              <View style={styles.usernameRow}>
                <Text style={[styles.username, { fontSize: sizes.username }]} numberOfLines={1}>{username}</Text>
                {user && (
                  <Text style={styles.followersBadge}>{formatNumber(user.followersCount)}</Text>
                )}
              </View>
              <Text style={[styles.handle, { fontSize: sizes.handle }]} numberOfLines={1}>@{handle}</Text>
            </Pressable>
            <View style={styles.headerRight}>
              {!isOwn && (
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
              )}
              <View style={styles.badgeContainer}>
                <EncryptionBadge type={encryptionType} size="small" />
                <Text style={styles.timestamp}>{timestamp}</Text>
              </View>
              <Pressable onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
                <MoreVertical size={sizes.icon} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Menu Dropdown */}
          {showMenu && (
            <View style={styles.menuDropdown}>
              <Pressable style={styles.menuItem} onPress={handleSave}>
                {isPostSaved ? (
                  <BookmarkCheck size={16} color={Colors.neonGreen} />
                ) : (
                  <BookmarkPlus size={16} color={Colors.neonBlue} />
                )}
                <Text style={[styles.menuText, isPostSaved && { color: Colors.neonGreen }]}>
                  {isPostSaved ? 'Guardado' : 'Guardar'}
                </Text>
              </Pressable>
              {isOwn ? (
                <Pressable style={styles.menuItem} onPress={handleDelete}>
                  <Trash2 size={16} color="#ff4757" />
                  <Text style={[styles.menuText, { color: '#ff4757' }]}>Eliminar</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.menuItem} onPress={handleReport}>
                  <Flag size={16} color="#ff9f43" />
                  <Text style={[styles.menuText, { color: '#ff9f43' }]}>Reportar</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Image Attachment */}
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.attachedImage} resizeMode="cover" />
            </View>
          )}

          {/* Content */}
          <Pressable style={[styles.content, { padding: sizes.padding, minHeight: isDesktop ? 50 : 60 }]} onPress={handleContentPress}>
            {isDecrypting ? (
              <DecryptionEffect text={content} encryptionType={encryptionType} onComplete={handleDecryptionComplete} />
            ) : isDecrypted ? (
              <View>
                <Text style={[styles.contentText, { fontSize: sizes.content, lineHeight: sizes.lineHeight }]}>{content}</Text>
                <View style={styles.decryptedIndicator}>
                  <Unlock size={sizes.smallIcon} color={Colors.neonGreen} />
                  <Text style={[styles.decryptedText, { fontSize: sizes.actionText - 1 }]}>decrypted · tap to encrypt</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={[styles.contentText, styles.encryptedText, { fontSize: sizes.content, lineHeight: sizes.lineHeight }]}>{getEncryptedContent()}</Text>
                <View style={styles.encryptOverlay}>
                  <Lock size={sizes.icon} color={encryptionType === 'binary' ? Colors.binaryColor : encryptionType === 'aes' ? Colors.aesColor : Colors.reverseColor} />
                  <Text style={[styles.decryptText, { fontSize: isDesktop ? 10 : 11, color: encryptionType === 'binary' ? Colors.binaryColor : encryptionType === 'aes' ? Colors.aesColor : Colors.reverseColor }]}>TAP TO DECRYPT</Text>
                </View>
              </View>
            )}
          </Pressable>

          {/* Stats */}
          <View style={[styles.statsBar, { paddingHorizontal: sizes.padding }]}>
            <View style={styles.statItem}>
              <MousePointer size={sizes.smallIcon} color={Colors.neonPurple} />
              <Text style={[styles.statText, { fontSize: sizes.actionText - 1 }]}>{tapCount} taps</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={sizes.smallIcon} color={Colors.neonBlue} />
              <Text style={[styles.statText, { fontSize: sizes.actionText - 1 }]}>{formatNumber(viewCount)} views</Text>
            </View>
          </View>

          {/* Music Player */}
          {(hasMusic || musicUrl) && parsedMusic && (
            <View style={[styles.musicSection, { marginHorizontal: sizes.padding }]}>
              {/* Music Header - siempre visible */}
              <Pressable 
                style={[styles.musicHeader, { borderLeftColor: parsedMusic.color }]}
                onPress={() => setShowPlayer(!showPlayer)}
              >
                <IconComponent size={16} color={parsedMusic.color} />
                <View style={styles.musicInfo}>
                  <Text style={[styles.musicPlatform, { color: parsedMusic.color }]}>{parsedMusic.name}</Text>
                  <Text style={styles.musicUrlText} numberOfLines={1}>{musicUrl}</Text>
                </View>
                <View style={[styles.playBtn, { backgroundColor: parsedMusic.color }]}>
                  {showPlayer ? <Pause size={12} color="#FFF" /> : <Play size={12} color="#FFF" style={{ marginLeft: 1 }} />}
                </View>
              </Pressable>

              {/* Embedded Player */}
              {showPlayer && (
                <View style={styles.playerContainer}>
                  <Pressable style={styles.closePlayer} onPress={() => setShowPlayer(false)}>
                    <X size={14} color={Colors.textMuted} />
                  </Pressable>
                  <View style={[styles.embedWrapper, { height: parsedMusic.platform === 'youtube' ? 180 : 80 }]}>
                    {Platform.OS === 'web' ? (
                      <iframe
                        src={parsedMusic.embedUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <WebView
                        source={{ uri: parsedMusic.embedUrl }}
                        style={styles.webview}
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled
                        domStorageEnabled
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Legacy Music Display (sin URL) */}
          {hasMusic && !musicUrl && musicTitle && (
            <View style={[styles.musicContainer, { padding: sizes.smallPadding, marginHorizontal: sizes.padding }]}>
              <Music size={sizes.smallIcon} color={Colors.neonPurple} />
              <Text style={[styles.musicTitle, { fontSize: sizes.actionText }]} numberOfLines={1}>{musicTitle}</Text>
              <Text style={[styles.musicArtist, { fontSize: sizes.actionText - 1 }]} numberOfLines={1}>{musicArtist}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={[styles.actions, { paddingVertical: sizes.smallPadding }]}>
            <Pressable style={styles.actionButton} onPress={handleLike}>
              <Heart size={sizes.icon} color={isLiked ? '#ff4757' : Colors.textSecondary} fill={isLiked ? '#ff4757' : 'transparent'} />
              <Text style={[styles.actionText, { fontSize: sizes.actionText }, isLiked && styles.likedText]}>{formatNumber(likeCount)}</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => setShowComments(true)}>
              <MessageCircle size={sizes.icon} color={Colors.textSecondary} />
              <Text style={[styles.actionText, { fontSize: sizes.actionText }]}>{formatNumber(comments + commentsList.length - 1)}</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Share size={sizes.icon} color={Colors.textSecondary} />
              <Text style={[styles.actionText, { fontSize: sizes.actionText }]}>{formatNumber(shares)}</Text>
            </Pressable>
          </View>
        </GlassCard>
      </Pressable>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={id}
        comments={commentsList}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onLikeComment={handleLikeComment}
        onAddReply={handleAddReply}
        onEditReply={handleEditReply}
        onDeleteReply={handleDeleteReply}
        onLikeReply={handleLikeReply}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={id}
        postContent={content}
        postAuthor={username}
        postAuthorHandle={handle}
        postAuthorAvatar={avatar}
        encryptionType={encryptionType}
        onRepost={handleRepost}
        onRepostToCommunity={handleRepostToCommunity}
      />
    </>
  );
}


const styles = StyleSheet.create({
  pressable: { width: '100%' },
  card: { marginHorizontal: 4, padding: 0, borderColor: 'rgba(0, 114, 255, 0.2)', overflow: 'hidden' },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  avatar: { marginRight: 8, borderWidth: 1, borderColor: Colors.neonPurple },
  userInfo: { flex: 1, marginRight: 4 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontFamily: 'SpaceMono-Bold', color: Colors.text },
  followersBadge: { 
    fontFamily: 'SpaceMono', 
    fontSize: 9, 
    color: Colors.neonPurple, 
    backgroundColor: 'rgba(191, 0, 255, 0.15)', 
    paddingHorizontal: 5, 
    paddingVertical: 1, 
    borderRadius: 4 
  },
  handle: { fontFamily: 'SpaceMono', color: Colors.textSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  followButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
  badgeContainer: { alignItems: 'flex-end', flexShrink: 0 },
  timestamp: { marginTop: 3, fontFamily: 'SpaceMono', fontSize: 9, color: Colors.textMuted },
  menuButton: { padding: 4 },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(20, 20, 20, 0.98)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
    minWidth: 140,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuText: { fontFamily: 'SpaceMono', fontSize: 12, color: Colors.text },
  imageContainer: {
    width: '100%',
    maxHeight: 200,
    overflow: 'hidden',
  },
  attachedImage: {
    width: '100%',
    height: 200,
  },
  content: { flex: 1, justifyContent: 'center' },
  contentText: { fontFamily: 'SpaceMono', color: Colors.text },
  encryptOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(5, 5, 5, 0.75)', borderRadius: 4 },
  encryptedText: { opacity: 0.5 },
  decryptText: { fontFamily: 'MajorMono', marginTop: 4 },
  decryptedIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  decryptedText: { fontFamily: 'SpaceMono', color: Colors.neonGreen, opacity: 0.7 },
  statsBar: { flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 4, gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontFamily: 'SpaceMono', color: Colors.textMuted },
  musicSection: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  musicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    borderLeftWidth: 3,
    padding: 10,
    gap: 8,
  },
  musicInfo: {
    flex: 1,
  },
  musicPlatform: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
  },
  musicUrlText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  closePlayer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  embedWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  musicContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 4, marginBottom: 4 },
  musicTitle: { fontFamily: 'SpaceMono', color: Colors.text, marginLeft: 4, flex: 1 },
  musicArtist: { fontFamily: 'SpaceMono', color: Colors.textSecondary, marginLeft: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { marginLeft: 4, fontFamily: 'SpaceMono', color: Colors.textSecondary },
  likedText: { color: '#ff4757' },
});
