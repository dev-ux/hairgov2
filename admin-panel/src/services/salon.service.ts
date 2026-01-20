import api from '../config/api';

export interface SalonData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  hairdresser_id: string;
  photos: string[];
  is_validated?: boolean;
}

export const getSalons = async (page: number = 1, limit: number = 10, search: string = '') => {
  const response = await api.get(`/salons?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const createSalon = async (salonData: SalonData) => {
  const response = await api.post('/salons', salonData);
  return response.data;
};

export const updateSalon = async (id: string, salonData: Partial<SalonData>) => {
  const response = await api.put(`/salons/${id}`, salonData);
  return response.data;
};

export const deleteSalon = async (id: string) => {
  const response = await api.delete(`/salons/${id}`);
  return response.data;
};

export const validateSalon = async (id: string) => {
  const response = await api.patch(`/salons/${id}/validate`);
  return response.data;
};
