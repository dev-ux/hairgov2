import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth.service';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'client' | 'hairdresser' | 'guest';
  profile_picture?: string;
  // Ajoutez d'autres champs utilisateur si nécessaire
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<boolean>;
  registerClient: (userData: any, navigation?: any) => Promise<boolean>;
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

  // Initialisation sans charger automatiquement l'utilisateur
  useEffect(() => {
    const initialize = async () => {
      try {
        // Vérifier si l'utilisateur est connecté sans le charger automatiquement
        const token = await AsyncStorage.getItem('userToken');
        console.log('Application initialisée. Connexion automatique désactivée.');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initialize();
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

  // Fonction pour générer un code OTP de test (uniquement en développement)
  const generateTestOtp = (phone: string) => {
    if (!__DEV__) return;
    
    // Générer un code OTP à 4 chiffres
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`\n=================================`);
    console.log(`CODE OTP POUR ${phone}: ${otp}`);
    console.log(`(Ceci est un code de test en mode développement)`);
    console.log(`=================================\n`);
    return otp;
  };

  const registerClient = async (userData: any, navigation?: any): Promise<boolean> => {
    try {
      console.log('Début de l\'inscription avec les données:', userData);
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.registerClient(userData);
      console.log('Réponse du service d\'inscription:', response);
      
      // Si l'inscription est réussie et qu'on a la navigation, on redirige vers la vérification OTP
      if (response.success && navigation) {
        console.log('Inscription réussie, redirection vers la vérification OTP');
        
        // En mode développement, afficher le code OTP dans la console
        if (__DEV__ && userData.phone) {
          generateTestOtp(userData.phone);
        }
        
        // Sauvegarder le token et les informations utilisateur dans le stockage local
        if (response.data?.token && response.data?.user) {
          await AsyncStorage.setItem('userToken', response.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
          
          // Mettre à jour l'état de l'utilisateur
          setUser(response.data.user);
        }
        
        // Rediriger vers l'écran de vérification OTP avec les informations nécessaires
        navigation.navigate('VerifyOtp', { 
          email: userData.email, 
          phone: userData.phone,
          userId: response.data?.user?.id // Ajout de l'ID utilisateur pour la vérification
        });
        
        // Afficher un message à l'utilisateur
        console.log('Un code de vérification a été envoyé à votre numéro de téléphone');
      } else {
        console.log('Échec de l\'inscription ou navigation non disponible');
        const errorMessage = response?.message || 'Échec de l\'inscription';
        setError(errorMessage);
      }
      
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
