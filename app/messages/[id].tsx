import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, MoreVertical, Phone, Video, Lock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  encryptionType?: 'binary' | 'aes' | 'reverse' | 'none';
}

interface ChatUser {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

const mockUsers: Record<string, ChatUser> = {
  'user-2': {
    id: 'user-2',
    username: 'Neon Hacker',
    handle: 'neon_hacker',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
  'user-3': {
    id: 'user-3',
    username: 'Binary Queen',
    handle: 'binary_queen',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
  'user-4': {
    id: 'user-4',
    username: 'Void Runner',
    handle: 'void_runner',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
    lastSeen: 'hace 2h',
  },
  'user-5': {
    id: 'user-5',
    username: 'Synth Lord',
    handle: 'synth_lord',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
    lastSeen: 'hace 5h',
  },
};

const mockMessages: Record<string, Message[]> = {
  'user-2': [
    { id: '1', content: 'Hey! ¿Cómo va todo?', timestamp: '10:30', isOwn: false, isRead: true },
    { id: '2', content: 'Todo bien, trabajando en el nuevo proyecto', timestamp: '10:32', isOwn: true, isRead: true },
    { id: '3', content: '¿Viste el nuevo exploit que salió?', timestamp: '10:35', isOwn: false, isRead: true },
    { id: '4', content: 'Es bastante interesante el vector de ataque', timestamp: '10:36', isOwn: false, isRead: false },
  ],
  'user-3': [
    { id: '1', content: 'El PR está listo para merge', timestamp: '09:15', isOwn: false, isRead: true },
    { id: '2', content: 'Perfecto, lo reviso ahora', timestamp: '09:20', isOwn: true, isRead: true },
    { id: '3', content: 'El código está listo para review', timestamp: '09:45', isOwn: true, isRead: true },
  ],
  'user-4': [
    { id: '1', content: '¿Entramos al servidor?', timestamp: '18:00', isOwn: false, isRead: true },
    { id: '2', content: 'Dale, en 10 minutos', timestamp: '18:05', isOwn: true, isRead: true },
    { id: '3', content: 'Nos vemos en el servidor a las 10', timestamp: '18:10', isOwn: false, isRead: true },
  ],
  'user-5': [
    { id: '1', content: 'Escucha este beat 🔥', timestamp: '14:00', isOwn: false, isRead: true },
    { id: '2', content: 'Está increíble!', timestamp: '14:15', isOwn: true, isRead: true },
    { id: '3', content: '🎵 Te envié el nuevo track', timestamp: '14:30', isOwn: false, isRead: true },
  ],
};

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages[id || ''] || []);
  
  const user = mockUsers[id || ''] || {
    id: 'unknown',
    username: 'Usuario',
    handle: 'user',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    isOnline: false,
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      isRead: false,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showTimestamp = index === 0 || 
      messages[index - 1]?.isOwn !== item.isOwn;
    
    return (
      <View style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage
      ]}>
        {!item.isOwn && showTimestamp && (
          <Image source={{ uri: user.avatar }} style={styles.messageAvatar} />
        )}
        <View style={[
          styles.messageBubble,
          item.isOwn ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => router.push(`/user/${user.handle}`)}
        >
          <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
          <View style={styles.userDetails}>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.statusContainer}>
              {user.isOnline ? (
                <>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statusText}>En línea</Text>
                </>
              ) : (
                <Text style={styles.statusText}>
                  {user.lastSeen || 'Desconectado'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Phone size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Video size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Encryption Notice */}
      <View style={styles.encryptionNotice}>
        <Lock size={12} color={Colors.neonGreen} />
        <Text style={styles.encryptionText}>
          Mensajes cifrados de extremo a extremo
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
        </View>
        <TouchableOpacity 
          style={[
            styles.sendButton,
            message.trim() && styles.sendButtonActive
          ]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} color={message.trim() ? Colors.background : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.backgroundMedium,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Layout.spacing.xs,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Layout.spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neonGreen,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xs,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    gap: 6,
  },
  encryptionText: {
    fontSize: 11,
    color: Colors.neonGreen,
  },
  messagesList: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.sm,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Layout.spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: Colors.neonPurple,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.text,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.backgroundMedium,
    gap: Layout.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Layout.spacing.sm : 0,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    color: Colors.text,
    fontSize: 15,
    maxHeight: 100,
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.neonBlue,
  },
});
