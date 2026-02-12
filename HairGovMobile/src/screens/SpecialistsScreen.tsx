import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/constants';

interface Specialist {
  id: string;
  full_name: string;
  profession: string;
  experience_years: number;
  average_rating: number;
  total_jobs: number;
  profile_photo: string;
  salon_name?: string;
  salon_address?: string;
  is_available: boolean;
  price_range?: string;
  user?: {
    id: string;
    full_name: string;
    profile_photo?: string;
  };
}

const SpecialistsScreen = () => {
  const navigation = useNavigation();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpecialists();
  }, []); // Tableau vide pour n'exécuter qu'une seule fois

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Debug: Chargement des spécialistes...');
      const response = await fetch(`${API_URL}/hairdressers?registration_status=approved`);
      const data = await response.json();
      
      
      // Accéder aux données dans data.data.hairdressers
      let hairdressers = [];
      if (data && data.success && data.data && Array.isArray(data.data.hairdressers)) {
        hairdressers = data.data.hairdressers.map((h: any) => {
          console.log('Données brutes du coiffeur:', h);
          
          return {
            id: h.id, // Utiliser directement l'ID du coiffeur
            full_name: h.user?.full_name || h.full_name || 'Nom inconnu',
            profession: h.profession || 'Coiffeur',
            average_rating: h.average_rating || 0,
            total_jobs: h.total_jobs || 0,
            profile_photo: h.user?.profile_photo || h.profile_photo || null,
            salon_name: h.salon_name || null,
            salon_address: h.salon_address || null,
            is_available: h.is_available !== undefined ? h.is_available : false,
            price_range: h.price_range !== undefined ? h.price_range : null,
            user: h.user
          };
        });
      } else {
        console.error('🔍 Debug - Structure de réponse inattendue:', data);
        setError('Format de réponse invalide');
        return;
      }
      
      // Filtrer les coiffeurs avec une note >= 3.5
      const filteredSpecialists = hairdressers.filter((specialist: any) => 
        specialist.average_rating >= 3.5
      );
      console.log(`🔍 Debug: ${hairdressers.length} coiffeurs trouvés, ${filteredSpecialists.length} avec note >= 3.5`);
      console.log('🔍 IDs des coiffeurs filtrés:', filteredSpecialists.map((s: any) => ({ id: s.id, name: s.full_name })));
      setSpecialists(filteredSpecialists);
      
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement des spécialistes:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialist = ({ item }: { item: Specialist }) => (
    <TouchableOpacity 
      style={styles.specialistCard}
      onPress={() => {
        console.log('Navigation vers BarberDetail avec ID:', item.id);
        navigation.navigate('BarberDetail' as any, { barberId: item.id });
      }}
    >
      <View style={styles.headerSection}>
        <Image 
          source={item.profile_photo ? { uri: item.profile_photo } : require('../assets/url_de_l_image_1.jpg')}
          style={styles.specialistImage}
          resizeMode="cover"
        />
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityText}>
            {item.is_available ? 'Disponible' : 'Occupé'}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentSection}>
        <Text style={styles.specialistName}>{item.full_name}</Text>
        <Text style={styles.specialty}>{item.profession}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.average_rating.toFixed(1)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.total_jobs} clients</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.experience_years} ans</Text>
          </View>
        </View>
        
        {item.salon_name && (
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{item.salon_name}</Text>
            </View>
            {item.salon_address && (
              <Text style={styles.addressText}>{item.salon_address}</Text>
            )}
          </View>
        )}
        
        {item.price_range && (
          <View style={styles.priceContainer}>
            <Ionicons name="pricetag-outline" size={14} color="#FF6B6B" />
            <Text style={styles.priceText}>{item.price_range}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement des spécialistes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={50} color="#999" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSpecialists}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spécialistes</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={specialists}
        renderItem={renderSpecialist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  specialistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSection: {
    position: 'relative',
  },
  specialistImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  contentSection: {
    padding: 16,
  },
  specialistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 4,
  },
});

export default SpecialistsScreen;
