import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import conditionnel pour éviter les erreurs
let MapView: any = null;
let Marker: any = null;
let mapError = false;

try {
  if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.MapView;
    Marker = Maps.Marker;
  }
} catch (error) {
  console.warn('react-native-maps not available:', error);
  mapError = true;
}

const MapScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Vérifier si react-native-maps est disponible
    if (mapError || !MapView || !Marker) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, []);

  // Coordonnées de départ (exemple : Abidjan)
  const initialRegion = {
    latitude: 5.3600,
    longitude: -4.0083,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Exemple de marqueurs
  const markers = [
    {
      id: '1',
      title: 'HairGov Salon - Cocody',
      description: 'Salon principal à Cocody',
      coordinate: {
        latitude: 5.3600,
        longitude: -4.0083,
      },
    },
    {
      id: '2',
      title: 'HairGov Salon - Plateau',
      description: 'Salon du Plateau',
      coordinate: {
        latitude: 5.3273,
        longitude: -4.0250,
      },
    },
  ];

  // Écran de chargement
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      </View>
    );
  }

  // Écran d'erreur ou fallback
  if (hasError || Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="map-outline" size={64} color="#6C63FF" />
          <Text style={styles.errorTitle}>Carte non disponible</Text>
          <Text style={styles.errorText}>
            La carte interactive n'est pas disponible sur cet appareil.
          </Text>
          <View style={styles.markersList}>
            <Text style={styles.markersTitle}>Nos salons :</Text>
            {markers.map((marker) => (
              <View key={marker.id} style={styles.markerItem}>
                <Ionicons name="location" size={16} color="#6C63FF" />
                <View>
                  <Text style={styles.markerTitle}>{marker.title}</Text>
                  <Text style={styles.markerDesc}>{marker.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        <MapView 
          style={styles.map} 
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="cut" size={24} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>
    );
  } catch (error) {
    console.error('Map rendering error:', error);
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#ff4444" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorText}>
            Impossible d'afficher la carte. Veuillez réessayer plus tard.
          </Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  markersList: {
    width: '100%',
    marginTop: 20,
  },
  markersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  markerDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  markerContainer: {
    backgroundColor: '#6C63FF',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default MapScreen;