import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Mail,
  UserPlus,
  UserMinus,
  Shield,
  Send,
  X,
  CheckCircle,
} from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import GlowingBorder from '@/components/ui/GlowingBorder';
import StatusCard from '@/components/status/StatusCard';
import Colors from '@/constants/Colors';
import { useUsersStore } from '@/stores/usersStore';

const zondaGif = require('@/assets/images/zonda.gif');

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const user = useUsersStore((state) => state.getUser(id || ''));
  const isFollowing = useUsersStore((state) => state.isFollowing(id || ''));
  const followUser = useUsersStore((state) => state.followUser);
  const unfollowUser = useUsersStore((state) => state.unfollowUser);
  const sendMessage = useUsersStore((state) => state.sendMessage);
  const getConversation = useUsersStore((state) => state.getConversation);
  const getUserPosts = useUsersStore((state) => state.getUserPosts);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(getConversation(id || ''));

  // Responsive
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Filtrar posts del usuario
  const userPosts = getUserPosts(id || '');

  const sizes = {
    avatar: isDesktop ? 85 : isTablet ? 90 : 90,
    headerHeight: isDesktop ? 180 : isTablet ? 200 : 200,
    icon: isDesktop ? 20 : 22,
    buttonSize: isDesktop ? 34 : 38,
    title: isDesktop ? 20 : 22,
    handle: isDesktop ? 12 : 13,
    bio: isDesktop ? 12 : 13,
    stat: isDesktop ? 14 : 16,
    statLabel: isDesktop ? 8 : 9,
    action: isDesktop ? 10 : 11,
    padding: isDesktop ? 14 : 16,
  };

  useEffect(() => {
    setMessages(getConversation(id || ''));
  }, [id]);

  const handleFollow = () => {
    if (isFollowing) {
      unfollowUser(id || '');
    } else {
      followUser(id || '');
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage(id || '', messageText.trim());
    setMessages(getConversation(id || ''));
    setMessageText('');
    Alert.alert('Mensaje enviado', 'Tu mensaje ha sido enviado correctamente');
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

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
            maxWidth: isDesktop ? 550 : isTablet ? 600 : '100%',
            alignSelf: 'center',
            width: '100%',
            paddingBottom: isDesktop ? 70 : 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={[styles.coverContainer, { height: sizes.headerHeight }]}>
          <Image
            source={{ uri: user.cover || 'https://images.pexels.com/photos/3265460/pexels-photo-3265460.jpeg' }}
            style={styles.coverImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(5,5,5,0.8)', Colors.background]}
            style={styles.coverGradient}
          />

          {/* Header Actions */}
          <View style={[styles.headerActions, { marginTop: insets.top }]}>
            <Pressable
              style={[styles.headerButton, { width: sizes.buttonSize, height: sizes.buttonSize }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={sizes.icon} color={Colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Profile Info */}
        <View style={[styles.profileInfo, { paddingHorizontal: sizes.padding }]}>
          <GlowingBorder
            color={user.isOnline ? Colors.neonGreen : Colors.neonPurple}
            width={2}
            style={[styles.avatarBorder, {
              width: sizes.avatar + 10,
              height: sizes.avatar + 10,
              borderRadius: (sizes.avatar + 10) / 2,
            }]}
          >
            <Image
              source={{ uri: user.avatar }}
              style={[styles.avatar, {
                width: sizes.avatar,
                height: sizes.avatar,
                borderRadius: sizes.avatar / 2,
              }]}
            />
            {user.isOnline && <View style={styles.onlineIndicator} />}
          </GlowingBorder>

          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <NeonText
                text={user.username}
                color={Colors.text}
                fontSize={sizes.title}
                fontFamily="MajorMono"
                glow={false}
              />
              {user.isVerified && (
                <CheckCircle size={18} color={Colors.neonBlue} style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={[styles.handle, { fontSize: sizes.handle }]}>@{user.handle}</Text>
          </View>

          <Text style={[styles.bio, { fontSize: sizes.bio, lineHeight: sizes.bio + 5 }]}>
            {user.bio}
          </Text>

          {/* User Stats */}
          <View style={[styles.stats, { padding: sizes.padding - 2 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: sizes.stat }]}>{user.postsCount}</Text>
              <Text style={[styles.statLabel, { fontSize: sizes.statLabel }]}>POSTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: sizes.stat }]}>{user.followingCount}</Text>
              <Text style={[styles.statLabel, { fontSize: sizes.statLabel }]}>FOLLOWING</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: sizes.stat }]}>{user.followersCount}</Text>
              <Text style={[styles.statLabel, { fontSize: sizes.statLabel }]}>FOLLOWERS</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable
              style={[styles.actionButton, styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              {isFollowing ? (
                <>
                  <UserMinus size={sizes.icon - 4} color={Colors.neonGreen} />
                  <Text style={[styles.actionText, { color: Colors.neonGreen }]}>SIGUIENDO</Text>
                </>
              ) : (
                <>
                  <UserPlus size={sizes.icon - 4} color={Colors.neonPurple} />
                  <Text style={styles.actionText}>SEGUIR</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => setShowMessageModal(true)}
            >
              <Mail size={sizes.icon - 4} color={Colors.neonBlue} />
              <Text style={styles.actionText}>MENSAJE</Text>
            </Pressable>
          </View>

          {/* User Posts - Solo visible si lo sigues */}
          {isFollowing ? (
            <View style={styles.postsContainer}>
              <NeonText
                text="PUBLICACIONES"
                color={Colors.neonBlue}
                fontSize={isDesktop ? 13 : 14}
                style={styles.sectionTitle}
              />
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <StatusCard
                    key={post.id}
                    id={post.id}
                    username={post.username}
                    handle={post.handle}
                    avatar={post.avatar}
                    content={post.content}
                    encryptionType={post.encryptionType}
                    timestamp={post.timestamp}
                    likes={post.likes}
                    comments={post.comments}
                    shares={post.shares}
                    hasMusic={post.hasMusic}
                    musicTitle={post.musicTitle}
                    musicArtist={post.musicArtist}
                    isOwn={false}
                  />
                ))
              ) : (
                <View style={styles.noPostsContainer}>
                  <Shield size={40} color={Colors.textMuted} />
                  <Text style={styles.noPostsText}>
                    Este usuario aún no tiene publicaciones
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.lockedContainer}>
              <Shield size={50} color={Colors.neonPurple} />
              <Text style={styles.lockedTitle}>Contenido privado</Text>
              <Text style={styles.lockedText}>
                Sigue a {user.username} para ver sus publicaciones
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Message Modal */}
      {showMessageModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Mensaje a @{user.handle}</Text>
                <Pressable onPress={() => setShowMessageModal(false)}>
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              {/* Messages List */}
              <ScrollView style={styles.messagesList}>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.senderId === 'void_runner' ? styles.sentMessage : styles.receivedMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.content}</Text>
                    <Text style={styles.messageTime}>{msg.timestamp}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor={Colors.textMuted}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <Pressable
                  style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send size={20} color={messageText.trim() ? Colors.neonBlue : Colors.textMuted} />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.neonPurple,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  coverContainer: {
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  profileInfo: {
    marginTop: -45,
    alignItems: 'center',
  },
  avatarBorder: {
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {},
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.neonGreen,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handle: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bio: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
  },
  statLabel: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    paddingVertical: 12,
    maxWidth: 160,
  },
  followButton: {
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  followingButton: {
    borderColor: Colors.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  actionText: {
    fontFamily: 'MajorMono',
    color: Colors.text,
    marginLeft: 6,
    fontSize: 11,
  },
  postsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginLeft: 8,
  },
  noPostsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPostsText: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  lockedTitle: {
    fontFamily: 'MajorMono',
    color: Colors.neonPurple,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  lockedText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.neonBlue,
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    fontSize: 13,
  },
  messageTime: {
    fontFamily: 'SpaceMono',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'SpaceMono',
    color: Colors.text,
    fontSize: 13,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 114, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
