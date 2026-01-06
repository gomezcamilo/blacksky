import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import {
  X,
  Link,
  Copy,
  RefreshCw,
  Users,
  Check,
  Send,
  Lock,
  Globe,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useCommunitiesStore } from '@/stores/communitiesStore';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  postAuthor: string;
  postAuthorHandle: string;
  postAuthorAvatar: string;
  encryptionType: 'binary' | 'aes' | 'reverse';
  onRepost: (comment?: string) => void;
  onRepostToCommunity: (communityId: string, comment?: string) => void;
}

export default function ShareModal({
  visible,
  onClose,
  postId,
  postContent,
  postAuthor,
  postAuthorHandle,
  postAuthorAvatar,
  encryptionType,
  onRepost,
  onRepostToCommunity,
}: ShareModalProps) {
  const [selectedTab, setSelectedTab] = useState<'share' | 'repost' | 'community'>('share');
  const [repostComment, setRepostComment] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const communities = useCommunitiesStore((state) => state.communities);
  const joinedCommunities = communities.filter((c) => c.isMember);

  const shareLink = `https://blacksky.app/post/${postId}`;

  const handleCopyLink = async () => {
    // En una app real usaríamos Clipboard.setStringAsync
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Link copiado', 'El enlace ha sido copiado al portapapeles');
  };

  const handleRepost = () => {
    onRepost(repostComment || undefined);
    setRepostComment('');
    onClose();
    Alert.alert('Reposteado', 'La publicación ha sido compartida en tu perfil');
  };

  const handleRepostToCommunity = () => {
    if (!selectedCommunity) {
      Alert.alert('Selecciona una comunidad', 'Debes seleccionar una comunidad para compartir');
      return;
    }
    onRepostToCommunity(selectedCommunity, repostComment || undefined);
    setRepostComment('');
    setSelectedCommunity(null);
    onClose();
    Alert.alert('Compartido', 'La publicación ha sido compartida en la comunidad');
  };

  const getEncryptionColor = () => {
    switch (encryptionType) {
      case 'binary': return Colors.neonGreen;
      case 'aes': return Colors.neonBlue;
      case 'reverse': return Colors.neonPurple;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Compartir</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={22} color={Colors.text} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, selectedTab === 'share' && styles.tabActive]}
              onPress={() => setSelectedTab('share')}
            >
              <Link size={16} color={selectedTab === 'share' ? Colors.neonBlue : Colors.textMuted} />
              <Text style={[styles.tabText, selectedTab === 'share' && styles.tabTextActive]}>
                Link
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === 'repost' && styles.tabActive]}
              onPress={() => setSelectedTab('repost')}
            >
              <RefreshCw size={16} color={selectedTab === 'repost' ? Colors.neonPurple : Colors.textMuted} />
              <Text style={[styles.tabText, selectedTab === 'repost' && styles.tabTextActive]}>
                Repostear
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === 'community' && styles.tabActive]}
              onPress={() => setSelectedTab('community')}
            >
              <Users size={16} color={selectedTab === 'community' ? Colors.neonGreen : Colors.textMuted} />
              <Text style={[styles.tabText, selectedTab === 'community' && styles.tabTextActive]}>
                Comunidad
              </Text>
            </Pressable>
          </View>

          {/* Post Preview */}
          <View style={[styles.postPreview, { borderLeftColor: getEncryptionColor() }]}>
            <View style={styles.postHeader}>
              <Image source={{ uri: postAuthorAvatar }} style={styles.postAvatar} />
              <View>
                <Text style={styles.postAuthor}>{postAuthor}</Text>
                <Text style={styles.postHandle}>@{postAuthorHandle}</Text>
              </View>
            </View>
            <Text style={styles.postContent} numberOfLines={2}>
              {postContent}
            </Text>
          </View>

          {/* Content based on tab */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {selectedTab === 'share' && (
              <View style={styles.shareContent}>
                <Text style={styles.sectionLabel}>ENLACE DE LA PUBLICACIÓN</Text>
                <View style={styles.linkContainer}>
                  <Text style={styles.linkText} numberOfLines={1}>{shareLink}</Text>
                  <Pressable style={styles.copyButton} onPress={handleCopyLink}>
                    {copied ? (
                      <Check size={18} color={Colors.neonGreen} />
                    ) : (
                      <Copy size={18} color={Colors.neonBlue} />
                    )}
                  </Pressable>
                </View>
                <Text style={styles.hint}>
                  Comparte este enlace para que otros puedan ver la publicación
                </Text>
              </View>
            )}

            {selectedTab === 'repost' && (
              <View style={styles.repostContent}>
                <Text style={styles.sectionLabel}>AÑADIR COMENTARIO (OPCIONAL)</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escribe algo sobre esta publicación..."
                  placeholderTextColor={Colors.textMuted}
                  value={repostComment}
                  onChangeText={setRepostComment}
                  multiline
                  maxLength={200}
                />
                <Text style={styles.charCount}>{repostComment.length}/200</Text>
                
                <Pressable style={styles.repostButton} onPress={handleRepost}>
                  <RefreshCw size={18} color={Colors.background} />
                  <Text style={styles.repostButtonText}>REPOSTEAR EN MI PERFIL</Text>
                </Pressable>
                
                <Text style={styles.hint}>
                  Esta publicación aparecerá en tu perfil y en el feed de tus seguidores
                </Text>
              </View>
            )}

            {selectedTab === 'community' && (
              <View style={styles.communityContent}>
                <Text style={styles.sectionLabel}>SELECCIONA UNA COMUNIDAD</Text>
                
                {joinedCommunities.length > 0 ? (
                  <>
                    <View style={styles.communitiesList}>
                      {joinedCommunities.map((community) => (
                        <Pressable
                          key={community.id}
                          style={[
                            styles.communityItem,
                            selectedCommunity === community.id && styles.communityItemSelected,
                          ]}
                          onPress={() => setSelectedCommunity(community.id)}
                        >
                          <View style={styles.communityIcon}>
                            <Text style={styles.communityEmoji}>{community.icon}</Text>
                          </View>
                          <View style={styles.communityInfo}>
                            <View style={styles.communityNameRow}>
                              <Text style={styles.communityName}>{community.name}</Text>
                              {community.isPrivate ? (
                                <Lock size={10} color={Colors.neonPurple} />
                              ) : (
                                <Globe size={10} color={Colors.neonBlue} />
                              )}
                            </View>
                            <Text style={styles.communityMembers}>{community.members} miembros</Text>
                          </View>
                          {selectedCommunity === community.id && (
                            <Check size={18} color={Colors.neonGreen} />
                          )}
                        </Pressable>
                      ))}
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>AÑADIR COMENTARIO (OPCIONAL)</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Escribe algo..."
                      placeholderTextColor={Colors.textMuted}
                      value={repostComment}
                      onChangeText={setRepostComment}
                      multiline
                      maxLength={200}
                    />

                    <Pressable
                      style={[
                        styles.repostButton,
                        styles.communityRepostButton,
                        !selectedCommunity && styles.buttonDisabled,
                      ]}
                      onPress={handleRepostToCommunity}
                      disabled={!selectedCommunity}
                    >
                      <Send size={18} color={selectedCommunity ? Colors.background : Colors.textMuted} />
                      <Text style={[
                        styles.repostButtonText,
                        !selectedCommunity && { color: Colors.textMuted }
                      ]}>
                        COMPARTIR EN COMUNIDAD
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Users size={40} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>No estás en ninguna comunidad</Text>
                    <Text style={styles.emptyHint}>Únete a comunidades para compartir publicaciones</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontFamily: 'MajorMono',
    fontSize: 18,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
  postPreview: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  postAuthor: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    color: Colors.text,
  },
  postHandle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  postContent: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  content: {
    padding: 16,
    maxHeight: 350,
  },
  shareContent: {},
  sectionLabel: {
    fontFamily: 'MajorMono',
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonBlue,
  },
  copyButton: {
    padding: 6,
    backgroundColor: 'rgba(0, 114, 255, 0.1)',
    borderRadius: 6,
  },
  hint: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 10,
    lineHeight: 14,
  },
  repostContent: {},
  commentInput: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.text,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
  },
  charCount: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 6,
  },
  repostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.neonPurple,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 16,
  },
  communityRepostButton: {
    backgroundColor: Colors.neonGreen,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  repostButtonText: {
    fontFamily: 'MajorMono',
    fontSize: 12,
    color: Colors.background,
  },
  communityContent: {},
  communitiesList: {
    gap: 8,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  communityItemSelected: {
    borderColor: Colors.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityEmoji: {
    fontSize: 20,
  },
  communityInfo: {
    flex: 1,
  },
  communityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    color: Colors.text,
  },
  communityMembers: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 12,
  },
  emptyHint: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
