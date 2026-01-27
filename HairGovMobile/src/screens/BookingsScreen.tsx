import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

type Booking = {  
  id: string;
  client_name: string;
  client_phone: string;
  hairstyle?: {
    name: string;
    description?: string;
  };
  service_type: 'home' | 'salon';
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_time: string;
  location_address: string;
  client_price: number;
  service_fee: number;
  estimated_duration: number;
  created_at: string;
  hairdresser?: {
    full_name: string;
    profile_photo?: string;
  };
  salon?: {
    name: string;
    address: string;
  };
};

export const BookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        setError('Vous devez être connecté pour voir vos réservations');
        return;
      }

      console.log('Récupération des réservations client...');
      const response = await fetch(`${API_URL}/bookings/client`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError(`Erreur: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      console.log('Données reçues:', data);

      if (data.success && data.data) {
        setBookings(data.data);
        console.log(`Nombre de réservations: ${data.data.length}`);
      } else {
        setError(data.message || 'Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      setError('Impossible de charger les réservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'rejected':
      case 'cancelled':
        return styles.statusCancelled;
      case 'in_progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
      case 'confirmed':
        return 'Confirmé';
      case 'rejected':
        return 'Refusé';
      case 'cancelled':
        return 'Annulé';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Rafraîchir la liste
        fetchBookings();
      } else {
        setError(data.message || 'Impossible d\'annuler la réservation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      setError('Erreur lors de l\'annulation');
    }
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.salonInfo}>
          <Text style={styles.salonName}>
            {item.salon?.name || item.hairdresser?.full_name || 'Service de coiffure'}
          </Text>
          <Text style={styles.serviceName}>
            {item.hairstyle?.name || 'Service'}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.detailText}>{formatDate(item.scheduled_time)}</Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <Ionicons name="location-outline" size={20} color="#666" />
        <Text style={styles.detailText}>
          {item.service_type === 'home' ? 'À domicile' : 'En salon'} - {item.location_address}
        </Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <Ionicons name="cash-outline" size={20} color="#666" />
        <Text style={styles.detailText}>
          {item.client_price} FCFA {item.service_fee > 0 && `+ ${item.service_fee} FCFA (frais)`}
        </Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <Ionicons name="time-outline" size={20} color="#666" />
        <Text style={styles.detailText}>{item.estimated_duration} minutes</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Booking' as any, { 
            reservation: {
              id: item.id,
              clientName: item.client_name,
              clientAvatar: null,
              description: item.hairstyle?.description || 'Service de coiffure',
              price: `${item.client_price}€`,
              locationPreference: item.service_type === 'home' ? 'domicile' : 'salon',
              date: formatDate(item.scheduled_time),
              time: new Date(item.scheduled_time).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              status: item.status,
              phoneNumber: item.client_phone
            }
          })}
        >
          <Text style={styles.actionButtonText}>Voir les détails</Text>
        </TouchableOpacity>
        
        {(item.status === 'pending' || item.status === 'accepted') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Réservations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement de vos réservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Réservations</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Aucune réservation</Text>
          <Text style={styles.emptySubtext}>Vous n'avez aucune réservation pour le moment</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
      paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContent: {
    paddingBottom: 80,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  salonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusConfirmed: {
    backgroundColor: '#e6f7e6',
  },
  statusPending: {
    backgroundColor: '#fff8e6',
  },
  statusInProgress: {
    backgroundColor: '#e3f2fd',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
  },
  statusCancelled: {
    backgroundColor: '#ffe6e6',
  },
  salonInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  newBookingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newBookingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BookingsScreen;
