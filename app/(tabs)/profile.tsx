import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Share2,
  Shield,
  Mail,
  Users,
  Lock,
} from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import GlowingBorder from '@/components/ui/GlowingBorder';
import StatusCard from '@/components/status/StatusCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';

// User posts
const userPosts = [
  {
    id: '1',
    content:
      'New neural implant prototype just arrived. Testing begins tomorrow. Expect increased processing speeds and memory capacity.',
    encryptionType: 'aes' as const,
    timestamp: '3h ago',
    likes: 72,
    comments: 14,
    shares: 6,
  },
  {
    id: '2',
    content:
      'The megacorp surveillance system has a 3-minute blind spot during daily resets. Use it wisely.',
    encryptionType: 'binary' as const,
    timestamp: '1d ago',
    likes: 104,
    comments: 28,
    shares: 42,
    hasMusic: true,
    musicTitle: 'Synthetic Revolution',
    musicArtist: 'Data Fragment',
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Auth user
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // Responsive
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Profile state - usar datos del usuario autenticado
  const [profile, setProfile] = useState({
    name: authUser?.username || 'VOID RUNNER',
    handle: authUser?.handle || 'void_runner',
    avatar:
      authUser?.avatar ||
      'https://images.pexels.com/photos/4456996/pexels-photo-4456996.jpeg?auto=compress&cs=tinysrgb&w=640',
    cover:
      authUser?.cover ||
      'https://images.pexels.com/photos/3265460/pexels-photo-3265460.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: authUser?.bio || 'Digital nomad navigating the fringes of cyberspace.',
  });

  // Actualizar perfil cuando cambie el usuario autenticado
  useEffect(() => {
    if (authUser) {
      setProfile({
        name: authUser.username,
        handle: authUser.handle,
        avatar: authUser.avatar,
        cover: authUser.cover,
        bio: authUser.bio || '',
      });
    }
  }, [authUser]);

  const [showEditModal, setShowEditModal] = useState(false);

  const stats = {
    posts: authUser?.postsCount || 0,
    following: authUser?.followingCount || 0,
    followers: authUser?.followersCount || 0,
  };

  const encryptionLevel = 'Level 1';
  const badges = authUser?.isVerified ? ['Verified'] : [];
  
  // Sizes
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
    badge: isDesktop ? 10 : 11,
    action: isDesktop ? 9 : 10,
    section: isDesktop ? 13 : 14,
    padding: isDesktop ? 14 : 16,
  };

  const handleSaveProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
    // Actualizar también en el authStore
    updateProfile({
      username: newProfile.name,
      avatar: newProfile.avatar,
      cover: newProfile.cover,
      bio: newProfile.bio,
    });
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            maxWidth: isDesktop ? 550 : isTablet ? 600 : '100%', 
            alignSelf: 'center', 
            width: '100%',
            paddingBottom: isDesktop ? 70 : 100,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={[styles.coverContainer, { height: sizes.headerHeight }]}>
          <Image 
            source={{ uri: profile.cover }}
            style={styles.coverImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(5,5,5,0.8)', Colors.background]}
            style={styles.coverGradient}
          />
          
          {/* Profile Header Actions */}
          <View style={[styles.headerActions, { marginTop: insets.top }]}>
            <Pressable 
              style={[styles.headerButton, { width: sizes.buttonSize, height: sizes.buttonSize, borderRadius: sizes.buttonSize / 2 }]}
              onPress={() => setShowEditModal(true)}
            >
              <Settings size={sizes.icon} color={Colors.text} />
            </Pressable>
            <Pressable style={[styles.headerButton, { width: sizes.buttonSize, height: sizes.buttonSize, borderRadius: sizes.buttonSize / 2 }]}>
              <Share2 size={sizes.icon} color={Colors.text} />
            </Pressable>
          </View>
        </View>
        
        {/* Profile Info */}
        <View style={[styles.profileInfo, { paddingHorizontal: sizes.padding }]}>
          <GlowingBorder 
            color={Colors.neonPurple}
            width={2}
            style={[styles.avatarBorder, {
              width: sizes.avatar + 10,
              height: sizes.avatar + 10,
              borderRadius: (sizes.avatar + 10) / 2,
            }]}
          >
            <Image 
              source={{ uri: profile.avatar }}
              style={[styles.avatar, {
                width: sizes.avatar,
                height: sizes.avatar,
                borderRadius: sizes.avatar / 2,
              }]}
            />
          </GlowingBorder>
          
          <View style={styles.nameContainer}>
            <NeonText 
              text={profile.name}
              color={Colors.text}
              fontSize={sizes.title}
              fontFamily="MajorMono"
              glow={false}
            />
            <Text style={[styles.handle, { fontSize: sizes.handle }]}>@{profile.handle}</Text>
          </View>
          
          <View style={styles.encryptionLevel}>
            <Lock size={11} color={Colors.neonPurple} />
            <Text style={[styles.encryptionText, { fontSize: sizes.badge }]}>
              {encryptionLevel}
            </Text>
          </View>
          
          <Text style={[styles.bio, { fontSize: sizes.bio, lineHeight: sizes.bio + 5 }]}>
            {profile.bio}
          </Text>
          
          {/* User Stats */}
          <View style={[styles.stats, { padding: sizes.padding - 2 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: sizes.stat }]}>{stats.posts}</Text>
              <Text style={[styles.statLabel, { fontSize: sizes.statLabel }]}>POSTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: sizes.stat }]}>{stats.following}</Text>
              <Text style={[styles.statLabel, { fontSize: sizes.statLabel }]}>FOLLOWING</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: sizes.stat }]}>{stats.followers}</Text>
              <Text style={[styles.statLabel, { fontSize: sizes.statLabel }]}>FOLLOWERS</Text>
            </View>
          </View>
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={[styles.badgeText, { fontSize: sizes.badge }]}>{badge}</Text>
              </View>
            ))}
          </View>
          
          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable style={[styles.actionButton, { paddingVertical: sizes.padding - 6 }]}>
              <Shield size={sizes.icon - 4} color={Colors.neonPurple} />
              <Text style={[styles.actionText, { fontSize: sizes.action }]}>ENCRYPT</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, { paddingVertical: sizes.padding - 6 }]}>
              <Mail size={sizes.icon - 4} color={Colors.neonBlue} />
              <Text style={[styles.actionText, { fontSize: sizes.action }]}>MESSAGE</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, { paddingVertical: sizes.padding - 6 }]}>
              <Users size={sizes.icon - 4} color={Colors.neonGreen} />
              <Text style={[styles.actionText, { fontSize: sizes.action }]}>FOLLOW</Text>
            </Pressable>
          </View>
          
          {/* User Posts */}
          <View style={styles.postsContainer}>
            <NeonText 
              text="ENCRYPTED THOUGHTS"
              color={Colors.neonBlue}
              fontSize={sizes.section}
              style={styles.sectionTitle}
            />
            
            {userPosts.map((post) => (
              <StatusCard
                key={post.id}
                username={profile.name}
                handle={profile.handle}
                avatar={profile.avatar}
                content={post.content}
                encryptionType={post.encryptionType}
                timestamp={post.timestamp}
                likes={post.likes}
                comments={post.comments}
                shares={post.shares}
                hasMusic={post.hasMusic}
                musicTitle={post.musicTitle}
                musicArtist={post.musicArtist}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        currentProfile={profile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    right: 0,
    flexDirection: 'row',
    padding: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileInfo: {
    marginTop: -45,
    alignItems: 'center',
  },
  avatarBorder: {
    marginBottom: 12,
  },
  avatar: {},
  nameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  encryptionLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  encryptionText: {
    fontFamily: 'SpaceMono',
    color: Colors.neonPurple,
    marginLeft: 4,
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.neonBlue,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 3,
  },
  badgeText: {
    fontFamily: 'SpaceMono',
    color: Colors.neonBlue,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  actionText: {
    fontFamily: 'MajorMono',
    color: Colors.text,
    marginLeft: 4,
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
});
