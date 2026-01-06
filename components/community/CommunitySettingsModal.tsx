import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import {
  X,
  Camera,
  ImageIcon,
  Shield,
  Trash2,
  Save,
  Users,
  Crown,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Member {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
}

interface CommunitySettingsModalProps {
  visible: boolean;
  onClose: () => void;
  community: {
    id: string;
    name: string;
    description: string;
    icon: string;
    coverImage: string;
    isOwner: boolean;
  };
  onSave: (data: {
    name?: string;
    description?: string;
    icon?: string;
    coverImage?: string;
  }) => void;
  onAddAdmin: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

const mockMembers: Member[] = [
  { id: '1', username: 'VoidRunner', handle: 'void_runner', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'owner' },
  { id: '2', username: 'NeonHacker', handle: 'neon_hacker', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'admin' },
  { id: '3', username: 'CyberWitch', handle: 'cyber_witch', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
  { id: '4', username: 'DataPhantom', handle: 'data_phantom', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
];

const EMOJI_OPTIONS = ['🎮', '🎵', '💻', '🎨', '📚', '🔐', '🌐', '⚡', '🚀', '🎭', '🤖', '👾', '🎯', '💎', '🔮', '🌙'];

export default function CommunitySettingsModal({
  visible,
  onClose,
  community,
  onSave,
  onAddAdmin,
  onRemoveAdmin,
  onRemoveMember,
}: CommunitySettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [icon, setIcon] = useState(community.icon);
  const [coverImage, setCoverImage] = useState(community.coverImage);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    onSave({
      name: name !== community.name ? name : undefined,
      description: description !== community.description ? description : undefined,
      icon: icon !== community.icon ? icon : undefined,
      coverImage: coverImage !== community.coverImage ? coverImage : undefined,
    });
    onClose();
  };

  const handleToggleAdmin = (member: Member) => {
    if (member.role === 'owner') return;
    
    if (member.role === 'admin') {
      setMembers(prev => prev.map(m => 
        m.id === member.id ? { ...m, role: 'member' as const } : m
      ));
      onRemoveAdmin(member.id);
    } else {
      setMembers(prev => prev.map(m => 
        m.id === member.id ? { ...m, role: 'admin' as const } : m
      ));
      onAddAdmin(member.id);
    }
  };

  const handleRemoveMember = (member: Member) => {
    if (member.role === 'owner') return;
    setMemberToRemove(member);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      onRemoveMember(memberToRemove.id);
      setMemberToRemove(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={14} color="#FFD700" />;
      case 'admin': return <ShieldCheck size={14} color={Colors.neonGreen} />;
      default: return <User size={14} color={Colors.textMuted} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Creador';
      case 'admin': return 'Admin';
      default: return 'Miembro';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Configuración</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'general' && styles.tabActive]}
              onPress={() => setActiveTab('general')}
            >
              <ImageIcon size={16} color={activeTab === 'general' ? Colors.neonPurple : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>
                General
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'members' && styles.tabActive]}
              onPress={() => setActiveTab('members')}
            >
              <Users size={16} color={activeTab === 'members' ? Colors.neonPurple : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
                Miembros
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'general' ? (
              <>
                {/* Cover Image */}
                <Text style={styles.label}>Imagen de portada</Text>
                <TouchableOpacity style={styles.coverPicker} onPress={pickCoverImage}>
                  <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                  <View style={styles.coverOverlay}>
                    <Camera size={24} color={Colors.text} />
                    <Text style={styles.coverText}>Cambiar portada</Text>
                  </View>
                </TouchableOpacity>

                {/* Icon */}
                <Text style={styles.label}>Icono de la comunidad</Text>
                <TouchableOpacity 
                  style={styles.iconPicker}
                  onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Text style={styles.iconPreview}>{icon}</Text>
                  <Text style={styles.iconChangeText}>Cambiar</Text>
                </TouchableOpacity>

                {showEmojiPicker && (
                  <View style={styles.emojiGrid}>
                    {EMOJI_OPTIONS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[styles.emojiOption, icon === emoji && styles.emojiSelected]}
                        onPress={() => {
                          setIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Name */}
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nombre de la comunidad"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={50}
                />

                {/* Description */}
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe tu comunidad..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Save size={18} color={Colors.background} />
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Members List */}
                <Text style={styles.sectionTitle}>
                  Miembros ({members.length})
                </Text>
                
                {members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.username}</Text>
                        <View style={styles.roleBadge}>
                          {getRoleIcon(member.role)}
                          <Text style={styles.roleText}>{getRoleLabel(member.role)}</Text>
                        </View>
                      </View>
                      <Text style={styles.memberHandle}>@{member.handle}</Text>
                    </View>
                    
                    {member.role !== 'owner' && community.isOwner && (
                      <View style={styles.memberActions}>
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            member.role === 'admin' && styles.actionBtnActive
                          ]}
                          onPress={() => handleToggleAdmin(member)}
                        >
                          <Shield 
                            size={16} 
                            color={member.role === 'admin' ? Colors.neonGreen : Colors.textMuted} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtnDanger}
                          onPress={() => handleRemoveMember(member)}
                        >
                          <Trash2 size={16} color={Colors.neonRed} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}

                <View style={styles.legendContainer}>
                  <Text style={styles.legendTitle}>Acciones:</Text>
                  <View style={styles.legendItem}>
                    <Shield size={14} color={Colors.neonGreen} />
                    <Text style={styles.legendText}>Hacer/quitar admin</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Trash2 size={14} color={Colors.neonRed} />
                    <Text style={styles.legendText}>Expulsar de la comunidad</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Confirm Dialog for removing member */}
      <ConfirmDialog
        visible={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        title="Expulsar miembro"
        message={`¿Estás seguro de que deseas expulsar a ${memberToRemove?.username} de la comunidad? Esta acción no se puede deshacer.`}
        confirmText="Expulsar"
        cancelText="Cancelar"
        type="danger"
        icon="trash"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.backgroundMedium,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.neonPurple,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.neonPurple,
  },
  content: {
    padding: Layout.spacing.lg,
    maxHeight: 500,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverPicker: {
    height: 120,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverText: {
    color: Colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  iconPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconPreview: {
    fontSize: 32,
    marginRight: Layout.spacing.md,
  },
  iconChangeText: {
    color: Colors.neonPurple,
    fontSize: 14,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Layout.borderRadius.md,
  },
  emojiOption: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emojiSelected: {
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  emojiText: {
    fontSize: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonPurple,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.xl,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Layout.spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  memberHandle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderColor: Colors.neonGreen,
  },
  actionBtnDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 0, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 60, 0.3)',
  },
  legendContainer: {
    marginTop: Layout.spacing.xl,
    padding: Layout.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Layout.borderRadius.md,
  },
  legendTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
