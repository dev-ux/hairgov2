import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/constants';

interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  hairdresser: {
    id: string;
    full_name: string;
    profile_photo?: string;
  } | null;
  hairstyle: {
    id: string;
    name: string;
    description: string;
    estimated_duration: number;
    category: string;
  } | null;
  service_type: string;
  service_fee: number;
  client_price: number;
  status: string;
  location_address: string;
  latitude: number;
  longitude: number;
  estimated_duration: number;
  scheduled_time: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

const BookingScreen = ({ navigation }: any) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Log pour déboguer l'état des bookings
  console.log('État actuel des bookings:', bookings.length, 'réservations');

  // Récupérer les réservations depuis l'API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Tentative de connexion à:', `${API_URL}/bookings`);
      
      const response = await fetch(`${API_URL}/bookings`);
      const result = await response.json();
      
      console.log('Réponse API bookings:', result);
      console.log('Nombre de réservations reçues:', result.data?.length || 0);
      
      if (result.success && result.data) {
        setBookings(result.data);
        console.log('Réservations mises à jour:', result.data.length);
      } else {
        setError('Erreur lors de la récupération des réservations');
      }
    } catch (err) {
      console.error('Erreur API bookings:', err);
      setError('Impossible de charger les réservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'started': return '#2196F3';
      case 'completed': return '#9C27B0';
      case 'cancelled': return '#757575';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'started': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.salonName}>Salon Élégance</Text>
          <Text style={styles.bookingTime}>{formatDate(item.scheduled_time)}</Text>
          <Text style={styles.serviceName}>{item.hairstyle?.name || 'Service non spécifié'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <TouchableOpacity style={styles.detailButton}>
          <Text style={styles.detailButtonText}>Voir les détails</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Réservations</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateBooking')}>
            <Ionicons name="add" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement des réservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Réservations</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateBooking')}>
          <Ionicons name="add" size={24} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune réservation</Text>
              <TouchableOpacity style={styles.emptyCreateButton} onPress={() => navigation.navigate('CreateBooking')}>
                <Text style={styles.emptyCreateButtonText}>Créer une réservation</Text>
              </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    padding: 10,
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  emptyCreateButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingScreen;
