import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { API_URL } from '../config/constants';

// Utilisation du même type que dans AppNavigator.tsx
type RootStackParamList = {
  // Onboarding
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  // Authentification
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'coiffeur' };
  VerifyOtp: { email?: string; phone: string; userId?: string };
  ForgotPassword: undefined;
  Main: undefined;
  // Principal
  Home: undefined;
  // Profil
  Profile: undefined;
  // Autres écrans du profil
  Favorites: undefined;
  History: undefined;
  Statistics: undefined;
  Bookings: undefined;
  Payments: undefined;
  Settings: undefined;
  // Autres écrans
  Barber: undefined;
  BarberDetail: { barberId: string };
  Booking: {
    hairdresserId: string;
    hairdresserName: string;
  };
  // Notre écran
  SalonDetail: { salonId: string };
};

type SalonDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SalonDetail'>;

interface Hairdresser {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  profile_photo: string | null;
}

interface SalonDetail {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude: string | number;
  longitude: string | number;
  photos: string[];
  is_validated?: boolean;
  created_at: string;
  updated_at: string;
  hairdresser?: Hairdresser;
}

const { width } = Dimensions.get('window');

type SalonDetailScreenRouteProp = RouteProp<RootStackParamList, 'SalonDetail'>;

const SalonDetailScreen = () => {
  const navigation = useNavigation<SalonDetailScreenNavigationProp>();
  const route = useRoute<SalonDetailScreenRouteProp>();
  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const salonId = route.params?.salonId;

  const fetchSalonDetails = useCallback(async () => {
    if (!salonId) {
      setError('Aucun identifiant de salon fourni');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/salons/${salonId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement du salon');
      }

      if (data.success && data.data) {
        setSalon(data.data);
      } else {
        throw new Error('Données du salon non disponibles');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchSalonDetails();
  }, [fetchSalonDetails]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchSalonDetails();
  };

  const handlePhonePress = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleMapPress = () => {
    if (!salon) return;
    
    const lat = Number(salon.latitude);
    const lng = Number(salon.longitude);
    const label = encodeURIComponent(salon.name);
    
    const url = Platform.select({
      ios: `maps:${lat},${lng}?q=${label}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    
    if (url) {
      Linking.openURL(url).catch(console.error);
    }
  };

  const handleBookPress = () => {
    if (!salon || !salon.hairdresser) return;
    navigation.navigate('Booking', {
      hairdresserId: salon.hairdresser.id,
      hairdresserName: `${salon.hairdresser.first_name} ${salon.hairdresser.last_name}`
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error || !salon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Aucune donnée disponible pour ce salon'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec l'image */}
      <View style={styles.imageContainer}>
        {salon.photos?.length > 0 ? (
          <Image 
            source={{ uri: salon.photos[0] }} 
            style={styles.salonImage}
            resizeMode="cover"
            onError={() => {
              if (salon) {
                setSalon({ ...salon, photos: [] });
              }
            }}
          />
        ) : (
          <View style={[styles.salonImage, styles.noImage]}>
            <Ionicons name="business" size={50} color="#999" />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        {/* En-tête avec le nom et la vérification */}
        <View style={styles.headerRow}>
          <Text style={styles.salonName} numberOfLines={2}>
            {salon.name}
          </Text>
          {salon.is_validated && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.verifiedText}>Vérifié</Text>
            </View>
          )}
        </View>

        {/* Adresse */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#6C63FF" />
          <Text style={styles.address}>{salon.address}</Text>
        </View>

        {/* Coiffeur */}
        {salon.hairdresser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coiffeur</Text>
            <View style={styles.hairdresserInfo}>
              {salon.hairdresser.profile_photo ? (
                <Image 
                  source={{ uri: salon.hairdresser.profile_photo }} 
                  style={styles.avatar}
                  onError={() => {
                    if (salon.hairdresser) {
                      setSalon({
                        ...salon,
                        hairdresser: { ...salon.hairdresser, profile_photo: '' }
                      });
                    }
                  }}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
              )}
              <View>
                <Text style={styles.hairdresserName}>
                  {salon.hairdresser.first_name} {salon.hairdresser.last_name}
                </Text>
                {salon.hairdresser.phone && (
                  <TouchableOpacity 
                    style={styles.phoneButton}
                    onPress={() => handlePhonePress(salon.hairdresser?.phone)}
                  >
                    <Ionicons name="call-outline" size={16} color="#6C63FF" />
                    <Text style={styles.phoneText}>{salon.hairdresser.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {salon.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{salon.description}</Text>
          </View>
        )}

        {/* Carte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>
          <TouchableOpacity 
            style={styles.mapContainer}
            onPress={handleMapPress}
            activeOpacity={0.8}
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: Number(salon.latitude) || 0,
                longitude: Number(salon.longitude) || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: Number(salon.latitude) || 0,
                  longitude: Number(salon.longitude) || 0,
                }}
                title={salon.name}
                description={salon.address}
              />
            </MapView>
          </TouchableOpacity>
        </View>

        {/* Boutons d'action */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleBookPress}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Réserver</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleMapPress}
          >
            <Ionicons name="navigate-outline" size={20} color="#6C63FF" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Y aller</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // En-tête avec l'image
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
  },
  salonImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
  },
  // Contenu principal
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  salonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  // Informations de base
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  // Section coiffeur
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hairdresserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hairdresserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    color: '#6C63FF',
    marginLeft: 4,
    fontSize: 14,
  },
  // Description
  description: {
    color: '#666',
    lineHeight: 22,
  },
  // Carte
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    flex: 1,
  },
  // Boutons d'action
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#6C63FF',
  },
  // États
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SalonDetailScreen;
