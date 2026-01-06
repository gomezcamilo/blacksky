import { create } from 'zustand';

export interface AuthUser {
  id: string;
  username: string;
  handle: string;
  email: string;
  avatar: string;
  cover: string;
  bio: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  recoveryCodeHash?: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (handle: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    handle: string;
    email: string;
    password: string;
    recoveryCode: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  setUser: (user: AuthUser) => void;
}

// Generar ID único
const generateId = () => {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Avatares por defecto
const defaultAvatars = [
  'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
];

const defaultCover =
  'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=1260';

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (handle: string, password: string) => {
    set({ isLoading: true });

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simular verificación - en producción esto consultaría la base de datos
    // Por ahora, solo aceptamos usuarios que empiecen con letras específicas para demo
    const validPrefixes = ['a', 'b', 'c', 'd', 'e', 'test', 'demo', 'user'];
    const isValidUser = validPrefixes.some(prefix => 
      handle.toLowerCase().startsWith(prefix)
    ) || password === 'demo123';

    if (!isValidUser) {
      set({ isLoading: false });
      return false; // Usuario no encontrado
    }

    const user: AuthUser = {
      id: generateId(),
      username: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/_/g, ' '),
      handle: handle.toLowerCase(),
      email: `${handle}@blacksky.app`,
      avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      cover: defaultCover,
      bio: 'Navegando por el ciberespacio...',
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    };

    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  register: async (data) => {
    set({ isLoading: true });

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user: AuthUser = {
      id: generateId(),
      username: data.username || data.handle,
      handle: data.handle.toLowerCase(),
      email: data.email,
      avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      cover: defaultCover,
      bio: '',
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      recoveryCodeHash: data.recoveryCode,
      createdAt: new Date().toISOString(),
    };

    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },
}));
