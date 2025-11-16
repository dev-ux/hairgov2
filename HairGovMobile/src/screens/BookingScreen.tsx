import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  FlatList,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../config/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BookingService, type BookingData } from '../services/booking.service';

interface RouteParams {
  hairdresserId: string;
  hairdresserName: string;
  clientName?: string;
  clientPhone?: string;
}

interface Hairdresser {
  id: string;
  name: string;
  address?: string;
  profession?: string;
  salon_name?: string;
  price: number;
  latitude: number;
  longitude: number;
  rating?: number;
  distance?: string;
}

const BookingScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  type RootStackParamList = {
  Home: undefined;
  Barber: undefined;
  Booking: undefined;
  Map: undefined;
  BarberProfile: { hairdresserId: string };
  BarberList: {
    hairdressers: any[];
    serviceType: string;
    selectedDate: string;
    selectedTime: string;
  };
};

  const { hairdresserId, hairdresserName, clientName, clientPhone } = route.params as RouteParams;

  // États pour le formulaire
  const [formData, setFormData] = useState({
    client_name: clientName || 'John Doe',
    client_phone: clientPhone || '+33612345678',
    hairdresser_id: hairdresserId,
    hairstyle_id: '1',
    service_type: 'salon' as string,
    service_fee: 25,
    client_price: 30,
    estimated_duration: 60,
    scheduled_time: new Date(Date.now() + 3600000),
    location_address: '',
    latitude: 0,
    longitude: 0,
  });

  // État pour la carte
  const [mapRegion, setMapRegion] = useState({
    latitude: 48.8566, // Paris par défaut
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  // État pour les coiffeurs à proximité
  const [nearbyHairdressers, setNearbyHairdressers] = useState<Hairdresser[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedHairdresser, setSelectedHairdresser] = useState<Hairdresser | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Charger les coiffeurs à proximité
  const loadNearbyHairdressers = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      const response = await BookingService.getNearbyHairdressers(latitude, longitude, 1);
      
      // Vérifier la structure de la réponse et extraire les coiffeurs
      const hairdressers = response?.data?.hairdressers || [];
      console.log('Coiffeurs chargés:', hairdressers);
      
      if (!Array.isArray(hairdressers)) {
        console.warn('Format de réponse inattendu pour les coiffeurs:', response);
        setNearbyHairdressers([]);
        return;
      }

      // Ajouter des données manquantes si nécessaire
      const processedHairdressers = hairdressers.map((h: any) => ({
        ...h,
        id: h.id || Math.random().toString(36).substr(2, 9), // ID unique si non fourni
        longitude: h.longitude || longitude + (Math.random() * 0.01 - 0.005),
        latitude: h.latitude || latitude + (Math.random() * 0.01 - 0.005),
        profession: h.profession || 'Coiffeur professionnel',
        address: h.address || 'Adresse non disponible',
        salon_name: h.salon_name || 'Salon sans nom',
        price: h.price || 30,
        rating: h.rating || 0,
        distance: h.distance ? `${h.distance} km` : '0.5 km',
        name: h.name || 'Coiffeur non nommé'
      } as Hairdresser));
      
      setNearbyHairdressers(processedHairdressers);
      
      if (processedHairdressers.length === 0) {
        console.log('Aucun coiffeur trouvé à proximité');
        Alert.alert('Information', 'Aucun coiffeur disponible dans votre secteur pour le moment.');
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des coiffeurs:', error);
      Alert.alert('Erreur', 'Impossible de charger les coiffeurs à proximité');
      setNearbyHairdressers([]); // S'assurer que la liste est vide en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Charger la liste des salons
  const loadSalons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/hairdressers`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des salons');
      }
      
      const result = await response.json();
      console.log('Réponse des salons:', result);
      
      // Vérifier si la réponse contient des données et est un tableau
      const salons = Array.isArray(result?.data?.hairdressers) 
        ? result.data.hairdressers 
        : [];
      
      // Ajouter des valeurs par défaut si nécessaire
      const processedSalons = salons.map((salon: any) => ({
        ...salon,
        id: salon.id || Math.random().toString(36).substr(2, 9),
        name: salon.name || 'Salon sans nom',
        address: salon.address || 'Adresse non disponible',
        price: salon.price || 30,
        rating: salon.rating || 0,
        salon_name: salon.salon_name || 'Salon sans nom',
        profession: salon.profession || 'Coiffeur professionnel',
        latitude: salon.latitude || 0,
        longitude: salon.longitude || 0,
        distance: salon.distance || '0.5 km'
      }));
      
      setNearbyHairdressers(processedSalons);
      
      if (processedSalons.length === 0) {
        console.log('Aucun salon trouvé');
        Alert.alert('Information', 'Aucun salon disponible pour le moment.');
      } else {
        // Rediriger vers BarberListScreen avec les données des coiffeurs
        navigation.navigate('BarberList', { 
          hairdressers: processedSalons,
          serviceType: formData.service_type,
          selectedDate: formData.scheduled_time?.toISOString().split('T')[0],
          selectedTime: formData.scheduled_time?.toTimeString().substring(0, 5)
        });
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des salons:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des salons');
      setNearbyHairdressers([]); // S'assurer que la liste est vide en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la sélection d'un coiffeur
  const handleSelectHairdresser = (hairdresser: Hairdresser) => {
    setSelectedHairdresser(hairdresser);
    
    // Convertir la distance en nombre si c'est une chaîne avec 'km'
    const distanceValue = typeof hairdresser.distance === 'string' 
      ? parseFloat(hairdresser.distance.replace(' km', '')) 
      : hairdresser.distance || 0;
    
    setFormData(prev => ({
      ...prev,
      hairdresser_id: hairdresser.id,
      location_address: hairdresser.address || '',
      latitude: hairdresser.latitude || 0,
      longitude: hairdresser.longitude || 0,
      client_price: hairdresser.price || (prev.service_type === 'home' ? 40 : 30),
    }));
  };

  // Afficher les détails du coiffeur sélectionné
  const renderHairdresserDetails = () => {
    if (!selectedHairdresser) return null;
    
    // Convertir la distance en nombre si c'est une chaîne avec 'km'
    const distanceValue = typeof selectedHairdresser.distance === 'string' 
      ? parseFloat(selectedHairdresser.distance.replace(' km', '')) 
      : selectedHairdresser.distance || 0;
    
    return (
      <View style={styles.selectedHairdresserDetails}>
        <Text style={styles.selectedHairdresserName}>{selectedHairdresser.name}</Text>
        <Text style={styles.selectedHairdresserInfo}>{selectedHairdresser.profession}</Text>
        <Text style={styles.selectedHairdresserInfo}>{selectedHairdresser.address}</Text>
        <Text style={styles.selectedHairdresserRating}>
          {Array(5).fill('').map((_, i) => (
            <Ionicons 
              key={i} 
              name={i < Math.floor(selectedHairdresser.rating || 0) ? 'star' : 'star-outline'} 
              size={16} 
              color="#FFD700" 
            />
          ))}
          {' '}({(selectedHairdresser.rating || 0).toFixed(1)}) • {distanceValue.toFixed(1)} km
        </Text>
      </View>
    );
  };

  // Gestion du type de service
  const handleServiceTypeChange = async (type: 'salon' | 'home') => {
    const newFormData = {
      ...formData,
      service_type: type,
      client_price: type === 'home' ? 40 : 30,
      hairdresser_id: '' // Réinitialiser la sélection du coiffeur
    };
    
    setFormData(newFormData);
    
    if (type === 'salon') {
      await loadSalons();
    } else if (type === 'home') {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'La géolocalisation est nécessaire pour les services à domicile');
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        
        // Charger les vrais coiffeurs à proximité
        await loadNearbyHairdressers(latitude, longitude);
        
      } catch (error) {
        console.error('Erreur de géolocalisation:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position');
      }
    }
  };

  // Liste des services disponibles avec un élément par défaut
  const services = [
    { id: '', name: 'Sélectionnez un service', type: '', duration: 0, price: 0 },
    { id: '1', name: 'Coupe homme', type: 'coupe', duration: 30, price: formData.service_type === 'home' ? 40 : 25 },
    { id: '2', name: 'Coupe femme', type: 'coupe', duration: 60, price: formData.service_type === 'home' ? 50 : 35 },
    { id: '3', name: 'Coloration', type: 'coloration', duration: 120, price: formData.service_type === 'home' ? 80 : 60 },
    { id: '4', name: 'Brushing', type: 'brushing', duration: 45, price: formData.service_type === 'home' ? 45 : 30 },
    { id: '5', name: 'Mèches', type: 'coloration', duration: 90, price: formData.service_type === 'home' ? 70 : 50 },
    { id: '6', name: 'Balayage', type: 'coloration', duration: 150, price: formData.service_type === 'home' ? 100 : 80 },
    { id: '7', name: 'Shampooing + Soin', type: 'soin', duration: 30, price: formData.service_type === 'home' ? 35 : 20 },
  ];
  
  const handleChange = (field: string, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour valider le numéro de téléphone
  const validatePhoneNumber = (phone: string) => {
    // Format international: +33612345678 ou 0612345678
    const phoneRegex = /^\+?[0-9\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async () => {
    // Validation du service sélectionné
    if (!formData.hairstyle_id) {
      Alert.alert('Service requis', 'Veuillez sélectionner un service');
      return;
    }
    
    if (formData.service_type === 'home' && !selectedHairdresser) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un coiffeur sur la carte');
      return;
    }

    // Validation du numéro de téléphone si fourni
    if (formData.client_phone && !validatePhoneNumber(formData.client_phone)) {
      Alert.alert('Format invalide', 'Le format du numéro de téléphone est incorrect (ex: 0612345678)');
      return;
    }

    // Désactivation temporaire des services à domicile
    if (formData.service_type && formData.service_type === 'home') {
      Alert.alert('Information', 'La réservation à domicile sera bientôt disponible.');
      return;
    }

    // Vérification que la date est dans le futur
    if (formData.scheduled_time <= new Date()) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date future');
      return;
    }
    
    // Vérification de la disponibilité du coiffeur
    if (formData.service_type === 'home' && !selectedHairdresser) {
      Alert.alert('Erreur', 'Veuillez sélectionner un coiffeur disponible');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Préparation des données pour l'API
      const bookingData: BookingData = {
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone?.trim().replace(/\s/g, '') || '',
        hairdresser_id: formData.hairdresser_id || '',
        hairstyle_id: formData.hairstyle_id,
        service_type: formData.service_type as 'home' | 'salon',
        service_fee: formData.service_fee,
        client_price: formData.client_price,
        estimated_duration: formData.estimated_duration,
        scheduled_time: formData.scheduled_time.toISOString(),
      };
  
      // Ajout des informations de localisation pour les services à domicile
      if (formData.service_type === 'home' && selectedHairdresser) {
        bookingData.location_address = selectedHairdresser.address || 'Adresse non spécifiée';
        bookingData.latitude = selectedHairdresser.latitude;
        bookingData.longitude = selectedHairdresser.longitude;
      }
      
      console.log('Envoi des données de réservation:', bookingData);
      
      // Appel au service de réservation
      await BookingService.createBooking(bookingData);

      Alert.alert(
        'Réservation confirmée',
        `Votre réservation chez ${hairdresserName} a bien été enregistrée pour le ${formatDate(formData.scheduled_time)} à ${formatTime(formData.scheduled_time)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erreur lors de la réservation:', error);
      Alert.alert('Erreur', error?.message || 'Une erreur est survenue lors de la réservation');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Fonction pour formater l'heure
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Prendre un rendez-vous</Text>
            <Text style={styles.hairdresserName}>Chez {hairdresserName}</Text>
          </View>
        </View>

        {/* Sélection de la coupe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service souhaité</Text>
          <View style={[styles.pickerContainer, { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden' }]}>
            <Picker
              selectedValue={formData.hairstyle_id}
              onValueChange={(itemValue: string) => {
                const selectedService = services.find(s => s.id === itemValue);
                if (selectedService) {
                  setFormData(prev => ({
                    ...prev,
                    hairstyle_id: itemValue,
                    service_fee: selectedService.price * 0.8, // Exemple de calcul de la commission
                    client_price: selectedService.price,
                    estimated_duration: selectedService.duration
                  }));
                }
              }}
              dropdownIconColor="#3a86ff"
              mode="dropdown"
            >
              {services.map((service) => (
                <Picker.Item 
                  key={service.id} 
                  label={service.id ? `${service.name} - ${service.price}€` : 'Sélectionnez un service'}
                  value={service.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Téléphone (optionnel) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos coordonnées</Text>
          <TextInput
            style={styles.input}
            placeholder="Téléphone (optionnel)"
            keyboardType="phone-pad"
            value={formData.client_phone}
            onChangeText={(text) => handleChange('client_phone', text)}
          />
        </View>

        {/* Type de service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de service</Text>
          <Text style={styles.label}>Type de service</Text>
          <View style={styles.serviceTypeContainer}>
            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                formData.service_type === 'salon' && styles.serviceTypeButtonActive
              ]}
              onPress={() => handleServiceTypeChange('salon')}
            >
              <Ionicons 
                name="cut" 
                size={24} 
                color={formData.service_type === 'salon' ? '#fff' : '#3a86ff'} 
                style={styles.serviceIcon}
              />
              <Text style={[
                styles.serviceTypeText,
                formData.service_type === 'salon' && styles.serviceTypeTextActive
              ]}>
                En salon
              </Text>
              {formData.service_type === 'salon' && (
                <View style={styles.serviceTypeBadge}>
                  <Text style={styles.serviceTypeBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                formData.service_type === 'home' && styles.serviceTypeButtonActive
              ]}
              onPress={() => handleServiceTypeChange('home')}
            >
              <Ionicons 
                name="home" 
                size={24} 
                color={formData.service_type === 'home' ? '#fff' : '#3a86ff'}
                style={styles.serviceIcon}
              />
              <Text style={[
                styles.serviceTypeText,
                formData.service_type === 'home' && styles.serviceTypeTextActive
              ]}>
                À domicile
              </Text>
              {formData.service_type === 'home' && (
                <View style={styles.serviceTypeBadge}>
                  <Text style={styles.serviceTypeBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Affichage des salons ou de la carte selon le type de service */}
          <View>
            {formData.service_type === 'salon' && (
              <View style={styles.salonListContainer}>
                <Text style={styles.sectionTitle}>Sélectionnez un salon</Text>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#3a86ff" />
                ) : (
                  <View style={styles.salonItemsContainer}>
                    {nearbyHairdressers.map((item) => (
                      <TouchableOpacity 
                        key={item.id}
                        style={[
                          styles.salonItem,
                          formData.hairdresser_id === item.id && styles.selectedSalonItem
                        ]}
                        onPress={() => {
                          setFormData(prev => ({
                            ...prev,
                            hairdresser_id: item.id,
                            client_price: item.price || 30
                          }));
                        }}
                      >
                        <View style={styles.salonInfo}>
                          <Text style={styles.salonName}>{item.salon_name || 'Salon sans nom'}</Text>
                          <Text style={styles.salonAddress}>{item.address || 'Adresse non disponible'}</Text>
                          <Text style={styles.salonPrice}>{item.price ? `${item.price} €` : 'Prix non disponible'}</Text>
                        </View>
                        {formData.hairdresser_id === item.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#3a86ff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {formData.service_type === 'home' && (
              <View style={styles.mapContainer}>
                <View style={styles.mapHeader}>
                  <Text style={styles.sectionTitle}>Sélectionnez un coiffeur à proximité</Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={async () => {
                      try {
                        const location = await Location.getCurrentPositionAsync({});
                        const { latitude, longitude } = location.coords;
                        await loadNearbyHairdressers(latitude, longitude);
                      } catch (error) {
                        console.error('Erreur de rafraîchissement:', error);
                        Alert.alert('Erreur', 'Impossible de rafraîchir la liste des coiffeurs');
                      }
                    }}
                  >
                    <Ionicons name="refresh" size={20} color="#3a86ff" />
                  </TouchableOpacity>
                </View>
                
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={mapRegion}
                  onMapReady={() => setIsMapReady(true)}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                  onPress={async (e) => {
                    try {
                      const { coordinate } = e.nativeEvent;
                      await loadNearbyHairdressers(coordinate.latitude, coordinate.longitude);
                    } catch (error) {
                      console.error('Erreur lors de la sélection sur la carte:', error);
                    }
                  }}
                >
                  {isMapReady && nearbyHairdressers.map((hairdresser) => (
                    <Marker
                      key={hairdresser.id}
                      coordinate={{
                        latitude: hairdresser.latitude,
                        longitude: hairdresser.longitude,
                      }}
                      title={hairdresser.name}
                      description={`${(typeof hairdresser.distance === 'number' ? hairdresser.distance : 0).toFixed(1)} km - ${hairdresser.rating || 0} ★`}
                      onPress={() => handleSelectHairdresser(hairdresser)}
                    >
                      <View style={[
                        styles.markerContainer,
                        selectedHairdresser?.id === hairdresser.id && styles.selectedMarker
                      ]}>
                        <Ionicons 
                          name="cut" 
                          size={24} 
                          color={selectedHairdresser?.id === hairdresser.id ? '#fff' : '#3a86ff'} 
                        />
                      </View>
                    </Marker>
                  ))}
                </MapView>
                
                {renderHairdresserDetails()}
                
                {!selectedHairdresser && nearbyHairdressers.length > 0 && (
                  <Text style={styles.infoText}>Sélectionnez un coiffeur sur la carte</Text>
                )}
                
                {nearbyHairdressers.length === 0 && !isLoading && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Aucun coiffeur trouvé à proximité</Text>
                  </View>
                )}
                
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3a86ff" />
                    <Text style={styles.loadingText}>Recherche des coiffeurs à proximité...</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Sélection de la date et l'heure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure *</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#6C63FF" style={styles.icon} />
            <Text style={styles.dateTimeText}>
              {formatDate(formData.scheduled_time)} à {formatTime(formData.scheduled_time)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6C63FF" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.scheduled_time}
              mode="datetime"
              display="default"
              minimumDate={new Date()}
              onChange={(event: any, date?: Date) => {
                setShowDatePicker(false);
                if (date) {
                  handleChange('scheduled_time', date);
                }
              }}
            />
          )}
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmer la réservation</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.requiredInfo}>* Champs obligatoires</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 70,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  scrollView: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    marginLeft: 10,
    marginTop: 0,
  },
  hairdresserName: {
    fontSize: 18,
    color: '#6C63FF',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A5A2F6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 10,
    fontStyle: 'italic',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
  },
  notesInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  // Styles pour le sélecteur de type de service
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  serviceTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    overflow: 'hidden',
  },
  serviceTypeButtonActive: {
    backgroundColor: '#3a86ff',
    borderColor: '#3a86ff',
  },
  serviceIcon: {
    marginRight: 10,
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  serviceTypeTextActive: {
    color: '#fff',
  },
  serviceTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTypeBadgeText: {
    color: '#3a86ff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Styles pour les détails du coiffeur
  selectedHairdresserDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
 
  selectedHairdresserInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  selectedHairdresserRating: {
    marginTop: 5,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  
  // Styles pour la liste des salons
  salonListContainer: {
    marginTop: 15,
  },
  salonItemsContainer: {
    maxHeight: 300,
  },
  salonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSalonItem: {
    borderColor: '#3a86ff',
    backgroundColor: '#f0f7ff',
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  salonPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a86ff',
  },
  // Styles pour la carte
  mapContainer: {
    marginTop: 15,
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  refreshButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
  },
  map: {
    width: '100%',
    height: 250,
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3a86ff',
  },
  selectedMarker: {
    backgroundColor: '#3a86ff',
  },
  hairdresserInfo: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  selectedHairdresserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '500',
  },
  distanceText: {
    marginLeft: 8,
    color: '#666',
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
    padding: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  }
});

export default BookingScreen;
