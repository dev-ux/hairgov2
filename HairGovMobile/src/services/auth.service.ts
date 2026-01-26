import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Configuration de l'URL de l'API en fonction de la plateforme
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api/v1'; // Pour émulateur Android (port 3001)
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3001/api/v1'; // Pour émulateur iOS
    } else {
      return 'http://localhost:3001/api/v1'; // Pour développement web
    }
  } else {
    return 'https://hairgov2.onrender.com/api/v1'; // Pour la production
  }
};

const API_URL = getApiUrl();
console.log('URL de l\'API utilisée:', API_URL);

interface LoginData {
  phone: string;
  password: string;
}

interface RegisterClientData {
  full_name: string;
  email?: string; // email optionnel pour les clients
  phone: string;
  password: string;
}

interface RegisterHairdresserData extends RegisterClientData {
  profession?: string;
  residential_address?: string;
  date_of_birth?: string;
  id_card_number?: string;
  has_salon?: boolean;
  education_level?: string;
  hairstyle_ids?: number[];
  is_active?: boolean;
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
      console.log('Envoi de la requête d\'inscription à:', `${API_URL}/auth/register/client`);
      console.log('Données envoyées:', userData);
      
      let response;
      try {
        response = await fetch(`${API_URL}/auth/register/client`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      } catch (fetchError) {
        console.error('Erreur lors de l\'appel à l\'API:', fetchError);
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion Internet.');
      }

      console.log('Réponse du serveur - Status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Réponse du serveur - Données:', data);
      } catch (jsonError) {
        console.error('Erreur lors de l\'analyse de la réponse JSON:', jsonError);
        throw new Error('Réponse du serveur invalide');
      }

      if (!response.ok) {
        const errorMessage = data?.message || `Erreur serveur (${response.status})`;
        console.error('Erreur lors de l\'inscription:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.success) {
        console.error('Échec de l\'inscription:', data.message || 'Raison inconnue');
        throw new Error(data.message || 'Échec de l\'inscription');
      }

      console.log('Inscription réussie, données reçues:', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Inscription coiffeur
  async registerHairdresser(userData: RegisterHairdresserData) {
    try {
      console.log('Envoi de la requête d\'inscription coiffeur à:', `${API_URL}/auth/register/hairdresser`);
      console.log('Données envoyées:', userData);
      
      let response;
      try {
        response = await fetch(`${API_URL}/auth/register/hairdresser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      } catch (fetchError) {
        console.error('Erreur lors de l\'appel à l\'API:', fetchError);
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion Internet.');
      }

      console.log('Réponse du serveur - Status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Réponse du serveur - Données:', data);
      } catch (jsonError) {
        console.error('Erreur lors de l\'analyse de la réponse JSON:', jsonError);
        throw new Error('Réponse du serveur invalide');
      }

      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.message || `Erreur serveur (${response.status})`;
        console.error('Erreur lors de l\'inscription du coiffeur:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.success) {
        console.error('Échec de l\'inscription du coiffeur:', data.message || 'Raison inconnue');
        throw new Error(data.message || 'Échec de l\'inscription');
      }

      console.log('Inscription coiffeur réussie, données reçues:', data);
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
