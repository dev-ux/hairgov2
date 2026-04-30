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
      const userToken = await AsyncStorage.getItem('userToken');
      
      console.log('=== DEBUG FAVORITE SERVICE ===');
      console.log('Token from AsyncStorage:', userToken ? 'EXISTS' : 'NULL/EMPTY');
      console.log('Token length:', userToken?.length || 0);
      console.log('Token preview:', userToken ? `${userToken.substring(0, 20)}...` : 'NONE');
      console.log('Hairdresser ID:', hairdresserId);
      
      if (!userToken) {
        console.log('❌ No userToken found - showing login required');
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour ajouter des favoris'
          }
        };
      }

      console.log('Adding to favorites - Token:', userToken ? 'Present' : 'Missing');
      console.log('Adding to favorites - Hairdresser ID:', hairdresserId);

      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('Add to favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour gérer vos favoris'
          }
        };
      }

      console.log('Removing from favorites - Token:', userToken ? 'Present' : 'Missing');
      console.log('Removing from favorites - Hairdresser ID:', hairdresserId);

      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('Remove from favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        return false;
      }

      const response = await fetch(`${API_URL}/favorites/hairdressers/${hairdresserId}/favorite`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        return [];
      }

      const response = await fetch(`${API_URL}/favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      console.log('=== DEBUG SALON FAVORITE SERVICE ===');
      console.log('Token from AsyncStorage:', userToken ? 'EXISTS' : 'NULL/EMPTY');
      console.log('Token length:', userToken?.length || 0);
      console.log('Token preview:', userToken ? `${userToken.substring(0, 20)}...` : 'NONE');
      console.log('Salon ID:', salonId);
      
      if (!userToken) {
        console.log('❌ No userToken found - showing login required');
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour ajouter des favoris'
          }
        };
      }

      console.log('Adding salon to favorites - Token:', userToken ? 'Present' : 'Missing');
      console.log('Adding salon to favorites - Salon ID:', salonId);

      const response = await fetch(`${API_URL}/favorites/salons/${salonId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('Add salon to favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Veuillez vous connecter pour gérer vos favoris'
          }
        };
      }

      console.log('Removing salon from favorites - Token:', userToken ? 'Present' : 'Missing');
      console.log('Removing salon from favorites - Salon ID:', salonId);

      const response = await fetch(`${API_URL}/favorites/salons/${salonId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('Remove salon from favorites response status:', response.status);

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        return false;
      }

      const response = await fetch(`${API_URL}/favorites/salons/${salonId}/favorite`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 401) {
        // Token invalide ou expiré
        await AsyncStorage.removeItem('userToken');
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

// Gérer les favoris de coiffures
export const hairstyleFavoriteService = {
  addToFavorites: async (hairstyleId: string): Promise<FavoriteResponse> => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return { success: false, error: { code: 'NO_TOKEN', message: 'Veuillez vous connecter pour ajouter des favoris' } };

      const response = await fetch(`${API_URL}/favorites/hairstyles/${hairstyleId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      });
      if (response.status === 401) { await AsyncStorage.removeItem('userToken'); return { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expirée, veuillez vous reconnecter' } }; }
      return await response.json();
    } catch {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Erreur réseau' } };
    }
  },

  removeFromFavorites: async (hairstyleId: string): Promise<FavoriteResponse> => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return { success: false, error: { code: 'NO_TOKEN', message: 'Veuillez vous connecter pour gérer vos favoris' } };

      const response = await fetch(`${API_URL}/favorites/hairstyles/${hairstyleId}/favorite`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      });
      if (response.status === 401) { await AsyncStorage.removeItem('userToken'); return { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expirée, veuillez vous reconnecter' } }; }
      return await response.json();
    } catch {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Erreur réseau' } };
    }
  },

  checkFavorite: async (hairstyleId: string): Promise<boolean> => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return false;

      const response = await fetch(`${API_URL}/favorites/hairstyles/${hairstyleId}/favorite`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      });
      if (response.status === 401) { await AsyncStorage.removeItem('userToken'); return false; }
      const data = await response.json();
      return data.success ? data.data.isFavorite : false;
    } catch {
      return false;
    }
  },
};
