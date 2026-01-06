import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Text,
  ScrollView,
  Pressable,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Mail, X, MessageCircle, Heart, UserPlus, AtSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface InboxButtonProps {
  notificationCount?: number;
  messageCount?: number;
}

// Datos de ejemplo
const mockNotifications: Notification[] = [
  { id: '1', type: 'like', title: 'Nuevo like', body: '@neon_hacker le gustó tu publicación', isRead: false, createdAt: '2m' },
  { id: '2', type: 'follow', title: 'Nuevo seguidor', body: '@binary_queen comenzó a seguirte', isRead: false, createdAt: '15m' },
  { id: '3', type: 'comment', title: 'Nuevo comentario', body: '@void_runner comentó en tu post', isRead: true, createdAt: '1h' },
  { id: '4', type: 'mention', title: 'Te mencionaron', body: '@synth_lord te mencionó en un post', isRead: true, createdAt: '3h' },
];

export default function InboxButton({ 
  notificationCount = 3, 
  messageCount = 2 
}: InboxButtonProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  
  const totalCount = notificationCount + messageCount;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} color={Colors.neonRed} fill={Colors.neonRed} />;
      case 'comment': return <MessageCircle size={16} color={Colors.neonBlue} />;
      case 'follow': return <UserPlus size={16} color={Colors.neonGreen} />;
      case 'mention': return <AtSign size={16} color={Colors.neonPurple} />;
      default: return <Bell size={16} color={Colors.textSecondary} />;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    setModalVisible(false);
    // Navegar según el tipo de notificación
    if (notification.type === 'follow') {
      router.push('/discover');
    } else {
      router.push('/');
    }
  };

  const handleMessagesPress = () => {
    setModalVisible(false);
    router.push('/messages');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Bell size={24} color={Colors.text} />
        {totalCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {totalCount > 9 ? '9+' : totalCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bandeja de entrada</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
                onPress={() => setActiveTab('notifications')}
              >
                <Bell size={18} color={activeTab === 'notifications' ? Colors.neonBlue : Colors.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
                  Notificaciones
                </Text>
                {notificationCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{notificationCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
                onPress={() => setActiveTab('messages')}
              >
                <Mail size={18} color={activeTab === 'messages' ? Colors.neonBlue : Colors.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
                  Mensajes
                </Text>
                {messageCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{messageCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'notifications' ? (
                mockNotifications.length > 0 ? (
                  mockNotifications.map((notification) => (
                    <Pressable
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.isRead && styles.notificationUnread
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <View style={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationBody}>{notification.body}</Text>
                        <Text style={styles.notificationTime}>{notification.createdAt}</Text>
                      </View>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Bell size={48} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>Sin notificaciones</Text>
                  </View>
                )
              ) : (
                <View style={styles.emptyState}>
                  <Mail size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Sin mensajes</Text>
                  <TouchableOpacity style={styles.newMessageButton} onPress={handleMessagesPress}>
                    <Text style={styles.newMessageText}>Iniciar conversación</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neonRed,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundMedium,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
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
    borderBottomColor: Colors.neonBlue,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.neonBlue,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationUnread: {
    backgroundColor: 'rgba(0, 255, 255, 0.03)',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neonBlue,
    marginLeft: Layout.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: Layout.spacing.md,
  },
  newMessageButton: {
    marginTop: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    backgroundColor: Colors.neonPurple,
    borderRadius: Layout.borderRadius.md,
  },
  newMessageText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
