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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Salon } from './HomeScreen';
import { API_URL } from '../config/constants';

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
  
  // Extraire le nom du fichier de l'URL
  const filename = originalUrl.split('/').pop() || '';
  const workingFilename = urlMapping[filename] || filename;
  
  // Retourner l'URL Cloudinary si mappée, sinon l'URL locale
  return workingFilename.startsWith('http') ? workingFilename : `https://hairgov2.onrender.com/uploads/photos/${workingFilename}`;
};

const { width } = Dimensions.get('window');

export default function AllSalonsScreen() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllSalons'>;
  const navigation = useNavigation<NavigationProp>();
  const defaultSalonImage = require('../assets/url_de_l_image_1.jpg');
  
  const colors = {
    text: '#333333'
  };
  
  const handleImageError = (salonId: string) => {
    console.log(`Erreur de chargement de l'image pour le salon ${salonId}, utilisation de l'image par défaut`);
    setImageErrors(prev => ({
      ...prev,
      [salonId]: true
    }));
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
          setSalons(result.data);
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

  const renderSalonItem = ({ item }: { item: Salon }) => {
    const originalImageUrl = item.photos?.[0] ? formatImageUrl(item.photos[0]) : null;
    const imageUrl = originalImageUrl ? getWorkingImageUrl(item.photos[0]) : null;
    
    return (
      <TouchableOpacity
        style={styles.salonCard}
        onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
      >
        <Image 
          source={imageErrors[item.id] || !imageUrl 
            ? defaultSalonImage 
            : { uri: imageUrl }}
          style={styles.salonImage} 
          resizeMode="cover"
          onError={() => handleImageError(item.id)}
          defaultSource={defaultSalonImage}
        />
        <View style={styles.salonInfo}>
          <Text style={styles.salonName}>{item.name}</Text>
          <Text style={styles.salonAddress} numberOfLines={1}>
            {item.address}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.average_rating ? item.average_rating.toFixed(1) : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} style={{ marginTop: 50 }} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, marginTop: 50 }]}>Tous les Salons</Text>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
         
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  salonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  salonImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  salonInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewModeButton: {
    padding: 8,
  },
});
