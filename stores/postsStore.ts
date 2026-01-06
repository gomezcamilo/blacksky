// Store global para posts
import { create } from 'zustand';

export interface Post {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  encryptionType: 'binary' | 'aes' | 'reverse';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  hasMusic?: boolean;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  imageUrl?: string;
  isOwn: boolean;
  // Repost fields
  isRepost?: boolean;
  repostComment?: string;
  originalPost?: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
    content: string;
    encryptionType: 'binary' | 'aes' | 'reverse';
  };
  repostedTo?: string; // community id if reposted to community
}

interface PostsState {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares'>) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  sharePost: (id: string) => void;
  repostPost: (postId: string, comment?: string) => void;
  repostToCommunity: (postId: string, communityId: string, comment?: string) => void;
}

// Datos iniciales
const initialPosts: Post[] = [
  {
    id: '1',
    username: 'NeonRider',
    handle: 'neonrider',
    avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=640',
    content: 'Just discovered a new security exploit in the mainframe. Corporate defenses are weaker than they claim.',
    encryptionType: 'binary',
    timestamp: '2h ago',
    likes: 42,
    comments: 7,
    shares: 3,
    hasMusic: true,
    musicTitle: 'Cybernetic Dreams',
    musicArtist: 'Neon Synthesis',
    isOwn: false,
  },
  {
    id: '2',
    username: 'CyberWitch',
    handle: 'cyber_witch',
    avatar: 'https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg?auto=compress&cs=tinysrgb&w=640',
    content: 'The line between reality and digital is blurring every day. Stay aware of your surroundings, both virtual and physical.',
    encryptionType: 'aes',
    timestamp: '5h ago',
    likes: 128,
    comments: 23,
    shares: 15,
    isOwn: false,
  },
  {
    id: '3',
    username: 'DataPhantom',
    handle: 'data_phantom',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=640',
    content: "Remember: In the age of surveillance, privacy is not just a right - it's a responsibility. Encrypt everything.",
    encryptionType: 'reverse',
    timestamp: '1d ago',
    likes: 56,
    comments: 12,
    shares: 8,
    hasMusic: true,
    musicTitle: 'Digital Twilight',
    musicArtist: 'Binary Sunset',
    isOwn: false,
  },
];

export const usePostsStore = create<PostsState>((set) => ({
  posts: initialPosts,
  
  addPost: (newPost) => set((state) => ({
    posts: [
      {
        ...newPost,
        id: Date.now().toString(),
        timestamp: 'ahora',
        likes: 0,
        comments: 0,
        shares: 0,
      },
      ...state.posts,
    ],
  })),
  
  deletePost: (id) => set((state) => ({
    posts: state.posts.filter((post) => post.id !== id),
  })),
  
  likePost: (id) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ),
  })),

  sharePost: (id) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === id ? { ...post, shares: post.shares + 1 } : post
    ),
  })),

  repostPost: (postId, comment) => set((state) => {
    const originalPost = state.posts.find((p) => p.id === postId);
    if (!originalPost) return state;

    const repost: Post = {
      id: Date.now().toString(),
      username: 'VoidRunner',
      handle: 'void_runner',
      avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: comment || '',
      encryptionType: originalPost.encryptionType,
      timestamp: 'ahora',
      likes: 0,
      comments: 0,
      shares: 0,
      isOwn: true,
      isRepost: true,
      repostComment: comment,
      originalPost: {
        id: originalPost.id,
        username: originalPost.username,
        handle: originalPost.handle,
        avatar: originalPost.avatar,
        content: originalPost.content,
        encryptionType: originalPost.encryptionType,
      },
    };

    return {
      posts: [repost, ...state.posts.map((p) =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      )],
    };
  }),

  repostToCommunity: (postId, communityId, comment) => set((state) => {
    const originalPost = state.posts.find((p) => p.id === postId);
    if (!originalPost) return state;

    const repost: Post = {
      id: Date.now().toString(),
      username: 'VoidRunner',
      handle: 'void_runner',
      avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: comment || '',
      encryptionType: originalPost.encryptionType,
      timestamp: 'ahora',
      likes: 0,
      comments: 0,
      shares: 0,
      isOwn: true,
      isRepost: true,
      repostComment: comment,
      repostedTo: communityId,
      originalPost: {
        id: originalPost.id,
        username: originalPost.username,
        handle: originalPost.handle,
        avatar: originalPost.avatar,
        content: originalPost.content,
        encryptionType: originalPost.encryptionType,
      },
    };

    return {
      posts: [repost, ...state.posts.map((p) =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      )],
    };
  }),
}));
