import { API_URL, STORAGE_KEYS } from '@config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Salon {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

// Doit correspondre au validator backend (booking.controller -> createBooking)
export interface BookingData {
  // Client
  client_id?: string;
  client_name: string;
  client_phone: string;

  // Prestation
  hairstyle_id: string; // Doit exister côté backend
  service_type: 'home' | 'salon';

  // Localisation (requis pour la sélection du coiffeur côté serveur)
  location_address: string;
  latitude: number;
  longitude: number;

  // Horaire
  scheduled_time: string; // ISO string
}

export const BookingService = {
  // Créer une nouvelle réservation
  async createBooking(bookingData: BookingData) {
    try {
      console.log('Tentative de création de réservation avec les données:', bookingData);
      
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      if (!token) {
        console.error('Erreur: Aucun token d\'authentification trouvé');
        throw new Error('Aucun token d\'authentification trouvé');
      }

      console.log('Envoi de la requête à:', `${API_URL}/bookings`);
      
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Réponse du serveur - Statut:', response.status);
      
      let errorData;
      try {
        errorData = await response.json();
        console.log('Réponse du serveur - Données:', errorData);
      } catch (e) {
        console.error('Erreur lors de la lecture de la réponse JSON:', e);
      }

      if (!response.ok) {
        const errorMessage = errorData?.message || 
                            errorData?.error || 
                            `Erreur HTTP: ${response.status} ${response.statusText}`;
        console.error('Erreur lors de la création de la réservation:', errorMessage);
        throw new Error(errorMessage);
      }

      return errorData;
    } catch (error: any) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw new Error(error.message || 'Une erreur inattendue est survenue');
    }
  },

  // Récupérer les salons disponibles à proximité
  async getNearbyHairdressers(latitude: number, longitude: number, radius: number = 10) {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Utiliser l'endpoint des salons avec filtrage par localisation
      const response = await fetch(
        `${API_URL}/salons?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des salons');
      }

      const data = await response.json();
      
      // Retourner les données dans un format attendu par l'écran de réservation
      return {
        success: true,
        data: {
          hairdressers: data.data || []
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des salons à proximité:', error);
      throw new Error('Erreur lors de la récupération des salons');
    }
  },

  // Récupérer les détails d'une réservation
  async getBookingDetails(bookingId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des détails de la réservation');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la réservation:', error);
      throw error;
    }
  },

  // Récupérer la liste des salons validés
  async getValidatedSalons(): Promise<Salon[]> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/salons`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des salons');
      }

      const data = await response.json();
      // Filtrer pour ne retourner que les salons validés si nécessaire
      return data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des salons:', error);
      throw error;
    }
  },
};

export default BookingService;
