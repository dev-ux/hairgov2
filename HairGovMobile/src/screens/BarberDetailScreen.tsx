import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_URL } from '../config/constants';

// Import du type de navigation global
import { RootStackParamList } from '../navigation/AppNavigator';

type BarberDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BarberDetail'>;
type BarberDetailScreenRouteProp = RouteProp<RootStackParamList, 'BarberDetail'>;

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo: string | null;
  created_at: string;
}

interface HairdresserDetail {
  id: string;
  user: User;
  profession: string | null;
  average_rating: number;
  total_jobs: number;
  is_available: boolean;
  address: string | null;
  created_at: string;
  // Champs optionnels qui pourraient ne pas être présents
  description?: string;
  rating_count?: number;
}

const BarberDetailScreen = () => {
  const navigation = useNavigation<BarberDetailScreenNavigationProp>();
  const route = useRoute<BarberDetailScreenRouteProp>();
  
  // S'assurer que barberId est une chaîne de caractères
  const barberId = String(route.params?.barberId || '');
  
  // Vérifier si l'ID est valide
  if (!barberId) {
    console.error('ID du coiffeur manquant ou invalide');
    // Gérer l'erreur, par exemple en redirigeant vers l'écran précédent
    React.useEffect(() => {
      navigation.goBack();
    }, [navigation]);
    
    return (
      <View style={styles.centered}>
        <Text>ID du coiffeur invalide</Text>
      </View>
    );
  }
  
  const [loading, setLoading] = useState(true);
  const [barber, setBarber] = useState<HairdresserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarberDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Tentative de chargement des détails du coiffeur avec l'ID:`, barberId, 'Type:', typeof barberId);
        
        // Nettoyer l'ID pour s'assurer qu'il est valide pour l'URL
        const cleanedBarberId = barberId.replace(/[^a-zA-Z0-9-]/g, '');
        const url = `${API_URL}/hairdressers/${cleanedBarberId}`;
        console.log('URL de la requête:', url);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Réponse reçue, status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erreur de réponse:', response.status, errorText);
          throw new Error(`Erreur HTTP ${response.status}: ${errorText || 'Impossible de charger les détails du coiffeur'}`);
        }
        
        const data = await response.json();
        console.log('Données reçues:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data) {
          // Extraire les données de base
          const hairdresser = data.data;
          const user = hairdresser.user || {};
          
          // Construire l'objet barberData en utilisant les données de l'API
          const barberData: HairdresserDetail = {
            id: hairdresser.id,
            user: {
              id: user.id || hairdresser.id,
              full_name: user.full_name || 'Nom inconnu',
              email: user.email || '',
              phone: user.phone || '',
              profile_photo: user.profile_photo || null,
              created_at: user.created_at || hairdresser.created_at
            },
            profession: hairdresser.profession || 'Coiffeur',
            address: hairdresser.address || 'Adresse non disponible',
            is_available: hairdresser.is_available || false,
            average_rating: hairdresser.average_rating || 0,
            total_jobs: hairdresser.total_jobs || 0,
            created_at: hairdresser.created_at,
            description: hairdresser.description || 'Aucune description disponible.',
            rating_count: hairdresser.rating_count || 0
          };   
          console.log('Données du coiffeur formatées:', barberData);
          setBarber(barberData);
        } else {
          console.warn('Réponse inattendue du serveur:', data);
          throw new Error('Format de réponse inattendu du serveur');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des détails du coiffeur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchBarberDetails();
  }, [barberId]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={20} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={20} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={20} color="#CCCCCC" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!barber) {
    return (
      <View style={styles.centered}>
        <Text>Coiffeur non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* En-tête personnalisé avec bouton de retour */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du coiffeur</Text>
        <View style={{ width: 24 }} /> {/* Pour équilibrer le flexbox */}
      </View>
      
      <ScrollView>
      {/* En-tête avec photo de couverture et photo de profil */}
      <View style={styles.header}>
        <Image
          source={barber.user.profile_photo ? { uri: barber.user.profile_photo } : require('../assets/default-avatar.png')}
          style={styles.profileImage}
          defaultSource={require('../assets/default-avatar.png')}
        />
        <Text style={styles.name}>{barber.user.full_name}</Text>
        <Text style={styles.profession}>{barber.profession}</Text>
        
        <View style={styles.ratingContainer}>
          {renderStars(barber.average_rating)}
          <Text style={styles.ratingText}>({barber.rating_count} avis)</Text>
        </View>
        
        <View style={[styles.availabilityBadge, { backgroundColor: barber.is_available ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.availabilityText}>
            {barber.is_available ? 'Disponible' : 'Non disponible'}
          </Text>
        </View>
      </View>

      {/* Section Détails */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Text style={styles.aboutText}>
          {barber.description || 'Aucune description disponible pour le moment.'}
        </Text>
      </View>

      {/* Section Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coordonnées</Text>
        
        {barber.address && (
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.contactText}>{barber.address}</Text>
          </View>
        )}
        
        {barber.user.phone && (
          <View style={styles.infoItem}>
            <Ionicons name="call" size={20} color="#666" />
            <Text style={styles.infoText}>{barber.user.phone || 'Non renseigné'}</Text>
          </View>
        )}
        
        {barber.user.email && (
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={20} color="#666" />
            <Text style={styles.infoText}>{barber.user.email || 'Non renseigné'}</Text>
          </View>
        )}
      </View>

      {/* Bouton de prise de rendez-vous */}
      <TouchableOpacity 
        style={[styles.button, !barber.is_available && styles.buttonDisabled]}
        disabled={!barber.is_available}
        onPress={() => {
          navigation.navigate('Booking', { 
            hairdresserId: barber.id,
            hairdresserName: barber.user?.full_name || 'le coiffeur'
          });
        }}
      >
        <Text style={styles.buttonText}>
          {barber.is_available ? 'Prendre rendez-vous' : 'Non disponible pour le moment'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#fff',
    // Suppression des propriétés non supportées par Image
  } as ImageStyle,
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  profession: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 5,
    color: '#666',
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  availabilityText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  aboutText: {
    color: '#666',
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
  },
  contactText: {
    marginLeft: 10,
    color: '#555',
    flex: 1,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pricingContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pricingHeader: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  pricingHeaderText: {
    flex: 1,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  pricingRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  altRow: {
    backgroundColor: '#f9f9f9',
  },
  serviceName: {
    flex: 1,
    color: '#333',
  },
  price: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
});

export default BarberDetailScreen;
