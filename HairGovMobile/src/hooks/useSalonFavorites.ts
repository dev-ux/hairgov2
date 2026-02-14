// hooks/useSalonFavorites.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { favoriteService, salonFavoriteService } from '../services/favoriteService';

export const useSalonFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Utiliser l'endpoint général et filtrer les salons
      const favoritesData = await favoriteService.getFavorites();
      console.log('🔍 useSalonFavorites - favoritesData:', favoritesData);
      
      if (!Array.isArray(favoritesData)) {
        console.error('Favorites data is not an array:', favoritesData);
        setFavorites([]);
        return;
      }
      
      const favoriteIds = favoritesData
        .filter((fav: any) => fav && fav.favorite_type === 'salon')
        .map((fav: any) => fav.salon_id)
        .filter((id: any) => id); // Filtrer les IDs null/undefined
        
      console.log('🔍 useSalonFavorites - favoriteIds:', favoriteIds);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading salon favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (salonId: string) => {
    try {
      setLoading(true);
      
      if (favorites.includes(salonId)) {
        // Retirer des favoris
        const result = await salonFavoriteService.removeFromFavorites(salonId);
        if (result.success) {
          setFavorites(prev => prev.filter(id => id !== salonId));
          return false;
        } else {
          // Gérer les erreurs
          if (result.error?.code === 'NO_TOKEN' || result.error?.code === 'INVALID_TOKEN') {
            Alert.alert('Connexion requise', result.error?.message || 'Veuillez vous connecter pour gérer vos favoris');
          } else {
            Alert.alert('Erreur', result.error?.message || 'Impossible de retirer des favoris');
          }
        }
      } else {
        // Ajouter aux favoris
        const result = await salonFavoriteService.addToFavorites(salonId);
        if (result.success) {
          setFavorites(prev => [...prev, salonId]);
          return true;
        } else {
          // Gérer les erreurs
          if (result.error?.code === 'NO_TOKEN' || result.error?.code === 'INVALID_TOKEN') {
            Alert.alert('Connexion requise', result.error?.message || 'Veuillez vous connecter pour ajouter des favoris');
          } else {
            Alert.alert('Erreur', result.error?.message || 'Impossible d\'ajouter aux favoris');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling salon favorite:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la gestion des favoris');
    } finally {
      setLoading(false);
    }
    return favorites.includes(salonId);
  };

  const isFavorite = (salonId: string) => {
    return favorites.includes(salonId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
};
