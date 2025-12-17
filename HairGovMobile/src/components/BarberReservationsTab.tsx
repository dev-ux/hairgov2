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

const { width } = Dimensions.get('window');

interface Reservation {
  id: string;
  client_name: string;
  client_phone: string;
  client_avatar?: string;
  service_type: 'home' | 'salon';
  service_fee: number;
  client_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location_address: string;
  estimated_duration: number;
  scheduled_time: string;
  created_at: string;
  hairstyle?: {
    name: string;
    description?: string;
    category?: string;
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BarberHome'>;

export default function BarberReservationsTab() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      // const response = await api.get('/bookings/hairdresser/history');
      
      // Données mockées pour l'instant
      const mockReservations: Reservation[] = [
        {
          id: '1',
          client_name: 'Marie Dupont',
          client_phone: '+33612345678',
          client_avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          service_type: 'home',
          service_fee: 25,
          client_price: 45,
          status: 'pending',
          location_address: '15 Rue de la Paix, Paris',
          estimated_duration: 30,
          scheduled_time: '2025-12-17T14:00:00Z',
          created_at: '2025-12-16T10:00:00Z',
          hairstyle: {
            name: 'Coupe femme',
            description: 'Coupe et brushing',
            category: 'Femme',
          },
        },
        {
          id: '2',
          client_name: 'Jean Martin',
          client_phone: '+33623456789',
          client_avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          service_type: 'salon',
          service_fee: 0,
          client_price: 30,
          status: 'confirmed',
          location_address: '123 Avenue des Champs-Élysées, Paris',
          estimated_duration: 45,
          scheduled_time: '2025-12-17T16:00:00Z',
          created_at: '2025-12-15T15:00:00Z',
          hairstyle: {
            name: 'Coupe homme',
            description: 'Coupe simple',
            category: 'Homme',
          },
        },
        {
          id: '3',
          client_name: 'Sophie Bernard',
          client_phone: '+33634567890',
          client_avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          service_type: 'home',
          service_fee: 25,
          client_price: 55,
          status: 'completed',
          location_address: '8 Boulevard Saint-Germain, Paris',
          estimated_duration: 60,
          scheduled_time: '2025-12-16T10:00:00Z',
          created_at: '2025-12-14T09:00:00Z',
          hairstyle: {
            name: 'Coloration',
            description: 'Coloration complète',
            category: 'Coloration',
          },
        },
      ];
      
      setReservations(mockReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Erreur', 'Impossible de charger les réservations');
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

  const filteredReservations = reservations.filter(reservation => {
    if (selectedFilter === 'all') return true;
    return reservation.status === selectedFilter;
  });

  const filters = [
    { key: 'all' as const, label: 'Toutes' },
    { key: 'pending' as const, label: 'En attente' },
    { key: 'confirmed' as const, label: 'Confirmées' },
    { key: 'completed' as const, label: 'Terminées' },
    { key: 'cancelled' as const, label: 'Annulées' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Réservations</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel-outline" size={20} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des réservations */}
      <ScrollView
        style={styles.reservationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? "Vous n'avez aucune réservation pour le moment"
                : `Aucune réservation ${getStatusText(selectedFilter)}`
              }
            </Text>
          </View>
        ) : (
          filteredReservations.map((reservation) => (
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
