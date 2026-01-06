import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AtSign, Lock, Eye, EyeOff, Mail, ArrowLeft, Check, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import NeonText from '@/components/ui/NeonText';
import RecoveryCodeModal from '@/components/auth/RecoveryCodeModal';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';

const moloCorpLogo = require('@/assets/images/molocorp.png');

// Función para generar código de recuperación alfanumérico
const generateRecoveryCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segmentLength = 4;
  const code: string[] = [];
  
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code.push(segment);
  }
  
  return code.join('-');
};

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const register = useAuthStore((state) => state.register);

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const formWidth = isDesktop ? 400 : isTablet ? 380 : width - 48;

  const buttonScale = useSharedValue(1);

  const sizes = {
    logo: isDesktop ? 60 : isTablet ? 70 : 80,
    title: isDesktop ? 24 : isTablet ? 26 : 28,
    input: isDesktop ? 14 : 15,
    button: isDesktop ? 13 : 14,
    link: isDesktop ? 12 : 13,
    icon: isDesktop ? 18 : 20,
    small: isDesktop ? 10 : 11,
  };

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    if (!nickname.trim()) {
      setError('Elige un @nickname único');
      shakeButton();
      return;
    }
    if (nickname.length < 3) {
      setError('El nickname debe tener al menos 3 caracteres');
      shakeButton();
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setError('Ingresa un email válido');
      shakeButton();
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setError('La contraseña no cumple los requisitos');
      shakeButton();
      return;
    }
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      shakeButton();
      return;
    }

    setError('');
    
    // Generar código de recuperación
    const newRecoveryCode = generateRecoveryCode();
    setRecoveryCode(newRecoveryCode);
    
    // Registrar usuario en el store
    await register({
      username: nickname,
      handle: nickname,
      email: email,
      password: password,
      recoveryCode: newRecoveryCode,
    });
    
    // Mostrar modal con el código
    setShowRecoveryModal(true);
  };

  const handleRecoveryModalClose = () => {
    setShowRecoveryModal(false);
    router.replace('/(tabs)');
  };

  const shakeButton = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1.05, { duration: 50 }),
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 50 })
    );
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <View style={styles.validationItem}>
      {valid ? (
        <Check size={12} color={Colors.neonGreen} />
      ) : (
        <X size={12} color={Colors.textMuted} />
      )}
      <Text style={[styles.validationText, valid && styles.validationTextValid]}>
        {text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={moloCorpLogo}
            style={[styles.logo, { width: sizes.logo, height: sizes.logo }]}
            resizeMode="contain"
          />
          <NeonText
            text="CREAR IDENTIDAD"
            color={Colors.neonBlue}
            fontSize={sizes.title}
            glow
            glowIntensity={0.6}
          />
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { fontSize: sizes.link }]}>
          Tu identidad anónima en el void digital
        </Text>

        {/* Register Form */}
        <View style={[styles.formContainer, { width: formWidth }]}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Nickname Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: sizes.small }]}>@NICKNAME</Text>
            <View style={styles.inputContainer}>
              <AtSign size={sizes.icon} color={Colors.neonPurple} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: sizes.input }]}
                placeholder="tu_nombre_unico"
                placeholderTextColor={Colors.textMuted}
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            <Text style={styles.inputHint}>
              Solo letras, números y guiones bajos. Este será tu identificador único.
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: sizes.small }]}>EMAIL</Text>
            <View style={styles.inputContainer}>
              <Mail size={sizes.icon} color={Colors.neonBlue} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: sizes.input }]}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase());
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            <Text style={styles.inputHint}>
              Solo para recuperación de cuenta. No será visible públicamente.
            </Text>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: sizes.small }]}>CONTRASEÑA</Text>
            <View style={styles.inputContainer}>
              <Lock size={sizes.icon} color={Colors.neonGreen} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: sizes.input, flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? (
                  <EyeOff size={sizes.icon} color={Colors.textSecondary} />
                ) : (
                  <Eye size={sizes.icon} color={Colors.textSecondary} />
                )}
              </Pressable>
            </View>

            {/* Password Requirements */}
            <View style={styles.validationContainer}>
              <ValidationItem valid={hasMinLength} text="Mínimo 8 caracteres" />
              <ValidationItem valid={hasUppercase} text="Una mayúscula" />
              <ValidationItem valid={hasNumber} text="Un número" />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: sizes.small }]}>CONFIRMAR CONTRASEÑA</Text>
            <View style={styles.inputContainer}>
              <Lock size={sizes.icon} color={Colors.neonGreen} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: sizes.input, flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                {showConfirmPassword ? (
                  <EyeOff size={sizes.icon} color={Colors.textSecondary} />
                ) : (
                  <Eye size={sizes.icon} color={Colors.textSecondary} />
                )}
              </Pressable>
            </View>
            {confirmPassword.length > 0 && (
              <View style={styles.validationContainer}>
                <ValidationItem valid={passwordsMatch} text="Las contraseñas coinciden" />
              </View>
            )}
          </View>

          {/* Register Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable style={styles.registerButton} onPress={handleRegister}>
              <Text style={[styles.registerButtonText, { fontSize: sizes.button }]}>
                CREAR MI IDENTIDAD
              </Text>
            </Pressable>
          </Animated.View>

          {/* Terms */}
          <Text style={styles.termsText}>
            Al crear una cuenta, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>

          {/* Login Link */}
          <Pressable onPress={() => router.back()} style={styles.loginLinkContainer}>
            <Text style={[styles.loginText, { fontSize: sizes.link }]}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Recovery Code Modal */}
      <RecoveryCodeModal
        visible={showRecoveryModal}
        onClose={handleRecoveryModalClose}
        recoveryCode={recoveryCode}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 50, 50, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#ff5050',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'MajorMono',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceMono',
    color: Colors.text,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
  },
  inputHint: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
  },
  validationContainer: {
    marginTop: 8,
    gap: 4,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validationText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
  },
  validationTextValid: {
    color: Colors.neonGreen,
  },
  registerButton: {
    backgroundColor: Colors.neonBlue,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.background,
  },
  termsText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.neonPurple,
  },
  loginLinkContainer: {
    marginTop: 24,
  },
  loginText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loginLink: {
    color: Colors.neonPurple,
  },
});
