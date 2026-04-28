import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Salon } from './HomeScreen';
import { API_URL } from '../config/constants';
import { FavoriteButton } from '../components/FavoriteButton';
import { useTheme } from '../contexts/ThemeContext';

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (url: string) => {
  try {
    if (!url) {
      console.log('Aucune URL fournie');
      return null;
    }

    console.log('URL originale reçue:', url);

    // Nettoyer l'URL
    let cleanUrl = url.trim();
    
    // Si c'est une URL file:// (photo locale), la retourner telle quelle
    if (cleanUrl.startsWith('file://')) {
      console.log('URL locale détectée:', cleanUrl);
      return cleanUrl;
    }

    // Si l'URL est déjà complète (http/https), la retourner telle quelle
    if (cleanUrl.startsWith('http')) {
      console.log('URL complète détectée:', cleanUrl);
      return cleanUrl;
    }

    // Si l'URL commence par /uploads/, construire l'URL complète
    if (cleanUrl.startsWith('/uploads/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${cleanUrl}`;
      console.log('URL uploads détectée, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL est un chemin relatif simple, construire l'URL complète
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    const fullUrl = `${baseUrl}/uploads/photos/${cleanUrl}`;
    console.log('URL relative détectée, URL finale:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Erreur lors du formatage de l\'URL:', error);
    return null;
  }
};

// Solution temporaire : mapper les URLs manquantes vers des images existantes
const getWorkingImageUrl = (originalUrl: string): string => {
  // Si c'est déjà une URL complète (Cloudinary), la retourner directement
  if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
    console.log('AllSalonsScreen - URL complète détectée:', originalUrl);
    return originalUrl;
  }
  
  const urlMapping: { [key: string]: string } = {
    'hairstyle-1770513464791-250ac316-33ea-4be5-a6e8-35e8472656c3.jpg': 'photos-1762358785558-9fb0fd5d-e8a9-4f47-9bc4-c2ec18a12da8.jpg',
    'hairstyle-1770513424792-cdb056c9-fd44-40c6-8269-f4d02a5ed613.jpg': 'photos-1762358872925-cc14ac13-8b31-4145-abdf-ad86af4b1a9a.jpg'
  };
  
  // Si l'URL commence par /uploads/photos/, extraire juste le nom du fichier
  let filename = originalUrl;
  if (originalUrl.startsWith('/uploads/photos/')) {
    filename = originalUrl.replace('/uploads/photos/', '');
  } else if (originalUrl.includes('/')) {
    filename = originalUrl.split('/').pop() || '';
  }
  
  const workingFilename = urlMapping[filename] || filename;
  
  // Construire l'URL finale correcte
  const baseUrl = 'https://hairgov2.onrender.com';
  const finalUrl = `${baseUrl}/uploads/photos/${workingFilename}`;
  console.log('URL finale construite:', finalUrl);
  return finalUrl;
};

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ExtendedSalon extends Salon {
  services?: Service[];
  rating?: number;
  reviewCount?: number;
}

export default function AllSalonsScreen(): React.ReactElement {
  const [salons, setSalons] = useState<ExtendedSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [maxPrice, setMaxPrice] = useState('');
  const [venueType, setVenueType] = useState('all');
  const [selectedServices, setSelectedServices] = useState<Record<string, string>>({});
  
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllSalons'>;
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const defaultSalonImage = require('../assets/url_de_l_image_1.jpg');
  
  const handleImageError = (salonId: string) => {
    console.log(`Erreur de chargement de l'image pour le salon ${salonId}, utilisation de l'image par défaut`);
    setImageErrors(prev => ({
      ...prev,
      [salonId]: true
    }));
  };

  const handleServiceSelect = (salonId: string, serviceId: string, time: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [`${salonId}-${serviceId}`]: time
    }));
  };

  const renderTimeSlots = (salonId: string, serviceId: string) => {
    const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM'];
    const selectedKey = `${salonId}-${serviceId}`;
    const selectedTime = selectedServices[selectedKey];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedTime === time && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleServiceSelect(salonId, serviceId, time)}
          >
            <Text style={[
              styles.timeSlotText,
              selectedTime === time && { color: '#fff' }
            ]}>{time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCarousel = (photos: string[]) => {
    if (!photos || photos.length === 0) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselContainer}>
        {photos.map((photo, index) => {
          const imageUrl = getWorkingImageUrl(photo);
          return (
            <Image
              key={index}
              source={imageErrors[`carousel-${index}`] || !imageUrl 
                ? defaultSalonImage 
                : { uri: imageUrl }}
              style={styles.carouselImage}
              resizeMode="cover"
              onError={() => setImageErrors(prev => ({ ...prev, [`carousel-${index}`]: true }))}
              defaultSource={defaultSalonImage}
            />
          );
        })}
      </ScrollView>
    );
  };


  useEffect(() => {
    const fetchSalons = async () => {
      try {
        console.log('Chargement des salons depuis:', `${API_URL}/salons`);
        const response = await fetch(`${API_URL}/salons?_=${new Date().getTime()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('Réponse du serveur - Status:', response.status);
        
        if (!response.ok && response.status !== 304) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Réponse de l\'API:', result);
        
        if (result && result.success && Array.isArray(result.data)) {
          console.log(`Nombre de salons reçus: ${result.data.length}`);
          // Ajouter des services factices pour la démo
          const salonsWithServices = result.data.map((salon: any) => ({
            ...salon,
            services: [
              { id: '1', name: 'Women haircut', duration: 60, price: 45 },
              { id: '2', name: 'Root Touchup', duration: 30, price: 35 },
              { id: '3', name: 'Hair Styling', duration: 45, price: 40 },
              { id: '4', name: 'Hair Color', duration: 90, price: 80 }
            ],
            rating: Math.random() * 2 + 3, // Note entre 3 et 5
            reviewCount: Math.floor(Math.random() * 1000) + 100
          }));
          setSalons(salonsWithServices);
          setError(null);
        } else {
          throw new Error('Format de réponse inattendu de l\'API');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des salons:', err);
        setError('Impossible de charger les salons. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  const renderSalonItem = ({ item }: { item: ExtendedSalon }) => {
    return (
      <View style={[styles.salonCard, { backgroundColor: colors.card }]}>
        {/* Carrousel d'images */}
        {renderCarousel(item.photos)}
        
        <View style={styles.salonContent}>
          {/* Header du salon */}
          <View style={styles.salonHeader}>
            <View style={styles.salonTitleContainer}>
              <Text style={[styles.salonName, { color: colors.text }]}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {item.rating?.toFixed(1) || '4.5'} ({item.reviewCount || 100})
                </Text>
              </View>
            </View>
            <FavoriteButton itemId={item.id} itemType="salon" size={20} />
          </View>
          
          <Text style={[styles.salonAddress, { color: colors.textSecondary }]}>
            {item.address}
          </Text>

          {/* Services */}
          <View style={styles.servicesContainer}>
            <Text style={[styles.servicesTitle, { color: colors.text }]}>Services</Text>
            {item.services?.slice(0, 2).map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDetails, { color: colors.textSecondary }]}>
                    {service.duration} min • ${service.price}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Time slots */}
          <View style={styles.timeSlotsSection}>
            <Text style={[styles.timeSlotsTitle, { color: colors.text }]}>Available Times</Text>
            {renderTimeSlots(item.id, item.services?.[0]?.id || '1')}
          </View>

          {/* Bouton Book Now */}
          <TouchableOpacity 
            style={[styles.bookButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>All Salons</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Barre de recherche */}
      <View style={[styles.searchSection, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search salons..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filtres */}
      <View style={[styles.filtersSection, { backgroundColor: colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
            <Text style={[styles.filterText, { color: colors.text }]}>Sort by</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
            <Text style={[styles.filterText, { color: colors.text }]}>Max price</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
            <Text style={[styles.filterText, { color: colors.text }]}>Venue type</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Liste des salons */}
      <FlatList
        data={salons}
        renderItem={renderSalonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    marginTop: 30,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    marginRight: 5,
  },
  listContent: {
    padding: 20,
  },
  salonCard: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  carouselContainer: {
    height: 200,
  },
  carouselImage: {
    width: width - 40,
    height: 200,
  },
  salonContent: {
    padding: 20,
  },
  salonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  salonTitleContainer: {
    flex: 1,
  },
  salonName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  salonAddress: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  serviceItem: {
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '500',
  },
  serviceDetails: {
    fontSize: 14,
  },
  timeSlotsSection: {
    marginBottom: 16,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

