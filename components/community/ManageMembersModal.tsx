import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { X, Shield, ShieldCheck, Crown, UserX, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Community, MemberRole, useCommunitiesStore } from '@/stores/communitiesStore';
import { useUsersStore } from '@/stores/usersStore';

interface ManageMembersModalProps {
  visible: boolean;
  onClose: () => void;
  community: Community;
}

const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; icon: any }> = {
  owner: { label: 'Propietario', color: '#FFD700', icon: Crown },
  admin: { label: 'Admin', color: Colors.neonPurple, icon: ShieldCheck },
  moderator: { label: 'Moderador', color: Colors.neonBlue, icon: Shield },
  member: { label: 'Miembro', color: Colors.textSecondary, icon: null },
};

export default function ManageMembersModal({ visible, onClose, community }: ManageMembersModalProps) {
  const users = useUsersStore((state) => state.users);
  const currentUserHandle = useCommunitiesStore((state) => state.currentUserHandle);
  const addAdmin = useCommunitiesStore((state) => state.addAdmin);
  const removeAdmin = useCommunitiesStore((state) => state.removeAdmin);
  const addModerator = useCommunitiesStore((state) => state.addModerator);
  const removeModerator = useCommunitiesStore((state) => state.removeModerator);
  const kickMember = useCommunitiesStore((state) => state.kickMember);
  const getUserRole = useCommunitiesStore((state) => state.getUserRole);

  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const currentUserRole = getUserRole(community.id, currentUserHandle);
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';

  const handleRoleChange = (memberHandle: string, newRole: MemberRole) => {
    const memberRole = getUserRole(community.id, memberHandle);
    
    if (newRole === 'admin') {
      if (memberRole === 'admin') {
        removeAdmin(community.id, memberHandle);
      } else {
        addAdmin(community.id, memberHandle);
      }
    } else if (newRole === 'moderator') {
      if (memberRole === 'moderator') {
        removeModerator(community.id, memberHandle);
      } else {
        addModerator(community.id