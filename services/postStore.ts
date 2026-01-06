// Store local para posts (funciona sin backend)
// Usa AsyncStorage para persistencia local

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalPost {
  id: string;
  content: string;
  encryptionType: 'binary' | 'aes' | 'reverse' | 'none';
  visibility: 'public' | 'followers' | 'private';
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  music?: {
    title: string;
    artist: string;
  };
  imageUrl?: string;
}

const POSTS_KEY = '@cipher_posts';

// Funciones de encriptación simulada
export const encryptContent = (content: string, type: 'binary' | 'aes' | 'reverse' | 'none'): string => {
  switch (type) {
    case 'binary':
      return content.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    case 'reverse':
      return content.split('').reverse().join('');
    case 'aes':
      // Simulación visual de AES (en producción usar crypto real)
      return btoa(content);
    default:
      return content;
  }
};

export const decryptContent = (content: string, type: 'binary' | 'aes' | 'reverse' | 'none'): string => {
  switch (type) {
    case 'binary':
      return content.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
    case 'reverse':
      return content.split('').reverse().join('');
    case 'aes':
      try {
        return atob(content);
      } catch {
        return content;
      }
    default:
      return content;
  }
};

class PostStore {
  private posts: LocalPost[] = [];
  private listeners: Set<() => void> = new Set();

  async init() {
    try {
      const stored = await AsyncStorage.getItem(POSTS_KEY);
      if (stored) {
        this.posts = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  private async save() {
    try {
      await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(this.posts));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getPosts(): LocalPost[] {
    return [...this.posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPost(data: {
    content: string;
    encryptionType: 'binary' | 'aes' | 'reverse' | 'none';
    visibility?: 'public' | 'followers' | 'private';
    music?: { title: string; artist: string };
    imageUrl?: string;
  }): Promise<LocalPost> {
    const newPost: LocalPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: data.content,
      encryptionType: data.encryptionType,
      visibility: data.visibility || 'public',
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      music: data.music,
      imageUrl: data.imageUrl,
    };

    this.posts.unshift(newPost);
    await this.save();
    
    return newPost;
  }

  async deletePost(id: string): Promise<boolean> {
    const index = this.posts.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.posts.splice(index, 1);
    await this.save();
    return true;
  }

  async likePost(id: string): Promise<number> {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.likesCount++;
      await this.save();
      return post.likesCount;
    }
    return 0;
  }

  getPostById(id: string): LocalPost | undefined {
    return this.posts.find(p => p.id === id);
  }
}

export const postStore = new PostStore();
export default postStore;
