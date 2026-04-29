import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/constants';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const LATITUDE_DELTA = 0.3;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

interface Salon {
  id: string;
  name: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  photos: string[];
  phone?: string;
  average_rating?: number;
  distance?: number;
}

const DEFAULT_REGION: Region = {
  latitude: 5.3600,
  longitude: -4.0083,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const MapScreen = ({ navigation }: any) => {
  const mapRef = useRef<MapView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [_userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async (centerMap = false) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission de localisation refusée');
        fetchSalons();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      if (centerMap) {
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      }

      fetchSalons(latitude, longitude);
    } catch (error) {
      setLocationError('Impossible d\'obtenir votre position');
      fetchSalons();
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchSalons = async (userLat?: number, userLon?: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/salons`);
      const result = await response.json();

      if (result.success && result.data) {
        let processedSalons: Salon[] = result.data;

        if (userLat && userLon) {
          processedSalons = result.data.map((salon: Salon) => {
            const salonLat = parseFloat(String(salon.latitude));
            const salonLon = parseFloat(String(salon.longitude));
            if (!isNaN(salonLat) && !isNaN(salonLon)) {
              return { ...salon, distance: calculateDistance(userLat, userLon, salonLat, salonLon) };
            }
            return salon;
          });
          processedSalons.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setSalons(processedSalons);

        // If we have salons with coordinates and no user location, center on first salon
        if (!userLat && processedSalons.length > 0) {
          const first = processedSalons[0];
          const lat = parseFloat(String(first.latitude));
          const lon = parseFloat(String(first.longitude));
          if (!isNaN(lat) && !isNaN(lon)) {
            setMapRegion({
              latitude: lat,
              longitude: lon,
              latitudeDelta: LATITUDE_DELTA * 2,
              longitudeDelta: LONGITUDE_DELTA * 2,
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching salons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('file://')) return null;
    if (photoUrl.startsWith('http')) return photoUrl;
    const baseUrl = API_URL.replace('/api/v1', '');
    if (photoUrl.startsWith('photos-')) return `${baseUrl}/uploads/photos/${photoUrl}`;
    if (!photoUrl.includes('/')) return `${baseUrl}/uploads/photos/${photoUrl}`;
    return `${baseUrl}${photoUrl}`;
  };

  const handleSalonMarkerPress = (salon: Salon) => {
    setSelectedSalon(salon);
    const lat = parseFloat(String(salon.latitude));
    const lon = parseFloat(String(salon.longitude));
    if (!isNaN(lat) && !isNaN(lon) && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat - 0.005,
        longitude: lon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  const handleGoToSalon = () => {
    if (selectedSalon) {
      setSelectedSalon(null);
      navigation.navigate('SalonDetail', { salonId: selectedSalon.id });
    }
  };

  const formatDistance = (d?: number) => {
    if (d === undefined) return null;
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <LinearGradient
          colors={['#6C63FF', '#8B84FF']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Carte des Salons</Text>
              <Text style={styles.headerSubtitle}>
                {salons.length} salon{salons.length > 1 ? 's' : ''} autour de vous
              </Text>
            </View>
            <TouchableOpacity style={styles.locateBtn} onPress={() => getCurrentLocation(true)}>
              <Ionicons name="locate" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {locationError && (
            <View style={styles.locationErrorBar}>
              <Ionicons name="warning-outline" size={14} color="#FFD700" />
              <Text style={styles.locationErrorText}>{locationError}</Text>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
      >
        {salons.map((salon) => {
          const lat = parseFloat(String(salon.latitude));
          const lon = parseFloat(String(salon.longitude));
          if (isNaN(lat) || isNaN(lon)) return null;
          const isSelected = selectedSalon?.id === salon.id;
          return (
            <Marker
              key={salon.id}
              coordinate={{ latitude: lat, longitude: lon }}
              onPress={() => handleSalonMarkerPress(salon)}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerContainerSelected]}>
                <LinearGradient
                  colors={isSelected ? ['#FF6B6B', '#FF4444'] : ['#6C63FF', '#8B84FF']}
                  style={styles.markerGradient}
                >
                  <Ionicons name="cut" size={isSelected ? 18 : 14} color="#fff" />
                </LinearGradient>
                {isSelected && <View style={styles.markerArrow} />}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Bottom Sheet — salon detail */}
      {selectedSalon && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />

          <View style={styles.bottomSheetContent}>
            <View style={styles.salonImageWrapper}>
              {selectedSalon.photos?.[0] && formatImageUrl(selectedSalon.photos[0]) ? (
                <Image
                  source={{ uri: formatImageUrl(selectedSalon.photos[0])! }}
                  style={styles.salonImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient colors={['#6C63FF22', '#6C63FF44']} style={styles.salonImagePlaceholder}>
                  <Ionicons name="business" size={36} color="#6C63FF" />
                </LinearGradient>
              )}
            </View>

            <View style={styles.salonDetails}>
              <Text style={styles.salonName} numberOfLines={1}>{selectedSalon.name}</Text>
              <View style={styles.salonMeta}>
                <Ionicons name="location-outline" size={13} color="#6C63FF" />
                <Text style={styles.salonAddress} numberOfLines={1}>{selectedSalon.address}</Text>
              </View>
              <View style={styles.salonBadgeRow}>
                {selectedSalon.distance !== undefined && (
                  <View style={styles.badge}>
                    <Ionicons name="navigate" size={11} color="#6C63FF" />
                    <Text style={styles.badgeText}>{formatDistance(selectedSalon.distance)}</Text>
                  </View>
                )}
                {selectedSalon.average_rating !== undefined && selectedSalon.average_rating > 0 && (
                  <View style={[styles.badge, styles.ratingBadge]}>
                    <Ionicons name="star" size={11} color="#FF9800" />
                    <Text style={[styles.badgeText, { color: '#FF9800' }]}>
                      {selectedSalon.average_rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={() => setSelectedSalon(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.visitBtn} onPress={handleGoToSalon}>
            <LinearGradient
              colors={['#6C63FF', '#8B84FF']}
              style={styles.visitBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="storefront-outline" size={18} color="#fff" />
              <Text style={styles.visitBtnText}>Voir le salon</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Salon count pill */}
      {!selectedSalon && salons.length > 0 && (
        <View style={styles.countPill}>
          <Ionicons name="business-outline" size={14} color="#6C63FF" />
          <Text style={styles.countPillText}>{salons.length} salons</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: { marginTop: 12, fontSize: 15, color: '#666' },

  headerSafe: { zIndex: 10 },
  header: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  locateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationErrorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationErrorText: { fontSize: 12, color: '#FFD700' },

  map: { flex: 1 },

  markerContainer: {
    alignItems: 'center',
  },
  markerContainerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF4444',
    marginTop: -2,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  salonImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
  },
  salonImage: { width: '100%', height: '100%' },
  salonImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonDetails: { flex: 1 },
  salonName: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  salonMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  salonAddress: { fontSize: 12, color: '#666', flex: 1 },
  salonBadgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingBadge: { backgroundColor: '#FFF8E1' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#6C63FF' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitBtn: { borderRadius: 14, overflow: 'hidden' },
  visitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  visitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  countPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  countPillText: { fontSize: 13, fontWeight: '600', color: '#6C63FF' },
});

export default MapScreen;
