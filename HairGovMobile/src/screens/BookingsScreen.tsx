import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

type FilterKey = 'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  pending:     { label: 'En attente',  bg: '#FFF8E6', text: '#FF9800', icon: 'time-outline' },
  accepted:    { label: 'Confirmé',    bg: '#E3F2FD', text: '#2196F3', icon: 'checkmark-circle-outline' },
  in_progress: { label: 'En cours',    bg: '#EDE7F6', text: '#6C63FF', icon: 'cut-outline' },
  completed:   { label: 'Terminé',     bg: '#E8F5E9', text: '#4CAF50', icon: 'checkmark-done-outline' },
  rejected:    { label: 'Refusé',      bg: '#FFEBEE', text: '#F44336', icon: 'close-circle-outline' },
  cancelled:   { label: 'Annulé',      bg: '#FFEBEE', text: '#F44336', icon: 'ban-outline' },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',         label: 'Tout' },
  { key: 'pending',     label: 'En attente' },
  { key: 'accepted',    label: 'Confirmé' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed',   label: 'Terminé' },
  { key: 'cancelled',   label: 'Annulé' },
];

export const BookingsScreen = () => {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

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
        setError(`Erreur: ${response.status}`);
        return;
      }
      const data = await response.json();
      if (data.success) {
        const bookingsData = data.data?.bookings ?? data.data ?? [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
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

  useFocusEffect(useCallback(() => { fetchBookings(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

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

  const filtered = activeFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeFilter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const provider = item.hairdresser?.full_name || item.salon?.name || 'Coiffeur';

    return (
      <View style={styles.card}>
        {/* Status stripe */}
        <View style={[styles.cardStripe, { backgroundColor: cfg.text }]} />

        <View style={styles.cardInner}>
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <Text style={styles.providerName}>{provider}</Text>
              <Text style={styles.serviceName}>{item.hairstyle?.name || 'Service coiffure'}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon as any} size={12} color={cfg.text} />
              <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={15} color="#6C63FF" />
              <Text style={styles.infoText}>{formatDate(item.scheduled_time)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name={item.service_type === 'home' ? 'home-outline' : 'storefront-outline'} size={15} color="#6C63FF" />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.service_type === 'home' ? 'À domicile' : 'En salon'} — {item.location_address}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={15} color="#6C63FF" />
              <Text style={styles.infoText}>
                {item.client_price.toLocaleString()} FCFA
                {item.service_fee > 0 ? ` + ${item.service_fee.toLocaleString()} FCFA frais` : ''}
              </Text>
            </View>
          </View>

          {(item.status === 'pending' || item.status === 'completed') && (
            <View style={styles.cardActions}>
              {item.status === 'pending' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelBooking(item.id)}>
                  <Ionicons name="close-outline" size={14} color="#F44336" />
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
              )}
              {item.status === 'completed' && !item.has_rating && (
                <TouchableOpacity style={styles.rateBtn} onPress={() => openRatingModal(item.id)}>
                  <Ionicons name="star" size={14} color="#fff" />
                  <Text style={styles.rateBtnText}>Donner un avis</Text>
                </TouchableOpacity>
              )}
              {item.status === 'completed' && item.has_rating && (
                <View style={styles.ratedPill}>
                  <Ionicons name="star" size={12} color="#FF9800" />
                  <Text style={styles.ratedText}>Avis déposé</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.headerGradient}>
          <Text style={styles.headerTitle}>Mes Réservations</Text>
        </LinearGradient>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Réservations</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Terminées</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterTabText, activeFilter === f.key && styles.filterTabTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={56} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchBookings}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />}
        />
      ) : (
        <View style={styles.centerContent}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-outline" size={48} color="#6C63FF" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'all' ? 'Aucune réservation' : `Aucune réservation ${STATUS_CONFIG[activeFilter]?.label?.toLowerCase() || ''}`}
          </Text>
          <Text style={styles.emptySubtext}>Prenez rendez-vous dès maintenant</Text>
          <TouchableOpacity
            style={styles.newBookingBtn}
            onPress={() => navigation.navigate('CreateBooking')}
          >
            <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.newBookingGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.newBookingText}>Nouvelle réservation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateBooking')}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Rating Modal */}
      <Modal visible={ratingModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
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
                    size={40}
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
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submittingRating && styles.submitBtnDisabled]}
              onPress={handleSubmitRating}
              disabled={submittingRating}
            >
              <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.submitBtnGrad}>
                {submittingRating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Envoyer mon avis</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },

  headerGradient: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  filterRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: { backgroundColor: '#EEF0FF' },
  filterTabText: { fontSize: 13, fontWeight: '500', color: '#888' },
  filterTabTextActive: { color: '#6C63FF', fontWeight: '700' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: '#666' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  errorText: { fontSize: 15, color: '#ff6b6b', textAlign: 'center' },
  retryBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#999' },
  newBookingBtn: { borderRadius: 24, overflow: 'hidden', marginTop: 4 },
  newBookingGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  newBookingText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  list: { padding: 16, gap: 12, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  cardStripe: { width: 4 },
  cardInner: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTopLeft: { flex: 1 },
  providerName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  serviceName: { fontSize: 13, color: '#888', marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginBottom: 10 },
  infoGrid: { gap: 6 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 12.5, color: '#555', flex: 1 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF5F5',
  },
  cancelBtnText: { color: '#F44336', fontSize: 12.5, fontWeight: '600' },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FF9800',
  },
  rateBtnText: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  ratedPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratedText: { fontSize: 12, color: '#FF9800', fontWeight: '600' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGrad: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  starsRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  commentInput: {
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#fafafa',
  },
  submitBtn: { borderRadius: 14, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default BookingsScreen;
