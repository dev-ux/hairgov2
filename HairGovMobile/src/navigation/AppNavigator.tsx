import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans
import { Onboarding1 } from '../screens/Onboarding1';
import { Onboarding2 } from '../screens/Onboarding2';
import { Onboarding3 } from '../screens/Onboarding3';
import { HomeScreen } from '../screens/HomeScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import BookingScreen from '../screens/BookingScreen';
import BarberListScreen from '../screens/BarberListScreen';
import BarberDetailScreen from '../screens/BarberDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SalonDetailScreen from '@screens/SalonDetailScreen';

// Définition des types pour la navigation
export type RootStackParamList = {
  // Onboarding
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  // Authentification
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'coiffeur' };
  VerifyOtp: { email?: string; phone: string; userId?: string };
  ForgotPassword: undefined;
  Main: undefined;
  // Principal
  Home: undefined;
  // Profil
  Profile: undefined;
  // Autres écrans du profil
  Favorites: undefined;
  History: undefined;
  Statistics: undefined;
  Bookings: undefined;
  Payments: undefined;
  Settings: undefined;
  // Autres écrans
  Barber: undefined;
  BarberDetail: { barberId: string };
  Booking: {
    hairdresserId: string;
    hairdresserName: string;
  };
  SalonDetail: { salonId: string };
  Map: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Barber') {
            iconName = focused ? 'cut' : 'cut-outline';
          } else if (route.name === 'Booking') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          )
        }} 
      />
      <Tab.Screen 
        name="Barber" 
        component={BarberListScreen} 
        options={{ 
          title: 'Nos Coiffeurs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cut" size={size} color={color} />
          )
        }} 
      />
    
      <Tab.Screen 
        name="Booking" 
        component={BookingScreen} 
        options={{ 
          title: 'Réservations',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          )
        }} 
        initialParams={{
          hairdresserId: '1', // ID par défaut, à remplacer par la logique de votre application
          hairdresserName: 'Coiffeur', // Nom par défaut
        }}
      />
      <Tab.Screen name="Map" component={HomeScreen} options={{ title: 'Carte' }} />
    </Tab.Navigator>
  );
};

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
          component={MainTabs} 
          options={{ 
            headerShown: false,
            animation: 'fade'
          }} 
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
        <Stack.Screen 
          name="VerifyOtp" 
          component={VerifyOtpScreen}
          options={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            headerShown: true,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="BarberDetail" 
          component={BarberDetailScreen} 
          options={{ title: 'Détails du coiffeur' }} 
        />
        <Stack.Screen 
          name="SalonDetail" 
          component={SalonDetailScreen} 
          options={({ navigation }) => ({
            title: 'Détails du salon',
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{
                  marginLeft: 10,
                  padding: 8,
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          })} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
