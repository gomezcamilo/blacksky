// Store global para usuarios y seguimientos
import { create } from 'zustand';
import { usePostsStore } from './postsStore';

export interface UserProfile {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  cover?: string;
  bio: string;
  isVerified: boolean;
  isOnline: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface UsersState {
  users: Record<string, UserProfile>;
  following: string[]; // IDs de usuarios que sigo
  messages: Record<string, Message[]>; // Mensajes por conversación
  currentUserId: string;
  
  // Actions
  getUser: (id: string) => UserProfile | undefined;
  isFollowing: (userId: string) => boolean;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  getConversation: (userId: string) => Message[];
  getUserPosts: (userId: string) => ReturnType<typeof usePostsStore.getState>['posts'];
}

// Usuarios de ejemplo basados en los posts existentes
const mockUsers: Record<string, UserProfile> = {
  neonrider: {
    id: 'neonrider',
    username: 'NeonRider',
    handle: 'neonrider',
    avatar:
      'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=640',
    cover: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Riding through the neon-lit streets of cyberspace. Security researcher by day, digital nomad by night.',
    isVerified: true,
    isOnline: true,
    followersCount: 1542,
    followingCount: 234,
    postsCount: 89,
  },
  cyber_witch: {
    id: 'cyber_witch',
    username: 'CyberWitch',
    handle: 'cyber_witch',
    avatar:
      'https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg?auto=compress&cs=tinysrgb&w=640',
    cover: 'https://images.pexels.com/photos/3265460/pexels-photo-3265460.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Casting digital spells in the matrix. Crypto enthusiast and privacy advocate. The future is encrypted.',
    isVerified: true,
    isOnline: false,
    followersCount: 3201,
    followingCount: 156,
    postsCount: 234,
  },
  data_phantom: {
    id: 'data_phantom',
    username: 'DataPhantom',
    handle: 'data_phantom',
    avatar:
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=640',
    cover: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: "Ghost in the machine. Data analyst turned digital activist. Privacy is not a privilege, it's a right.",
    isVerified: false,
    isOnline: true,
    followersCount: 892,
    followingCount: 445,
    postsCount: 156,
  },
  cipher_master: {
    id: 'cipher_master',
    username: 'CipherMaster',
    handle: 'cipher_master',
    avatar:
      'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Master of encryption. Building the future of secure communications.',
    isVerified: true,
    isOnline: true,
    followersCount: 2341,
    followingCount: 123,
    postsCount: 342,
  },
  neon_rider: {
    id: 'neon_rider',
    username: 'NeonRider',
    handle: 'neon_rider',
    avatar:
      'https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Riding the digital waves. VPN enthusiast and privacy advocate.',
    isVerified: false,
    isOnline: false,
    followersCount: 567,
    followingCount: 234,
    postsCount: 78,
  },
  synth_lord: {
    id: 'synth_lord',
    username: 'SynthLord',
    handle: 'synth_lord',
    avatar:
      'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Creating darkwave and synthwave beats. Music is my encryption.',
    isVerified: true,
    isOnline: true,
    followersCount: 4521,
    followingCount: 89,
    postsCount: 567,
  },
  beat_hacker: {
    id: 'beat_hacker',
    username: 'BeatHacker',
    handle: 'beat_hacker',
    avatar:
      'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Hacking beats and breaking barriers. Electronic music producer.',
    isVerified: false,
    isOnline: true,
    followersCount: 1234,
    followingCount: 456,
    postsCount: 123,
  },
  pixel_witch: {
    id: 'pixel_witch',
    username: 'PixelWitch',
    handle: 'pixel_witch',
    avatar:
      'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Digital artist and NFT creator. Cyberpunk aesthetics.',
    isVerified: true,
    isOnline: false,
    followersCount: 3456,
    followingCount: 234,
    postsCount: 234,
  },
  glitch_artist: {
    id: 'glitch_artist',
    username: 'GlitchArtist',
    handle: 'glitch_artist',
    avatar:
      'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Breaking pixels, creating art. Glitch is my medium.',
    isVerified: false,
    isOnline: true,
    followersCount: 789,
    followingCount: 567,
    postsCount: 89,
  },
  luna_oscura: {
    id: 'luna_oscura',
    username: 'LunaOscura',
    handle: 'luna_oscura',
    avatar:
      'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Poeta nocturna. Escribiendo versos en la oscuridad digital.',
    isVerified: false,
    isOnline: true,
    followersCount: 1876,
    followingCount: 345,
    postsCount: 234,
  },
  neon_dreamer: {
    id: 'neon_dreamer',
    username: 'NeonDreamer',
    handle: 'neon_dreamer',
    avatar:
      'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Soñador digital. Pensamientos nocturnos y reflexiones.',
    isVerified: false,
    isOnline: false,
    followersCount: 654,
    followingCount: 432,
    postsCount: 89,
  },
  void_walker: {
    id: 'void_walker',
    username: 'VoidWalker',
    handle: 'void_walker',
    avatar:
      'https://images.pexels.com/photos/2191013/pexels-photo-2191013.jpeg?auto=compress&cs=tinysrgb&w=100',
    cover: 'https://images.pexels.com/photos/2191013/pexels-photo-2191013.jpeg?auto=compress&cs=tinysrgb&w=1260',
    bio: 'Caminante del vacío. Reflexiones desde el abismo digital.',
    isVerified: true,
    isOnline: true,
    followersCount: 2345,
    followingCount: 123,
    postsCount: 156,
  },
};

export const useUsersStore = create<UsersState>((set, get) => ({
  users: mockUsers,
  following: [],
  messages: {},
  currentUserId: 'void_runner',
  
  getUser: (id: string) => get().users[id],
  
  isFollowing: (userId: string) => get().following.includes(userId),
  
  followUser: (userId: string) => set((state) => {
    if (state.following.includes(userId)) return state;
    const user = state.users[userId];
    if (user) {
      return {
        following: [...state.following, userId],
        users: {
          ...state.users,
          [userId]: { ...user, followersCount: user.followersCount + 1 },
        },
      };
    }
    return { following: [...state.following, userId] };
  }),
  
  unfollowUser: (userId: string) => set((state) => {
    const user = state.users[userId];
    if (user) {
      return {
        following: state.following.filter((id) => id !== userId),
        users: {
          ...state.users,
          [userId]: { ...user, followersCount: Math.max(0, user.followersCount - 1) },
        },
      };
    }
    return { following: state.following.filter((id) => id !== userId) };
  }),
  
  sendMessage: (receiverId: string, content: string) => set((state) => {
    const conversationKey = [state.currentUserId, receiverId].sort().join('_');
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: state.currentUserId,
      receiverId,
      content,
      timestamp: 'ahora',
      isRead: false,
    };
    return {
      messages: {
        ...state.messages,
        [conversationKey]: [...(state.messages[conversationKey] || []), newMessage],
      },
    };
  }),
  
  getConversation: (userId: string) => {
    const state = get();
    const conversationKey = [state.currentUserId, userId].sort().join('_');
    return state.messages[conversationKey] || [];
  },
  
  getUserPosts: (userId: string) => {
    const posts = usePostsStore.getState().posts;
    return posts.filter((post) => post.handle === userId);
  },
}));
