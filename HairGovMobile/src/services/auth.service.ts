import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api/v1';

interface LoginData {
  phone: string;
  password: string;
}

interface RegisterClientData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterHairdresserData extends RegisterClientData {
  salon_name: string;
  address: string;
  // Ajoutez d'autres champs spécifiques aux coiffeurs si nécessaire
}

export const AuthService = {
  // Connexion utilisateur
  async login(phone: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de la connexion');
      }

      // Sauvegarder le token et les données utilisateur
      if (data.data?.token) {
        await AsyncStorage.setItem('userToken', data.data.token);
        if (data.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        }
        if (data.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Inscription client
  async registerClient(userData: RegisterClientData) {
    try {
      const response = await fetch(`${API_URL}/auth/register/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de l\'inscription');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Inscription coiffeur
  async registerHairdresser(userData: RegisterHairdresserData) {
    try {
      const response = await fetch(`${API_URL}/auth/register/hairdresser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de l\'inscription');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription du coiffeur:', error);
      throw error;
    }
  },

  // Connexion invité
  async loginAsGuest() {
    try {
      const response = await fetch(`${API_URL}/auth/login/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de la connexion invité');
      }

      if (data.data?.token) {
        await AsyncStorage.setItem('userToken', data.data.token);
        if (data.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion invité:', error);
      throw error;
    }
  },

  // Rafraîchir le token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec du rafraîchissement du token');
      }

      if (data.data?.token) {
        await AsyncStorage.setItem('userToken', data.data.token);
        if (data.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        }
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  },

  // Récupérer les informations de l'utilisateur connecté
  async getCurrentUser(): Promise<any | null> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré, on tente de le rafraîchir
          try {
            await this.refreshToken();
            return this.getCurrentUser(); // Rappel récursif après rafraîchissement
          } catch (refreshError) {
            await this.logout();
            return null;
          }
        }
        throw new Error(data.message || 'Erreur lors de la récupération du profil');
      }

      // Mettre à jour les données utilisateur dans le stockage local
      if (data.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.data));
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  },

  // Déconnexion
  async logout() {
    try {
      // Supprimer les données d'authentification
      await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};

export default AuthService;
