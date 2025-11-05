import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Booking = {  
  id: string;
  date: string;
  time: string;
  service: string;
  status: 'confirmé' | 'en attente' | 'annulé';
  salon: string;
};

export const BookingsScreen = () => {
  const navigation = useNavigation();
  // Données factices pour l'exemple
  const bookings: Booking[] = [
    { 
      id: '1', 
      date: '10 Nov 2023', 
      time: '14:30', 
      service: 'Coupe homme', 
      status: 'confirmé',
      salon: 'Salon Élégance' 
    },
    { 
      id: '2', 
      date: '15 Nov 2023', 
      time: '11:00', 
      service: 'Coloration', 
      status: 'en attente',
      salon: 'Beauté Naturelle' 
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmé':
        return styles.statusConfirmed;
      case 'en attente':
        return styles.statusPending;
      case 'annulé':
        return styles.statusCancelled;
      default:
        return {};
    }
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.salonName}>{item.salon}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.detailText}>{item.date} à {item.time}</Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <Ionicons name="cut-outline" size={20} color="#666" />
        <Text style={styles.detailText}>{item.service}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Voir les détails</Text>
        </TouchableOpacity>
        {item.status === 'en attente' && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête personnalisé avec bouton de retour */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Réservations</Text>
      </View>
      
      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Aucune réservation à venir</Text>
          <Text style={styles.emptySubtext}>Prenez rendez-vous dès maintenant !</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.newBookingButton}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.newBookingButtonText}>Nouvelle réservation</Text>
      </TouchableOpacity>
    </View>
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
  statusCancelled: {
    backgroundColor: '#ffe6e6',
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
