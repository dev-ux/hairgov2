import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { acceptBooking, startBooking, completeBooking } from '../services/hairdresser.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

interface ReservationDetail {
  id: string;
  clientName: string;
  clientAvatar?: string;
  hairstyleName?: string;
  description: string;
  price: string;
  locationPreference: 'domicile' | 'salon';
  clientCoordinates?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  phoneNumber?: string;
  status?: string;
  date?: string;
  time?: string;
}

interface Props {
  route: {
    params: {
      reservation: ReservationDetail;
    };
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#FF9800' },
  accepted: { label: 'Acceptée', color: '#2196F3' },
  in_progress: { label: 'En cours', color: '#6C63FF' },
  completed: { label: 'Terminée', color: '#4CAF50' },
  cancelled: { label: 'Annulée', color: '#F44336' },
  rejected: { label: 'Refusée', color: '#F44336' },
};

export default function ReservationDetailScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { reservation: initialReservation } = route.params;
  const [reservation, setReservation] = useState(initialReservation);
  const [loading, setLoading] = useState(false);

  const statusConfig = STATUS_CONFIG[reservation.status || 'pending'];

  const handleCall = () => {
    if (reservation.phoneNumber) {
      Linking.openURL(`tel:${reservation.phoneNumber}`);
    }
  };

  const handleAcceptBooking = async () => {
    Alert.alert(
      'Accepter la réservation',
      'Confirmez-vous l\'acceptation de cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await acceptBooking(reservation.id);
              if (response.success) {
                setReservation(prev => ({ ...prev, status: 'accepted' }));
                Alert.alert('Réservation acceptée', 'Le client a été notifié.');
              }
            } catch (error: any) {
              Alert.alert('Erreur', error?.message || 'Impossible d\'accepter la réservation');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleStartBooking = async () => {
    Alert.alert(
      'Démarrer la prestation',
      'Confirmez-vous le début de la prestation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await startBooking(reservation.id);
              if (response.success) {
                setReservation(prev => ({ ...prev, status: 'in_progress' }));
                Alert.alert('Prestation démarrée', 'La prestation est maintenant en cours.');
              }
            } catch (error: any) {
              Alert.alert('Erreur', error?.message || 'Impossible de démarrer la prestation');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteBooking = async () => {
    Alert.alert(
      'Terminer la prestation',
      'Confirmez-vous la fin de la prestation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await completeBooking(reservation.id);
              if (response.success) {
                setReservation(prev => ({ ...prev, status: 'completed' }));
                Alert.alert(
                  'Prestation terminée !',
                  'Bravo ! Le client sera invité à vous noter.',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error: any) {
              Alert.alert('Erreur', error?.message || 'Impossible de terminer la prestation');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelReservation = async () => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_URL}/bookings/${reservation.id}/cancel`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              const result = await response.json();
              if (result.success) {
                Alert.alert('Annulée', 'La réservation a été annulée.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Erreur', result.message || 'Impossible d\'annuler');
              }
            } catch {
              Alert.alert('Erreur', 'Une erreur est survenue');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail réservation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Statut */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.color + '18' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Client */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client</Text>
          <View style={styles.clientRow}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color="#6C63FF" />
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{reservation.clientName}</Text>
              {reservation.phoneNumber && (
                <TouchableOpacity style={styles.phoneRow} onPress={handleCall}>
                  <Ionicons name="call-outline" size={16} color="#6C63FF" />
                  <Text style={styles.phoneText}>{reservation.phoneNumber}</Text>
                </TouchableOpacity>
              )}
            </View>
            {reservation.phoneNumber && (
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Prestation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prestation</Text>
          <View style={styles.detailRow}>
            <Ionicons name="cut-outline" size={18} color="#6C63FF" />
            <Text style={styles.detailText}>
              {reservation.hairstyleName || reservation.description}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={18} color="#6C63FF" />
            <Text style={styles.detailText}>{reservation.price}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name={reservation.locationPreference === 'domicile' ? 'home-outline' : 'business-outline'}
              size={18}
              color="#6C63FF"
            />
            <Text style={styles.detailText}>
              {reservation.locationPreference === 'domicile' ? 'À domicile' : 'En salon'}
            </Text>
          </View>
          {reservation.clientCoordinates?.address && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#6C63FF" />
              <Text style={styles.detailText}>{reservation.clientCoordinates.address}</Text>
            </View>
          )}
          {reservation.date && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color="#6C63FF" />
              <Text style={styles.detailText}>
                {reservation.date}{reservation.time ? ` à ${reservation.time}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Actions selon statut */}
        <View style={styles.actionsCard}>
          {reservation.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={handleAcceptBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.actionBtnText}>Accepter la réservation</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {reservation.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={handleStartBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="play-circle" size={22} color="#fff" />
                  <Text style={styles.actionBtnText}>Démarrer la prestation</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {reservation.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={handleCompleteBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.actionBtnText}>Terminer la prestation</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {(reservation.status === 'pending' || reservation.status === 'accepted') && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={handleCancelReservation}
              disabled={loading}
            >
              <Ionicons name="close-circle-outline" size={22} color="#F44336" />
              <Text style={[styles.actionBtnText, styles.cancelBtnText]}>
                Annuler la réservation
              </Text>
            </TouchableOpacity>
          )}

          {(reservation.status === 'completed' || reservation.status === 'cancelled' || reservation.status === 'rejected') && (
            <View style={styles.finalState}>
              <Ionicons
                name={reservation.status === 'completed' ? 'checkmark-circle' : 'close-circle'}
                size={40}
                color={reservation.status === 'completed' ? '#4CAF50' : '#F44336'}
              />
              <Text style={styles.finalStateText}>
                {reservation.status === 'completed'
                  ? 'Prestation terminée'
                  : 'Réservation clôturée'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  headerSpacer: { width: 32 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0eeff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneText: { fontSize: 14, color: '#6C63FF' },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  detailText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  acceptBtn: { backgroundColor: '#6C63FF' },
  startBtn: { backgroundColor: '#2196F3' },
  completeBtn: { backgroundColor: '#4CAF50' },
  cancelBtn: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F44336' },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtnText: { color: '#F44336' },
  finalState: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  finalStateText: { fontSize: 16, fontWeight: '600', color: '#666' },
});
