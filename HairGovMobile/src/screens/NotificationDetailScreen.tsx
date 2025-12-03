import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Notifications: undefined;
};

type NotificationType = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  content?: string;
  date?: string;
  type?: 'promotion' | 'appointment' | 'system';
};

const NotificationDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  
  // Récupérer les paramètres de navigation
  const { notification } = route.params as { notification: NotificationType };

  // Formater la date pour un affichage plus lisible
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Déterminer l'icône en fonction du type de notification
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'promotion':
        return 'pricetag';
      case 'appointment':
        return 'calendar';
      case 'system':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la notification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.notificationHeader}>
          <View style={[styles.iconContainer, notification.read ? styles.readIcon : styles.unreadIcon]}>
            <Ionicons 
              name={getNotificationIcon()} 
              size={32} 
              color="#fff" 
            />
          </View>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationTime}>{formatDate(notification.date || notification.time)}</Text>
        </View>

        <View style={styles.notificationBody}>
          <Text style={styles.message}>{notification.message}</Text>
          
          {notification.content && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>{notification.content}</Text>
            </View>
          )}

          {notification.type === 'promotion' && (
            <TouchableOpacity style={styles.promotionButton}>
              <Text style={styles.promotionButtonText}>Voir l'offre</Text>
            </TouchableOpacity>
          )}

          {notification.type === 'appointment' && (
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={[styles.actionButton, styles.confirmButton]}>
                <Text style={styles.actionButtonText}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  unreadIcon: {
    backgroundColor: '#6C63FF',
  },
  readIcon: {
    backgroundColor: '#a5a2c4',
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 14,
    color: '#666',
  },
  notificationBody: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
  },
  contentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  promotionButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  promotionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#6C63FF',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default NotificationDetailScreen;
