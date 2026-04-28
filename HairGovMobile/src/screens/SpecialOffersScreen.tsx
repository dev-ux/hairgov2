import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/constants';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  original_price: number;
  discounted_price: number;
  image?: string;
  salon_name: string;
  salon_address: string;
  end_date: string;
}

const SpecialOffersScreen = () => {
  const navigation = useNavigation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpecialOffers();
  }, []);

  const loadSpecialOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/special-offers`);
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.data);
      } else {
        setError('Impossible de charger les offres spéciales');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement des offres:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity style={styles.offerCard}>
      <Image 
        source={item.image ? { uri: item.image } : require('../assets/url_de_l_image_1.jpg')}
        style={styles.offerImage}
        resizeMode="cover"
      />
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>{item.original_price}€</Text>
          <Text style={styles.discount}>-{item.discount}%</Text>
          <Text style={styles.discountedPrice}>{item.discounted_price}€</Text>
        </View>
        
        <View style={styles.salonInfo}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.salonName}>{item.salon_name}</Text>
        </View>
        
        <Text style={styles.endDate}>Valable jusqu'au {new Date(item.end_date).toLocaleDateString('fr-FR')}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement des offres...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={50} color="#999" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSpecialOffers}>
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
        <Text style={styles.headerTitle}>Offres Spéciales</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
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
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerContent: {
    padding: 16,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discount: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  salonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salonName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  endDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SpecialOffersScreen;
