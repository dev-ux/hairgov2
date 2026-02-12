// hooks/useFavorites.ts
import { useState, useEffect } from 'react';
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
      const favoriteIds = favoritesData.map((fav: any) => fav.hairdresser.id);
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
        }
      } else {
        // Ajouter aux favoris
        const result = await favoriteService.addToFavorites(hairdresserId);
        if (result.success) {
          setFavorites(prev => [...prev, hairdresserId]);
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
