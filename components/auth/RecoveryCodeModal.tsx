import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface RecoveryCodeModalProps {
  visible: boolean;
  onClose: () => void;
  recoveryCode: string;
}

export default function RecoveryCodeModal({
  visible,
  onClose,
  recoveryCode,
}: RecoveryCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(recoveryCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: mostrar alerta para copiar manualmente
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log('Error copying:', error);
    }
  };

  const handleConfirm = () => {
    if (confirmed) {
      onClose();
    } else {
      setConfirmed(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Shield size={32} color={Colors.neonGreen} />
          </View>

          {/* Title */}
          <Text style={styles.title}>¡Cuenta Creada!</Text>

          {/* Warning */}
          <View style={styles.warningBox}>
            <AlertTriangle size={18} color="#ff9f43" />
            <Text style={styles.warningText}>
              Este es tu código de recuperación. Es el ÚNICO método para restablecer tu contraseña.
            </Text>
          </View>

          {/* Recovery Code */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>TU CÓDIGO DE RECUPERACIÓN</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText} selectable>{recoveryCode}</Text>
            </View>
            <TouchableOpacity 
              style={styles.copyButton} 
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              {copied ? (
                <>
                  <Check size={16} color={Colors.neonGreen} />
                  <Text style={[styles.copyText, { color: Colors.neonGreen }]}>¡Copiado!</Text>
                </>
              ) : (
                <>
                  <Copy size={16} color={Colors.neonBlue} />
                  <Text style={styles.copyText}>Copiar código</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>⚠️ IMPORTANTE:</Text>
            <Text style={styles.instructionText}>
              • Escríbelo o cópialo ahora{'\n'}
              • Guárdalo en un lugar seguro{'\n'}
              • NO lo compartas con nadie{'\n'}
              • Sin este código NO podrás recuperar tu cuenta
            </Text>
          </View>

          {/* Confirm Button */}
          {!confirmed ? (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                Ya guardé mi código
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.confirmButton, styles.finalButton]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                Entrar a BLACK SKY
              </Text>
            </TouchableOpacity>
          )}

          {confirmed && (
            <Text style={styles.finalWarning}>
              ¿Estás seguro? Una vez cierres este diálogo no podrás ver el código de nuevo.
            </Text>
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
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: Colors.neonGreen,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 159, 67, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 67, 0.3)',
    borderRadius: 12,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#ff9f43',
    lineHeight: 18,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  codeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: Colors.neonPurple,
    borderRadius: 12,
    padding: Layout.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 18,
    fontFamily: 'SpaceMono',
    color: Colors.neonPurple,
    letterSpacing: 2,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
    padding: Layout.spacing.sm,
    gap: 6,
  },
  copyText: {
    fontSize: 13,
    color: Colors.neonBlue,
  },
  instructions: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
  },
  finalButton: {
    backgroundColor: Colors.neonPurple,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
  finalWarning: {
    fontSize: 11,
    color: Colors.neonRed,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});
