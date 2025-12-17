import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';

const { height, width } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.6;
const MIN_SHEET_HEIGHT = height * 0.3;

interface ClientRequest {
  id: string;
  name: string;
  avatar: string;
  description: string;
  distance: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

const mockClientRequests: ClientRequest[] = [
  {
    id: '1',
    name: 'Nom C.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    description: 'Le client veut être coiffer à domicil',
    distance: '2 Km',
    location: { latitude: 48.8566, longitude: 2.3522 }
  },
  {
    id: '2',
    name: 'Nom C.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    description: 'Le client desire se fair coiffer au salon',
    distance: '6 Km',
    location: { latitude: 48.8666, longitude: 2.3322 }
  },
  {
    id: '3',
    name: 'Nom C.',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetur',
    distance: '1 Km',
    location: { latitude: 48.8466, longitude: 2.3722 }
  }
];

export default function BarberHomeTab() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BarberHome'>;
  const navigation = useNavigation<NavigationProp>();
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>(mockClientRequests);
  const [sheetHeight] = useState(new Animated.Value(SHEET_HEIGHT));
  const gestureRef = useRef(PanGestureHandler);
  const mapRef = useRef<MapView>(null);
  const { user } = useAuth();

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: sheetHeight } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      const newHeight = SHEET_HEIGHT + translationY;
      
      if (newHeight > MIN_SHEET_HEIGHT && newHeight < SHEET_HEIGHT) {
        Animated.spring(sheetHeight, {
          toValue: newHeight > (SHEET_HEIGHT + MIN_SHEET_HEIGHT) / 2 ? MIN_SHEET_HEIGHT : SHEET_HEIGHT,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepted request:', requestId);
    const request = clientRequests.find(req => req.id === requestId);
    if (request) {
      const reservation = {
        id: requestId,
        clientName: request.name,
        clientAvatar: request.avatar,
        description: request.description,
        price: '132$',
        locationPreference: 'domicile' as const,
        clientCoordinates: {
          latitude: request.location.latitude,
          longitude: request.location.longitude,
          address: 'Adresse du client',
        },
        phoneNumber: '+225XXXXXXXXX'
      };
      navigation.navigate('ReservationDetail', { reservation });
    }
  };

  const handleRefuseRequest = (requestId: string) => {
    console.log('Refused request:', requestId);
    setClientRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleViewReservationDetails = (request: ClientRequest) => {
    const reservation = {
      id: request.id,
      clientName: request.name,
      clientAvatar: request.avatar,
      description: request.description,
      price: '132$',
      locationPreference: 'domicile' as const,
      clientCoordinates: {
        latitude: request.location.latitude,
        longitude: request.location.longitude,
        address: 'Adresse du client',
      },
      phoneNumber: '+225XXXXXXXXX'
    };
    navigation.navigate('ReservationDetail', { reservation });
  };

  const renderClientRequest = ({ item }: { item: ClientRequest }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => handleViewReservationDetails(item)}
    >
      <View style={styles.clientInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.clientDetails}>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.refuseButton]}
          onPress={() => handleRefuseRequest(item.id)}
        >
          <Text style={styles.refuseButtonText}>REFUSER</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accepeter</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>Bonjour, {user?.full_name || 'Coiffeur'} </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#6C63FF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person" size={24} color="#6C63FF" />
            </TouchableOpacity>
          </View>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {clientRequests.map((request) => (
            <Marker
              key={request.id}
              coordinate={request.location}
              title={request.name}
              description={request.description}
            />
          ))}
        </MapView>

        <PanGestureHandler
          ref={gestureRef}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.detailsSheet, { height: sheetHeight }]}>
            <View style={styles.dragHandle} />
            <Text style={styles.detailsTitle}>Demandes de réservation</Text>
            
            <FlatList
              data={clientRequests}
              renderItem={renderClientRequest}
              keyExtractor={(item) => item.id}
              style={styles.requestsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.requestsListContent}
            />
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 1,
    backgroundColor: 'white',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  profileButton: {
    padding: 5,
  },
  map: {
    flex: 1,
  },
  detailsSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  requestsList: {
    flex: 1,
  },
  requestsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  distance: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  refuseButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  refuseButtonText: {
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#f44336',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
