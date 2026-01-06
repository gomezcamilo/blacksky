import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  Lock,
  Globe,
  Hash,
  X,
  Plus,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import NeonText from '@/components/ui/NeonText';
import GlassCard from '@/components/ui/GlassCard';
import SuccessModal from '@/components/ui/SuccessModal';
import Colors from '@/constants/Colors';
import { useCommunitiesStore } from '@/stores/communitiesStore';

const EMOJI_OPTIONS = ['🔐', '💻', '🎨', '🎵', '🎮', '📚', '🌐', '⚡', '🔥', '💎', '🚀', '👾'];

export default function CreateCommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const addCommunity = useCommunitiesStore((state) => state.addCommunity);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('🔐');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const maxWidth = isDesktop ? 500 : isTablet ? 480 : width;
  const padding = isDesktop ? 24 : 16;

  const sizes = {
    title: isDesktop ? 20 : 22,
    label: isDesktop ? 11 : 12,
    input: isDesktop ? 13 : 14,
    button: isDesktop ? 13 : 14,
  };

  const pickImage = async () => {
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

  const addTag = () => {
    if (newTag.trim() && tags.length < 5 && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) return;

    addCommunity({
      name: name.trim(),
      description: description.trim(),
      coverImage: coverImage || 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: selectedIcon,
      createdBy: 'void_runner',
      isPrivate,
      tags,
      isMember: true,
      isOwner: true,
    });

    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.back();
  };

  const isValid = name.trim().length >= 3 && description.trim().length >= 10;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: padding,
            maxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
          <NeonText text="CREATE COMMUNITY" color={Colors.neonPurple} fontSize={sizes.title} />
          <View style={{ width: 40 }} />
        </View>

        {/* Cover Image */}
        <Pressable onPress={pickImage} style={styles.coverContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Camera size={32} color={Colors.textMuted} />
              <Text style={styles.coverText}>Añadir portada</Text>
            </View>
          )}
        </Pressable>

        {/* Icon Selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sizes.label }]}>ICONO</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                style={[styles.emojiOption, selectedIcon === emoji && styles.emojiSelected]}
                onPress={() => setSelectedIcon(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sizes.label }]}>NOMBRE *</Text>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={[styles.input, { fontSize: sizes.input }]}
              placeholder="Nombre de la comunidad"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={30}
            />
          </GlassCard>
          <Text style={styles.hint}>{name.length}/30 caracteres</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sizes.label }]}>DESCRIPCIÓN *</Text>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={[styles.input, styles.textArea, { fontSize: sizes.input }]}
              placeholder="¿De qué trata tu comunidad?"
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
          </GlassCard>
          <Text style={styles.hint}>{description.length}/200 caracteres</Text>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sizes.label }]}>PRIVACIDAD</Text>
          <View style={styles.privacyOptions}>
            <Pressable
              style={[styles.privacyOption, !isPrivate && styles.privacySelected]}
              onPress={() => setIsPrivate(false)}
            >
              <Globe size={20} color={!isPrivate ? Colors.neonBlue : Colors.textSecondary} />
              <View style={styles.privacyInfo}>
                <Text style={[styles.privacyTitle, !isPrivate && { color: Colors.neonBlue }]}>Pública</Text>
                <Text style={styles.privacyDesc}>Cualquiera puede unirse</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.privacyOption, isPrivate && styles.privacySelected]}
              onPress={() => setIsPrivate(true)}
            >
              <Lock size={20} color={isPrivate ? Colors.neonPurple : Colors.textSecondary} />
              <View style={styles.privacyInfo}>
                <Text style={[styles.privacyTitle, isPrivate && { color: Colors.neonPurple }]}>Privada</Text>
                <Text style={styles.privacyDesc}>Solo con invitación</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sizes.label }]}>TAGS (máx. 5)</Text>
          <View style={styles.tagInputContainer}>
            <Hash size={16} color={Colors.textMuted} />
            <TextInput
              style={[styles.tagInput, { fontSize: sizes.input }]}
              placeholder="Añadir tag"
              placeholderTextColor={Colors.textMuted}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={addTag}
              maxLength={15}
            />
            <Pressable onPress={addTag} style={styles.addTagButton}>
              <Plus size={18} color={Colors.neonBlue} />
            </Pressable>
          </View>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
                <Pressable onPress={() => removeTag(tag)}>
                  <X size={14} color={Colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <Pressable
          style={[styles.createButton, !isValid && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!isValid}
        >
          <Text style={[styles.createButtonText, { fontSize: sizes.button }]}>
            CREAR COMUNIDAD
          </Text>
        </Pressable>
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="¡Comunidad creada!"
        message="Tu comunidad está lista. Invita a otros usuarios a unirse y comienza a compartir."
        encryptionType="aes"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  coverContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  coverText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  inputCard: {
    padding: 0,
  },
  input: {
    fontFamily: 'SpaceMono',
    color: Colors.text,
    padding: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: Colors.neonPurple,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
  },
  emoji: {
    fontSize: 24,
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  privacySelected: {
    borderColor: Colors.neonPurple,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 13,
    color: Colors.text,
  },
  privacyDesc: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagInput: {
    flex: 1,
    fontFamily: 'SpaceMono',
    color: Colors.text,
    paddingVertical: 12,
    marginLeft: 8,
  },
  addTagButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.neonBlue,
  },
  createButton: {
    backgroundColor: Colors.neonPurple,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(191, 0, 255, 0.3)',
  },
  createButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.background,
  },
});
