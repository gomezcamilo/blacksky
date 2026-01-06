import { create } from 'zustand';

export interface CommunityMessage {
  id: string;
  communityId: string;
  userId: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: CommunityReply[];
  isOwn: boolean;
}

export interface CommunityReply {
  id: string;
  userId: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface CommunityMessagesState {
  messages: CommunityMessage[];
  addMessage: (communityId: string, content: string) => void;
  addReply: (messageId: string, content: string) => void;
  likeMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  getMessagesByCommunity: (communityId: string) => CommunityMessage[];
}

const initialMessages: CommunityMessage[] = [
  // Crypto Anarchists (id: 1)
  {
    id: 'cm1',
    communityId: '1',
    userId: 'u1',
    username: 'CipherMaster',
    handle: 'cipher_master',
    avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: '¿Alguien ha probado el nuevo protocolo de encriptación cuántica? Parece prometedor para la próxima generación de comunicaciones seguras.',
    timestamp: '2h',
    likes: 12,
    replies: [
      {
        id: 'r1',
        userId: 'u2',
        username: 'DataPhantom',
        handle: 'data_phantom',
        avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
        content: 'Sí, lo estuve testeando. Aún tiene algunos bugs pero el concepto es sólido.',
        timestamp: '1h',
        isOwn: false,
      },
    ],
    isOwn: false,
  },
  {
    id: 'cm2',
    communityId: '1',
    userId: 'u3',
    username: 'NeonRider',
    handle: 'neon_rider',
    avatar: 'https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Nuevo tutorial sobre VPNs descentralizadas en mi perfil. Feedback bienvenido 🔐',
    timestamp: '5h',
    likes: 28,
    replies: [],
    isOwn: false,
  },
  // Underground Music (id: 3)
  {
    id: 'cm3',
    communityId: '3',
    userId: 'u4',
    username: 'SynthLord',
    handle: 'synth_lord',
    avatar: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Acabo de subir un nuevo track de darkwave. Link en mi bio 🎵',
    timestamp: '3h',
    likes: 45,
    replies: [
      {
        id: 'r2',
        userId: 'u5',
        username: 'BeatHacker',
        handle: 'beat_hacker',
        avatar: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=100',
        content: '¡Brutal! Me encanta el drop del minuto 2:30',
        timestamp: '2h',
        isOwn: false,
      },
    ],
    isOwn: false,
  },
  {
    id: 'cm4',
    communityId: '3',
    userId: 'u6',
    username: 'VoidRunner',
    handle: 'void_runner',
    avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: '¿Recomendaciones de artistas de synthwave para un playlist nocturno?',
    timestamp: '1d',
    likes: 15,
    replies: [
      {
        id: 'r3',
        userId: 'u7',
        username: 'NightDrive',
        handle: 'night_drive',
        avatar: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=100',
        content: 'Carpenter Brut, Perturbator, y Kavinsky son esenciales 🌃',
        timestamp: '20h',
        isOwn: false,
      },
      {
        id: 'r4',
        userId: 'u8',
        username: 'RetroWave',
        handle: 'retro_wave',
        avatar: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=100',
        content: 'No te olvides de Gunship y The Midnight!',
        timestamp: '18h',
        isOwn: false,
      },
    ],
    isOwn: true,
  },
  // Digital Artists (id: 5)
  {
    id: 'cm5',
    communityId: '5',
    userId: 'u9',
    username: 'PixelWitch',
    handle: 'pixel_witch',
    avatar: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Nuevo drop de mi colección cyberpunk este viernes. 50 piezas únicas generadas con IA + retoque manual 🎨',
    timestamp: '4h',
    likes: 67,
    replies: [],
    isOwn: false,
  },
  {
    id: 'cm6',
    communityId: '5',
    userId: 'u10',
    username: 'GlitchArtist',
    handle: 'glitch_artist',
    avatar: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: '¿Qué software usan para glitch art? Estoy buscando alternativas a Photoshop',
    timestamp: '8h',
    likes: 23,
    replies: [
      {
        id: 'r5',
        userId: 'u11',
        username: 'DataMosh',
        handle: 'data_mosh',
        avatar: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=100',
        content: 'Audacity para databending, Processing para generativo, y GIMP es gratis',
        timestamp: '6h',
        isOwn: false,
      },
    ],
    isOwn: false,
  },
];

export const useCommunityMessagesStore = create<CommunityMessagesState>((set, get) => ({
  messages: initialMessages,

  addMessage: (communityId, content) =>
    set((state) => ({
      messages: [
        {
          id: Date.now().toString(),
          communityId,
          userId: 'current_user',
          username: 'VoidRunner',
          handle: 'void_runner',
          avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
          content,
          timestamp: 'ahora',
          likes: 0,
          replies: [],
          isOwn: true,
        },
        ...state.messages,
      ],
    })),

  addReply: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              replies: [
                ...msg.replies,
                {
                  id: Date.now().toString(),
                  userId: 'current_user',
                  username: 'VoidRunner',
                  handle: 'void_runner',
                  avatar: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=100',
                  content,
                  timestamp: 'ahora',
                  isOwn: true,
                },
              ],
            }
          : msg
      ),
    })),

  likeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
      ),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  getMessagesByCommunity: (communityId) => {
    return get().messages.filter((msg) => msg.communityId === communityId);
  },
}));
