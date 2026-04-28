import axios from 'axios';

// URL de production pour le backend déployé sur Render
const API_URL = 'https://hairgov2.onrender.com/api/v1';

// Alternative pour développement local (commentée)
// const API_URL = 'http://localhost:3001/api/v1';

// Création d'une instance axios personnalisée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs 401 (non autorisé)
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
