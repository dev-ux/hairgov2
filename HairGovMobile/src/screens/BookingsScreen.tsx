import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

type Booking = {
  id: string;
  client_name: string;
  client_phone: string;
  hairstyle?: { name: string; description?: string };
  service_type: 'home' | 'salon';
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_time: string;
  location_address: string;
  client_price: number;
  service_fee: number;
  estimated_duration: number;
  created_at: string;
  hairdresser?: { full_name: string; profile_photo?: string };
  salon?: { name: string; address: string };
  has_rating?: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'En attente', bg: '#FFF8E6', text: '#FF9800' },
  accepted:   { label: 'Confirmé',   bg: '#E3F2FD', text: '#2196F3' },
  in_progress:{ label: 'En cours',   bg: '#EDE7F6', text: '#6C63FF' },
  completed:  { label: 'Terminé',    bg: '#E8F5E9', text: '#4CAF50' },
  rejected:   { label: 'Refusé',     bg: '#FFEBEE', text: '#F44336' },
  cancelled:  { label: 'Annulé',     bg: '#FFEBEE', text: '#F44336' },
};

export const BookingsScreen = () => {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{ visible: boolean; bookingId: string | null }>({
    visible: false,
    bookingId: null,
  });
  const [selectedStars, setSelectedStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchBookings = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Vous devez être connecté pour voir vos réservations');
        return;
      }

      const response = await fetch(`${API_URL}/bookings/client`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        setError(response.status === 401 ? 'Session expirée. Veuillez vous reconnecter.' : `Erreur: ${response.status}`);
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setBookings(data.data);
      } else {
        setError(data.message || 'Impossible de charger les réservations');
      }
    } catch {
      setError('Impossible de charger les réservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert('Annuler', 'Voulez-vous vraiment annuler cette réservation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
              fetchBookings();
            } else {
              Alert.alert('Erreur', data.message || 'Impossible d\'annuler');
            }
          } catch {
            Alert.alert('Erreur', 'Une erreur est survenue');
          }
        },
      },
    ]);
  };

  const openRatingModal = (bookingId: string) => {
    setSelectedStars(5);
    setComment('');
    setRatingModal({ visible: true, bookingId });
  };

  const handleSubmitRating = async () => {
    if (!ratingModal.bookingId) return;
    try {
      setSubmittingRating(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/bookings/${ratingModal.bookingId}/rate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: selectedStars, comment }),
      });
      const data = await response.json();
      if (data.success) {
        setRatingModal({ visible: false, bookingId: null });
        Alert.alert('Merci !', 'Votre avis a été enregistré.');
        fetchBookings();
      } else {
        Alert.alert('Erreur', data.message || 'Impossible d\'enregistrer votre avis');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const renderItem = ({ item }: { item: Booking }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const provider = item.hairdresser?.full_name || item.salon?.name || 'Coiffeur';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.providerName}>{provider}</Text>
            <Text style={styles.serviceName}>{item.hairstyle?.name || 'Service'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formatDate(item.scheduled_time)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.service_type === 'home' ? 'À domicile' : 'En salon'} — {item.location_address}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.client_price.toLocaleString()} FCFA
              {item.service_fee > 0 ? ` + ${item.service_fee.toLocaleString()} FCFA frais` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {(item.status === 'pending' || item.status === 'accepted') && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          )}
          {item.status === 'completed' && !item.has_rating && (
            <TouchableOpacity
              style={styles.rateBtn}
              onPress={() => openRatingModal(item.id)}
            >
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.rateBtnText}>Donner un avis</Text>
            </TouchableOpacity>
          )}
          {item.status === 'completed' && item.has_rating && (
            <View style={styles.ratedLabel}>
              <Ionicons name="star" size={14} color="#FF9800" />
              <Text style={styles.ratedLabelText}>Noté</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Mes Réservations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Mes Réservations</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={22} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={56} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchBookings}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.centerContent}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucune réservation</Text>
          <Text style={styles.emptySubtext}>Réservez un coiffeur depuis l'accueil</Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>Explorer les coiffeurs</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rating Modal */}
      <Modal visible={ratingModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Votre avis</Text>
              <TouchableOpacity onPress={() => setRatingModal({ visible: false, bookingId: null })}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingLabel}>Note</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedStars(star)}>
                  <Ionicons
                    name={star <= selectedStars ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= selectedStars ? '#FF9800' : '#ddd'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>Commentaire (optionnel)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Décrivez votre expérience..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitRatingBtn, submittingRating && styles.submitRatingBtnDisabled]}
              onPress={handleSubmitRating}
              disabled={submittingRating}
            >
              {submittingRating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitRatingBtnText}>Envoyer mon avis</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBarTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#666' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  errorText: { fontSize: 15, color: '#ff6b6b', textAlign: 'center' },
  retryBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999' },
  homeBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  homeBtnText: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  serviceName: { fontSize: 14, color: '#666' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardBody: { gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: '#666', flex: 1 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelBtnText: { color: '#F44336', fontSize: 13, fontWeight: '600' },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FF9800',
  },
  rateBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  ratedLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratedLabelText: { fontSize: 13, color: '#FF9800', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  starsRow: { flexDirection: 'row', gap: 8 },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitRatingBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitRatingBtnDisabled: { backgroundColor: '#c5c2f5' },
  submitRatingBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default BookingsScreen;
