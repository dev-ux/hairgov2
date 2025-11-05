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
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { API_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
// Import de l'image par défaut
const defaultSalonImage = require('../assets/url_de_l_image_1.jpg');

type Salon = {
  id: string;
  name: string;
  address: string;
  photos: string[];
  average_rating: number;
  hairdresser: {
    id: string;
    full_name: string;
    profile_photo: string | null;
  };
};


const { width } = Dimensions.get('window');

interface UserData {
  full_name: string;
  // Ajoutez d'autres propriétés utilisateur si nécessaire
}

export const HomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [salons, setSalons] = useState<Salon[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        console.log('Tentative de connexion à:', `${API_URL}/salons`);
        // Ajout d'un timestamp pour éviter le cache
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/salons?_=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('Réponse du serveur - Status:', response.status);
        
        // Vérifier si la réponse est en cache (304) ou si c'est une réponse normale (200)
        if (response.status === 304) {
          console.log('Réponse 304 - Utilisation du cache côté client');
          // Si vous avez un mécanisme de cache côté client, vous pouvez l'utiliser ici
          // Pour l'instant, on laisse le code continuer pour traiter la réponse en cache
        } else if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json().catch(err => {
          console.error('Erreur lors du parsing de la réponse JSON:', err);
          throw new Error('Format de réponse invalide du serveur');
        });
        
        console.log('Données des salons reçues:', data);

        if (data && data.success && Array.isArray(data.data)) {
          console.log(`Nombre de salons reçus: ${data.data.length}`);
          
          if (data.data.length === 0) {
            console.log('Aucun salon disponible dans la réponse');
          } else {
            // Ajout d'un log pour chaque salon et ses images
            data.data.forEach((salon: Salon, index: number) => {
              console.log(`Salon #${index + 1}:`, {
                name: salon.name,
                photos: salon.photos,
                address: salon.address,
                hairdresser: salon.hairdresser?.full_name
              });
            });
          }
          
          // Vérifier si les données sont différentes avant de mettre à jour l'état
          setSalons(prevSalons => {
            const newSalons = data.data;
            if (JSON.stringify(prevSalons) !== JSON.stringify(newSalons)) {
              console.log('Mise à jour des salons avec de nouvelles données');
              return newSalons;
            }
            console.log('Les données des salons sont identiques, pas de mise à jour');
            return prevSalons;
          });
          setLastUpdate(new Date());
        } else {
          const errorMsg = data?.message || 'Format de réponse inattendu du serveur';
          console.error('Erreur du serveur:', errorMsg, data);
          setError(errorMsg);
        }
      } catch (err) {
        setError('Impossible de se connecter au serveur');
        console.error('Error fetching salons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

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

        {/* Liste des salons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nos Salons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorDetail}>Vérifiez que le serveur est en cours d'exécution sur {API_URL}</Text>
            </View>
          ) : salons === null ? (
            <Text style={styles.emptyText}>Chargement des données en cours...</Text>
          ) : salons.length === 0 ? (
            <Text style={styles.emptyText}>Aucun salon disponible pour le moment</Text>
          ) : (
            <FlatList
              data={salons}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.salonCard}
                  onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
                >
                  <View style={styles.salonImageContainer}>
                    <Image 
                      source={item.photos && item.photos.length > 0 
                        ? { 
                            uri: item.photos[0],
                            cache: 'reload' // Force le rechargement de l'image
                          }
                        : defaultSalonImage
                      } 
                      style={styles.salonImage}
                      resizeMode="cover"
                      defaultSource={defaultSalonImage}
                      onError={(e) => {
                        console.log('Erreur de chargement de l\'image, utilisation de l\'image par défaut');
                        // Forcer le rechargement avec l'image par défaut
                        if (item.photos && item.photos.length > 0) {
                          item.photos = [];
                          setSalons([...salons]);
                        }
                      }}
                    />
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {item.average_rating > 0 ? item.average_rating.toFixed(1) : 'Nouveau'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.salonInfo}>
                    <Text style={styles.salonName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.salonAddress} numberOfLines={1}>{item.address}</Text>
                    <Text style={styles.hairdresserName} numberOfLines={1}>
                      {item.hairdresser?.full_name || 'Coiffeur non spécifié'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.salonsList}
            />
          )}
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
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
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
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
  salonsList: {
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  salonCard: {
    width: 220,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  salonImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    borderRadius: 8,
  },
  salonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  defaultImageText: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
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
  salonAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  hairdresserName: {
    fontSize: 12,
    color: '#6C63FF',
  },
  categoriesList: {
    paddingLeft: 20,
    paddingRight: 10,
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
    color: '#666',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
});
