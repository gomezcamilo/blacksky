import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Key, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForgotPasswordModal({
  visible,
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'code' | 'password' | 'success'>('code');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = () => {
    if (!recoveryCode.trim()) {
      setError('Ingresa tu código de recuperación');
      return;
    }
    if (recoveryCode.length < 12) {
      setError('El código debe tener al menos 12 caracteres');
      return;
    }
    // Aquí se verificaría el código contra la base de datos
    setError('');
    setStep('password');
  };

  const handleResetPassword = () => {
    if (!newPassword) {
      setError('Ingresa una nueva contraseña');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    // Aquí se actualizaría la contraseña en la base de datos
    setError('');
    setStep('success');
  };

  const handleClose = () => {
    setStep('code');
    setRecoveryCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Close Button */}
          {step !== 'success' && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          )}

          {step === 'code' && (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Key size={32} color={Colors.neonPurple} />
              </View>

              {/* Title */}
              <Text style={styles.title}>Recuperar Cuenta</Text>
              <Text style={styles.subtitle}>
                Ingresa el código de recuperación que recibiste al crear tu cuenta
              </Text>

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color={Colors.neonRed} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  placeholderTextColor={Colors.textMuted}
                  value={recoveryCode}
                  onChangeText={(text) => {
                    setRecoveryCode(text.toUpperCase());
                    setError('');
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={19}
                />
              </View>

              {/* Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerifyCode}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Verificar Código</Text>
              </TouchableOpacity>

              <Text style={styles.helpText}>
                ¿No tienes tu código? Lamentablemente no hay otra forma de recuperar tu cuenta.
              </Text>
            </>
          )}

          {step === 'password' && (
            <>
              {/* Icon */}
              <View style={[styles.iconContainer, { borderColor: Colors.neonGreen }]}>
                <Check size={32} color={Colors.neonGreen} />
              </View>

              {/* Title */}
              <Text style={styles.title}>Código Verificado</Text>
              <Text style={styles.subtitle}>
                Ahora crea una nueva contraseña para tu cuenta
              </Text>

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color={Colors.neonRed} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* New Password */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Nueva contraseña"
                  placeholderTextColor={Colors.textMuted}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showPassword}
                />
              </View>

              {/* Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleResetPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Cambiar Contraseña</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'success' && (
            <>
              {/* Icon */}
              <View style={[styles.iconContainer, { borderColor: Colors.neonGreen }]}>
                <Check size={32} color={Colors.neonGreen} />
              </View>

              {/* Title */}
              <Text style={styles.title}>¡Contraseña Actualizada!</Text>
              <Text style={styles.subtitle}>
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </Text>

              {/* Button */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: Colors.neonGreen }]}
                onPress={handleSuccess}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  dialog: {
    backgroundColor: Colors.backgroundMedium,
    borderRadius: 20,
    padding: Layout.spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: Colors.neonPurple,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Layout.spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 60, 0.3)',
    borderRadius: 8,
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
    width: '100%',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.neonRed,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 14,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    letterSpacing: 1,
  },
  eyeButton: {
    padding: 4,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.neonPurple,
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
  helpText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.lg,
    lineHeight: 16,
  },
});
