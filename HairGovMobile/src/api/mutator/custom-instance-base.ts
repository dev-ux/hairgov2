import { API_URL } from '../../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createInstance = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('userToken');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const { headers: _, ...restOptions } = options;
  
  const response = await fetch(`${API_URL}${url}`, {
    ...restOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Une erreur est survenue');
  }
  
  // Si la réponse est 204 (No Content), on ne tente pas de parser le JSON
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};
