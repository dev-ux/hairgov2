import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../config/constants';
import { FavoriteButton } from '../components/FavoriteButton';

// Type pour la navigation
type BarberListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Barber'>;

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo: string | null;
}

interface Hairdresser {
  id: string;
  full_name: string;
  average_rating: number;
  total_jobs: number;
  profile_photo?: string | null;
  profession?: string;
  address?: string;
  is_available: boolean;
  user?: User; // Ajout de la propriété user optionnelle
}

const BarberListScreen: React.FC = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<BarberListScreenNavigationProp>();

  // Fonction pour récupérer tous les coiffeurs
  const fetchActiveHairdressers = async (): Promise<Hairdresser[]> => {
    try {
      const url = `${API_URL}/hairdressers`;
      console.log(`Tentative de connexion à: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse:', response.status, errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Données brutes de l\'API (BarberListScreen):', JSON.stringify(responseData, null, 2));

      // Vérifier si la réponse contient un tableau de coiffeurs dans data.hairdressers
      if (responseData.success && responseData.data && Array.isArray(responseData.data.hairdressers)) {
        console.log('Premier coiffeur de la liste:', JSON.stringify(responseData.data.hairdressers[0], null, 2));
        console.log(`🔍 Debug: ${responseData.data.hairdressers.length} coiffeurs trouvés au total`);
        
        // Transformer les données pour correspondre à l'interface Hairdresser
        return responseData.data.hairdressers.map((h: any) => {
          // L'ID du coiffeur est dans h.user.id, pas dans h.id directement
          const hairdresserId = h.user?.id || h.id;
          console.log('ID du coiffeur dans la liste:', hairdresserId, 'Type:', typeof hairdresserId);
          
          return {
            id: hairdresserId,
            full_name: h.user?.full_name || 'Nom inconnu',
            profession: h.profession || 'Coiffeur',
            average_rating: h.average_rating || 0,
            total_jobs: h.total_jobs || 0,
            profile_photo: h.user?.profile_photo || null,
            address: h.address || 'Adresse non disponible',
            is_available: h.is_available || false,
            // Garder une référence à l'objet user complet pour le détail
            user: h.user
          };
        });
      }

      return [];
    } catch (err) {
      console.error('Erreur lors de la récupération des coiffeurs:', err);
      throw err;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadHairdressers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les coiffeurs actifs
        const activeHairdressers = await fetchActiveHairdressers();

        if (isMounted) {
          setHairdressers(Array.isArray(activeHairdressers) ? activeHairdressers : []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des coiffeurs:', err);
        if (isMounted) {
          setError('Impossible de charger la liste des coiffeurs. Veuillez réessayer plus tard.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHairdressers();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderRatingStars = (rating: number) => {
    console.log('renderRatingStars appelé avec rating:', rating);
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={20} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={20} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={20} color="#FFD700" />);
      }
    }

    console.log('Étoiles générées:', stars.length, 'pour rating:', rating);
    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Hairdresser }) => {
    console.log('=== DONNÉES COMPLÈTES DU COIFFEUR ===');
    console.log('ID:', item.id);
    console.log('Nom:', item.full_name);
    console.log('Rating:', item.average_rating);
    console.log('Total jobs:', item.total_jobs);
    console.log('=====================================');
    console.log('ID du coiffeur cliqué:', item.id, 'Type:', typeof item.id);
    // S'assurer que l'ID est une chaîne de caractères
    const barberId = String(item.id);
    console.log('ID formaté pour la navigation:', barberId);

    const handlePress = () => {
      navigation.navigate('BarberDetail', { barberId });
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={item.profile_photo ? { uri: item.profile_photo } : require('../assets/default-avatar.png')}
            style={styles.avatar}
            resizeMode="cover"
            onError={() => {
            }}
            defaultSource={require('../assets/default-avatar.png')}
          />
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton itemId={item.id} itemType="hairdresser" size={16} />
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.full_name}</Text>
          {renderRatingStars(item.average_rating || 0)}
          {item.total_jobs !== undefined && (
            <Text style={styles.jobCount}>{item.total_jobs} prestations</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={50} color="#999" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const filteredHairdressers = hairdressers.filter((hairdresser: Hairdresser) =>
    hairdresser.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hairdresser.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hairdresser.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(`🔍 Debug BarberList: ${hairdressers.length} coiffeurs totaux, ${filteredHairdressers.length} après recherche`);

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un coiffeur..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {filteredHairdressers.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cut-outline" size={50} color="#999" />
          <Text style={styles.emptyText}>Aucun coiffeur trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHairdressers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 50,
  },
  listContainer: {
    padding: 16,
  },
  gridContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    margin: 4,
    minHeight: 180,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  // Style supprimé car nous utilisons maintenant une image par défaut
  infoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#fff9',
    padding: 4,
    borderRadius: 4,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  jobCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 16,
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 2,
  },
});

export default BarberListScreen;
