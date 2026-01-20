import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarberHomeTab from '../components/BarberHomeTab';
import BarberSalonTab from '../components/BarberSalonTab';
import BarberReservationsTab from '../components/BarberReservationsTab';

export default function BarberHomePage() {
  const [activeTab, setActiveTab] = useState<'home' | 'salon' | 'reservations'>('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <BarberHomeTab />;
      case 'salon':
        return <BarberSalonTab />;
      case 'reservations':
        return <BarberReservationsTab />;
      default:
        return <BarberHomeTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderTab()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={activeTab === 'home' ? '#6C63FF' : '#999'} 
          />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>
            Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'salon' && styles.navItemActive]}
          onPress={() => setActiveTab('salon')}
        >
          <Ionicons 
            name="business" 
            size={24} 
            color={activeTab === 'salon' ? '#6C63FF' : '#999'} 
          />
          <Text style={[styles.navLabel, activeTab === 'salon' && styles.navLabelActive]}>
            Salon
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'reservations' && styles.navItemActive]}
          onPress={() => setActiveTab('reservations')}
        >
          <Ionicons 
            name="calendar" 
            size={24} 
            color={activeTab === 'reservations' ? '#6C63FF' : '#999'} 
          />
          <Text style={[styles.navLabel, activeTab === 'reservations' && styles.navLabelActive]}>
            Réservations
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
    paddingTop: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    // Style pour l'onglet actif si nécessaire
  },
  navLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
