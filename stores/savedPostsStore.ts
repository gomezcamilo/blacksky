import { create } from 'zustand';

export interface SavedPost {
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
  savedAt: string;
}

interface SavedPostsState {
  savedPosts: SavedPost[];
  savePost: (post: Omit<SavedPost, 'savedAt'>) => void;
  unsavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
}

export const useSavedPostsStore = create<SavedPostsState>((set, get) => ({
  savedPosts: [],

  savePost: (post) =>
    set((state) => {
      if (state.savedPosts.some((p) => p.id === post.id)) {
        return state;
      }
      return {
        savedPosts: [
          {
            ...post,
            savedAt: new Date().toISOString(),
          },
          ...state.savedPosts,
        ],
      };
    }),

  unsavePost: (postId) =>
    set((state) => ({
      savedPosts: state.savedPosts.filter((p) => p.id !== postId),
    })),

  isPostSaved: (postId) => {
    return get().savedPosts.some((p) => p.id === postId);
  },
}));
