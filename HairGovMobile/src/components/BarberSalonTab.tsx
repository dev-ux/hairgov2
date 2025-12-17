import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface Salon {
  id: string;
  name: string;
  address: string;
  photos: string[];
  is_validated: boolean;
  created_at: string;
}

export default function BarberSalonTab() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMode, setEditingMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  useEffect(() => {
    fetchSalonInfo();
  }, []);

  const fetchSalonInfo = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      // const response = await api.get('/salons/my-salon');
      
      // Données mockées pour l'instant
      const mockSalon: Salon = {
        id: '1',
        name: 'Salon de Coiffure Premium',
        address: '123 Avenue des Champs-Élysées, Paris',
        photos: [
          'https://images.unsplash.com/photo-1560066986-280031964726?w=800',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
        ],
        is_validated: true,
        created_at: '2025-01-01T00:00:00Z',
      };
      
      setSalon(mockSalon);
      setFormData({
        name: mockSalon.name,
        address: mockSalon.address,
      });
    } catch (error) {
      console.error('Error fetching salon info:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations du salon');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Remplacer par l'appel API réel
      // await api.put('/salons/my-salon', formData);
      
      setSalon(prev => prev ? { ...prev, ...formData } : null);
      setEditingMode(false);
      Alert.alert('Succès', 'Informations du salon mises à jour');
    } catch (error) {
      console.error('Error updating salon:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les informations');
    }
  };

  const handleCancel = () => {
    if (salon) {
      setFormData({
        name: salon.name,
        address: salon.address,
      });
    }
    setEditingMode(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!salon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noSalonContainer}>
          <Ionicons name="business-outline" size={64} color="#ccc" />
          <Text style={styles.noSalonTitle}>Aucun salon</Text>
          <Text style={styles.noSalonText}>
            Vous n'avez pas encore enregistré de salon
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Créer mon salon</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Salon</Text>
          {!editingMode && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingMode(true)}
            >
              <Ionicons name="create-outline" size={20} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Photos du salon */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Photos du salon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {salon.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
            <TouchableOpacity style={styles.addPhotoButton}>
              <Ionicons name="add" size={24} color="#6C63FF" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Informations du salon */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations du salon</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom du salon</Text>
            {editingMode ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Nom du salon"
              />
            ) : (
              <Text style={styles.value}>{salon.name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Adresse</Text>
            {editingMode ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Adresse du salon"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>{salon.address}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Statut de validation</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: salon.is_validated ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.statusText}>
                {salon.is_validated ? 'Validé' : 'En attente'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date de création</Text>
            <Text style={styles.value}>
              {new Date(salon.created_at).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {editingMode && (
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  noSalonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noSalonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noSalonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  photosSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 15,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
