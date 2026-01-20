import api from '../api';

export interface Salon {
  id: string;
  hairdresser_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalonResponse {
  success: boolean;
  data: Salon;
  message?: string;
}

export interface CreateSalonData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  email?: string;
  business_hours?: string;
  photos?: string[];
}

// Créer un nouveau salon
export const createSalon = async (salonData: CreateSalonData): Promise<SalonResponse> => {
  try {
    console.log('Creating salon with data:', salonData);
    const response = await api.post<SalonResponse>('/salons', salonData);
    console.log('Salon creation response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
};

// Récupérer les informations du salon du coiffeur connecté
export const getMySalon = async (): Promise<SalonResponse> => {
  try {
    console.log('Fetching my salon...');
    const response = await api.get<SalonResponse>('/salons/my-salon');
    console.log('My salon response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching my salon:', error);
    throw error;
  }
};

// Mettre à jour les informations du salon
export const updateSalon = async (salonId: string, salonData: Partial<CreateSalonData>): Promise<SalonResponse> => {
  try {
    const response = await api.put<SalonResponse>(`/salons/${salonId}`, salonData);
    return response.data;
  } catch (error) {
    console.error('Error updating salon:', error);
    throw error;
  }
};

// Supprimer un salon
export const deleteSalon = async (salonId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/salons/${salonId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting salon:', error);
    throw error;
  }
};
