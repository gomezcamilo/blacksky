// API Service para Cipher Social
// Configura API_BASE_URL en tu .env o usa localhost para desarrollo

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Tipos
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
  isOnline: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  encryptedContent?: string;
  encryptionType: 'binary' | 'aes' | 'reverse' | 'none';
  visibility: 'public' | 'followers' | 'private';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user?: User;
  attachments?: PostAttachment[];
}

export interface PostAttachment {
  id: string;
  postId: string;
  attachmentType: 'image' | 'music' | 'video' | 'file';
  fileUrl?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicDuration?: number;
}

export interface CreatePostData {
  content: string;
  encryptionType: 'binary' | 'aes' | 'reverse' | 'none';
  visibility?: 'public' | 'followers' | 'private';
  music?: {
    title: string;
    artist: string;
  };
  imageUrl?: string;
}

// Clase de error personalizada
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper para hacer requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new ApiError(response.status, error.message || 'Error en la petición');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'Error de conexión. Verifica tu conexión a internet.');
  }
}

// =============================================
// POSTS API
// =============================================
export const postsApi = {
  // Obtener todos los posts (feed)
  getAll: (page = 1, limit = 20) => 
    request<{ posts: Post[]; total: number; page: number }>(`/posts?page=${page}&limit=${limit}`),

  // Obtener un post por ID
  getById: (id: string) => 
    request<Post>(`/posts/${id}`),

  // Crear un nuevo post
  create: (data: CreatePostData) =>
    request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Eliminar un post
  delete: (id: string) =>
    request<{ success: boolean }>(`/posts/${id}`, {
      method: 'DELETE',
    }),

  // Dar like a un post
  like: (id: string) =>
    request<{ liked: boolean; likesCount: number }>(`/posts/${id}/like`, {
      method: 'POST',
    }),

  // Quitar like de un post
  unlike: (id: string) =>
    request<{ liked: boolean; likesCount: number }>(`/posts/${id}/like`, {
      method: 'DELETE',
    }),
};

// =============================================
// USERS API
// =============================================
export const usersApi = {
  // Obtener perfil actual
  getMe: () => 
    request<User>('/users/me'),

  // Obtener usuario por ID
  getById: (id: string) => 
    request<User>(`/users/${id}`),

  // Obtener posts de un usuario
  getPosts: (userId: string, page = 1) =>
    request<{ posts: Post[]; total: number }>(`/users/${userId}/posts?page=${page}`),

  // Seguir usuario
  follow: (userId: string) =>
    request<{ following: boolean }>(`/users/${userId}/follow`, {
      method: 'POST',
    }),

  // Dejar de seguir
  unfollow: (userId: string) =>
    request<{ following: boolean }>(`/users/${userId}/follow`, {
      method: 'DELETE',
    }),
};

// =============================================
// AUTH API
// =============================================
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { username: string; email: string; password: string; displayName: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),
};

export default {
  posts: postsApi,
  users: usersApi,
  auth: authApi,
};
