import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Données temporaires - À remplacer par vos données réelles ou un appel API
const categories = [
  { id: '1', name: 'Coiffure', icon: 'cut' },
  { id: '2', name: 'Salon', icon: 'home' },
  { id: '3', name: 'Beauté', icon: 'spa' },
  { id: '4', name: 'Soins', icon: 'flower' },
];

const popularSalons = [
  {
    id: '1',
    name: 'Salon Élégance',
    rating: 4.8,
    distance: '0.5 km',
    image: 'https://via.placeholder.com/150',
    category: 'Coiffure'
  },
  {
    id: '2',
    name: 'Le Barbier Moderne',
    rating: 4.9,
    distance: '1.2 km',
    image: 'https://via.placeholder.com/150',
    category: 'Salon'
  },
];

const { width } = Dimensions.get('window');

interface UserData {
  full_name: string;
  // Ajoutez d'autres propriétés utilisateur si nécessaire
}

export const HomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Chargement des données utilisateur depuis AsyncStorage...');
        const userData = await AsyncStorage.getItem('userData');
        console.log('Données brutes de l\'utilisateur:', userData);
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log('Données utilisateur parsées:', parsedData);
          setUser(parsedData);
          
          // Vérification des clés disponibles
          console.log('Clés disponibles dans les données utilisateur:', Object.keys(parsedData));
        } else {
          console.log('Aucune donnée utilisateur trouvée dans AsyncStorage');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };

    loadUserData();
  }, []);

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon} size={24} color="#6C63FF" />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSalonCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.salonCard}>
      <Image source={{ uri: item.image }} style={styles.salonImage} />
      <View style={styles.salonInfo}>
        <Text style={styles.salonName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.distanceText}>• {item.distance}</Text>
        </View>
        <Text style={styles.salonCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Bonjour, {user?.full_name || 'Client'}
            </Text>
            <Text style={styles.title}>Trouvez votre salon</Text>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6C63FF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>

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

        {/* Catégories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Salons à proximité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>À proximité</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularSalons}
            renderItem={renderSalonCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.salonsList}
          />
        </View>

        {/* Meilleurs salons */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Les mieux notés</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {popularSalons.map((salon) => (
            <TouchableOpacity key={salon.id} style={styles.popularSalonCard}>
              <Image source={{ uri: salon.image }} style={styles.popularSalonImage} />
              <View style={styles.popularSalonInfo}>
                <Text style={styles.popularSalonName}>{salon.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{salon.rating}</Text>
                  <Text style={styles.distanceText}>• {salon.distance}</Text>
                </View>
                <Text style={styles.popularSalonCategory}>{salon.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 70,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#6C63FF',
    fontSize: 14,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  salonsList: {
    paddingRight: 20,
  },
  salonCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  salonImage: {
    width: '100%',
    height: 120,
  },
  salonInfo: {
    padding: 12,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#999',
  },
  salonCategory: {
    fontSize: 12,
    color: '#6C63FF',
  },
  popularSalonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 10,
  },
  popularSalonImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  popularSalonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  popularSalonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  popularSalonCategory: {
    fontSize: 12,
    color: '#6C63FF',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
});
