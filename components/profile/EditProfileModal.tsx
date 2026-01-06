import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Camera, Check, LogOut, Bookmark } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Colors from '@/constants/Colors';
import { useSavedPostsStore } from '@/stores/savedPostsStore';
import { useAuthStore } from '@/stores/authStore';

interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  bio: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile;
}

export default function EditProfileModal({
  visible,
  onClose,
  onSave,
  currentProfile,
}: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const logout = useAuthStore((state) => state.logout);

  const [name, setName] = useState(currentProfile.name);
  const [bio, setBio] = useState(currentProfile.bio);
  const [avatar, setAvatar] = useState(currentProfile.avatar);
  const [cover, setCover] = useState(currentProfile.cover);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const savedPostsCount = useSavedPostsStore((state) => state.savedPosts.length);

  const modalWidth = isDesktop ? 500 : isTablet ? 450 : width - 32;

  const pickImage = async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'avatar') {
        setAvatar(result.assets[0].uri);
      } else {
        setCover(result.assets[0].uri);
      }
    }
  };

  const handleSave = () => {
    onSave({
      name,
      handle: currentProfile.handle,
      avatar,
      cover,
      bio,
    });
    onClose();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout(); // Limpiar el estado de autenticación
    onClose();
    setTimeout(() => {
      router.replace('/login');
    }, 100);
  };

  const handleOpenSaved = () => {
    onClose();
    router.push('/saved');
  };

  const sizes = {
    title: isDesktop ? 18 : 20,
    label: isDesktop ? 11 : 12,
    input: isDesktop ? 13 : 14,
    button: isDesktop ? 12 : 13,
    icon: isDesktop ? 20 : 22,
    padding: isDesktop ? 16 : 20,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          {
            width: modalWidth,
            maxHeight: height - 100,
            marginTop: insets.top + 20,
          }
        ]}>
          <GlassCard style={styles.modal} intensity={80}>
            {/* Header */}
            <View style={[styles.header, { padding: sizes.padding }]}>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={sizes.icon} color={Colors.text} />
              </Pressable>
              <NeonText
                text="EDIT PROFILE"
                color={Colors.neonPurple}
                fontSize={sizes.title}
              />
              <Pressable onPress={handleSave} style={styles.saveButton}>
                <Check size={sizes.icon} color={Colors.neonGreen} />
              </Pressable>
            </View>

            <ScrollView 
              style={styles.content}
              contentContainerStyle={{ padding: sizes.padding }}
              showsVerticalScrollIndicator={false}
            >
              {/* Cover Image */}
              <View style={styles.section}>
                <Text style={[styles.label, { fontSize: sizes.label }]}>COVER IMAGE</Text>
                <Pressable onPress={() => pickImage('cover')} style={styles.coverContainer}>
                  <Image source={{ uri: cover }} style={styles.coverPreview} />
                  <View style={styles.imageOverlay}>
                    <Camera size={24} color={Colors.text} />
                    <Text style={styles.changeText}>Change Cover</Text>
                  </View>
                </Pressable>
              </View>

              {/* Avatar */}
              <View style={styles.section}>
                <Text style={[styles.label, { fontSize: sizes.label }]}>PROFILE PHOTO</Text>
                <Pressable onPress={() => pickImage('avatar')} style={styles.avatarContainer}>
                  <Image source={{ uri: avatar }} style={styles.avatarPreview} />
                  <View style={styles.avatarOverlay}>
                    <Camera size={20} color={Colors.text} />
                  </View>
                </Pressable>
              </View>

              {/* Name */}
              <View style={styles.section}>
                <Text style={[styles.label, { fontSize: sizes.label }]}>DISPLAY NAME</Text>
                <TextInput
                  style={[styles.input, { fontSize: sizes.input }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your display name"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={30}
                />
                <Text style={styles.charCount}>{name.length}/30</Text>
              </View>

              {/* Handle (read-only) */}
              <View style={styles.section}>
                <Text style={[styles.label, { fontSize: sizes.label }]}>USERNAME</Text>
                <View style={[styles.input, styles.inputDisabled]}>
                  <Text style={[styles.inputText, { fontSize: sizes.input }]}>
                    @{currentProfile.handle}
                  </Text>
                </View>
              </View>

              {/* Bio */}
              <View style={styles.section}>
                <Text style={[styles.label, { fontSize: sizes.label }]}>BIO</Text>
                <TextInput
                  style={[styles.input, styles.bioInput, { fontSize: sizes.input }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={160}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{bio.length}/160</Text>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={[styles.footer, { padding: sizes.padding }]}>
              <Pressable onPress={handleSave} style={styles.saveFullButton}>
                <Text style={[styles.saveButtonText, { fontSize: sizes.button }]}>
                  SAVE CHANGES
                </Text>
              </Pressable>

              {/* Saved Posts Button */}
              <Pressable onPress={handleOpenSaved} style={styles.savedButton}>
                <Bookmark size={18} color={Colors.neonBlue} />
                <Text style={styles.savedButtonText}>GUARDADOS</Text>
                {savedPostsCount > 0 && (
                  <View style={styles.savedCountBadge}>
                    <Text style={styles.savedCountText}>{savedPostsCount}</Text>
                  </View>
                )}
              </Pressable>

              {/* Logout Button */}
              <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <LogOut size={18} color="#ff4757" />
                <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
              </Pressable>
            </View>
          </GlassCard>
        </View>
      </View>

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        type="danger"
        icon="logout"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderColor: 'rgba(191, 0, 255, 0.3)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  coverContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
    marginTop: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveFullButton: {
    backgroundColor: Colors.neonPurple,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.background,
  },
  savedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 114, 255, 0.3)',
    backgroundColor: 'rgba(0, 114, 255, 0.1)',
  },
  savedButtonText: {
    fontFamily: 'MajorMono',
    fontSize: 12,
    color: Colors.neonBlue,
  },
  savedCountBadge: {
    backgroundColor: Colors.neonBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  savedCountText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: Colors.background,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  logoutButtonText: {
    fontFamily: 'MajorMono',
    fontSize: 12,
    color: '#ff4757',
  },
});
