import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  primary: '#6C63FF',
  secondary: '#FF6B6B',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E5E5E5',
  error: '#FF3B30',
  success: '#4CAF50',
  warning: '#FF9800',
  card: '#FFFFFF',
  modal: '#FFFFFF',
  input: '#F5F5F5',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors = {
  primary: '#8B7FFF',
  secondary: '#FF8A8A',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  error: '#FF5252',
  success: '#66BB6A',
  warning: '#FFB74D',
  card: '#1E1E1E',
  modal: '#2A2A2A',
  input: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Charger le thème sauvegardé au démarrage
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
