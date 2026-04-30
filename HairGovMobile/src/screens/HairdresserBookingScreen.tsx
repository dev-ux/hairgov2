import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../config/constants';

type RouteProps = RouteProp<RootStackParamList, 'HairdresserBooking'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

interface Hairstyle {
  id: string;
  name: string;
  category: string;
  estimated_duration: number;
  price?: number;
}

const SERVICE_FEE = 500;
const PRICE_PER_MIN = 200;

export default function HairdresserBookingScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const { hairdresserId, hairdresserName, serviceType: initialServiceType } = route.params;

  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loadingHairstyles, setLoadingHairstyles] = useState(true);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [serviceType, setServiceType] = useState<'home' | 'salon'>(initialServiceType ?? 'salon');
  const [address, setAddress] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date(Date.now() + 3600000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    fetchHairstyles();
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      const raw = await AsyncStorage.getItem('userData');
      if (raw) {
        const u = JSON.parse(raw);
        setClientName(u.full_name || '');
        setClientPhone(u.phone || '');
        setClientId(u.id || null);
      }
    } catch { /* silent */ }
  };

  const fetchHairstyles = async () => {
    try {
      const response = await fetch(`${API_URL}/hairstyles`);
      const result = await response.json();
      if (result.success && result.data) {
        const list = Array.isArray(result.data.hairstyles)
          ? result.data.hairstyles
          : Array.isArray(result.data)
          ? result.data
          : [];
        setHairstyles(list);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les services disponibles');
    } finally {
      setLoadingHairstyles(false);
    }
  };

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setScheduledTime(date);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

  const estimatedPrice = selectedHairstyle
    ? selectedHairstyle.estimated_duration * PRICE_PER_MIN
    : 0;

  const handleSubmit = async () => {
    if (!selectedHairstyle) {
      Alert.alert('Service requis', 'Veuillez sélectionner un service');
      return;
    }
    if (serviceType === 'home' && !address.trim()) {
      Alert.alert('Adresse requise', 'Veuillez entrer votre adresse pour la prestation à domicile');
      return;
    }

    try {
      setSubmitting(true);

      if (!clientName || !clientPhone) {
        Alert.alert('Connexion requise', 'Veuillez vous connecter pour réserver');
        navigation.navigate('Login');
        return;
      }

      const bookingData = {
        hairdresser_id: hairdresserId,
        client_id: clientId,
        client_name: clientName,
        client_phone: clientPhone,
        hairstyle_id: selectedHairstyle.id,
        service_type: serviceType,
        scheduled_time: scheduledTime.toISOString(),
        location_address: serviceType === 'home' ? address : `Salon de ${hairdresserName}`,
        latitude: 5.3486,
        longitude: -4.0082,
        client_price: estimatedPrice,
        service_fee: SERVICE_FEE,
        estimated_duration: selectedHairstyle.estimated_duration,
      };

      const response = await fetch(`${API_URL}/bookings/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccess(true);
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de créer la réservation');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingHairstyles) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement des services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Réserver</Text>
          <Text style={styles.headerSub}>{hairdresserName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Type de service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de prestation</Text>
          <View style={styles.serviceTypeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, serviceType === 'salon' && styles.typeBtnActive]}
              onPress={() => setServiceType('salon')}
            >
              <Ionicons name="business" size={20} color={serviceType === 'salon' ? '#fff' : '#6C63FF'} />
              <Text style={[styles.typeBtnText, serviceType === 'salon' && styles.typeBtnTextActive]}>
                En salon
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, serviceType === 'home' && styles.typeBtnActive]}
              onPress={() => setServiceType('home')}
            >
              <Ionicons name="home" size={20} color={serviceType === 'home' ? '#fff' : '#6C63FF'} />
              <Text style={[styles.typeBtnText, serviceType === 'home' && styles.typeBtnTextActive]}>
                À domicile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Adresse domicile */}
        {serviceType === 'home' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre adresse</Text>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Ex: Cocody, Rue des Jardins, Abidjan"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        )}

        {/* Sélection du service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un service</Text>
          {hairstyles.length === 0 ? (
            <Text style={styles.emptyText}>Aucun service disponible</Text>
          ) : (
            hairstyles.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={[styles.serviceCard, selectedHairstyle?.id === h.id && styles.serviceCardActive]}
                onPress={() => setSelectedHairstyle(h)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, selectedHairstyle?.id === h.id && styles.serviceNameActive]}>
                    {h.name}
                  </Text>
                  <Text style={styles.serviceCategory}>{h.category}</Text>
                  <Text style={styles.serviceDuration}>
                    <Ionicons name="time-outline" size={12} /> {h.estimated_duration} min
                  </Text>
                </View>
                <View style={styles.serviceRight}>
                  <Text style={[styles.servicePrice, selectedHairstyle?.id === h.id && styles.servicePriceActive]}>
                    {(h.estimated_duration * PRICE_PER_MIN).toLocaleString()} FCFA
                  </Text>
                  {selectedHairstyle?.id === h.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#6C63FF" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Date et heure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          <TouchableOpacity style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#6C63FF" />
            <Text style={styles.dateText}>{formatDate(scheduledTime)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Récapitulatif */}
        {selectedHairstyle && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Récapitulatif</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Coiffeur</Text>
              <Text style={styles.summaryValue}>{hairdresserName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>{selectedHairstyle.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type</Text>
              <Text style={styles.summaryValue}>{serviceType === 'home' ? 'À domicile' : 'En salon'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Durée estimée</Text>
              <Text style={styles.summaryValue}>{selectedHairstyle.estimated_duration} min</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <Text style={styles.summaryLabel}>Prix prestation</Text>
              <Text style={styles.summaryValue}>{estimatedPrice.toLocaleString()} FCFA</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de service</Text>
              <Text style={styles.summaryValue}>{SERVICE_FEE.toLocaleString()} FCFA</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryTotal}>
                {(estimatedPrice + SERVICE_FEE).toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!selectedHairstyle || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selectedHairstyle || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Confirmer la réservation</Text>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={scheduledTime}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Modal succès */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Réservation envoyée !</Text>
            <Text style={styles.successText}>
              Votre demande a été envoyée à {hairdresserName}. Vous serez notifié(e) dès qu'il l'accepte.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate('Bookings');
              }}
            >
              <Text style={styles.successBtnText}>Voir mes réservations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  headerSub: { fontSize: 13, color: '#6C63FF', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 14 },
  serviceTypeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#6C63FF',
    backgroundColor: '#fff',
  },
  typeBtnActive: { backgroundColor: '#6C63FF' },
  typeBtnText: { fontSize: 15, fontWeight: '600', color: '#6C63FF' },
  typeBtnTextActive: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#333' },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  serviceCardActive: { borderColor: '#6C63FF', backgroundColor: '#f0eeff' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  serviceNameActive: { color: '#6C63FF' },
  serviceCategory: { fontSize: 13, color: '#888', marginBottom: 4 },
  serviceDuration: { fontSize: 12, color: '#999' },
  serviceRight: { alignItems: 'flex-end', gap: 6 },
  servicePrice: { fontSize: 14, fontWeight: '700', color: '#333' },
  servicePriceActive: { color: '#6C63FF' },
  emptyText: { color: '#999', textAlign: 'center', fontSize: 15 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  dateText: { flex: 1, fontSize: 15, color: '#333' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryRowBorder: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 4 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  summaryLabelTotal: { fontSize: 15, color: '#333', fontWeight: '700' },
  summaryTotal: { fontSize: 17, color: '#6C63FF', fontWeight: '800' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#c5c2f5', shadowOpacity: 0 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 12 },
  successText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
