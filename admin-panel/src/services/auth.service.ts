import axios from 'axios';
import api from '../config/api';

interface LoginCredentials {
  phone?: string;
  email?: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: any;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: any }> => {
  try {
    const response = await api.post<ApiResponse>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      
      // Vérifier si l'utilisateur est un administrateur
      if (user.user_type !== 'admin') {
        throw new Error('Accès refusé. Seuls les administrateurs peuvent se connecter.');
      }
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    }
    
    throw new Error(response.data.error?.message || 'Échec de la connexion');
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiResponse;
      throw new Error(errorData.error?.message || 'Erreur de connexion');
    }
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.user_type === 'admin';
};

export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
