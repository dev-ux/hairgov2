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
