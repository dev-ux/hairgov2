import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/constants';
import * as Location from 'expo-location';

interface Salon {
  id: string;
  name: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  photos: string[];
  phone?: string;
  average_rating?: number;
  distance?: number; // Distance en km
}

const MapScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MapScreen - Platform.OS:', Platform.OS);
    console.log('MapScreen - Fetching user location and salons');
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // Demander la permission de localisation
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setLocationError('Permission de localisation refusée');
        fetchSalons(); // Récupérer les salons sans localisation
        return;
      }

      // Obtenir la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      console.log('User location:', { latitude, longitude });
      setUserLocation({ latitude, longitude });
      
      // Récupérer les salons et calculer les distances
      fetchSalons(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Impossible d\'obtenir votre position');
      fetchSalons(); // Récupérer les salons sans localisation
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Formule de Haversine pour calculer la distance entre deux points
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  };

  const fetchSalons = async (userLat?: number, userLon?: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/salons`);
      const result = await response.json();
      
      console.log('MapScreen - API Response:', result);
      
      if (result.success && result.data) {
        let processedSalons = result.data;
        
        // Si on a la position de l'utilisateur, calculer les distances
        if (userLat && userLon) {
          processedSalons = result.data.map((salon: Salon) => {
            const salonLat = parseFloat(String(salon.latitude));
            const salonLon = parseFloat(String(salon.longitude));
            const distance = calculateDistance(userLat, userLon, salonLat, salonLon);
            return { ...salon, distance };
          });
          
          // Trier par distance (du plus proche au plus loin)
          processedSalons.sort((a: Salon, b: Salon) => (a.distance || 0) - (b.distance || 0));
        }
        
        setSalons(processedSalons);
        console.log('MapScreen - Salons loaded:', processedSalons.length);
      }
    } catch (err) {
      console.error('Error fetching salons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    
    console.log('MapScreen - formatImageUrl input:', photoUrl);
    
    // Si l'URL commence par file://, c'est une photo locale (non accessible depuis le web)
    if (photoUrl.startsWith('file://')) {
      console.log('MapScreen - Local file detected, returning null');
      return null;
    }
    
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (photoUrl.startsWith('http')) {
      console.log('MapScreen - HTTP URL detected:', photoUrl);
      return photoUrl;
    }
  
    // Construire l'URL de base pour les fichiers statiques (sans /api/v1)
    const baseUrl = API_URL.replace('/api/v1', '');
  
    // Si l'URL commence par "photos-", construire l'URL complète vers /uploads/photos/
    if (photoUrl.startsWith('photos-')) {
      const fullUrl = `${baseUrl}/uploads/photos/${photoUrl}`;
      console.log('MapScreen - Photos- URL constructed:', fullUrl);
      return fullUrl;
    }
  
    // Si c'est juste un nom de fichier, construire l'URL complète
    if (!photoUrl.includes('/')) {
      const fullUrl = `${baseUrl}/uploads/photos/${photoUrl}`;
      console.log('MapScreen - Filename URL constructed:', fullUrl);
      return fullUrl;
    }
  
    // Sinon, ajouter l'URL de base
    const fullUrl = `${baseUrl}${photoUrl}`;
    console.log('MapScreen - Base URL constructed:', fullUrl);
    return fullUrl;
  };

  const handleSalonPress = (salon: Salon) => {
    Alert.alert(
      salon.name,
      `${salon.address}\n${salon.phone ? `📞 ${salon.phone}` : ''}`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement des salons...</Text>
        </View>
      </View>
    );
  }

  // Afficher la liste des salons avec une carte statique
  return (
    <View style={styles.container}>
      {/* Header avec carte statique */}
      <View style={styles.mapPlaceholder}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1579532583983-0425d9a4c3c1?w=800&h=400&fit=crop' }}
          style={styles.staticMapImage}
        />
        <View style={styles.mapOverlay}>
          <Ionicons name="map" size={48} color="white" />
          <Text style={styles.mapTitle}>Carte des Salons</Text>
          <Text style={styles.mapSubtitle}>
            {userLocation 
              ? `${salons.length} salons autour de vous` 
              : `${salons.length} salons trouvés`
            }
          </Text>
          {locationError && (
            <Text style={styles.locationErrorText}>{locationError}</Text>
          )}
        </View>
      </View>

      {/* Liste des salons */}
      <ScrollView style={styles.salonList}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Salons à proximité</Text>
        </View>
        
        {salons.map((salon) => (
          <TouchableOpacity 
            key={salon.id} 
            style={styles.salonCard}
            onPress={() => handleSalonPress(salon)}
          >
            <View style={styles.salonImageContainer}>
              {salon.photos && salon.photos.length > 0 && formatImageUrl(salon.photos[0]) ? (
                <Image 
                  source={{ uri: formatImageUrl(salon.photos[0]) || undefined }} 
                  style={styles.salonImage}
                  onError={(e) => {
                    console.log('MapScreen - Failed to load salon image:', e.nativeEvent.error);
                  }}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="business" size={32} color="#6C63FF" />
                </View>
              )}
            </View>
            
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>{salon.name}</Text>
              <Text style={styles.salonAddress}>{salon.address}</Text>
              
              <View style={styles.salonMeta}>
                {salon.distance !== undefined && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={14} color="#6C63FF" />
                    <Text style={styles.distanceText}>
                      {salon.distance < 1 
                        ? `${Math.round(salon.distance * 1000)}m` 
                        : `${salon.distance.toFixed(1)}km`
                      }
                    </Text>
                  </View>
                )}
                
                {salon.average_rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFA500" />
                    <Text style={styles.ratingText}>{salon.average_rating.toFixed(1)}</Text>
                  </View>
                )}
                
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#6C63FF" />
                  <Text style={styles.locationText}>
                    {parseFloat(String(salon.latitude)).toFixed(2)}, {parseFloat(String(salon.longitude)).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.salonAction}>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
        
        {salons.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucun salon trouvé</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // Map placeholder styles
  mapPlaceholder: {
    height: 200,
    position: 'relative',
  },
  staticMapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  mapSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  locationErrorText: {
    fontSize: 12,
    color: '#ffcccc',
    marginTop: 8,
    textAlign: 'center',
  },
  // Salon list styles
  salonList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  salonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salonImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  salonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  salonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  salonAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default MapScreen;