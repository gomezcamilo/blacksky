import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Heart,
  Send,
  MoreVertical,
  Edit3,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';

interface Reply {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  isOwn: boolean;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  isOwn: boolean;
  replies: Reply[];
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onAddReply: (commentId: string, content: string) => void;
  onEditReply: (commentId: string, replyId: string, content: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
}

export default function CommentsModal({
  visible,
  onClose,
  postId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onAddReply,
  onEditReply,
  onDeleteReply,
  onLikeReply,
}: CommentsModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<{ commentId: string; replyId: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const modalWidth = isDesktop ? 500 : width;
  const sizes = {
    avatar: isDesktop ? 32 : 36,
    replyAvatar: isDesktop ? 26 : 30,
    text: isDesktop ? 12 : 13,
    small: isDesktop ? 10 : 11,
    icon: isDesktop ? 16 : 18,
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyText.trim()) {
      onAddReply(commentId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      if (editingReply) {
        onEditReply(editingReply.commentId, editingReply.replyId, editText.trim());
        setEditingReply(null);
      } else if (editingComment) {
        onEditComment(editingComment, editText.trim());
        setEditingComment(null);
      }
      setEditText('');
    }
  };

  const startEdit = (id: string, content: string, isReply = false, commentId?: string) => {
    setEditText(content);
    if (isReply && commentId) {
      setEditingReply({ commentId, replyId: id });
      setEditingComment(null);
    } else {
      setEditingComment(id);
      setEditingReply(null);
    }
    setShowMenu(null);
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const renderReply = (reply: Reply, commentId: string) => (
    <View key={reply.id} style={styles.replyContainer}>
      <Image source={{ uri: reply.avatar }} style={[styles.replyAvatar, { width: sizes.replyAvatar, height: sizes.replyAvatar }]} />
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={[styles.username, { fontSize: sizes.small }]}>{reply.username}</Text>
          <Text style={[styles.timestamp, { fontSize: sizes.small - 1 }]}>{reply.timestamp}</Text>
          {reply.isOwn && (
            <Pressable onPress={() => setShowMenu(showMenu === `reply-${reply.id}` ? null : `reply-${reply.id}`)}>
              <MoreVertical size={14} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        {editingReply?.replyId === reply.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.editInput, { fontSize: sizes.text }]}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <Pressable onPress={() => { setEditingReply(null); setEditText(''); }} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleSaveEdit} style={styles.saveButton}>
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={[styles.commentText, { fontSize: sizes.text }]}>{reply.content}</Text>
        )}

        <View style={styles.replyActions}>
          <Pressable onPress={() => onLikeReply(commentId, reply.id)} style={styles.actionButton}>
            <Heart size={14} color={reply.isLiked ? '#ff4757' : Colors.textMuted} fill={reply.isLiked ? '#ff4757' : 'transparent'} />
            <Text style={[styles.actionText, reply.isLiked && styles.likedText]}>{reply.likes}</Text>
          </Pressable>
        </View>

        {showMenu === `reply-${reply.id}` && reply.isOwn && (
          <View style={styles.menuPopup}>
            <Pressable style={styles.menuItem} onPress={() => startEdit(reply.id, reply.content, true, commentId)}>
              <Edit3 size={14} color={Colors.text} />
              <Text style={styles.menuText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { onDeleteReply(commentId, reply.id); setShowMenu(null); }}>
              <Trash2 size={14} color="#ff4757" />
              <Text style={[styles.menuText, { color: '#ff4757' }]}>Eliminar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.avatar }} style={[styles.avatar, { width: sizes.avatar, height: sizes.avatar }]} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { fontSize: sizes.text }]}>{item.username}</Text>
          <Text style={[styles.timestamp, { fontSize: sizes.small }]}>{item.timestamp}</Text>
          {item.isOwn && (
            <Pressable onPress={() => setShowMenu(showMenu === item.id ? null : item.id)}>
              <MoreVertical size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        {editingComment === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.editInput, { fontSize: sizes.text }]}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <Pressable onPress={() => { setEditingComment(null); setEditText(''); }} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleSaveEdit} style={styles.saveButton}>
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={[styles.commentText, { fontSize: sizes.text }]}>{item.content}</Text>
        )}

        <View style={styles.commentActions}>
          <Pressable onPress={() => onLikeComment(item.id)} style={styles.actionButton}>
            <Heart size={sizes.icon} color={item.isLiked ? '#ff4757' : Colors.textMuted} fill={item.isLiked ? '#ff4757' : 'transparent'} />
            <Text style={[styles.actionText, item.isLiked && styles.likedText]}>{item.likes}</Text>
          </Pressable>
          <Pressable onPress={() => setReplyingTo(replyingTo === item.id ? null : item.id)} style={styles.actionButton}>
            <MessageCircle size={sizes.icon} color={Colors.textMuted} />
            <Text style={styles.actionText}>Responder</Text>
          </Pressable>
        </View>

        {showMenu === item.id && item.isOwn && (
          <View style={styles.menuPopup}>
            <Pressable style={styles.menuItem} onPress={() => startEdit(item.id, item.content)}>
              <Edit3 size={14} color={Colors.text} />
              <Text style={styles.menuText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { onDeleteComment(item.id); setShowMenu(null); }}>
              <Trash2 size={14} color="#ff4757" />
              <Text style={[styles.menuText, { color: '#ff4757' }]}>Eliminar</Text>
            </Pressable>
          </View>
        )}

        {/* Reply Input */}
        {replyingTo === item.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={[styles.replyInput, { fontSize: sizes.text }]}
              placeholder="Escribe una respuesta..."
              placeholderTextColor={Colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              autoFocus
            />
            <Pressable onPress={() => handleSubmitReply(item.id)} style={styles.sendReplyButton}>
              <Send size={16} color={Colors.neonBlue} />
            </Pressable>
          </View>
        )}

        {/* Replies */}
        {item.replies.length > 0 && (
          <View style={styles.repliesSection}>
            <Pressable onPress={() => toggleReplies(item.id)} style={styles.toggleReplies}>
              {expandedReplies.has(item.id) ? (
                <ChevronUp size={14} color={Colors.neonBlue} />
              ) : (
                <ChevronDown size={14} color={Colors.neonBlue} />
              )}
              <Text style={styles.repliesCount}>
                {item.replies.length} {item.replies.length === 1 ? 'respuesta' : 'respuestas'}
              </Text>
            </Pressable>
            {expandedReplies.has(item.id) && item.replies.map(reply => renderReply(reply, item.id))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalContainer, { width: modalWidth, maxHeight: height * 0.85 }]}>
          <GlassCard style={styles.modal}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 16 }]}>
              <Text style={styles.headerTitle}>Comentarios ({comments.length})</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            {/* Comments List */}
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MessageCircle size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Sé el primero en comentar</Text>
                </View>
              }
            />

            {/* New Comment Input */}
            <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
              <TextInput
                style={[styles.input, { fontSize: sizes.text }]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={Colors.textMuted}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <Pressable onPress={handleSubmitComment} style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]} disabled={!newComment.trim()}>
                <Send size={20} color={newComment.trim() ? Colors.neonPurple : Colors.textMuted} />
              </Pressable>
            </View>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 15, 0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'MajorMono',
    fontSize: 16,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
  },
  timestamp: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    flex: 1,
  },
  commentText: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  likedText: {
    color: '#ff4757',
  },
  menuPopup: {
    position: 'absolute',
    top: 24,
    right: 0,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  menuText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
  },
  editContainer: {
    marginTop: 4,
  },
  editInput: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.neonPurple,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.background,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  replyInput: {
    flex: 1,
    fontFamily: 'SpaceMono',
    color: Colors.text,
    paddingVertical: 10,
  },
  sendReplyButton: {
    padding: 6,
  },
  repliesSection: {
    marginTop: 12,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 12,
  },
  toggleReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  repliesCount: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonBlue,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    borderRadius: 15,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  replyActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceMono',
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
