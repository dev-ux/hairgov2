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
    
    // Nettoyer l'URL (supprimer les accolades, espaces et / au début)
    let cleanUrl = url.replace(/[{}]/g, '').trim();
    
    // Si l'URL est déjà une URL complète, la retourner telle quelle
    if (cleanUrl.startsWith('http')) {
      console.log('URL complète détectée:', cleanUrl);
      return cleanUrl;
    }
    
    // Extraire le nom du fichier de l'URL
    const fileName = cleanUrl.split('/').pop();
    
    // Construire l'URL complète en utilisant la base de l'API
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    const fullUrl = `${baseUrl}/uploads/photos/${fileName}`;
    
    console.log('URL finale construite:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Erreur lors du formatage de l\'URL:', error);
    return null;
  }
};

const { width } = Dimensions.get('window');

export default function AllSalonsScreen() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllSalons'>;
  const navigation = useNavigation<NavigationProp>();
  const defaultSalonImage = require('../assets/url_de_l_image_1.jpg');
  
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
    const imageUrl = item.photos?.[0] ? formatImageUrl(item.photos[0]) : null;
    
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tous les salons</Text>
        <View style={styles.headerRight} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 24,
  },
  backButton: {
    padding: 8,
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
});
