import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface ReservationDetail {
  id: string;
  clientName: string;
  clientAvatar: string;
  description: string;
  price: string;
  locationPreference: 'domicile' | 'salon';
  clientCoordinates?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  phoneNumber?: string;
}

interface ReservationDetailScreenProps {
  route: {
    params: {
      reservation: ReservationDetail;
    };
  };
}

export default function ReservationDetailScreen({ route }: ReservationDetailScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { reservation } = route.params;
  const [showLocation, setShowLocation] = useState(false);

  const handleToggleShowLocation = (value: boolean) => {
    setShowLocation(value);
    console.log('Montrer au Client où je me trouve:', value);
    // TODO: Implémenter la logique pour partager la position avec le client
  };

  const handleShowClientCoordinates = () => {
    if (reservation.clientCoordinates) {
      // TODO: Naviguer vers une carte avec les coordonnées du client
      console.log('Coordonnées du client:', reservation.clientCoordinates);
      Alert.alert(
        'Coordonnées du Client',
        `Adresse: ${reservation.clientCoordinates.address}\n` +
        `Téléphone: ${reservation.phoneNumber || 'Non disponible'}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Information', 'Coordonnées du client non disponibles');
    }
  };

  const handleCancelReservation = () => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        {
          text: 'Non',
          style: 'cancel'
        },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter l'appel API pour annuler la réservation
            console.log('Réservation annulée:', reservation.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Client Information Card */}
        <View style={styles.clientCard}>
          <View style={styles.clientInfo}>
            <Image 
              source={{ uri: reservation.clientAvatar }} 
              style={styles.clientAvatar}
            />
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{reservation.clientName}</Text>
              <Text style={styles.description}>{reservation.description}</Text>
              <Text style={styles.price}>{reservation.price}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Show Location Toggle */}
          <View style={styles.actionItem}>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Montrer au Client où je me trouve</Text>
            </View>
            <Switch
              value={showLocation}
              onValueChange={handleToggleShowLocation}
              trackColor={{ false: '#e4e4e4', true: '#6C63FF' }}
              thumbColor={showLocation ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Client Coordinates */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleShowClientCoordinates}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Cordonnées du Clients</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Cancel Reservation */}
          <TouchableOpacity 
            style={[styles.actionItem, styles.cancelAction]}
            onPress={handleCancelReservation}
          >
            <View style={styles.actionContent}>
              <Ionicons name="close-circle" size={20} color="#ff4444" />
              <Text style={[styles.actionTitle, styles.cancelText]}>Annuler la réservation</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 34,
  },
  clientCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C63FF',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelAction: {
    borderBottomWidth: 0,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cancelText: {
    color: '#ff4444',
    marginLeft: 10,
  },
});
