import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_URL } from '../config/constants';

type RootStackParamList = {
  Home: undefined;
  NotificationDetail: { notification: any };
  // Ajoutez d'autres écrans si nécessaire
};

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const NotificationsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les notifications depuis l'API
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/notifications`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError('Erreur lors de la récupération des notifications');
      }
    } catch (err) {
      console.error('Erreur API notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  // Séparer les notifications lues et non lues
  const unreadNotifications = notifications.filter(notif => !notif.read);
  const readNotifications = notifications.filter(notif => notif.read);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Marquer comme lu dans la base de données
      if (!notification.read) {
        const response = await fetch(`${API_URL}/notifications/${notification.id}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Marquer comme lu localement si l'API a réussi
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
          );
        }
      }
      
      // Naviguer vers les détails
      navigation.navigate('NotificationDetail', { notification });
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      // Même en cas d'erreur, on navigue vers les détails
      navigation.navigate('NotificationDetail', { notification });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Marquer toutes comme lu dans la base de données
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Marquer toutes comme lu localement
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
      // En cas d'erreur, on fait quand même la mise à jour locale
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons 
          name="notifications" 
          size={24} 
          color={!item.read ? "#6C63FF" : "#999"} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !item.read && styles.boldText]}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );

  const renderNotificationList = () => {
    const data = [];
    
    if (unreadNotifications.length > 0) {
      data.push(
        { key: 'unread-header', type: 'header', title: 'Non lues', count: unreadNotifications.length },
        ...unreadNotifications.map(notif => ({ key: notif.id, type: 'notification', data: notif }))
      );
    }
    
    if (readNotifications.length > 0) {
      data.push(
        { key: 'read-header', type: 'header', title: 'Lues', count: readNotifications.length },
        ...readNotifications.map(notif => ({ key: notif.id, type: 'notification', data: notif }))
      );
    }
    
    return data;
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return renderSectionHeader(item.title, item.count);
    }
    return renderNotificationItem({ item: item.data });
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadNotifications.length > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement des notifications...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={renderNotificationList()}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.notificationList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune notification</Text>
            </View>
          }
        />
      )}
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
    backgroundColor: '#fff',
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
    marginLeft: -24, // Pour compenser le bouton de retour
  },
  markAllButton: {
    padding: 5,
  },
  markAllText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  notificationList: {
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionCount: {
    fontSize: 12,
    color: '#6C63FF',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#f8f5ff',
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
  },
  notificationIcon: {
    marginRight: 15,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  boldText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
