import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_URL } from '../config/constants';
import MapView, { Marker } from 'react-native-maps';

type RootStackParamList = {
  Home: undefined;
  SalonDetail: { salonId: string };
  // ... autres écrans
};

type SalonDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SalonDetail'>;
type SalonDetailScreenRouteProp = NativeStackScreenProps<RootStackParamList, 'SalonDetail'>['route'];

interface Hairdresser {
  id: string;
  full_name: string;
  profile_photo: string | null;
}

interface SalonDetail {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude: string;
  longitude: string;
  photos: string[];
  average_rating: number;
  rating_count: number;
  hairdresser: Hairdresser;
  phone?: string;
  email?: string;
  opening_hours?: string;
  created_at: string;
}

const { width } = Dimensions.get('window');

const SalonDetailScreen = () => {
  const navigation = useNavigation<SalonDetailScreenNavigationProp>();
  const route = useRoute<SalonDetailScreenRouteProp>();
  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const salonId = String(route.params?.salonId || '');

  useEffect(() => {
    const fetchSalonDetails = async () => {
      if (!salonId) {
        const errorMsg = 'Aucun identifiant de salon fourni';
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      try {
        const apiUrl = `${API_URL}/salons/${salonId}`;
        console.log('Tentative de chargement des détails du salon depuis:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Réponse du serveur - Status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erreur de réponse du serveur:', errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Données reçues du serveur:', data);
        
        if (data.success && data.data) {
          console.log('Détails du salon chargés avec succès:', data.data);
          setSalon(data.data);
        } else {
          throw new Error(data.message || 'Données du salon non disponibles');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [salonId]);

  const handleCall = () => {
    if (salon?.phone) {
      Linking.openURL(`tel:${salon.phone}`);
    }
  };

  const handleOpenMaps = () => {
    if (salon?.latitude && salon?.longitude) {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${salon.latitude},${salon.longitude}`;
      const label = encodeURIComponent(salon.name);
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      
      if (url) {
        Linking.openURL(url);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={50} color="#6C63FF" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!salon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucune donnée disponible pour ce salon</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec image et bouton retour */}
      <View style={styles.header}>
        {salon.photos && salon.photos.length > 0 ? (
          <Image 
            source={{ uri: salon.photos[0] }} 
            style={styles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.headerImage, styles.headerImagePlaceholder]}>
            <Ionicons name="business" size={60} color="#6C63FF" />
          </View>
        )}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Section informations principales */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{salon.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>
              {salon.average_rating.toFixed(1)} ({salon.rating_count || 0} avis)
            </Text>
          </View>
        </View>

        {/* Coordonnées */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#6C63FF" />
            <Text style={styles.sectionTitle}>Adresse</Text>
          </View>
          <Text style={styles.sectionContent}>{salon.address}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMaps}>
            <Text style={styles.mapButtonText}>Voir sur la carte</Text>
            <Ionicons name="map" size={16} color="#6C63FF" />
          </TouchableOpacity>

          {salon.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Appeler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {salon.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#6C63FF" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{salon.description}</Text>
          </View>
        )}

        {/* Coiffeur associé */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cut" size={20} color="#6C63FF" />
            <Text style={styles.sectionTitle}>Coiffeur</Text>
          </View>
          <View style={styles.hairdresserContainer}>
            {salon.hairdresser?.profile_photo ? (
              <Image 
                source={{ uri: salon.hairdresser.profile_photo }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={24} color="#6C63FF" />
              </View>
            )}
            <Text style={styles.hairdresserName}>
              {salon.hairdresser?.full_name || 'Coiffeur non spécifié'}
            </Text>
          </View>
        </View>

        {/* Horaires d'ouverture */}
        {salon.opening_hours && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#6C63FF" />
              <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
            </View>
            <Text style={styles.sectionContent}>{salon.opening_hours}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  mapButtonText: {
    color: '#6C63FF',
    marginRight: 5,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  hairdresserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hairdresserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default SalonDetailScreen;
