import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import { X, Camera, Globe, Lock, Plus, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Community, useCommunitiesStore } from '@/stores/communitiesStore';

interface EditCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  community: Community;
}

const EMOJI_OPTIONS = ['🔐', '🧠', '🎵', '💻', '🎨', '🦉', '🌙', '⚡', '🔥', '💀', '👾', '🤖', '🌐', '🎮', '📡', '🛸'];

export default function EditCommunityModal({ visible, onClose, community }: EditCommunityModalProps) {
  const updateCommunity = useCommunitiesStore((state) => state.updateCommunity);
  
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [icon, setIcon] = useState(community.icon);
  const [coverImage, setCoverImage] = useState(community.coverImage);
  const [isPrivate, setIsPrivate] = useState(community.isPrivate);
  const [tags, setTags] = useState<string[]>(community.tags);
  const [newTag, setNewTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    
    updateCommunity(community.id, {
      name: name.trim(),
      description: description.trim(),
      icon,
      coverImage,
      isPrivate,
      tags,
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Editar Comunidad</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
              disabled={!name.trim()}
            >
              <Text style={[styles.saveText, !name.trim() && styles.saveTextDisabled]}>
                Guardar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Cover Image */}
            <View style={styles.coverSection}>
              <Image source={{ uri: coverImage }} style={styles.coverPreview} />
              <View style={styles.coverOverlay}>
                <TouchableOpacity style={styles.changeCoverButton}>
                  <Camera size={20} color={Colors.text} />
                  <Text style={styles.changeCoverText}>Cambiar portada</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Icon */}
            <View style={styles.iconSection}>
              <Text style={styles.label}>Icono</Text>
              <TouchableOpacity 
                style={styles.iconSelector}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Text style={styles.selectedIcon}>{icon}</Text>
                <Text style={styles.changeIconText}>Cambiar</Text>
              </TouchableOpacity>
              
              {showEmojiPicker && (
                <View style={styles.emojiPicker}>
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
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nombre de la comunidad"
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
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
              <Text style={styles.charCount}>{description.length}/300</Text>
            </View>

            {/* Privacy */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Privacidad</Text>
              <View style={styles.privacyOptions}>
                <TouchableOpacity
                  style={[styles.privacyOption, !isPrivate && styles.privacySelected]}
                  onPress={() => setIsPrivate(false)}
                >
                  <Globe size={18} color={!isPrivate ? Colors.neonBlue : Colors.textMuted} />
                  <View style={styles.privacyTextContainer}>
                    <Text style={[styles.privacyTitle, !isPrivate && styles.privacyTitleSelected]}>
                      Pública
                    </Text>
                    <Text style={styles.privacyDesc}>Cualquiera puede unirse</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.privacyOption, isPrivate && styles.privacySelected]}
                  onPress={() => setIsPrivate(true)}
                >
                  <Lock size={18} color={isPrivate ? Colors.neonPurple : Colors.textMuted} />
                  <View style={styles.privacyTextContainer}>
                    <Text style={[styles.privacyTitle, isPrivate && styles.privacyTitleSelected]}>
                      Privada
                    </Text>
                    <Text style={styles.privacyDesc}>Solo con invitación</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <X size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addTagRow}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Agregar tag..."
                  placeholderTextColor={Colors.textMuted}
                  maxLength={20}
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                  <Plus size={18} color={Colors.neonBlue} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Cover URL (temporal) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de portada</Text>
              <TextInput
                style={styles.input}
                value={coverImage}
                onChangeText={setCoverImage}
                placeholder="https://..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.neonPurple,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
  },
  saveText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  saveTextDisabled: {
    color: Colors.textMuted,
  },
  content: {
    padding: Layout.spacing.md,
  },
  coverSection: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Layout.spacing.lg,
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeCoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeCoverText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  iconSection: {
    marginBottom: Layout.spacing.lg,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedIcon: {
    fontSize: 32,
  },
  changeIconText: {
    color: Colors.neonBlue,
    fontSize: 14,
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
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
    backgroundColor: 'rgba(191, 0, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  emojiText: {
    fontSize: 24,
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  privacyOptions: {
    gap: 10,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  privacySelected: {
    borderColor: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  privacyTitleSelected: {
    color: Colors.neonPurple,
  },
  privacyDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: Colors.neonBlue,
  },
  addTagRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonBlue,
  },
});
