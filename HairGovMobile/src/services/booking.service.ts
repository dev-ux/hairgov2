import { API_URL, STORAGE_KEYS } from '@config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BookingData {
  // Informations client
  client_id?: string;        // Optionnel si l'utilisateur est connecté
  client_name: string;       // Nom complet du client
  client_phone: string;      // Téléphone du client (format international)
  
  // Informations professionnel
  hairdresser_id: string;    // ID du coiffeur
  
  // Détails de la prestation
  hairstyle_id: string;      // ID de la coupe de cheveux
  service_type: 'home' | 'salon'; // Type de service
  service_fee: number;       // Prix du service (pour le coiffeur)
  client_price: number;      // Prix TTC pour le client
  
  // Localisation (si service à domicile)
  location_address?: string;  // Adresse complète
  latitude?: number;          // Latitude
  longitude?: number;         // Longitude
  
  // Horaires
  estimated_duration: number; // Durée estimée en minutes
  scheduled_time: string;     // Format: "2025-11-03T10:00:00.000Z"
  
  // Statut (géré par le serveur)
  status?: string;           // Ex: 'pending', 'confirmed', 'completed', 'cancelled'
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

  // Récupérer les réservations à proximité (pour les coiffeurs)
  async getNearbyHairdressers(latitude: number, longitude: number, radius: number = 5000) {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(
        `${API_URL}/bookings/nearby-hairdressers?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des coiffeurs à proximité');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des coiffeurs à proximité:', error);
      throw error;
    }
  },

  // Récupérer les détails d'une réservation
  async getBookingDetails(bookingId: string) {
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
};

export default BookingService;
