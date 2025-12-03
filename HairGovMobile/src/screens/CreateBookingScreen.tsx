import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/constants';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 30) / 2; // 2 colonnes avec espacement

interface Salon {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  photos: string[];
  average_rating?: number;
}

const CreateBookingScreen = ({ navigation }: any) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/salons`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setSalons(result.data);
      } else {
        setError('Erreur lors de la récupération des salons');
      }
      
    } catch (err) {
      console.error('Erreur API salons:', err);
      setError('Impossible de charger les salons');
    } finally {
      setLoading(false);
    }
  };

  const handleSalonPress = (salon: Salon) => {
    // Naviguer vers les détails du salon ou créer une réservation
    Alert.alert(
      salon.name,
      'Que souhaitez-vous faire ?',
      [
        { text: 'Voir les détails', onPress: () => console.log('Voir détails') },
        { text: 'Réserver', onPress: () => navigation.navigate('BookingForm', { 
          salon: {
            id: salon.id,
            name: salon.name,
            address: salon.address,
            latitude: salon.latitude,
            longitude: salon.longitude,
          }
        })},
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const formatImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
  
    // Construire l'URL de base pour les fichiers statiques (sans /api/v1)
    const baseUrl = API_URL.replace('/api/v1', '');
  
    // Si l'URL commence par "photos-", construire l'URL complète vers /uploads/photos/
    if (photoUrl.startsWith('photos-')) {
      return `${baseUrl}/uploads/photos/${photoUrl}`;
    }
  
    // Si c'est juste un nom de fichier, construire l'URL complète
    if (!photoUrl.includes('/')) {
      return `${baseUrl}/uploads/photos/${photoUrl}`;
    }
  
    // Sinon, ajouter l'URL de base
    return `${baseUrl}${photoUrl}`;
  };

  const renderSalonItem = ({ item }: { item: Salon }) => {
    const imageUrl = formatImageUrl(item.photos[0]);
    
    return (
      <TouchableOpacity 
        style={styles.salonItem}
        onPress={() => handleSalonPress(item)}
      >
        <View style={styles.salonImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.salonImage}
              defaultSource={require('../assets/url_de_l_image_1.jpg')}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="business-outline" size={40} color="#ccc" />
            </View>
          )}
        </View>
        
        <View style={styles.salonInfo}>
          <Text style={styles.salonName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.salonAddress} numberOfLines={2}>{item.address}</Text>
          
          <View style={styles.salonMeta}>
            {item.average_rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFA500" />
                <Text style={styles.ratingText}>{item.average_rating.toFixed(1)}</Text>
              </View>
            )}
            
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.distanceText}>2.5 km</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choisir un salon</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement des salons...</Text>
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
        <Text style={styles.headerTitle}>Choisir un salon</Text>
        <View style={styles.placeholder} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSalons}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={salons}
          renderItem={renderSalonItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucun salon disponible</Text>
            </View>
          }
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  salonItem: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  salonImageContainer: {
    width: '100%',
    height: 120,
  },
  salonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonInfo: {
    padding: 12,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    minHeight: 32, // Pour 2 lignes
  },
  salonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CreateBookingScreen;
