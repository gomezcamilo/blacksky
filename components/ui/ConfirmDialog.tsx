import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { AlertTriangle, Info, Trash2, LogOut } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type DialogType = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: 'trash' | 'logout' | 'warning' | 'info';
}

export default function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  icon = 'warning',
}: ConfirmDialogProps) {
  const getIconColor = () => {
    switch (type) {
      case 'danger': return Colors.neonRed;
      case 'warning': return '#ff9f43';
      case 'info': return Colors.neonBlue;
      default: return Colors.neonRed;
    }
  };

  const getIcon = () => {
    const color = getIconColor();
    const size = 32;
    switch (icon) {
      case 'trash': return <Trash2 size={size} color={color} />;
      case 'logout': return <LogOut size={size} color={color} />;
      case 'info': return <Info size={size} color={color} />;
      default: return <AlertTriangle size={size} color={color} />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger': return styles.confirmButtonDanger;
      case 'warning': return styles.confirmButtonWarning;
      case 'info': return styles.confirmButtonInfo;
      default: return styles.confirmButtonDanger;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <View style={[styles.iconContainer, { borderColor: getIconColor() }]}>
            {getIcon()}
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, getConfirmButtonStyle()]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  dialog: {
    backgroundColor: Colors.backgroundMedium,
    borderRadius: 20,
    padding: Layout.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    borderWidth: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Layout.spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDanger: {
    backgroundColor: Colors.neonRed,
  },
  confirmButtonWarning: {
    backgroundColor: '#ff9f43',
  },
  confirmButtonInfo: {
    backgroundColor: Colors.neonBlue,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
