import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Lock,
  Globe,
  Settings,
  Share2,
  LogOut,
  Trash2,
  Plus,
  Send,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  UserPlus,
  UserMinus,
} from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import GlassCard from '@/components/ui/GlassCard';
import CommunitySettingsModal from '@/components/community/CommunitySettingsModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Colors from '@/constants/Colors';
import { useCommunitiesStore } from '@/stores/communitiesStore';
import { useCommunityMessagesStore, CommunityMessage } from '@/stores/communityMessagesStore';
import { useUsersStore } from '@/stores/usersStore';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const communities = useCommunitiesStore((state) => state.communities);
  const joinCommunity = useCommunitiesStore((state) => state.joinCommunity);
  const leaveCommunity = useCommunitiesStore((state) => state.leaveCommunity);

  const allMessages = useCommunityMessagesStore((state) => state.messages);
  const addMessage = useCommunityMessagesStore((state) => state.addMessage);
  const addReply = useCommunityMessagesStore((state) => state.addReply);
  const likeMessage = useCommunityMessagesStore((state) => state.likeMessage);

  const messages = useMemo(
    () => allMessages.filter((m) => m.communityId === id),
    [allMessages, id]
  );

  const following = useUsersStore((state) => state.following);
  const users = useUsersStore((state) => state.users);
  const followUser = useUsersStore((state) => state.followUser);
  const unfollowUser = useUsersStore((state) => state.unfollowUser);

  const community = communities.find((c) => c.id === id);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'chat' | 'info'>('chat');

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const maxWidth = isDesktop ? 600 : isTablet ? 550 : width;

  if (!community) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Comunidad no encontrada</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const handleJoinLeave = () => {
    if (community.isMember) {
      setShowLeaveConfirm(true);
    } else {
      joinCommunity(community.id);
    }
    setShowMenu(false);
  };

  const confirmLeave = () => {
    leaveCommunity(community.id);
    setShowLeaveConfirm(false);
  };

  const handleDeleteCommunity = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Aquí se eliminaría la comunidad
    console.log('Deleting community:', community.id);
    setShowDeleteConfirm(false);
    router.back();
  };

  const handleOpenSettings = () => {
    setShowMenu(false);
    setShowSettings(true);
  };

  const handleSaveSettings = (data: {
    name?: string;
    description?: string;
    icon?: string;
    coverImage?: string;
  }) => {
    // Aquí se actualizaría la comunidad en el store
    console.log('Saving settings:', data);
  };

  const handleAddAdmin = (userId: string) => {
    console.log('Adding admin:', userId);
  };

  const handleRemoveAdmin = (userId: string) => {
    console.log('Removing admin:', userId);
  };

  const handleRemoveMember = (userId: string) => {
    console.log('Removing member:', userId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (replyingTo) {
      addReply(replyingTo, newMessage.trim());
      setReplyingTo(null);
    } else {
      addMessage(id!, newMessage.trim());
    }
    setNewMessage('');
  };

  const toggleReplies = (messageId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const renderMessage = (message: CommunityMessage) => {
    const isExpanded = expandedReplies.has(message.id);
    const hasReplies = message.replies.length > 0;
    const isFollowing = following.includes(message.handle);
    const user = users[message.handle];

    const handleFollowToggle = () => {
      if (isFollowing) {
        unfollowUser(message.handle);
      } else {
        followUser(message.handle);
      }
    };

    return (
      <View key={message.id} style={styles.messageContainer}>
        <View style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Pressable 
              style={styles.messageAuthor}
              onPress={() => router.push(`/user/${message.handle}`)}
            >
              <Image source={{ uri: message.avatar }} style={styles.messageAvatar} />
              <View>
                <View style={styles.usernameRow}>
                  <Text style={styles.messageUsername}>{message.username}</Text>
                  {user && (
                    <Text style={styles.followerCount}>{user.followersCount}</Text>
                  )}
                </View>
                <Text style={styles.messageHandle}>@{message.handle} · {message.timestamp}</Text>
              </View>
            </Pressable>
            <View style={styles.messageHeaderRight}>
              {!message.isOwn && (
                <Pressable 
                  style={[styles.followBtn, isFollowing && styles.followingBtn]}
                  onPress={handleFollowToggle}
                >
                  {isFollowing ? (
                    <UserMinus size={12} color={Colors.neonGreen} />
                  ) : (
                    <UserPlus size={12} color={Colors.neonPurple} />
                  )}
                </Pressable>
              )}
              {message.isOwn && (
                <Pressable style={styles.messageMenu}>
                  <MoreHorizontal size={16} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>

          <Text style={styles.messageContent}>{message.content}</Text>

          <View style={styles.messageActions}>
            <Pressable 
              style={styles.messageAction}
              onPress={() => likeMessage(message.id)}
            >
              <Heart size={16} color={Colors.textMuted} />
              <Text style={styles.actionCount}>{message.likes}</Text>
            </Pressable>
            <Pressable 
              style={styles.messageAction}
              onPress={() => setReplyingTo(message.id)}
            >
              <MessageCircle size={16} color={Colors.textMuted} />
              <Text style={styles.actionCount}>{message.replies.length}</Text>
            </Pressable>
          </View>

          {/* Replies toggle */}
          {hasReplies && (
            <Pressable 
              style={styles.repliesToggle}
              onPress={() => toggleReplies(message.id)}
            >
              {isExpanded ? (
                <ChevronUp size={14} color={Colors.neonBlue} />
              ) : (
                <ChevronDown size={14} color={Colors.neonBlue} />
              )}
              <Text style={styles.repliesToggleText}>
                {isExpanded ? 'Ocultar' : 'Ver'} {message.replies.length} respuesta{message.replies.length > 1 ? 's' : ''}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Replies */}
        {isExpanded && message.replies.map((reply) => {
          const replyIsFollowing = following.includes(reply.handle);
          const replyUser = users[reply.handle];
          
          return (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyLine} />
              <View style={styles.replyContent}>
                <View style={styles.replyHeaderRow}>
                  <Pressable 
                    style={styles.replyHeader}
                    onPress={() => router.push(`/user/${reply.handle}`)}
                  >
                    <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                    <Text style={styles.replyUsername}>{reply.username}</Text>
                    {replyUser && (
                      <Text style={styles.replyFollowerCount}>{replyUser.followersCount}</Text>
                    )}
                    <Text style={styles.replyTime}>· {reply.timestamp}</Text>
                  </Pressable>
                  {!reply.isOwn && (
                    <Pressable 
                      style={[styles.followBtnSmall, replyIsFollowing && styles.followingBtnSmall]}
                      onPress={() => replyIsFollowing ? unfollowUser(reply.handle) : followUser(reply.handle)}
                    >
                      {replyIsFollowing ? (
                        <UserMinus size={10} color={Colors.neonGreen} />
                      ) : (
                        <UserPlus size={10} color={Colors.neonPurple} />
                      )}
                    </Pressable>
                  )}
                </View>
                <Text style={styles.replyText}>{reply.content}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: community.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(5,5,5,0.8)', Colors.background]}
            style={styles.coverGradient}
          />

          {/* Header Actions */}
          <View style={[styles.headerActions, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={22} color={Colors.text} />
            </Pressable>
            <View style={styles.headerRight}>
              <Pressable style={styles.headerButton}>
                <Share2 size={20} color={Colors.text} />
              </Pressable>
              {community.isMember && (
                <Pressable
                  style={styles.headerButton}
                  onPress={() => setShowMenu(!showMenu)}
                >
                  <Settings size={20} color={Colors.text} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Menu Dropdown */}
          {showMenu && (
            <View style={styles.menuDropdown}>
              {community.isOwner && (
                <Pressable style={styles.menuItem} onPress={handleOpenSettings}>
                  <Settings size={16} color={Colors.text} />
                  <Text style={styles.menuText}>Configuración</Text>
                </Pressable>
              )}
              <Pressable style={styles.menuItem} onPress={handleJoinLeave}>
                <LogOut size={16} color="#ff9f43" />
                <Text style={[styles.menuText, { color: '#ff9f43' }]}>Salir</Text>
              </Pressable>
              {community.isOwner && (
                <Pressable style={styles.menuItem} onPress={handleDeleteCommunity}>
                  <Trash2 size={16} color="#ff4757" />
                  <Text style={[styles.menuText, { color: '#ff4757' }]}>Eliminar</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Community Info Header */}
        <View style={styles.infoHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.communityIcon}>{community.icon}</Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.communityName}>{community.name}</Text>
            <View style={styles.privacyBadge}>
              {community.isPrivate ? (
                <Lock size={10} color={Colors.neonPurple} />
              ) : (
                <Globe size={10} color={Colors.neonBlue} />
              )}
            </View>
          </View>

          <View style={styles.quickStats}>
            <Users size={12} color={Colors.textMuted} />
            <Text style={styles.quickStatsText}>{community.members} miembros</Text>
            <View style={styles.statDot} />
            <MessageSquare size={12} color={Colors.textMuted} />
            <Text style={styles.quickStatsText}>{messages.length} mensajes</Text>
          </View>

          {/* Join/Leave Button */}
          {!community.isOwner && !community.isMember && (
            <Pressable style={styles.joinButtonSmall} onPress={handleJoinLeave}>
              <Plus size={14} color={Colors.background} />
              <Text style={styles.joinButtonSmallText}>UNIRSE</Text>
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} color={activeTab === 'chat' ? Colors.neonPurple : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>Chat</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Users size={16} color={activeTab === 'info' ? Colors.neonPurple : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Info</Text>
          </Pressable>
        </View>

        {/* Content */}
        {activeTab === 'chat' ? (
          <View style={styles.chatSection}>
            {community.isMember ? (
              messages.length > 0 ? (
                messages.map(renderMessage)
              ) : (
                <View style={styles.emptyChat}>
                  <MessageSquare size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyChatText}>No hay mensajes aún</Text>
                  <Text style={styles.emptyChatHint}>¡Sé el primero en escribir!</Text>
                </View>
              )
            ) : (
              <GlassCard style={styles.lockedContent}>
                <Lock size={32} color={Colors.textMuted} />
                <Text style={styles.lockedText}>
                  Únete a la comunidad para participar en el chat
                </Text>
              </GlassCard>
            )}
          </View>
        ) : (
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
            <Text style={styles.description}>{community.description}</Text>

            <Text style={styles.sectionLabel}>TAGS</Text>
            <View style={styles.tagsContainer}>
              {community.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>CREADO POR</Text>
            <Pressable 
              style={styles.creatorRow}
              onPress={() => router.push(`/user/${community.createdBy}`)}
            >
              <Text style={styles.creatorHandle}>@{community.createdBy}</Text>
              <Text style={styles.creatorDate}>{community.createdAt}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Message Input */}
      {community.isMember && activeTab === 'chat' && (
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingText}>
                Respondiendo a mensaje...
              </Text>
              <Pressable onPress={() => setReplyingTo(null)}>
                <Text style={styles.cancelReply}>Cancelar</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe un mensaje..."}
              placeholderTextColor={Colors.textMuted}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color={newMessage.trim() ? Colors.background : Colors.textMuted} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Settings Modal */}
      <CommunitySettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        community={{
          id: community.id,
          name: community.name,
          description: community.description,
          icon: community.icon,
          coverImage: community.coverImage,
          isOwner: community.isOwner,
        }}
        onSave={handleSaveSettings}
        onAddAdmin={handleAddAdmin}
        onRemoveAdmin={handleRemoveAdmin}
        onRemoveMember={handleRemoveMember}
      />

      {/* Leave Community Confirm Dialog */}
      <ConfirmDialog
        visible={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeave}
        title="Salir de la comunidad"
        message={`¿Estás seguro de que deseas salir de "${community.name}"? Podrás volver a unirte en cualquier momento.`}
        confirmText="Salir"
        cancelText="Cancelar"
        type="warning"
        icon="logout"
      />

      {/* Delete Community Confirm Dialog */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar comunidad"
        message={`¿Estás seguro de que deseas eliminar "${community.name}"? Esta acción es permanente y no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        icon="trash"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverContainer: {
    height: 160,
    position: 'relative',
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
    paddingHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.98)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 150,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
  },
  infoHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -30,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonPurple,
    marginBottom: 10,
  },
  communityIcon: {
    fontSize: 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  communityName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
    color: Colors.text,
  },
  privacyBadge: {
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    padding: 4,
    borderRadius: 6,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  quickStatsText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  joinButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neonPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  joinButtonSmallText: {
    fontFamily: 'MajorMono',
    fontSize: 11,
    color: Colors.background,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
  },
  tabText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.neonPurple,
  },
  chatSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  messageAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageUsername: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 13,
    color: Colors.text,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followerCount: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  messageHandle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  messageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  followingBtn: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderColor: Colors.neonGreen,
  },
  messageMenu: {
    padding: 4,
  },
  messageContent: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  messageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  repliesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  repliesToggleText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonBlue,
  },
  replyCard: {
    flexDirection: 'row',
    marginLeft: 20,
    marginTop: 8,
  },
  replyLine: {
    width: 2,
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
    borderRadius: 1,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  replyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  replyUsername: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: Colors.text,
  },
  replyFollowerCount: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  replyTime: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  followBtnSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  followingBtnSmall: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderColor: Colors.neonGreen,
  },
  replyText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },
  emptyChatHint: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  lockedContent: {
    alignItems: 'center',
    padding: 40,
  },
  lockedText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionLabel: {
    fontFamily: 'MajorMono',
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonBlue,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creatorHandle: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.neonPurple,
  },
  creatorDate: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  replyingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 0, 255, 0.2)',
  },
  replyingText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonPurple,
  },
  cancelReply: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  messageInput: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.text,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: Colors.textMuted,
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.neonBlue,
  },
});
