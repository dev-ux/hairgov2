import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { getHairdresserBookings, Reservation } from '../services/hairdresser.service';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BarberHome'>;

export default function BarberReservationsTab() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await getHairdresserBookings();
      
      if (response.success && response.data) {
        setReservations(response.data.bookings || []);
      } else {
        console.error('Error in response:', response.message);
        setReservations([]);
        Alert.alert('Erreur', response.message || 'Impossible de charger les réservations');
      }
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Impossible de charger les réservations';
      setReservations([]);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'in_progress':
        return '#6C63FF';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReservationPress = (reservation: Reservation) => {
    const reservationDetail = {
      id: reservation.id,
      clientName: reservation.client_name,
      clientAvatar: reservation.client_avatar,
      description: reservation.hairstyle?.description || 'Service de coiffure',
      price: `${reservation.client_price}€`,
      locationPreference: reservation.service_type === 'home' ? 'domicile' as const : 'salon' as const,
      clientCoordinates: {
        latitude: 48.8566,
        longitude: 2.3522,
        address: reservation.location_address,
      },
      phoneNumber: reservation.client_phone,
    };
    navigation.navigate('ReservationDetail', { reservation: reservationDetail });
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de vos réservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Réservations</Text>
      </View>


      {/* Liste des réservations */}
      <ScrollView
        style={styles.reservationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!reservations || reservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptyText}>
              Vous n'avez aucune réservation pour le moment.
            </Text>
            <Text style={styles.emptySubText}>
              Les nouvelles réservations apparaîtront ici dès que les clients prendront rendez-vous avec vous.
            </Text>
          </View>
        ) : (
          (reservations || []).map((reservation) => (
            <TouchableOpacity
              key={reservation.id}
              style={styles.reservationCard}
              onPress={() => handleReservationPress(reservation)}
            >
              <View style={styles.reservationHeader}>
                <View style={styles.clientInfo}>
                  {reservation.client_avatar && (
                    <Image source={{ uri: reservation.client_avatar }} style={styles.clientAvatar} />
                  )}
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>{reservation.client_name}</Text>
                    <Text style={styles.clientPhone}>{reservation.client_phone}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
                </View>
              </View>

              <View style={styles.reservationBody}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{reservation.hairstyle?.name || 'Service'}</Text>
                  <Text style={styles.serviceType}>
                    {reservation.service_type === 'home' ? 'À domicile' : 'En salon'}
                  </Text>
                </View>
                
                <View style={styles.reservationDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{formatDate(reservation.scheduled_time)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {reservation.location_address}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{reservation.client_price}€</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  reservationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reservationBody: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  serviceInfo: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#6C63FF',
  },
  reservationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
});
