import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const MapScreen = () => {
  // Coordonnées de départ (exemple : Paris)
  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Exemple de marqueurs
  const markers = [
    {
      id: '1',
      title: 'Salon de coiffure Paris',
      description: 'Un super salon au cœur de Paris',
      coordinate: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    },
    // Ajoutez plus de marqueurs selon vos besoins
  ];

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
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
