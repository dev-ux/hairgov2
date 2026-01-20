// URL de base de l'API
// Pour production (déployé sur Render)
const API_BASE_URL = "https://hairgov2.onrender.com";
export const API_URL = `${API_BASE_URL}/api/v1`;

// Options alternatives (commentées)
// export const API_URL = 'http://192.168.0.29:3002/api/v1'; // Pour développement local
// export const API_URL = 'http://192.168.0.23:3001/api/v1'; // Pour développement mobile
// export const API_URL = 'http://localhost:3001/api/v1'; // Pour développement web
// export const API_URL = 'http://10.0.2.2:3001/api/v1'; // Pour Android Emulator
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  GUEST_SESSION: 'guestSession',
};
