import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { searchCities, formatCityForSelect } from '../data/ivoryCoastCities';

interface City {
  id: number;
  name: string;
  alternateNames: string[];
  latitude: number;
  longitude: number;
  featureClass: string;
  featureCode: string;
  country: string;
  adminCodes: string[];
  population: number;
  elevation: number;
  timezone: string;
  modificationDate: string;
}

interface AddressSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  placeholder?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddressSelector: React.FC<AddressSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  placeholder = 'Rechercher une ville...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const filteredCities = useMemo(() => {
    return searchCities(searchQuery).slice(0, 50); // Limiter à 50 résultats
  }, [searchQuery]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    onSelect(city);
    onClose();
    setSearchQuery('');
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCitySelect(item)}
    >
      <View>
        <Text style={styles.cityName}>{item.name}</Text>
        <Text style={styles.cityCoords}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
        {item.population > 0 && (
          <Text style={styles.cityPopulation}>
            Pop: {item.population.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sélectionner une ville</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>

        {/* Liste des villes */}
        <FlatList
          data={filteredCities}
          renderItem={renderCityItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.cityList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Aucune ville trouvée' : 'Entrez un nom de ville'}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cityCoords: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cityPopulation: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AddressSelector;
