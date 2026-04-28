import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { homeScreenStyles } from './styles/HomeScreen.styles';
import * as Location from 'expo-location';
// Import de l'image par défaut
const defaultSalonImage = require('../assets/url_de_l_image_1.jpg');

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (url: string) => {
  try {
    if (!url) {
      console.log('Aucune URL fournie');
      return null;
    }

    console.log('URL originale reçue:', url);

    // Si c'est déjà une URL complète (Cloudinary ou autre), la retourner directement
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('URL complète détectée, retour direct:', url);
      return url;
    }

    // Nettoyer l'URL (supprimer les accolades, espaces, guillemets et autres caractères invalides)
    let cleanUrl = url.replace(/[{}"']/g, '').trim();
    
    // Si l'URL commence par /uploads/photos/, la nettoyer et construire l'URL complète
    if (cleanUrl.startsWith('/uploads/photos/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${cleanUrl}`;
      console.log('URL uploads/photos détectée, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL commence par /uploads/hairstyles/, la nettoyer et construire l'URL complète
    if (cleanUrl.startsWith('/uploads/hairstyles/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${cleanUrl}`;
      console.log('URL uploads/hairstyles détectée, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL commence par /uploads/, la nettoyer et construire l'URL complète
    if (cleanUrl.startsWith('/uploads/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${cleanUrl}`;
      console.log('URL uploads détectée, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL commence par profiles-, construire l'URL complète
    if (cleanUrl.startsWith('profiles-')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}/uploads/${cleanUrl}`;
      console.log('URL profiles détectée, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL commence par photos-, construire l'URL complète
    if (cleanUrl.startsWith('photos-')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}/uploads/photos/${cleanUrl}`;
      console.log('Nom de fichier photos- détecté, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL ne contient que le nom du fichier sans préfixe
    if (!cleanUrl.includes('/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}/uploads/photos/${cleanUrl}`;
      console.log('Nom de fichier simple détecté, URL finale:', fullUrl);
      return fullUrl;
    }

    // Pour tout autre cas, essayer de construire avec /uploads/photos/
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    const fileName = cleanUrl.split('/').pop();
    const fullUrl = `${baseUrl}/uploads/photos/${fileName}`;
    console.log('Cas par défaut, URL finale:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Erreur lors du formatage de l\'URL:', error);
    return null;
  }
};

export interface Hairstyle {
  id: string;
  name: string;
  photo: string;
  estimated_duration: number;
  price: number;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  photos: string[];
  average_rating: number;
  latitude: string | number;
  longitude: string | number;
  distance?: number;
  hairdresser: {
    id: string;
    full_name: string;
    profile_photo: string | null;
  };
};

// Dimensions de l'écran
const { width } = Dimensions.get('window');

interface UserData {
  full_name: string;
  // Ajoutez d'autres propriétés utilisateur si nécessaire
}

export default function HomeScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [salons, setSalons] = useState<Salon[] | null>(null);
  const [nearbySalons, setNearbySalons] = useState<Salon[] | null>(null);
  const [hairstyles, setHairstyles] = useState<Hairstyle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [loadingHairstyles, setLoadingHairstyles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const promoFlatListRef = useRef<FlatList>(null);

  // Données des promotions
  const promotions = [
    {
      id: '1',
      title: 'Jour Spécial 30%',
      subtitle: '30% off',
      description: 'Bénéficiez d\'une réduction pour chaque commande de service ! Valable aujourd\'hui uniquement !',
      color: '#6C63FF'
    },
    {
      id: '2',
      title: 'Service Premium',
      subtitle: '20% off',
      description: 'Découvrez nos services premium avec une réduction exclusive !',
      color: '#FF6B6B'
    },
    {
      id: '3',
      title: 'Nouveaux Clients',
      subtitle: '15% off',
      description: 'Offre spéciale pour nos nouveaux clients ! Profitez-en maintenant !',
      color: '#4CAF50'
    }
  ];

  // Défilement automatique du carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prevIndex) => {
        const nextIndex = prevIndex === promotions.length - 1 ? 0 : prevIndex + 1;
        // Faire défiler vers la slide suivante avec un meilleur centrage
        if (promoFlatListRef.current) {
          promoFlatListRef.current.scrollToIndex({ 
            index: nextIndex, 
            animated: true,
            viewPosition: 0.5 // Centre la slide parfaitement
          });
        }
        return nextIndex;
      });
    }, 4000); // 4 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        console.log('Tentative de connexion à:', `${API_URL}/salons`);
        // Ajout d'un timestamp pour éviter le cache
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/salons?_=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        console.log('Réponse du serveur - Status:', response.status);

        // Vérifier si la réponse est en cache (304) ou si c'est une réponse normale (200)
        if (response.status === 304) {
          console.log('Réponse 304 - Utilisation du cache côté client');
          // Si vous avez un mécanisme de cache côté client, vous pouvez l'utiliser ici
          // Pour l'instant, on laisse le code continuer pour traiter la réponse en cache
        } else if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json().catch(err => {
          console.error('Erreur lors du parsing de la réponse JSON:', err);
          throw new Error('Format de réponse invalide du serveur');
        });

        console.log('Données des salons reçues:', data);

        if (data && data.success && Array.isArray(data.data)) {
          console.log(`Nombre de salons reçus: ${data.data.length}`);

          if (data.data.length === 0) {
            console.log('Aucun salon disponible dans la réponse');
          } else {
            // Ajout d'un log pour chaque salon et ses images
            data.data.forEach((salon: Salon, index: number) => {
              console.log(`Salon #${index + 1}:`, {
                name: salon.name,
                photos: salon.photos,
                address: salon.address,
                hairdresser: salon.hairdresser?.full_name
              });
            });
          }

          // Vérifier si les données sont différentes avant de mettre à jour l'état
          setSalons(prevSalons => {
            const newSalons = data.data;
            if (JSON.stringify(prevSalons) !== JSON.stringify(newSalons)) {
              console.log('Mise à jour des salons avec de nouvelles données');
              return newSalons;
            }
            console.log('Les données des salons sont identiques, pas de mise à jour');
            return prevSalons;
          });
          setLastUpdate(new Date());
        } else {
          const errorMsg = data?.message || 'Format de réponse inattendu du serveur';
          console.error('Erreur du serveur:', errorMsg, data);
          setError(errorMsg);
        }
      } catch (err) {
        setError('Impossible de se connecter au serveur');
        console.error('Error fetching salons:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHairstyles = async () => {
      try {
        setLoadingHairstyles(true);
        console.log('Tentative de récupération des coiffures depuis:', `${API_URL}/hairstyles`);
        const response = await fetch(`${API_URL}/hairstyles`);
        const responseData = await response.json();
        console.log('Réponse de l\'API pour les coiffures:', { status: response.status, data: responseData });
        if (response.ok && responseData.success) {
          const hairstylesData = responseData.data.hairstyles || [];
          console.log('Coiffures chargées avec succès:', hairstylesData);
          setHairstyles(Array.isArray(hairstylesData) ? hairstylesData : []);
        } else {
          const errorMessage = responseData?.message || 'Erreur inconnue lors du chargement des coiffures';
          console.error('Erreur lors du chargement des coiffures:', errorMessage);
          setError(`Impossible de charger les coiffures: ${errorMessage}`);
        }
      } catch (err) {
        console.error('Erreur API:', err);
        setError('Erreur de connexion au serveur');
      } finally {
        setLoadingHairstyles(false);
      }
    };

    // Fonction pour obtenir la position de l'utilisateur
    const getUserLocation = async () => {
      try {
        setLoadingNearby(true);
        setLocationError(null);
        
        // Demander la permission d'accéder à la localisation
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission de localisation refusée');
          setLoadingNearby(false);
          return;
        }

        // Obtenir la position actuelle
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        console.log('Position utilisateur:', { latitude, longitude });

        // Calculer la distance et trier les salons
        if (salons && salons.length > 0) {
          const salonsWithDistance = salons.map(salon => {
            const salonLat = parseFloat(salon.latitude as string);
            const salonLng = parseFloat(salon.longitude as string);
            
            if (isNaN(salonLat) || isNaN(salonLng)) {
              return { ...salon, distance: Infinity };
            }

            // Calcul de la distance en utilisant la formule de Haversine
            const R = 6371; // Rayon de la Terre en km
            const dLat = (salonLat - latitude) * Math.PI / 180;
            const dLng = (salonLng - longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(latitude * Math.PI / 180) * Math.cos(salonLat * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            return { ...salon, distance };
          });

          // Filtrer et trier les salons par distance (max 50km)
          const nearby = salonsWithDistance
            .filter(salon => salon.distance < 50 && salon.distance !== Infinity)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Prendre les 5 plus proches

          setNearbySalons(nearby);
          console.log('Salons proches trouvés:', nearby.length);
        }
      } catch (error) {
        console.error('Erreur de localisation:', error);
        setLocationError('Impossible d\'obtenir votre position');
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchSalons();
    fetchHairstyles();
    
    // Obtenir la localisation après le chargement des salons
    setTimeout(() => {
      getUserLocation();
    }, 1000);
  }, [salons]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Chargement des données utilisateur depuis AsyncStorage...');
        const userData = await AsyncStorage.getItem('userData');
        console.log('Données brutes de l\'utilisateur:', userData);

        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log('Données utilisateur parsées:', parsedData);
          setUser(parsedData);

          // Vérification des clés disponibles
          console.log('Clés disponibles dans les données utilisateur:', Object.keys(parsedData));
        } else {
          console.log('Aucune donnée utilisateur trouvée dans AsyncStorage');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };

    loadUserData();
  }, []);


  return (
    <SafeAreaView style={[homeScreenStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={homeScreenStyles.scrollView}>
        {/* En-tête */}
        <View style={homeScreenStyles.header}>
          <View>
            <Text style={[homeScreenStyles.greeting, { color: colors.textSecondary }]}>
              Bonjour, {user?.full_name || 'Client'}
            </Text>
            <Text style={[homeScreenStyles.title, { color: colors.text }]}>Trouvez votre salon</Text>
          </View>

          <TouchableOpacity
            style={homeScreenStyles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={homeScreenStyles.notificationBadge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={homeScreenStyles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={[homeScreenStyles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={homeScreenStyles.searchIcon} />
          <TextInput
            style={[homeScreenStyles.searchInput, { color: colors.text }]}
            placeholder="Rechercher un salon ou un service..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Carousel des promotions */}
        <View style={homeScreenStyles.section}>
          <FlatList
            ref={promoFlatListRef}
            data={promotions}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
              setCurrentPromoIndex(index);
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={[homeScreenStyles.promoCard, { backgroundColor: item.color }]}>
                <Text style={homeScreenStyles.promoSubtitle}>{item.subtitle}</Text>
                <Text style={homeScreenStyles.promoTitle}>{item.title}</Text>
                <Text style={homeScreenStyles.promoDescription}>{item.description}</Text>
                <View style={homeScreenStyles.pagination}>
                  {promotions.map((_, dotIndex) => (
                    <View 
                      key={dotIndex}
                      style={[
                        homeScreenStyles.paginationDot,
                        dotIndex === currentPromoIndex ? null : homeScreenStyles.paginationDotInactive
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={homeScreenStyles.promoCarousel}
            getItemLayout={(data, index) => ({
              length: width - 40,
              offset: (width - 40) * index + 20, // Ajout du padding initial
              index,
            })}
            snapToInterval={width - 40} 
            decelerationRate="fast" 
          />
        </View>

            {/* Filtres */}
        <View style={homeScreenStyles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeScreenStyles.filterContainer}>
            <TouchableOpacity 
              style={[homeScreenStyles.filterButton, { backgroundColor: colors.primary}]}
              onPress={() => {
                try {
                  const parentNavigation = navigation.getParent();
                  if (parentNavigation) {
                    parentNavigation.navigate('SpecialOffers');
                  } else {
                    navigation.navigate('SpecialOffers' as never);
                  }
                } catch (error) {
                  console.error('Erreur de navigation SpecialOffers:', error);
                }
              }}
            >
              <Text style={homeScreenStyles.filterButtonTextActive}>Offre spéciales</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[homeScreenStyles.filterButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                try {
                  const parentNavigation = navigation.getParent();
                  if (parentNavigation) {
                    parentNavigation.navigate('TrendingHairstyles');
                  } else {
                    navigation.navigate('TrendingHairstyles' as never);
                  }
                } catch (error) {
                  console.error('Erreur de navigation TrendingHairstyles:', error);
                }
              }}
            >
              <Text style={[homeScreenStyles.filterButtonText, { color: colors.text }]}>Tendances</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[homeScreenStyles.filterButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                try {
                  const parentNavigation = navigation.getParent();
                  if (parentNavigation) {
                    parentNavigation.navigate('Specialists');
                  } else {
                    navigation.navigate('Specialists' as never);
                    navigation.navigate('Specialists' as never);
                  }
                } catch (error) {
                  console.error('Erreur de navigation Specialists:', error);
                }
              }}
            >
              <Text style={[homeScreenStyles.filterButtonText, { color: colors.text }]}>Spécialiste</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Section "Près de vous" */}
        <View style={homeScreenStyles.section}>
          <View style={homeScreenStyles.sectionHeader}>
            <Text style={[homeScreenStyles.sectionTitle, { color: colors.text }]}>Près de vous</Text>
            <TouchableOpacity onPress={() => { /* Gérer l'action "Plus" */ }}>
              <Text style={[homeScreenStyles.seeAll, { color: colors.primary }]}>Plus</Text>
            </TouchableOpacity>
          </View>
          {loadingNearby ? (
            <ActivityIndicator size="large" color={colors.primary} style={homeScreenStyles.loader} />
          ) : locationError ? (
            <View style={homeScreenStyles.errorContainer}>
              <Text style={[homeScreenStyles.errorText, { color: colors.text }]}>{locationError}</Text>
              <TouchableOpacity 
                style={[homeScreenStyles.retryButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const getUserLocation = async () => {
                    try {
                      setLoadingNearby(true);
                      setLocationError(null);
                      
                      let { status } = await Location.requestForegroundPermissionsAsync();
                      if (status !== 'granted') {
                        setLocationError('Permission de localisation refusée');
                        setLoadingNearby(false);
                        return;
                      }

                      const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                      });

                      const { latitude, longitude } = location.coords;
                      setUserLocation({ latitude, longitude });

                      if (salons && salons.length > 0) {
                        const salonsWithDistance = salons.map(salon => {
                          const salonLat = parseFloat(salon.latitude as string);
                          const salonLng = parseFloat(salon.longitude as string);
                          
                          if (isNaN(salonLat) || isNaN(salonLng)) {
                            return { ...salon, distance: Infinity };
                          }

                          const R = 6371;
                          const dLat = (salonLat - latitude) * Math.PI / 180;
                          const dLng = (salonLng - longitude) * Math.PI / 180;
                          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                    Math.cos(latitude * Math.PI / 180) * Math.cos(salonLat * Math.PI / 180) *
                                    Math.sin(dLng/2) * Math.sin(dLng/2);
                          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                          const distance = R * c;

                          return { ...salon, distance };
                        });

                        const nearby = salonsWithDistance
                          .filter(salon => salon.distance < 50 && salon.distance !== Infinity)
                          .sort((a, b) => a.distance - b.distance)
                          .slice(0, 5);

                        setNearbySalons(nearby);
                      }
                    } catch (error) {
                      setLocationError('Impossible d\'obtenir votre position');
                    } finally {
                      setLoadingNearby(false);
                    }
                  };
                  getUserLocation();
                }}
              >
                <Text style={homeScreenStyles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : nearbySalons === null ? (
            <Text style={[homeScreenStyles.emptyText, { color: colors.textSecondary }]}>Chargement des salons proches...</Text>
          ) : nearbySalons.length === 0 ? (
            <Text style={[homeScreenStyles.emptyText, { color: colors.textSecondary }]}>Aucun salon trouvé à proximité (moins de 50km)</Text>
          ) : (
            <FlatList
              data={nearbySalons}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[homeScreenStyles.salonCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
                >
                  <View style={homeScreenStyles.salonImageContainer}>
                    <Image
                      source={(() => {
                        const imageUrl = item.photos?.[0];
                        if (imageUrl) {
                          const formattedUrl = formatImageUrl(imageUrl);
                          if (formattedUrl) {
                            return { uri: formattedUrl };
                          }
                        }
                        return defaultSalonImage;
                      })()}
                      style={homeScreenStyles.salonImage}
                      resizeMode="cover"
                      defaultSource={defaultSalonImage}
                      onError={(e) => {
                        console.log('Erreur de chargement de l\'image du salon:', item.name, e);
                      }}
                    />
                    <View style={[homeScreenStyles.ratingContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={[homeScreenStyles.ratingText, { color: '#fff', fontSize: 10 }]}>
                        {item.average_rating > 0 ? item.average_rating.toFixed(1) : 'Nouveau'}
                      </Text>
                    </View>
                    {item.distance !== undefined && (
                      <View style={[homeScreenStyles.distanceBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[homeScreenStyles.distanceText, { color: '#fff' }]}>
                          {item.distance < 1 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)}km`}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={homeScreenStyles.salonInfo}>
                    <Text style={[homeScreenStyles.salonName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[homeScreenStyles.salonAddress, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                    <Text style={[homeScreenStyles.hairdresserName, { color: colors.primary }]} numberOfLines={1}>
                      {item.hairdresser?.full_name || 'Coiffeur non spécifié'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={homeScreenStyles.salonsList}
            />
          )}
        </View>

        {/* Liste des salons */}
        <View style={homeScreenStyles.section}>
          <View style={homeScreenStyles.sectionHeader}>
            <Text style={[homeScreenStyles.sectionTitle, { color: colors.text }]}>Nos Salons</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllSalons')}>
              <Text style={[homeScreenStyles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={homeScreenStyles.loader} />
          ) : error ? (
            <View style={homeScreenStyles.errorContainer}>
              <Text style={[homeScreenStyles.errorText, { color: colors.text }]}>{error}</Text>
              <Text style={[homeScreenStyles.errorDetail, { color: colors.textSecondary }]}>Vérifiez que le serveur est en cours d'exécution sur {API_URL}</Text>
            </View>
          ) : salons === null ? (
            <Text style={[homeScreenStyles.emptyText, { color: colors.textSecondary }]}>Chargement des données en cours...</Text>
          ) : salons.length === 0 ? (
            <Text style={[homeScreenStyles.emptyText, { color: colors.textSecondary }]}>Aucun salon disponible pour le moment</Text>
          ) : (
            <FlatList
              data={salons.slice(0, 5)} // Afficher seulement les 5 premiers salons
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[homeScreenStyles.salonCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
                >
                  <View style={homeScreenStyles.salonImageContainer}>
                    <Image
                      source={(() => {
                        const imageUrl = item.photos?.[0];
                        if (imageUrl) {
                          const formattedUrl = formatImageUrl(imageUrl);
                          if (formattedUrl) {
                            return { uri: formattedUrl };
                          }
                        }
                        return defaultSalonImage;
                      })()}
                      style={homeScreenStyles.salonImage}
                      resizeMode="cover"
                      defaultSource={defaultSalonImage}
                      onError={(e) => {
                        console.log('Erreur de chargement de l\'image du salon:', item.name, e);
                      }}
                    />
                    <View style={homeScreenStyles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={[homeScreenStyles.ratingText, { color: colors.text }]}>
                        {item.average_rating > 0 ? item.average_rating.toFixed(1) : 'Nouveau'}
                      </Text>
                    </View>
                  </View>
                  <View style={homeScreenStyles.salonInfo}>
                    <Text style={[homeScreenStyles.salonName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[homeScreenStyles.salonAddress, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                    <Text style={[homeScreenStyles.hairdresserName, { color: colors.primary }]} numberOfLines={1}>
                      {item.hairdresser?.full_name || 'Coiffeur non spécifié'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={homeScreenStyles.salonsList}
            />
          )}
        </View>

        {/* Section des coiffures */}
        <View style={homeScreenStyles.section}>
          <View style={homeScreenStyles.sectionHeader}>
            <Text style={homeScreenStyles.sectionTitle}>Nos Coiffures</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HairstylesGallery')}>
              <Text style={homeScreenStyles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loadingHairstyles ? (
            <ActivityIndicator size="large" color="#6C63FF" style={homeScreenStyles.loader} />
          ) : error ? (
            <View style={homeScreenStyles.errorContainer}>
              <Text style={homeScreenStyles.errorText}>{error}</Text>
            </View>
          ) : !hairstyles || hairstyles.length === 0 ? (
            <Text style={homeScreenStyles.emptyText}>Aucune coiffure disponible</Text>
          ) : (
            <FlatList
              data={hairstyles ? hairstyles.slice(0, 5) : []}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={homeScreenStyles.hairstyleCard}
                  onPress={() => navigation.navigate('HairstyleDetail', { hairstyleId: item.id })}
                >
                  {item.photo ? (
                  <Image
                    source={{ uri: formatImageUrl(item.photo) || '' }}
                    style={homeScreenStyles.hairstyleImage}
                    resizeMode="cover"
                    onError={(e) => {
                      try {
                        console.error('Erreur de chargement de l\'image hairstyle:', {
                          error: e?.nativeEvent?.error || 'Unknown error',
                          hairstyle: item.name,
                          photo: item.photo
                        });
                      } catch (logError) {
                        console.error('Erreur lors du logging de l\'erreur hairstyle:', logError);
                      }
                    }}
                  />
                ) : (
                  <View style={[homeScreenStyles.hairstyleImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                    <Ionicons name="cut-outline" size={30} color="#999" />
                  </View>
                )}
                  <View style={homeScreenStyles.hairstyleInfo}>
                    <Text style={homeScreenStyles.hairstyleName} numberOfLines={1}>{item.name}</Text>
                    <Text style={homeScreenStyles.hairstyleDuration} numberOfLines={1}>
                      {item.estimated_duration} min • {item.price}€
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={homeScreenStyles.hairstylesList}
            />
          )}
        </View> 

        
  

        
      </ScrollView>
    </SafeAreaView>
  );
};
