import { API_URL } from '../../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createInstance = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('userToken');
  console.log('Token from storage:', token ? 'exists' : 'not found');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('Authorization header set');
  } else {
    console.log('No token found, request will be unauthenticated');
  }
  
  const { headers: _, ...restOptions } = options;
  
  const fullUrl = `${API_URL}${url}`;
  console.log('Making request to:', fullUrl);
  
  const response = await fetch(fullUrl, {
    ...restOptions,
    headers,
  });
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.log('Error response:', error);
    throw new Error(error.message || 'Une erreur est survenue');
  }
  
  // Si la réponse est 204 (No Content), on ne tente pas de parser le JSON
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};
