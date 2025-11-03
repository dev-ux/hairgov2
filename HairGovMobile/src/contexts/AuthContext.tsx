import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth.service';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'client' | 'hairdresser' | 'guest';
  // Ajoutez d'autres champs utilisateur si nécessaire
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<boolean>;
  registerClient: (userData: any) => Promise<boolean>;
  registerHairdresser: (userData: any) => Promise<boolean>;
  loginAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  getCurrentUser: () => User | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const [userData, token] = await Promise.all([
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('userToken')
        ]);
        
        if (userData && token) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('Utilisateur chargé depuis le stockage local:', parsedUser);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', { phone });
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.login(phone, password);
      console.log('Réponse de l\'API:', response);
      
      if (response.data?.user) {
        // Mettre à jour l'état de l'utilisateur
        const userData = response.data.user;
        setUser(userData);
        
        // Sauvegarder les données utilisateur dans le stockage local
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        if (response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
        }
        
        console.log('Connexion réussie:', userData);
        
        // Retourner true pour indiquer que la connexion a réussi
        return true;
      } else {
        throw new Error('Aucune donnée utilisateur reçue');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerClient = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.registerClient(userData);
      return response.success;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription du client:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerHairdresser = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.registerHairdresser(userData);
      return response.success;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription du coiffeur:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.loginAsGuest();
      if (response.data?.user) {
        setUser(response.data.user);
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erreur lors de la connexion en tant qu\'invité:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de la connexion en tant qu\'invité';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
      // Mettre à jour également dans le stockage local
      AsyncStorage.setItem('userData', JSON.stringify({ ...user, ...userData }));
    }
  };

  const clearError = () => setError(null);

  const getCurrentUser = useCallback(() => user, [user]);

  const value = {
    user,
    isLoading: isLoading && !isInitialized,
    isAuthenticated: !!user,
    error,
    login,
    registerClient,
    registerHairdresser,
    loginAsGuest,
    logout,
    updateUser,
    clearError,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
