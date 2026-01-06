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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  Users,
  Lock,
  Globe,
  Plus,
  TrendingUp,
} from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCommunitiesStore } from '@/stores/communitiesStore';

export default function CommunitiesListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'public'>('all');

  const communities = useCommunitiesStore((state) => state.communities);
  const joinCommunity = useCommunitiesStore((state) => state.joinCommunity);

  const isTablet = width >= 768;
  const padding = isTablet ? 24 : 16;

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'joined') return matchesSearch && c.isMember;
    if (filter === 'public') return matchesSearch && !c.isPrivate;
    return matchesSearch;
  });

  const handleJoin = (id: string) => {
    joinCommunity(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: padding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
          <NeonText text="COMUNIDADES" color={Colors.neonPurple} fontSize={20} />
          <Pressable 
            style={styles.createButton}
            onPress={() => router.push('/community/create')}
          >
            <Plus size={20} color={Colors.neonPurple} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar comunidades..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'joined', label: 'Mis comunidades' },
            { id: 'public', label: 'Públicas' },
          ].map((f) => (
            <Pressable
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id as typeof filter)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <TrendingUp size={16} color={Colors.neonGreen} />
            <Text style={styles.statValue}>{communities.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Users size={16} color={Colors.neonBlue} />
            <Text style={styles.statValue}>{communities.filter(c => c.isMember).length}</Text>
            <Text style={styles.statLabel}>Unido</Text>
          </View>
        </View>

        {/* Communities List */}
        <View style={styles.list}>
          {filteredCommunities.map((community) => (
            <Pressable
              key={community.id}
              style={styles.communityItem}
              onPress={() => router.push(`/community/${community.id}`)}
            >
              <Image source={{ uri: community.coverImage }} style={styles.communityImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.communityOverlay}
              />
              
              <View style={styles.communityContent}>
                <View style={styles.communityHeader}>
                  <View style={styles.iconBox}>
                    <Text style={styles.iconEmoji}>{community.icon}</Text>
                  </View>
                  <View style={styles.communityMeta}>
                    <View style={styles.nameRow}>
                      <Text style={styles.communityName}>{community.name}</Text>
                      {community.isPrivate ? (
                        <Lock size={12} color={Colors.neonPurple} />
                      ) : (
                        <Globe size={12} color={Colors.neonBlue} />
                      )}
                    </View>
                    <Text style={styles.communityDesc} numberOfLines={2}>
                      {community.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.communityFooter}>
                  <View style={styles.membersInfo}>
                    <Users size={12} color={Colors.textMuted} />
                    <Text style={styles.membersText}>{community.members} miembros</Text>
                  </View>
                  
                  <View style={styles.tagsRow}>
                    {community.tags.slice(0, 2).map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {community.isMember ? (
                    <View style={styles.joinedBadge}>
                      <Text style={styles.joinedText}>Miembro</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.joinButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleJoin(community.id);
                      }}
                    >
                      <Plus size={14} color={Colors.background} />
                      <Text style={styles.joinText}>Unirse</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {filteredCommunities.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No se encontraron comunidades</Text>
            <Pressable
              style={styles.createCommunityBtn}
              onPress={() => router.push('/community/create')}
            >
              <Text style={styles.createCommunityText}>Crear una comunidad</Text>
            </Pressable>
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
  scrollContent: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.text,
    paddingVertical: 12,
    marginLeft: 10,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(191, 0, 255, 0.2)',
    borderColor: Colors.neonPurple,
  },
  filterText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.neonPurple,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundLight,
    padding: 12,
    borderRadius: 10,
  },
  statValue: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  list: {
    gap: 12,
  },
  communityItem: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  communityImage: {
    width: '100%',
    height: '100%',
  },
  communityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  communityContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    justifyContent: 'space-between',
  },
  communityHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  communityMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    color: Colors.text,
  },
  communityDesc: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  communityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    marginLeft: 12,
  },
  tag: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.neonBlue,
  },
  joinedBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinedText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.neonGreen,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neonPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 16,
  },
  createCommunityBtn: {
    marginTop: 20,
    backgroundColor: Colors.neonPurple,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createCommunityText: {
    fontFamily: 'MajorMono',
    fontSize: 12,
    color: Colors.background,
  },
});
