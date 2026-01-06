import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image, 
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BookOpen, 
  Feather,
  Heart,
  Filter,
  TrendingUp,
  Lock,
  Users,
  Plus,
  Globe,
  ChevronRight,
} from 'lucide-react-native';
import NeonText from '@/components/ui/NeonText';
import { ThoughtCard, Thought } from '@/components/thoughts';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCommunitiesStore } from '@/stores/communitiesStore';

const wavesGif = require('@/assets/images/zonda.gif');

const categories = [
  { id: 'all', label: 'Todos', icon: BookOpen, color: Colors.neonBlue },
  { id: 'reflexion', label: 'Reflexiones', icon: Feather, color: Colors.neonBlue },
  { id: 'poema', label: 'Poemas', icon: Feather, color: Colors.neonPurple },
  { id: 'historia', label: 'Historias', icon: BookOpen, color: Colors.neonGreen },
  { id: 'diario', label: 'Diario', icon: BookOpen, color: '#FFD700' },
];

const featuredThoughts: Thought[] = [
  {
    id: '1',
    author: { nickname: 'luna_oscura', avatar: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=640' },
    coverImage: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=640',
    title: 'Noches de Neón',
    content: 'En la oscuridad de la ciudad, las luces de neón son las únicas que entienden mi soledad. Cada destello es un latido, cada sombra un secreto guardado en el vacío digital.',
    category: 'poema',
    encryptionType: 'binary',
    musicUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isPrivate: false,
    likes: 234,
    comments: 45,
    createdAt: '2h',
  },
  {
    id: '2',
    author: { nickname: 'cyber_soul' },
    coverImage: 'https://images.pexels.com/photos/1293120/pexels-photo-1293120.jpeg?auto=compress&cs=tinysrgb&w=640',
    title: 'El Último Código',
    content: 'Cuando el mundo se apague, solo quedarán los bits de nuestros recuerdos flotando en el vacío digital. Somos datos, somos eternos.',
    category: 'historia',
    encryptionType: 'aes',
    isPrivate: false,
    likes: 189,
    comments: 32,
    createdAt: '4h',
  },
  {
    id: '3',
    author: { nickname: 'void_walker' },
    coverImage: 'https://images.pexels.com/photos/2191013/pexels-photo-2191013.jpeg?auto=compress&cs=tinysrgb&w=640',
    title: 'Reflexiones del Vacío',
    content: 'A veces el silencio dice más que mil palabras. En el vacío encontré mi verdad, en la oscuridad hallé mi luz.',
    category: 'reflexion',
    encryptionType: 'reverse',
    musicUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    isPrivate: false,
    likes: 156,
    comments: 28,
    createdAt: '6h',
  },
];

const recentThoughts: Thought[] = [
  {
    id: '4',
    author: { nickname: 'neon_dreamer' },
    content: 'Hoy desperté pensando en todas las versiones de mí que nunca llegaron a existir. Cada decisión es un universo paralelo que dejamos morir.',
    category: 'pensamiento',
    encryptionType: 'binary',
    isPrivate: false,
    likes: 89,
    comments: 12,
    createdAt: '1h',
  },
  {
    id: '5',
    author: { nickname: 'digital_poet' },
    title: 'Fragmentos',
    content: 'Somos código en un universo de datos,\nbits perdidos en la eternidad,\nbuscando conexión\nen un mar de soledad digital.\n\nCada línea es un suspiro,\ncada función un latido,\nen este mundo de silicio\ndonde el alma está perdida.',
    category: 'poema',
    encryptionType: 'aes',
    musicUrl: 'https://soundcloud.com/user/track',
    isPrivate: false,
    likes: 145,
    comments: 23,
    createdAt: '3h',
  },
  {
    id: '6',
    author: { nickname: 'shadow_writer' },
    coverImage: 'https://images.pexels.com/photos/1834407/pexels-photo-1834407.jpeg?auto=compress&cs=tinysrgb&w=640',
    title: 'Capítulo 1: El Despertar',
    content: 'La lluvia caía sobre la ciudad como lágrimas de un dios olvidado. Maya abrió los ojos en un mundo que ya no reconocía. Las pantallas holográficas brillaban con noticias de un futuro que ella nunca imaginó.\n\n"¿Cuánto tiempo estuve dormida?" se preguntó, mientras sus implantes neuronales se calibraban lentamente.',
    category: 'historia',
    encryptionType: 'reverse',
    isPrivate: false,
    likes: 267,
    comments: 56,
    createdAt: '5h',
  },
  {
    id: '7',
    author: { nickname: 'anonymous_soul' },
    content: 'Querido diario digital: Hoy fue uno de esos días donde el peso del mundo se siente más ligero. Encontré paz en lo inesperado, en una conversación con un extraño que entendió sin juzgar.',
    category: 'diario',
    encryptionType: 'binary',
    isPrivate: true,
    likes: 0,
    comments: 0,
    createdAt: '8h',
  },
];


export default function BoardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const communities = useCommunitiesStore((state) => state.communities);
  
  const isTablet = width >= 768;
  const contentPadding = isTablet ? Layout.moderateScale(32) : Layout.spacing.md;
  
  const featuredCardWidth = isTablet ? Layout.moderateScale(200, 0.4) : Layout.moderateScale(160, 0.4);
  const featuredCardHeight = isTablet ? Layout.moderateScale(260, 0.4) : Layout.moderateScale(220, 0.4);
  
  const communityCardWidth = isTablet ? Layout.moderateScale(180, 0.4) : Layout.moderateScale(150, 0.4);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredThoughts = selectedCategory === 'all' 
    ? recentThoughts 
    : recentThoughts.filter(t => t.category === selectedCategory);

  const handleThoughtPress = (thought: Thought) => {
    router.push({
      pathname: '/board/[id]',
      params: { id: thought.id, data: JSON.stringify(thought) }
    });
  };

  const getEncryptionColor = (type: string) => {
    switch (type) {
      case 'binary': return Colors.neonGreen;
      case 'aes': return Colors.neonBlue;
      case 'reverse': return Colors.neonPurple;
      default: return Colors.neonBlue;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Background GIF */}
      <Image
        source={wavesGif}
        style={styles.backgroundGif}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + Layout.spacing.lg, 
            paddingBottom: Layout.moderateScale(100),
            paddingHorizontal: contentPadding,
            maxWidth: isTablet ? 700 : '100%',
            alignSelf: 'center',
            width: '100%',
          }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.neonPurple}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <NeonText 
            text="BOARDS" 
            color={Colors.neonPurple}
            fontSize={Layout.moderateScale(20, 0.3)}
          />
          <Pressable style={styles.headerButton}>
            <Filter size={Layout.moderateScale(18, 0.3)} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.description}>
          Tu diario digital anónimo y encriptado. Escribe reflexiones, poemas, historias o simplemente lo que sientes.
        </Text>
        
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable 
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}15` }
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Icon size={14} color={isSelected ? cat.color : Colors.textMuted} />
                <Text style={[styles.categoryChipText, isSelected && { color: cat.color }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        
        {/* Featured Thoughts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={Layout.moderateScale(16, 0.3)} color={Colors.neonPurple} />
            <Text style={styles.sectionTitle}>DESTACADOS</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {featuredThoughts.map((thought) => (
              <Pressable 
                key={thought.id} 
                style={[styles.featuredCard, { width: featuredCardWidth, height: featuredCardHeight }]}
                onPress={() => handleThoughtPress(thought)}
              >
                <Image source={{ uri: thought.coverImage }} style={styles.featuredCover} />
                <LinearGradient
                  colors={['transparent', 'rgba(5,5,5,0.95)']}
                  style={styles.featuredGradient}
                />
                <View style={[styles.encryptionIndicator, { backgroundColor: getEncryptionColor(thought.encryptionType || 'binary') }]}>
                  <Lock size={8} color={Colors.background} />
                  <Text style={styles.encryptionText}>{thought.encryptionType?.toUpperCase()}</Text>
                </View>
                <View style={styles.featuredInfo}>
                  <View style={[styles.featuredBadge, { backgroundColor: Colors.neonPurple }]}>
                    <Text style={styles.featuredBadgeText}>
                      {categories.find(c => c.id === thought.category)?.label || thought.category}
                    </Text>
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={2}>{thought.title}</Text>
                  <Text style={styles.featuredAuthor}>@{thought.author.nickname}</Text>
                  <View style={styles.featuredStats}>
                    <Heart size={12} color={Colors.neonRed} />
                    <Text style={styles.featuredStatsText}>{thought.likes}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Communities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={Layout.moderateScale(16, 0.3)} color={Colors.neonGreen} />
            <Text style={styles.sectionTitle}>COMUNIDADES</Text>
            <Pressable 
              style={styles.seeAllButton}
              onPress={() => router.push('/community/create')}
            >
              <Plus size={14} color={Colors.neonPurple} />
              <Text style={styles.seeAllText}>Crear</Text>
            </Pressable>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.communitiesContainer}
          >
            {communities.slice(0, 6).map((community) => (
              <Pressable 
                key={community.id} 
                style={[styles.communityCard, { width: communityCardWidth }]}
                onPress={() => router.push(`/community/${community.id}`)}
              >
                <Image source={{ uri: community.coverImage }} style={styles.communityCover} />
                <LinearGradient
                  colors={['transparent', 'rgba(5,5,5,0.95)']}
                  style={styles.communityGradient}
                />
                <View style={styles.communityIcon}>
                  <Text style={styles.communityEmoji}>{community.icon}</Text>
                </View>
                {community.isPrivate && (
                  <View style={styles.privateBadge}>
                    <Lock size={8} color={Colors.background} />
                  </View>
                )}
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
                  <View style={styles.communityStats}>
                    <Users size={10} color={Colors.textMuted} />
                    <Text style={styles.communityMembersText}>{community.members}</Text>
                  </View>
                  {community.isMember && (
                    <View style={styles.memberBadge}>
                      <Text style={styles.memberBadgeText}>Miembro</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
            
            {/* Ver todas las comunidades */}
            <Pressable 
              style={[styles.viewAllCard, { width: communityCardWidth }]}
              onPress={() => router.push('/community/' as any)}
            >
              <View style={styles.viewAllContent}>
                <View style={styles.viewAllIcon}>
                  <ChevronRight size={24} color={Colors.neonPurple} />
                </View>
                <Text style={styles.viewAllText}>Ver todas</Text>
                <Text style={styles.viewAllCount}>{communities.length} comunidades</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>
        
        {/* Recent Thoughts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather size={Layout.moderateScale(16, 0.3)} color={Colors.neonBlue} />
            <Text style={styles.sectionTitle}>RECIENTES</Text>
          </View>
          
          {filteredThoughts.map((thought) => (
            <ThoughtCard 
              key={thought.id} 
              thought={thought}
              onPress={() => handleThoughtPress(thought)}
              onLike={() => console.log('Like', thought.id)}
              onComment={() => console.log('Comment', thought.id)}
              onShare={() => console.log('Share', thought.id)}
            />
          ))}
        </View>

        {/* Liked Thoughts Card */}
        <Pressable style={styles.likedCard}>
          <LinearGradient
            colors={[Colors.backgroundMedium, 'rgba(191, 0, 255, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.likedGradient}
          />
          <View style={styles.likedContent}>
            <Heart size={Layout.moderateScale(22, 0.3)} color={Colors.neonPurple} />
            <View style={styles.likedInfo}>
              <Text style={styles.likedTitle}>MIS FAVORITOS</Text>
              <Text style={styles.likedCount}>24 pensamientos guardados</Text>
            </View>
            <BookOpen size={Layout.moderateScale(22, 0.3)} color={Colors.text} />
          </View>
        </Pressable>
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
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  headerButton: {
    width: Layout.moderateScale(38, 0.3),
    height: Layout.moderateScale(38, 0.3),
    borderRadius: Layout.moderateScale(19, 0.3),
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
    lineHeight: 18,
  },
  categoriesContainer: {
    paddingBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  categoryChipText: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.textMuted,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'MajorMono',
    fontSize: Layout.moderateScale(14, 0.3),
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  featuredContainer: {
    paddingBottom: Layout.spacing.sm,
  },
  featuredCard: {
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    marginRight: Layout.spacing.md,
  },
  featuredCover: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  encryptionIndicator: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  encryptionText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 7,
    color: Colors.background,
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.sm,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  featuredBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 8,
    color: Colors.background,
  },
  featuredTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: Layout.moderateScale(12, 0.3),
    color: Colors.text,
    marginBottom: 2,
  },
  featuredAuthor: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(10, 0.3),
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredStatsText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
  communitiesContainer: {
    paddingBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  communityCard: {
    height: 140,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  communityCover: {
    width: '100%',
    height: '100%',
  },
  communityGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  communityIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityEmoji: {
    fontSize: 18,
  },
  privateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  communityName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: Colors.text,
    marginBottom: 4,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  communityMembersText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
  },
  memberBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: Colors.neonGreen,
  },
  viewAllCard: {
    height: 140,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllContent: {
    alignItems: 'center',
  },
  viewAllIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: Colors.neonPurple,
  },
  viewAllCount: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.neonPurple,
  },
  likedCard: {
    height: Layout.moderateScale(70, 0.4),
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xl,
  },
  likedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  likedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    height: '100%',
  },
  likedInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  likedTitle: {
    fontFamily: 'MajorMono',
    fontSize: Layout.moderateScale(14, 0.3),
    color: Colors.text,
  },
  likedCount: {
    fontFamily: 'SpaceMono',
    fontSize: Layout.moderateScale(11, 0.3),
    color: Colors.textSecondary,
  },
});
