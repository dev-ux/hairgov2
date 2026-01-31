import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Constants
const API_BASE_URL = 'https://hairgov2.onrender.com';

// Types
type MenuItem = {
  id: string;
  title: string;
  icon: string;
  screen: string;
};

// Menu Items Configuration
const menuItems: MenuItem[] = [
  { id: '1', title: 'Favoris', icon: 'heart-outline', screen: 'Favorites' },
  { id: '2', title: 'Historique', icon: 'time-outline', screen: 'History' },
  { id: '3', title: 'Statistiques', icon: 'stats-chart-outline', screen: 'Statistics' },
  { id: '4', title: 'Réservations', icon: 'calendar-outline', screen: 'Bookings' },
  { id: '5', title: 'Paiements', icon: 'card-outline', screen: 'Payments' },
  { id: '6', title: 'Paramètres', icon: 'settings-outline', screen: 'Settings' },
  { id: '7', title: 'Deconnexion', icon: 'log-out-outline', screen: 'Logout' },
];

// Utility Functions
const getProfileImageUrl = (profilePhoto?: string, profilePicture?: string): string | null => {
  const photo = profilePhoto || profilePicture;
  if (!photo) return null;
  return photo.startsWith('http') ? photo : `${API_BASE_URL}${photo}`;
};

type RootStackParamList = {
  Settings: undefined;
  Login: undefined;
  Favorites: undefined;
  History: undefined;
  Statistics: undefined;
  Bookings: undefined;
  Payments: undefined;
  Logout: undefined;
};

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { colors } = useTheme();

  // Actions
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  const handleMenuItemPress = (screen: string) => {
    if (screen === 'Logout') {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', style: 'destructive', onPress: handleLogout },
        ]
      );
    } else {
      navigation.navigate(screen as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête personnalisé avec bouton de retour */}
      {/* <View style={[styles.headerContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mon Profil</Text>
        <View style={{ width: 24 }} /> 
      </View> */}
      
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.avatarContainer}>
          {getProfileImageUrl(user?.profile_photo, user?.profile_picture) ? (
            <Image 
              source={{ uri: getProfileImageUrl(user?.profile_photo, user?.profile_picture)! }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.defaultAvatar, { backgroundColor: colors.input }]}>
              <Ionicons name="person" size={50} color={colors.primary} />
            </View>
          )}
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.full_name || 'Utilisateur'}
        </Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => handleMenuItemPress(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={colors.primary} style={styles.menuIcon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#6C63FF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 60,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    marginTop: 5,
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
