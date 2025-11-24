import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
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
import { BookingService, type BookingData, type Salon } from '../services/booking.service';
import { styles } from './styles/bookingScreen.styles';

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
  const scrollViewRef = useRef<ScrollView>(null);
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
    service_type: 'salon',
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
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedHairdresser, setSelectedHairdresser] = useState<Hairdresser | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtenir la position actuelle
 const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permission de localisation non accordée');
      // Centrer sur la France si la permission est refusée
      setMapRegion({
        latitude: 46.603354,
        longitude: 1.888334,
        latitudeDelta: 10,
        longitudeDelta: 10,
      });
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    setUserLocation(location);
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    
    return location;
  } catch (error) {
    console.error('Erreur de géolocalisation:', error);
    setLocationError('Impossible de récupérer votre position');
    // Centrer sur la France en cas d'erreur
    setMapRegion({
      latitude: 46.603354,
      longitude: 1.888334,
      latitudeDelta: 10,
      longitudeDelta: 10,
    });
    return null;
  }
};

  useEffect(() => {
    // Charger les salons au démarrage
    loadSalonsList();
    
    // Obtenir la position actuelle au chargement
    const initLocation = async () => {
      const location = await getCurrentLocation();
      if (location) {
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        // Charger les coiffeurs à proximité
        await loadNearbyHairdressers(location.coords.latitude, location.coords.longitude);
      }
    };

    initLocation();
    loadSalons();
  }, []);

  // Charger les salons validés
  const loadSalonsList = async () => {
    try {
      setIsLoading(true);
      const salonsData = await BookingService.getValidatedSalons();
      setSalons(salonsData);
      
      // Si c'est le premier chargement, centrer la carte sur le premier salon
      if (salonsData.length > 0 && !userLocation) {
        const firstSalon = salonsData[0];
        setMapRegion({
          latitude: parseFloat(String(firstSalon.latitude)),
          longitude: parseFloat(String(firstSalon.longitude)),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des salons:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des salons');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les coiffeurs à proximité
  const loadNearbyHairdressers = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      
      // Vérifier que les coordonnées sont valides
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Coordonnées GPS invalides');
      }

      const response = await BookingService.getNearbyHairdressers(latitude, longitude, 1);
      
      // Vérifier si la réponse est valide
      if (!response) {
        throw new Error('Réponse vide du serveur');
      }
      
      // Extraire les coiffeurs en fonction de la structure de la réponse
      const hairdressers = response.data?.hairdressers || response.data || [];
      console.log('Coiffeurs chargés:', hairdressers);
      
      if (!Array.isArray(hairdressers)) {
        console.warn('Format de réponse inattendu pour les coiffeurs:', response);
        setNearbyHairdressers([]);
        Alert.alert('Erreur', 'Format de réponse inattendu du serveur');
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
      // Auto-sélection si aucune localisation définie
      if (processedHairdressers.length > 0 && (!formData.latitude || !formData.longitude)) {
        const first = processedHairdressers[0];
        setFormData(prev => ({
          ...prev,
          location_address: first.address || 'Adresse non spécifiée',
          latitude: Number(first.latitude) || 0,
          longitude: Number(first.longitude) || 0,
        }));
      }
      
      if (processedHairdressers.length === 0) {
        console.log('Aucun coiffeur/salon trouvé à proximité, chargement des salons validés...');
        try {
          const salonsData = await BookingService.getValidatedSalons();
          const processed = salonsData.map((s: any) => ({
            ...s,
            id: s.id || Math.random().toString(36).substr(2, 9),
            name: s.name || s.salon_name || 'Salon',
            salon_name: s.salon_name || s.name || 'Salon',
            address: s.address || 'Adresse non disponible',
            latitude: parseFloat(String(s.latitude)) || 0,
            longitude: parseFloat(String(s.longitude)) || 0,
            price: s.price || 30,
            rating: s.rating || 0,
            distance: s.distance || '0.5 km',
          } as Hairdresser));
          setNearbyHairdressers(processed);
          // Auto-sélection fallback
          if (processed.length > 0) {
            const first = processed[0];
            setFormData(prev => ({
              ...prev,
              location_address: first.address || 'Adresse non spécifiée',
              latitude: Number(first.latitude) || 0,
              longitude: Number(first.longitude) || 0,
            }));
          }
          if (processed.length > 0) {
            setMapRegion({
              latitude: processed[0].latitude,
              longitude: processed[0].longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            });
          } else {
            Alert.alert('Information', 'Aucun salon disponible pour le moment.');
          }
        } catch (e) {
          console.error('Erreur fallback salons validés:', e);
          Alert.alert('Erreur', 'Impossible de charger des salons.');
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des coiffeurs:', error);
      // Fallback automatique aux salons validés en cas d'erreur
      try {
        const salonsData = await BookingService.getValidatedSalons();
        const processed = salonsData.map((s: any) => ({
          ...s,
          id: s.id || Math.random().toString(36).substr(2, 9),
          name: s.name || s.salon_name || 'Salon',
          salon_name: s.salon_name || s.name || 'Salon',
          address: s.address || 'Adresse non disponible',
          latitude: parseFloat(String(s.latitude)) || 0,
          longitude: parseFloat(String(s.longitude)) || 0,
          price: s.price || 30,
          rating: s.rating || 0,
          distance: s.distance || '0.5 km',
        } as Hairdresser));
        setNearbyHairdressers(processed);
        if (processed.length > 0) {
          setMapRegion({
            latitude: processed[0].latitude,
            longitude: processed[0].longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      } catch (e) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement des coiffeurs';
        Alert.alert('Erreur', `Impossible de charger les coiffeurs/salons : ${errorMessage}`);
        setNearbyHairdressers([]);
      }
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

  // Fonction pour gérer le clic sur un marqueur de coiffeur
  const handleMarkerPress = (hairdresser: Hairdresser) => {
    setSelectedHairdresser(hairdresser);
    setSelectedSalon(null); // Désélectionner le salon si un coiffeur est sélectionné
    setFormData(prev => ({
      ...prev,
      hairdresser_id: hairdresser.id,
      client_price: hairdresser.price || 30,
      location_address: hairdresser.address || '',
      latitude: hairdresser.latitude,
      longitude: hairdresser.longitude,
    }));
  };
  
  // Fonction pour gérer le clic sur un marqueur de salon
  const handleSalonPress = (salon: Salon) => {
    setSelectedSalon(salon);
    setSelectedHairdresser(null); // Désélectionner le coiffeur si un salon est sélectionné
    // Centrer la carte sur le salon sélectionné
    setMapRegion({
      latitude: parseFloat(String(salon.latitude)),
      longitude: parseFloat(String(salon.longitude)),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    // Appliquer la sélection au formulaire
    setFormData(prev => ({
      ...prev,
      hairdresser_id: String((salon as any).id),
      location_address: (salon as any).address || '',
      latitude: parseFloat(String(salon.latitude)),
      longitude: parseFloat(String(salon.longitude)),
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
      hairdresser_id: type === 'salon' ? hairdresserId : '' // En salon: sélectionner par défaut le coiffeur de la réservation
    };
    
    setFormData(newFormData);
    
    if (type === 'salon') {
      // En salon: pas d'affichage de la liste, sélection par défaut du coiffeur du rendez-vous
      setSelectedHairdresser(null);
      setSelectedSalon(null);
      // Auto-renseigner la localisation depuis la première entrée disponible
      try {
        if (salons && salons.length > 0) {
          const first = salons[0] as any;
          setFormData(prev => ({
            ...prev,
            location_address: first.address || 'Adresse non spécifiée',
            latitude: Number(first.latitude) || 0,
            longitude: Number(first.longitude) || 0,
          }));
        } else if (nearbyHairdressers && nearbyHairdressers.length > 0) {
          const first = nearbyHairdressers[0] as any;
          setFormData(prev => ({
            ...prev,
            location_address: first.address || 'Adresse non spécifiée',
            latitude: Number(first.latitude) || 0,
            longitude: Number(first.longitude) || 0,
          }));
        } else {
          // Charger les salons validés si rien en mémoire
          setIsLoading(true);
          const salonsData = await BookingService.getValidatedSalons();
          if (salonsData.length > 0) {
            const first = salonsData[0] as any;
            setFormData(prev => ({
              ...prev,
              location_address: first.address || 'Adresse non spécifiée',
              latitude: Number(first.latitude) || 0,
              longitude: Number(first.longitude) || 0,
            }));
            setMapRegion({
              latitude: Number(first.latitude) || 46.603354,
              longitude: Number(first.longitude) || 1.888334,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    } else if (type === 'home') {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Fallback: afficher les salons validés sur la carte
          Alert.alert('Information', 'La géolocalisation est désactivée. Affichage des salons à proximité connus.');
          setIsLoading(true);
          try {
            const salonsData = await BookingService.getValidatedSalons();
            // Centrer sur le premier salon si disponible
            if (salonsData.length > 0) {
              const first = salonsData[0];
              setMapRegion({
                latitude: parseFloat(String(first.latitude)) || 46.603354,
                longitude: parseFloat(String(first.longitude)) || 1.888334,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              });
            }
            // Réutiliser nearbyHairdressers comme source des marqueurs
            const processed = salonsData.map((s: any) => ({
              ...s,
              id: s.id || Math.random().toString(36).substr(2, 9),
              name: s.name || s.salon_name || 'Salon',
              salon_name: s.salon_name || s.name || 'Salon',
              address: s.address || 'Adresse non disponible',
              latitude: parseFloat(String(s.latitude)) || 0,
              longitude: parseFloat(String(s.longitude)) || 0,
              price: s.price || 30,
              rating: s.rating || 0,
              distance: s.distance || '0.5 km',
            } as Hairdresser));
            setNearbyHairdressers(processed);
            // Auto-sélection de la localisation pour contourner le choix manuel
            if (processed.length > 0) {
              const first = processed[0];
              setFormData(prev => ({
                ...prev,
                location_address: first.address || 'Adresse non spécifiée',
                latitude: Number(first.latitude) || 0,
                longitude: Number(first.longitude) || 0,
              }));
            }
          } catch (e) {
            console.error('Fallback salons error:', e);
          } finally {
            setIsLoading(false);
          }
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
        
        // Charger les salons/coiffeurs à proximité
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
    
    // La sélection sur la carte est obligatoire pour définir la localisation
    
    // S'assurer que les coordonnées sont présentes (requis côté backend)
    if (
      formData.latitude === undefined || formData.longitude === undefined ||
      formData.latitude === 0 || formData.longitude === 0
    ) {
      Alert.alert('Localisation requise', 'Veuillez sélectionner un salon sur la carte afin de renseigner la localisation.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Préparation des données pour l'API
      const bookingData: BookingData = {
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone?.trim().replace(/\s/g, '') || '',
        hairstyle_id: String(formData.hairstyle_id),
        service_type: formData.service_type as 'home' | 'salon',
        location_address: formData.location_address || 'Adresse non spécifiée',
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        scheduled_time: formData.scheduled_time.toISOString(),
      };
  
      // Rien à ajouter: la localisation est déjà requise et fournie pour les deux types
      
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
            onValueChange={(itemValue) => {
              const selectedService = services.find(s => s.id === itemValue);
              if (selectedService) {
                setFormData(prev => ({
                  ...prev,
                  hairstyle_id: itemValue,
                  service_fee: selectedService.price * 0.8,
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
        <View style={styles.serviceTypeContainer}>
          <TouchableOpacity
            style={[
              styles.serviceTypeButton,
              formData.service_type === 'salon' && styles.serviceTypeButtonActive
            ]}
            onPress={() => handleServiceTypeChange('salon')}
          >
            <Ionicons name="cut" size={24} color={formData.service_type === 'salon' ? '#fff' : '#3a86ff'} />
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
            <Ionicons name="home" size={24} color={formData.service_type === 'home' ? '#fff' : '#3a86ff'} />
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

        {/* Affichage des salons sur la carte pour type 'home' */}
        {formData.service_type === 'home' && (
          <View style={styles.mapContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#3a86ff" />
            ) : (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.mapContainer}
                region={mapRegion}
                onMapReady={() => setIsMapReady(true)}
                showsUserLocation={true}
              >
                {nearbyHairdressers.map((item) => (
                  <Marker
                    key={item.id}
                    coordinate={{
                      latitude: parseFloat(String(item.latitude)),
                      longitude: parseFloat(String(item.longitude)),
                    }}
                    title={`${item.salon_name || item.name || 'Salon'}`}
                    description={`${item.address || ''}`}
                    onPress={() => handleSalonPress(item as unknown as Salon)}
                  />
                ))}
              </MapView>
            )}
          </View>
        )}

        {/* Pas de carte en mode salon (sélection automatique) */}
        {formData.service_type === 'salon' && (
          <View style={styles.mapContainer}>
            {/* MapView ici (inchangé) */}
          </View>
        )}
      </View>

      {/* Sélection de la date et l'heure */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date et heure *</Text>
        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#6C63FF" />
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
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) handleChange('scheduled_time', date);
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

export default BookingScreen;