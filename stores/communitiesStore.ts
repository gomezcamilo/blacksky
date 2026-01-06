import { create } from 'zustand';

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface CommunityMember {
  oderId: string;
  handle: string;
  role: MemberRole;
  joinedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  icon: string;
  members: number;
  posts: number;
  createdBy: string;
  createdAt: string;
  isPrivate: boolean;
  tags: string[];
  isMember: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  membersList: CommunityMember[];
}

interface CommunitiesState {
  communities: Community[];
  currentUserHandle: string;
  
  // CRUD básico
  addCommunity: (community: Omit<Community, 'id' | 'members' | 'posts' | 'createdAt' | 'membersList' | 'isAdmin'>) => void;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  deleteCommunity: (id: string) => void;
  
  // Edición de comunidad
  updateCommunity: (id: string, updates: Partial<Pick<Community, 'name' | 'description' | 'coverImage' | 'icon' | 'isPrivate' | 'tags'>>) => void;
  
  // Gestión de roles
  addAdmin: (communityId: string, userHandle: string) => void;
  removeAdmin: (communityId: string, userHandle: string) => void;
  addModerator: (communityId: string, userHandle: string) => void;
  removeModerator: (communityId: string, userHandle: string) => void;
  kickMember: (communityId: string, userHandle: string) => void;
  
  // Helpers
  getUserRole: (communityId: string, userHandle: string) => MemberRole | null;
  canEditCommunity: (communityId: string) => boolean;
  canDeleteMessages: (communityId: string) => boolean;
}

const initialCommunities: Community[] = [
  {
    id: '1',
    name: 'Crypto Anarchists',
    description: 'Discusiones sobre criptografía, privacidad digital y libertad en la red. Un espacio para quienes creen en la descentralización.',
    coverImage: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: '🔐',
    members: 1247,
    posts: 342,
    createdBy: 'cipher_master',
    createdAt: '2024-01-15',
    isPrivate: false,
    tags: ['crypto', 'privacy', 'freedom'],
    isMember: true,
    isOwner: false,
    isAdmin: false,
    membersList: [
      { oderId: '1', handle: 'cipher_master', role: 'owner', joinedAt: '2024-01-15' },
      { oderId: '2', handle: 'void_runner', role: 'member', joinedAt: '2024-02-01' },
    ],
  },
  {
    id: '2',
    name: 'Neural Hackers',
    description: 'Explorando los límites de la mente y la tecnología. IA, interfaces neuronales y el futuro de la consciencia.',
    coverImage: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: '🧠',
    members: 892,
    posts: 156,
    createdBy: 'neuro_dev',
    createdAt: '2024-02-20',
    isPrivate: false,
    tags: ['ai', 'neural', 'future'],
    isMember: false,
    isOwner: false,
    isAdmin: false,
    membersList: [
      { oderId: '1', handle: 'neuro_dev', role: 'owner', joinedAt: '2024-02-20' },
    ],
  },
  {
    id: '3',
    name: 'Underground Music',
    description: 'Synthwave, darkwave, cyberpunk beats. Comparte y descubre música del underground digital.',
    coverImage: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: '🎵',
    members: 2103,
    posts: 567,
    createdBy: 'synth_lord',
    createdAt: '2023-11-10',
    isPrivate: false,
    tags: ['music', 'synthwave', 'electronic'],
    isMember: true,
    isOwner: false,
    isAdmin: false,
    membersList: [
      { oderId: '1', handle: 'synth_lord', role: 'owner', joinedAt: '2023-11-10' },
      { oderId: '2', handle: 'void_runner', role: 'member', joinedAt: '2024-01-05' },
    ],
  },
  {
    id: '4',
    name: 'Code Rebels',
    description: 'Programadores que desafían los límites. Open source, hacking ético y desarrollo alternativo.',
    coverImage: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: '💻',
    members: 1567,
    posts: 423,
    createdBy: 'root_access',
    createdAt: '2024-03-05',
    isPrivate: true,
    tags: ['coding', 'opensource', 'hacking'],
    isMember: false,
    isOwner: false,
    isAdmin: false,
    membersList: [
      { oderId: '1', handle: 'root_access', role: 'owner', joinedAt: '2024-03-05' },
    ],
  },
  {
    id: '5',
    name: 'Digital Artists',
    description: 'Arte digital, NFTs, diseño cyberpunk. Comparte tu creatividad visual con la comunidad.',
    coverImage: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: '🎨',
    members: 756,
    posts: 234,
    createdBy: 'pixel_witch',
    createdAt: '2024-04-12',
    isPrivate: false,
    tags: ['art', 'nft', 'design'],
    isMember: true,
    isOwner: false,
    isAdmin: false,
    membersList: [
      { oderId: '1', handle: 'pixel_witch', role: 'owner', joinedAt: '2024-04-12' },
      { oderId: '2', handle: 'void_runner', role: 'member', joinedAt: '2024-05-01' },
    ],
  },
  {
    id: '6',
    name: 'Night Owls',
    description: 'Para los que viven de noche. Pensamientos, reflexiones y conversaciones nocturnas.',
    coverImage: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800',
    icon: '🦉',
    members: 1890,
    posts: 678,
    createdBy: 'midnight_soul',
    createdAt: '2023-09-20',
    isPrivate: false,
    tags: ['night', 'thoughts', 'insomnia'],
    isMember: false,
    isOwner: false,
    isAdmin: false,
    membersList: [
      { oderId: '1', handle: 'midnight_soul', role: 'owner', joinedAt: '2023-09-20' },
    ],
  },
];

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
  communities: initialCommunities,
  currentUserHandle: 'void_runner',

  addCommunity: (newCommunity) =>
    set((state) => {
      const newId = Date.now().toString();
      return {
        communities: [
          {
            ...newCommunity,
            id: newId,
            members: 1,
            posts: 0,
            createdAt: new Date().toISOString().split('T')[0],
            isAdmin: true,
            membersList: [
              {
                oderId: '1',
                handle: state.currentUserHandle,
                role: 'owner' as MemberRole,
                joinedAt: new Date().toISOString().split('T')[0],
              },
            ],
          },
          ...state.communities,
        ],
      };
    }),

  joinCommunity: (id) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === id
          ? {
              ...c,
              isMember: true,
              members: c.members + 1,
              membersList: [
                ...c.membersList,
                {
                  oderId: Date.now().toString(),
                  handle: state.currentUserHandle,
                  role: 'member' as MemberRole,
                  joinedAt: new Date().toISOString().split('T')[0],
                },
              ],
            }
          : c
      ),
    })),

  leaveCommunity: (id) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === id
          ? {
              ...c,
              isMember: false,
              isAdmin: false,
              members: c.members - 1,
              membersList: c.membersList.filter((m) => m.handle !== state.currentUserHandle),
            }
          : c
      ),
    })),

  deleteCommunity: (id) =>
    set((state) => ({
      communities: state.communities.filter((c) => c.id !== id),
    })),

  updateCommunity: (id, updates) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  addAdmin: (communityId, userHandle) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              membersList: c.membersList.map((m) =>
                m.handle === userHandle ? { ...m, role: 'admin' as MemberRole } : m
              ),
            }
          : c
      ),
    })),

  removeAdmin: (communityId, userHandle) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              membersList: c.membersList.map((m) =>
                m.handle === userHandle ? { ...m, role: 'member' as MemberRole } : m
              ),
            }
          : c
      ),
    })),

  addModerator: (communityId, userHandle) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              membersList: c.membersList.map((m) =>
                m.handle === userHandle ? { ...m, role: 'moderator' as MemberRole } : m
              ),
            }
          : c
      ),
    })),

  removeModerator: (communityId, userHandle) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              membersList: c.membersList.map((m) =>
                m.handle === userHandle ? { ...m, role: 'member' as MemberRole } : m
              ),
            }
          : c
      ),
    })),

  kickMember: (communityId, userHandle) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              members: c.members - 1,
              membersList: c.membersList.filter((m) => m.handle !== userHandle),
            }
          : c
      ),
    })),

  getUserRole: (communityId, userHandle) => {
    const community = get().communities.find((c) => c.id === communityId);
    if (!community) return null;
    const member = community.membersList.find((m) => m.handle === userHandle);
    return member?.role || null;
  },

  canEditCommunity: (communityId) => {
    const state = get();
    const role = state.getUserRole(communityId, state.currentUserHandle);
    return role === 'owner' || role === 'admin';
  },

  canDeleteMessages: (communityId) => {
    const state = get();
    const role = state.getUserRole(communityId, state.currentUserHandle);
    return role === 'owner' || role === 'admin' || role === 'moderator';
  },
}));
