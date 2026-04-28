// hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { favoriteService } from '../services/favoriteService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await favoriteService.getFavorites();
      // Extraire à la fois les hairdresser_id et les user_id
      const favoriteIds = favoritesData.map((fav: any) => {
        // Ajouter le hairdresser_id
        const hairdresserId = fav.hairdresser?.id;
        // Ajouter aussi le user_id pour compatibilité
        const userId = fav.hairdresser?.user?.id;
        return [hairdresserId, userId].filter(Boolean); // Retourner les deux IDs valides
      }).flat(); // Aplatir le tableau
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (hairdresserId: string) => {
    try {
      setLoading(true);
      
      if (favorites.includes(hairdresserId)) {
        // Retirer des favoris
        const result = await favoriteService.removeFromFavorites(hairdresserId);
        if (result.success) {
          setFavorites(prev => prev.filter(id => id !== hairdresserId));
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
        const result = await favoriteService.addToFavorites(hairdresserId);
        if (result.success) {
          setFavorites(prev => [...prev, hairdresserId]);
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
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la gestion des favoris');
    } finally {
      setLoading(false);
    }
    return favorites.includes(hairdresserId);
  };

  const isFavorite = (hairdresserId: string) => {
    return favorites.includes(hairdresserId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
};
