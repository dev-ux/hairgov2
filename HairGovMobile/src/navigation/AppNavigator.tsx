import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Import des écrans
import { Onboarding1 } from '../screens/Onboarding1';
import { Onboarding2 } from '../screens/Onboarding2';
import { Onboarding3 } from '../screens/Onboarding3';
import { HomeScreen } from '../screens/HomeScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Définition des types pour la navigation
export type RootStackParamList = {
  // Onboarding
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  // Authentification
  Login: undefined;
  Register: { userType: 'client' | 'coiffeur' };
  ForgotPassword: undefined;
  // Principal
  Home: undefined;
  // Profil
  Profile: undefined;
  // Autres écrans
  Search: undefined;
  Booking: undefined;
  Favorites: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Onboarding1"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="Onboarding1" 
          component={Onboarding1} 
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="Onboarding2" 
          component={Onboarding2} 
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="Onboarding3" 
          component={Onboarding3} 
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
