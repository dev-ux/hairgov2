import api from '../api';

export interface Reservation {
  id: string;
  client_name: string;
  client_phone: string;
  client_avatar?: string;
  service_type: 'home' | 'salon';
  service_fee: number;
  client_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location_address: string;
  estimated_duration: number;
  scheduled_time: string;
  created_at: string;
  hairstyle?: {
    name: string;
    description?: string;
    category?: string;
  };
}

export interface ReservationResponse {
  success: boolean;
  data: {
    bookings: Reservation[];
  };
  message?: string;
}

// Récupérer les réservations du coiffeur connecté
export const getHairdresserBookings = async (): Promise<ReservationResponse> => {
  try {
    const response = await api.get<ReservationResponse>('/bookings/hairdresser/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching hairdresser bookings:', error);
    throw error;
  }
};

// Accepter une réservation
export const acceptBooking = async (bookingId: string): Promise<{ success: boolean; data: Reservation }> => {
  try {
    const response = await api.put<{ success: boolean; data: Reservation }>(`/bookings/${bookingId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting booking:', error);
    throw error;
  }
};

// Refuser une réservation
export const rejectBooking = async (bookingId: string): Promise<{ success: boolean; data: Reservation }> => {
  try {
    const response = await api.put<{ success: boolean; data: Reservation }>(`/bookings/${bookingId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting booking:', error);
    throw error;
  }
};

// Démarrer une réservation
export const startBooking = async (bookingId: string): Promise<{ success: boolean; data: Reservation }> => {
  try {
    const response = await api.put<{ success: boolean; data: Reservation }>(`/bookings/${bookingId}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting booking:', error);
    throw error;
  }
};

// Terminer une réservation
export const completeBooking = async (bookingId: string): Promise<{ success: boolean; data: Reservation }> => {
  try {
    const response = await api.put<{ success: boolean; data: Reservation }>(`/bookings/${bookingId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
};
