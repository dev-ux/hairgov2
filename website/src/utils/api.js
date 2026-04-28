import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hairgov2.onrender.com'  // Backend production
  : 'http://localhost:3003'; // Proxy local pour développement

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scizz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('scizz_token');
      localStorage.removeItem('scizz_user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

// Services API
export const authService = {
  // Inscription coiffeur
  registerHairdresser: async (userData) => {
    // Mode mock désactivé - utilisation du vrai backend
    console.log('🌐 MODE PRODUCTION - Appel API réel');
    console.log('� Données envoyées:', userData);
    
    try {
      const response = await api.post('/api/v1/auth/register/hairdresser', userData);
      console.log('✅ Réponse API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la connexion' };
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('scizz_token');
    localStorage.removeItem('scizz_user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('scizz_token');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('scizz_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const hairdresserService = {
  // Obtenir tous les coiffeurs
  getAllHairdressers: async () => {
    try {
      const response = await api.get('/api/v1/hairdressers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des coiffeurs' };
    }
  },

  // Obtenir un coiffeur par ID
  getHairdresserById: async (id) => {
    try {
      const response = await api.get(`/api/v1/hairdressers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du coiffeur' };
    }
  },

  // Mettre à jour le profil coiffeur
  updateProfile: async (id, profileData) => {
    try {
      const response = await api.put(`/api/v1/hairdressers/${id}`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  }
};

export const salonService = {
  // Obtenir tous les salons
  getAllSalons: async () => {
    try {
      const response = await api.get('/api/v1/salons');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des salons' };
    }
  },

  // Créer un salon
  createSalon: async (salonData) => {
    try {
      const response = await api.post('/api/v1/salons', salonData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du salon' };
    }
  }
};

export const bookingService = {
  // Créer une réservation
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/api/v1/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la réservation' };
    }
  },

  // Obtenir les réservations d'un utilisateur
  getUserBookings: async (userId) => {
    try {
      const response = await api.get(`/api/v1/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des réservations' };
    }
  }
};

export default api;
