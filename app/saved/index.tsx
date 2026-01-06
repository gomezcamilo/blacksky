import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, Trash2 } from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import StatusCard from '@/components/status/StatusCard';
import Colors from '@/constants/Colors';
import { useSavedPostsStore } from '@/stores/savedPostsStore';

const zondaGif = require('@/assets/images/zonda.gif');

export default function SavedPostsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const savedPosts = useSavedPostsStore((state) => state.savedPosts);
  const unsavePost = useSavedPostsStore((state) => state.unsavePost);

  return (
    <View style={styles.container}>
      <Image source={zondaGif} style={styles.backgroundGif} resizeMode="cover" />
      <View style={styles.overlay} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
          <NeonText text="GUARDADOS" color={Colors.neonBlue} fontSize={20} />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{savedPosts.length}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Tus publicaciones guardadas aparecerán aquí
        </Text>

        {/* Saved Posts */}
        {savedPosts.length > 0 ? (
          <View style={styles.postsContainer}>
            {savedPosts.map((post) => (
              <View key={post.id} style={styles.postWrapper}>
                <StatusCard
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
                  musicUrl={post.musicUrl}
                  imageUrl={post.imageUrl}
                  isOwn={false}
                />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => unsavePost(post.id)}
                >
                  <Trash2 size={14} color="#ff4757" />
                  <Text style={styles.removeText}>Eliminar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Bookmark size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No hay publicaciones guardadas</Text>
            <Text style={styles.emptyText}>
              Guarda publicaciones tocando los 3 puntos en cualquier post y seleccionando "Guardar"
            </Text>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  countBadge: {
    marginLeft: 10,
    backgroundColor: Colors.neonBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    color: Colors.background,
  },
  subtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 20,
    marginLeft: 4,
  },
  postsContainer: {
    gap: 8,
  },
  postWrapper: {
    marginBottom: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: -4,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 71, 87, 0.2)',
  },
  removeText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#ff4757',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'MajorMono',
    fontSize: 16,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
