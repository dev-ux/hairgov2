import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type MenuItem = {
  id: string;
  title: string;
  icon: string;
  screen: string;
};

const menuItems: MenuItem[] = [
  { id: '1', title: 'Favoris', icon: 'heart-outline', screen: 'Favorites' },
  { id: '2', title: 'Historique', icon: 'time-outline', screen: 'History' },
  { id: '3', title: 'Statistiques', icon: 'stats-chart-outline', screen: 'Statistics' },
  { id: '4', title: 'Réservations', icon: 'calendar-outline', screen: 'Bookings' },
  { id: '5', title: 'Paiements', icon: 'card-outline', screen: 'Payments' },
  { id: '6', title: 'Paramètres', icon: 'settings-outline', screen: 'Settings' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();

  const handleMenuItemPress = (screen: string) => {
    // @ts-ignore - Nous gérons la navigation de manière sûre
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#6C63FF" />
        </View>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userEmail}>john.doe@example.com</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color="#6C63FF" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
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
