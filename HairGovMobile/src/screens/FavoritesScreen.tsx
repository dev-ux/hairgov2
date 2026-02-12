import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { favoriteService } from '../services/favoriteService';
import { FavoriteButton } from '../components/FavoriteButton';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export const FavoritesScreen = () => {
    const navigation = useNavigation<FavoritesScreenNavigationProp>();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);
            const favoritesData = await favoriteService.getFavorites();
            setFavorites(favoritesData);
        } catch (err) {
            setError('Erreur de chargement des favoris');
            console.error('Error loading favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderFavoriteItem = ({ item }: { item: any }) => {
        const hairdresser = item.hairdresser;
        return (
            <TouchableOpacity 
                style={styles.favoriteCard}
                onPress={() => {
                    navigation.navigate('BarberDetail' as any, { barberId: hairdresser.id });
                }}
            >
                <Image 
                    source={hairdresser.user?.profile_photo ? { uri: hairdresser.user.profile_photo } : require('../assets/default-avatar.png')}
                    style={styles.favoriteImage}
                    resizeMode="cover"
                />
                <View style={styles.favoriteInfo}>
                    <Text style={styles.favoriteName}>{hairdresser.user?.full_name || 'Nom inconnu'}</Text>
                    <Text style={styles.favoriteProfession}>{hairdresser.profession || 'Coiffeur'}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{hairdresser.average_rating?.toFixed(1) || '0.0'}</Text>
                    </View>
                </View>
                <View style={styles.favoriteButtonContainer}>
                    <FavoriteButton itemId={hairdresser.id} itemType="hairdresser" size={20} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mes Favoris</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mes Favoris</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centered}>
                    <Ionicons name="sad-outline" size={50} color="#999" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
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
                <Text style={styles.headerTitle}>Mes Favoris</Text>
                <View style={{ width: 24 }} /> {/* Pour équilibrer le flexbox */}
            </View>

            {favorites.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="heart-outline" size={50} color="#999" />
                    <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
                    <Text style={styles.emptySubtext}>Ajoutez des coiffeurs à vos favoris pour les retrouver facilement</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
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
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  favoriteInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  favoriteProfession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  favoriteButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavoritesScreen;
