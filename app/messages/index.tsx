import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Edit, Circle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface Conversation {
  id: string;
  user: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isOwn: boolean;
    isRead: boolean;
  };
  unreadCount: number;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    user: {
      id: 'user-2',
      username: 'Neon Hacker',
      handle: 'neon_hacker',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: true,
    },
    lastMessage: {
      content: '¿Viste el nuevo exploit que salió?',
      timestamp: '2m',
      isOwn: false,
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    user: {
      id: 'user-3',
      username: 'Binary Queen',
      handle: 'binary_queen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: true,
    },
    lastMessage: {
      content: 'El código está listo para review',
      timestamp: '15m',
      isOwn: true,
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    user: {
      id: 'user-4',
      username: 'Void Runner',
      handle: 'void_runner',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false,
    },
    lastMessage: {
      content: 'Nos vemos en el servidor a las 10',
      timestamp: '1h',
      isOwn: false,
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: 'conv-4',
    user: {
      id: 'user-5',
      username: 'Synth Lord',
      handle: 'synth_lord',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false,
    },
    lastMessage: {
      content: '🎵 Te envié el nuevo track',
      timestamp: '3h',
      isOwn: false,
      isRead: true,
    },
    unreadCount: 0,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/messages/${item.user.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.username} numberOfLines={1}>
            {item.user.username}
          </Text>
          <Text style={styles.timestamp}>{item.lastMessage.timestamp}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text
            style={[
              styles.lastMessage,
              !item.lastMessage.isRead && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.isOwn && 'Tú: '}
            {item.lastMessage.content}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Edit size={22} color={Colors.neonBlue} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversaciones..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin conversaciones</Text>
          <Text style={styles.emptySubtitle}>
            Inicia una conversación con alguien
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.text,
    fontSize: 15,
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Layout.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.backgroundMedium,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.neonGreen,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
