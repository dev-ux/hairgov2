import api from './api';

export interface Booking {
  id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  hairdresser_id: string;
  hairstyle_id: string;
  service_type: string;
  service_fee: number;
  client_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location_address: string;
  latitude: number;
  longitude: number;
  estimated_duration: number;
  scheduled_time: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  extension_requested: boolean;
  extension_minutes: number;
  extension_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingResponse {
  success: boolean;
  data: Booking[];
  message?: string;
}

// Récupérer toutes les réservations
export const getAllBookings = async (): Promise<BookingResponse> => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Récupérer une réservation par ID
export const getBookingById = async (id: string): Promise<{ success: boolean; data: Booking }> => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

// Mettre à jour le statut d'une réservation
export const updateBookingStatus = async (id: string, status: string): Promise<{ success: boolean; data: Booking }> => {
  try {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Supprimer une réservation
export const deleteBooking = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
