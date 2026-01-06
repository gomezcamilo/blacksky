import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  Users,
  Plus,
  TrendingUp,
  Hash,
  UserPlus,
  UserMinus,
} from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { useCommunitiesStore, Community } from '@/stores/communitiesStore';
import { useUsersStore } from '@/stores/usersStore';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const communities = useCommunitiesStore((state) => state.communities);
  const joinCommunity = useCommunitiesStore((state) => state.joinCommunity);
  const leaveCommunity = useCommunitiesStore((state) => state.leaveCommunity);

  const users = useUsersStore((state) => state.users);
  const isFollowing = useUsersStore((state) => state.isFollowing);
  const followUser = useUsersStore((state) => state.followUser);
  const unfollowUser = useUsersStore((state) => state.unfollowUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'communities' | 'users'>('communities');

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const contentPadding = isDesktop ? 24 : isTablet ? 20 : 16;
  const maxWidth = isDesktop ? 700 : isTablet ? 600 : width;

  const sizes = {
    title: isDesktop ? 22 : 24,
    subtitle: isDesktop ? 12 : 13,
    text: isDesktop ? 12 : 13,
    small: isDesktop ? 10 : 11,
    icon: isDesktop ? 18 : 20,
    cardIcon: isDesktop ? 36 : 40,
  };

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const usersList = Object.values(users);
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleJoinToggle = (community: Community) => {
    if (community.isMember) {
      leaveCommunity(community.id);
    } else {
      joinCommunity(community.id);
    }
  };

  const handleFollowToggle = (handle: string) => {
    if (isFollowing(handle)) {
      unfollowUser(handle);
    } else {
      followUser(handle);
    }
  };

  const renderCommunityCard = (item: Community) => (
    <Pressable key={item.id} onPress={() => router.push(`/community/${item.id}`)}>
      <GlassCard style={styles.communityCard}>
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        <View style={styles.cardOverlay} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.communityIcon}>{item.icon}</Text>
            <View style={styles.cardInfo}>
              <Text style={[styles.communityName, { fontSize: sizes.subtitle + 2 }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.statsRow}>
                <Users size={12} color={Colors.textSecondary} />
                <Text style={[styles.statText, { fontSize: sizes.small }]}>
                  {item.members.toLocaleString()} miembros
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.joinButton, item.isMember && styles.joinedButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleJoinToggle(item);
              }}
            >
              <Text
                style={[
                  styles.joinButtonText,
                  { fontSize: sizes.small },
                  item.isMember && { color: Colors.neonGreen },
                ]}
              >
                {item.isMember ? 'UNIDO' : 'UNIRSE'}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.description, { fontSize: sizes.text }]} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Hash size={10} color={Colors.neonBlue} />
                <Text style={[styles.tagText, { fontSize: sizes.small - 1 }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );

  const renderUserCard = (user: (typeof usersList)[0]) => {
    const following = isFollowing(user.handle);
    return (
      <Pressable key={user.id} onPress={() => router.push(`/user/${user.handle}`)}>
        <GlassCard style={styles.userCard}>
          <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { fontSize: sizes.subtitle }]}>{user.username}</Text>
              <Text style={styles.followersBadge}>{user.followersCount}</Text>
            </View>
            <Text style={[styles.userHandle, { fontSize: sizes.small }]}>@{user.handle}</Text>
            <Text style={[styles.userBio, { fontSize: sizes.small }]} numberOfLines={1}>
              {user.bio}
            </Text>
          </View>
          <Pressable
            style={[styles.followButton, following && styles.followingButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleFollowToggle(user.handle);
            }}
          >
            {following ? (
              <UserMinus size={14} color={Colors.neonGreen} />
            ) : (
              <UserPlus size={14} color={Colors.neonPurple} />
            )}
          </Pressable>
        </GlassCard>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 100,
            paddingHorizontal: contentPadding,
            maxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <NeonText text="DISCOVER" color={Colors.neonPurple} fontSize={sizes.title} />
          <Pressable style={styles.createButton} onPress={() => router.push('/community/create')}>
            <Plus size={sizes.icon} color={Colors.background} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={sizes.icon} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: sizes.text }]}
            placeholder="Buscar comunidades o usuarios..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'communities' && styles.activeTab]}
            onPress={() => setActiveTab('communities')}
          >
            <Users size={14} color={activeTab === 'communities' ? Colors.neonPurple : Colors.textSecondary} />
            <Text style={[styles.tabText, { fontSize: sizes.small }, activeTab === 'communities' && styles.activeTabText]}>
              COMUNIDADES
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <TrendingUp size={14} color={activeTab === 'users' ? Colors.neonPurple : Colors.textSecondary} />
            <Text style={[styles.tabText, { fontSize: sizes.small }, activeTab === 'users' && styles.activeTabText]}>
              USUARIOS
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {activeTab === 'communities' ? (
          filteredCommunities.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No se encontraron comunidades</Text>
              <Pressable style={styles.createFirstButton} onPress={() => router.push('/community/create')}>
                <Text style={styles.createFirstText}>Crear la primera</Text>
              </Pressable>
            </View>
          ) : (
            filteredCommunities.map(renderCommunityCard)
          )
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        ) : (
          filteredUsers.map(renderUserCard)
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: Colors.neonPurple,
    borderRadius: 20,
    padding: 10,
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
    color: Colors.text,
    paddingVertical: 12,
    marginLeft: 10,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.backgroundLight,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(191, 0, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  tabText: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.neonPurple,
  },
  communityCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 100,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  communityIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  communityName: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
  },
  joinButton: {
    backgroundColor: Colors.neonPurple,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.neonGreen,
  },
  joinButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.text,
  },
  description: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 2,
  },
  tagText: {
    fontFamily: 'SpaceMono',
    color: Colors.neonBlue,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.neonPurple,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
  },
  followersBadge: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userHandle: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userBio: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    marginTop: 4,
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 16,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: Colors.neonPurple,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createFirstText: {
    fontFamily: 'MajorMono',
    fontSize: 13,
    color: Colors.background,
  },
});
