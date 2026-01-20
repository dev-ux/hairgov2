import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/constants';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RouteParams {
  salon: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface Hairstyle {
  id: string;
  name: string;
  description: string;
  estimated_duration: number;
  category: string;
}

const BookingFormScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { salon } = route.params as RouteParams;
  
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    service_type: 'salon',
    scheduled_time: new Date(Date.now() + 3600000),
    location_address: salon.address,
    latitude: salon.latitude,
    longitude: salon.longitude,
  });

  useEffect(() => {
    fetchHairstyles();
  }, []);

  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/hairstyles`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setHairstyles(result.data);
      }
    } catch (err) {
      console.error('Erreur API hairstyles:', err);
      Alert.alert('Erreur', 'Impossible de charger les services');
    } finally {
      setLoading(false);
    }
  };

  const handleHairstyleSelect = (hairstyle: Hairstyle) => {
    setSelectedHairstyle(hairstyle);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, scheduled_time: selectedDate }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.client_name.trim()) {
      Alert.alert('Nom requis', 'Veuillez entrer votre nom');
      return;
    }
    
    if (!formData.client_phone.trim()) {
      Alert.alert('Téléphone requis', 'Veuillez entrer votre numéro de téléphone');
      return;
    }
    
    if (!selectedHairstyle) {
      Alert.alert('Service requis', 'Veuillez sélectionner un service');
      return;
    }

    try {
      setSubmitting(true);
      
      const bookingData = {
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        hairdresser_id: null, // Sera assigné depuis le salon
        hairstyle_id: selectedHairstyle.id,
        service_type: formData.service_type,
        service_fee: 25,
        client_price: selectedHairstyle.estimated_duration * 0.5, // Prix calculé
        estimated_duration: selectedHairstyle.estimated_duration,
        scheduled_time: formData.scheduled_time.toISOString(),
        location_address: formData.location_address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        salon_id: salon.id, // Ajouté pour récupérer le hairdresser du salon
        client_id: null, // Ajouté pour la validation
      };

      const response = await fetch(`${API_URL}/bookings/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          'Réservation créée',
          'Votre réservation a été créée avec succès',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de créer la réservation');
      }
    } catch (error) {
      console.error('Erreur création réservation:', error);
      Alert.alert('Erreur', 'Impossible de créer la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHairstyleItem = ({ item }: { item: Hairstyle }) => (
    <TouchableOpacity 
      style={[
        styles.hairstyleItem, 
        selectedHairstyle?.id === item.id && styles.selectedHairstyleItem
      ]}
      onPress={() => handleHairstyleSelect(item)}
    >
      <View style={styles.hairstyleInfo}>
        <Text style={styles.hairstyleName}>{item.name}</Text>
        <Text style={styles.hairstyleCategory}>{item.category}</Text>
        <Text style={styles.hairstyleDuration}>{item.estimated_duration} min</Text>
      </View>
      <View style={styles.hairstyleRight}>
        {selectedHairstyle?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
        )}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
          <Text style={styles.headerTitle}>Réserver au salon</Text>
          <View style={styles.placeholder} />
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réserver au salon</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          <Text style={[styles.submitButton, submitting && styles.submitButtonDisabled]}>
            {submitting ? '...' : 'Valider'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Salon Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salon</Text>
          <View style={styles.salonInfoCard}>
            <Text style={styles.salonName}>{salon.name}</Text>
            <Text style={styles.salonAddress}>{salon.address}</Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos informations</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={formData.client_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, client_name: text }))}
              placeholder="Entrez votre nom"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.client_phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, client_phone: text }))}
              placeholder="Entrez votre numéro"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un service</Text>
          {hairstyles.map((hairstyle) => (
            <TouchableOpacity 
              key={hairstyle.id}
              style={[
                styles.hairstyleItem, 
                selectedHairstyle?.id === hairstyle.id && styles.selectedHairstyleItem
              ]}
              onPress={() => handleHairstyleSelect(hairstyle)}
            >
              <View style={styles.hairstyleInfo}>
                <Text style={styles.hairstyleName}>{hairstyle.name}</Text>
                <Text style={styles.hairstyleCategory}>{hairstyle.category}</Text>
                <Text style={styles.hairstyleDuration}>{hairstyle.estimated_duration} min</Text>
              </View>
              <View style={styles.hairstyleRight}>
                {selectedHairstyle?.id === hairstyle.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
                )}
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.scheduled_time.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {selectedHairstyle && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Salon:</Text>
              <Text style={styles.summaryValue}>{salon.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{selectedHairstyle.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Durée:</Text>
              <Text style={styles.summaryValue}>{selectedHairstyle.estimated_duration} minutes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Prix estimé:</Text>
              <Text style={styles.summaryPrice}>
                {(selectedHairstyle.estimated_duration * 0.5).toFixed(2)}€
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.scheduled_time}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
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
  placeholder: {
    width: 50,
  },
  submitButton: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    color: '#ccc',
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  salonInfoCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  salonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 14,
    color: '#666',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  hairstyleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedHairstyleItem: {
    backgroundColor: '#f0f5ff',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  hairstyleInfo: {
    flex: 1,
  },
  hairstyleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hairstyleCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  hairstyleDuration: {
    fontSize: 12,
    color: '#999',
  },
  hairstyleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  summarySection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});

export default BookingFormScreen;
