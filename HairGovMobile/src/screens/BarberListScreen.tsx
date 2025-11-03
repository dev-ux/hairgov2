import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Type pour la navigation
type BarberListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Barber'>;

// Configuration de l'API (à remplacer par votre URL réelle)
const API_URL = 'http://localhost:3000';

interface Hairdresser {
  id: string;
  full_name: string;
  average_rating: number;
  total_jobs: number;
  profile_photo?: string;
  profession?: string;
  address?: string;
}

const BarberListScreen = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<BarberListScreenNavigationProp>();

  useEffect(() => {
    const fetchHairdressers = async () => {
      try {
        // Coordonnées par défaut (Paris)
        const latitude = 48.8566;
        const longitude = 2.3522;
        const radius = 10; // en kilomètres
        
        const url = `${API_URL}/api/v1/bookings/nearby-hairdressers?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
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
        
        const data = await response.json();
        console.log('Réponse de l\'API:', data);
        
        if (data && Array.isArray(data)) {
          setHairdressers(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setHairdressers(data.data);
        } else {
          console.warn('Format de réponse inattendu:', data);
          setHairdressers([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Erreur lors du chargement des coiffeurs:', errorMessage);
        setError(`Impossible de charger les coiffeurs: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHairdressers();
  }, []);

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" />);
      }
    }
    
    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
      </View>
    );
  };

  const renderHairdresser = ({ item }: { item: Hairdresser }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Booking', { hairdresserId: item.id, hairdresserName: item.full_name })}
    >
      <Image 
        source={item.profile_photo 
          ? { uri: item.profile_photo } 
          : require('../assets/images/onboarding1.png')} 
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.full_name}</Text>
        {item.profession && <Text style={styles.profession}>{item.profession}</Text>}
        {renderRatingStars(item.average_rating || 0)}
        <Text style={styles.jobs}>{item.total_jobs || 0} prestations</Text>
        {item.address && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.address}>{item.address}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

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

  // Filtrer les coiffeurs en fonction de la recherche
  const filteredHairdressers = hairdressers.filter(hairdresser => 
    hairdresser.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hairdresser.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hairdresser.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un salon ou un service..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      
      <FlatList
        data={filteredHairdressers}
        renderItem={renderHairdresser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="cut-outline" size={50} color="#999" />
            <Text style={styles.emptyText}>Aucun coiffeur disponible</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 10,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  infoContainer: {
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
  },
  jobs: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
    marginTop: 50,
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
});

export default BarberListScreen;
