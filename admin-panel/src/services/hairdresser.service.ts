import api from '../config/api';

interface Hairdresser {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  is_active: boolean;
}

export const getActiveHairdressers = async (): Promise<Hairdresser[]> => {
  try {
    const response = await api.get('/admin/hairdressers', {
      params: {
        is_active: true,
        limit: 100, // Augmenter la limite pour obtenir tous les coiffeurs actifs
      },
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching hairdressers:', error);
    return [];
  }
};

export const getHairdresserById = async (id: string) => {
  try {
    const response = await api.get(`/admin/hairdressers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hairdresser by ID:', error);
    throw error;
  }
};

export interface UpdateHairdresserPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  profession?: string;
  residential_address?: string;
  description?: string;
  registration_status?: 'pending' | 'approved' | 'rejected';
}

export const updateHairdresser = async (id: string, payload: UpdateHairdresserPayload) => {
  const response = await api.put(`/admin/hairdressers/${id}`, payload);
  return response.data;
};

export const hairdresserService = {
  getActiveHairdressers,
  getHairdresserById,
  updateHairdresser,
};
