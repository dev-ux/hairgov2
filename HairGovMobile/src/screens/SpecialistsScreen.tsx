import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/constants';

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  experience_years: number;
  rating: number;
  total_clients: number;
  profile_photo: string;
  salon_name: string;
  salon_address: string;
  availability: boolean;
  price_range: string;
}

const SpecialistsScreen = () => {
  const navigation = useNavigation();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/specialists`);
      const data = await response.json();
      
      if (data.success) {
        setSpecialists(data.data);
      } else {
        setError('Impossible de charger les spécialistes');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement des spécialistes:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialist = ({ item }: { item: Specialist }) => (
    <TouchableOpacity style={styles.specialistCard}>
      <View style={styles.headerSection}>
        <Image 
          source={{ uri: item.profile_photo }}
          style={styles.specialistImage}
          resizeMode="cover"
        />
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityText}>
            {item.availability ? 'Disponible' : 'Occupé'}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentSection}>
        <Text style={styles.specialistName}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.total_clients} clients</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.experience_years} ans</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.salon_name}</Text>
          </View>
          <Text style={styles.addressText}>{item.salon_address}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Ionicons name="pricetag-outline" size={14} color="#FF6B6B" />
          <Text style={styles.priceText}>{item.price_range}</Text>
        </View>
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
