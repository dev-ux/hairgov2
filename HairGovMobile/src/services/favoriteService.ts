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
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour ajouter des favoris'
          }
        };
      }

      console.log('Adding to favorites - Token:', token ? 'Present' : 'Missing');
      console.log('Adding to favorites - Hairdresser ID:', hairdresserId);

      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Add to favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session expirée, veuillez vous reconnecter'
          }
        };
      }

      const data = await response.json();
      console.log('Add to favorites response:', data);
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur réseau lors de l\'ajout aux favoris'
        }
      };
    }
  },

  // Retirer un coiffeur des favoris
  removeFromFavorites: async (hairdresserId: string): Promise<FavoriteResponse> => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour gérer vos favoris'
          }
        };
      }

      console.log('Removing from favorites - Token:', token ? 'Present' : 'Missing');
      console.log('Removing from favorites - Hairdresser ID:', hairdresserId);

      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Remove from favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session expirée, veuillez vous reconnecter'
          }
        };
      }

      const data = await response.json();
      console.log('Remove from favorites response:', data);
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur réseau lors du retrait des favoris'
        }
      };
    }
  },

  // Vérifier si un coiffeur est en favoris
  checkFavorite: async (hairdresserId: string): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return false;
      }

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
      
      if (!token) {
        return [];
      }

      const response = await fetch(`${API_URL}/favorites/favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return [];
      }

      const data = await response.json();
      return data.success ? data.data.favorites : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }
};

// Gérer les favoris de salons
export const salonFavoriteService = {
  // Ajouter un salon aux favoris
  addToFavorites: async (salonId: string): Promise<FavoriteResponse> => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour ajouter des favoris'
          }
        };
      }

      console.log('Adding salon to favorites - Token:', token ? 'Present' : 'Missing');
      console.log('Adding salon to favorites - Salon ID:', salonId);

      const response = await fetch(`${API_URL}/favorites/salons/${salonId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Add salon to favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session expirée, veuillez vous reconnecter'
          }
        };
      }

      const data = await response.json();
      console.log('Add salon to favorites response:', data);
      return data;
    } catch (error) {
      console.error('Error adding salon to favorites:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur réseau lors de l\'ajout du salon aux favoris'
        }
      };
    }
  },

  // Retirer un salon des favoris
  removeFromFavorites: async (salonId: string): Promise<FavoriteResponse> => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour gérer vos favoris'
          }
        };
      }

      console.log('Removing salon from favorites - Token:', token ? 'Present' : 'Missing');
      console.log('Removing salon from favorites - Salon ID:', salonId);

      const response = await fetch(`${API_URL}/favorites/salons/${salonId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Remove salon from favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session expirée, veuillez vous reconnecter'
          }
        };
      }

      const data = await response.json();
      console.log('Remove salon from favorites response:', data);
      return data;
    } catch (error) {
      console.error('Error removing salon from favorites:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur réseau lors du retrait du salon des favoris'
        }
      };
    }
  },

  // Vérifier si un salon est en favoris
  checkFavorite: async (salonId: string): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/favorites/salons/${salonId}/favorite`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('token');
        return false;
      }

      const data = await response.json();
      return data.success ? data.data.isFavorite : false;
    } catch (error) {
      console.error('Error checking salon favorite:', error);
      return false;
    }
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
