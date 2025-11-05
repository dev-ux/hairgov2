import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export const FavoritesScreen = () => {
    const navigation = useNavigation<FavoritesScreenNavigationProp>();
  // Données factices pour l'exemple
  const favorites = [
    { id: '1', name: 'Salon Élégance', type: 'Coiffure' },
    { id: '2', name: 'Beauté Naturelle', type: 'Soin visage' },
  ];

  return (
    <View style={styles.container}>
        {/* En-tête personnalisé avec bouton de retour */}
              <View style={styles.headerContainer}>
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes Favoris</Text>
                <View style={{ width: 24 }} /> {/* Pour équilibrer le flexbox */}
              </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.favoriteItem}>
            <Ionicons name="heart" size={24} color="#FF5A5F" style={styles.icon} />
            <View>
              <Text style={styles.favoriteName}>{item.name}</Text>
              <Text style={styles.favoriteType}>{item.type}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  favoriteType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default FavoritesScreen;
