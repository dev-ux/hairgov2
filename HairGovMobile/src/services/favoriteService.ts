// services/favoriteService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

export interface FavoriteResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// Gérer les favoris de coiffeurs
export const favoriteService = {
  // Ajouter un coiffeur aux favoris
  addToFavorites: async (hairdresserId: string): Promise<FavoriteResponse> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur réseau'
        }
      };
    }
  },

  // Retirer un coiffeur des favoris
  removeFromFavorites: async (hairdresserId: string): Promise<FavoriteResponse> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur réseau'
        }
      };
    }
  },

  // Vérifier si un coiffeur est en favoris
  checkFavorite: async (hairdresserId: string): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.success ? data.data.isFavorite : false;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  },

  // Obtenir tous les favoris de l'utilisateur
  getFavorites: async (): Promise<any[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites/favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.success ? data.data.favorites : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }
};

// Gérer les favoris de salons (à implémenter plus tard)
export const salonFavoriteService = {
  addToFavorites: async (salonId: string): Promise<FavoriteResponse> => {
    // TODO: Implémenter quand l'API sera prête
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Non implémenté' } };
  },

  removeFromFavorites: async (salonId: string): Promise<FavoriteResponse> => {
    // TODO: Implémenter quand l'API sera prête
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Non implémenté' } };
  },

  checkFavorite: async (salonId: string): Promise<boolean> => {
    // TODO: Implémenter quand l'API sera prête
    return false;
  }
};

// Gérer les favoris de coiffures (à implémenter plus tard)
export const hairstyleFavoriteService = {
  addToFavorites: async (hairstyleId: string): Promise<FavoriteResponse> => {
    // TODO: Implémenter quand l'API sera prête
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Non implémenté' } };
  },

  removeFromFavorites: async (hairstyleId: string): Promise<FavoriteResponse> => {
    // TODO: Implémenter quand l'API sera prête
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Non implémenté' } };
  },

  checkFavorite: async (hairstyleId: string): Promise<boolean> => {
    // TODO: Implémenter quand l'API sera prête
    return false;
  }
};
