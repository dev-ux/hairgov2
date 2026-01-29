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
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { createSalon, getMySalon, updateSalon, Salon as SalonType, CreateSalonData } from '../services/salon.service';
import AddressSelector from './AddressSelector';

const { width } = Dimensions.get('window');

interface Salon {
  id: string;
  hairdresser_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export default function BarberSalonTab() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMode, setEditingMode] = useState(false);
  const [creatingMode, setCreatingMode] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [formData, setFormData] = useState<CreateSalonData>({
    name: '',
    address: '',
    latitude: 5.3600, // Abidjan coordinates
    longitude: -3.9500,
    description: '',
    phone: '',
    email: '',
    business_hours: '',
    photos: []
  });

  // Demander les permissions pour l'appareil photo et la galerie
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Désolé, nous avons besoin des permissions pour accéder à vos photos pour que cela fonctionne !'
        );
      }
    })();
  }, []);

  const handleAddPhoto = async () => {
    try {
      // Demander à l'utilisateur de choisir entre la galerie ou l'appareil photo
      Alert.alert(
        'Ajouter une photo',
        'Choisissez comment vous voulez ajouter une photo',
        [
          {
            text: 'Galerie',
            onPress: pickImageFromGallery,
          },
          {
            text: 'Appareil photo',
            onPress: pickImageFromCamera,
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de photo:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter une photo');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const currentPhotos = formData.photos || [];
        const newPhotos = [...currentPhotos, result.assets[0].uri];
        setFormData(prev => ({ ...prev, photos: newPhotos }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner cette photo');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra pour prendre des photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const currentPhotos = formData.photos || [];
        const newPhotos = [...currentPhotos, result.assets[0].uri];
        setFormData(prev => ({ ...prev, photos: newPhotos }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre cette photo');
    }
  };

  const handleAddressSelect = (city: any) => {
    setFormData(prev => ({
      ...prev,
      address: city.name,
      latitude: city.latitude,
      longitude: city.longitude
    }));
  };

  const addPhotoToSalon = async (photoUri: string) => {
    try {
      if (creatingMode) {
        // Mode création : ajouter au formulaire
        const currentPhotos = formData.photos || [];
        const updatedPhotos = [...currentPhotos, photoUri];
        setFormData({ ...formData, photos: updatedPhotos });
      } else if (salon) {
        // Mode édition : mettre à jour le salon existant
        const currentPhotos = salon.photos || [];
        const updatedPhotos = [...currentPhotos, photoUri];
        const updatedSalon = { ...salon, photos: updatedPhotos };
        setSalon(updatedSalon);
        
        // Mettre à jour sur le backend
        await updateSalon(salon.id, { photos: updatedPhotos });
        Alert.alert('Succès', 'Photo ajoutée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la photo au salon:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la photo au salon');
    }
  };

  useEffect(() => {
    fetchSalonInfo();
  }, []);

  const fetchSalonInfo = async () => {
    try {
      setLoading(true);
      const response = await getMySalon();
      
      if (response.success && response.data) {
        setSalon(response.data);
        setFormData({
          name: response.data.name,
          address: response.data.address,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          description: '',
          phone: '',
          email: '',
          business_hours: '',
          photos: response.data.photos || []
        });
      } else {
        // No salon exists, show creation mode
        setSalon(null);
      }
    } catch (error: any) {
      console.error('Error fetching salon info:', error);
      // If 404 or similar error, it means no salon exists
      if (error.response?.status === 404) {
        setSalon(null);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les informations du salon');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom du salon est obligatoire');
      return;
    }
    
    if (!formData.address.trim()) {
      Alert.alert('Erreur', 'L\'adresse du salon est obligatoire');
      return;
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    try {
      if (creatingMode) {
        // Create new salon
        const response = await createSalon(formData);
        if (response.success) {
          setSalon(response.data);
          setCreatingMode(false);
          Alert.alert('Succès', 'Votre salon a été créé avec succès');
        } else {
          Alert.alert('Erreur', response.message || 'Impossible de créer le salon');
        }
      } else if (salon) {
        // Update existing salon
        const response = await updateSalon(salon.id, formData);
        if (response.success) {
          setSalon(response.data);
          setEditingMode(false);
          Alert.alert('Succès', 'Informations du salon mises à jour');
        } else {
          Alert.alert('Erreur', response.message || 'Impossible de mettre à jour les informations');
        }
      }
    } catch (error: any) {
      console.error('Error saving salon:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Impossible de sauvegarder le salon';
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleCancel = () => {
    if (creatingMode) {
      setCreatingMode(false);
      // Reset form data
      setFormData({
        name: '',
        address: '',
        latitude: 5.3600,
        longitude: -3.9500,
        description: '',
        phone: '',
        email: '',
        business_hours: '',
        photos: []
      });
    } else if (salon) {
      setFormData({
        name: salon.name,
        address: salon.address,
        latitude: salon.latitude,
        longitude: salon.longitude,
        description: '',
        phone: '',
        email: '',
        business_hours: '',
        photos: salon.photos || []
      });
      setEditingMode(false);
    }
  };

  const handleCreateSalon = () => {
    setCreatingMode(true);
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

  if (!salon && !creatingMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noSalonContainer}>
          <Ionicons name="business-outline" size={64} color="#ccc" />
          <Text style={styles.noSalonTitle}>Aucun salon</Text>
          <Text style={styles.noSalonText}>
            Vous n'avez pas encore enregistré de salon
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateSalon}>
            <Text style={styles.createButtonText}>Créer mon salon</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (creatingMode) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Créer un salon</Text>
          </View>

          {/* Formulaire de création */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informations du salon</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nom du salon *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Nom du salon"
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Adresse *</Text>
              <View style={styles.addressContainer}>
                <TextInput
                  style={[styles.input, styles.textArea, styles.addressInput]}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="Adresse complète du salon"
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={styles.addressSelectorButton}
                  onPress={() => setShowAddressSelector(true)}
                >
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <Text style={styles.addressSelectorText}>Choisir une ville</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Numéro de téléphone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Email du salon"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Description du salon et services proposés"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Heures d'ouverture</Text>
              <TextInput
                style={styles.input}
                value={formData.business_hours}
                onChangeText={(text) => setFormData(prev => ({ ...prev, business_hours: text }))}
                placeholder="Ex: Lun-Ven: 9h-18h, Sam: 9h-17h"
              />
            </View>
          </View>

          {/* Photos du salon */}
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos du salon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.photos && formData.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photo} />
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Ionicons name="add" size={24} color="#6C63FF" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, !formData.name || !formData.address ? styles.saveButtonDisabled : '']} 
              onPress={handleSave}
              disabled={!formData.name || !formData.address}
            >
              <Text style={styles.saveButtonText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <AddressSelector
          visible={showAddressSelector}
          onClose={() => setShowAddressSelector(false)}
          onSelect={handleAddressSelect}
          placeholder="Rechercher une ville en Côte d'Ivoire..."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {creatingMode ? 'Créer un salon' : salon ? 'Mon Salon' : 'Mon Salon'}
          </Text>
          {!editingMode && !creatingMode && salon && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingMode(true)}
            >
              <Ionicons name="create-outline" size={20} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Photos du salon */}
        {salon && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos du salon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {salon.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photo} />
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Ionicons name="add" size={24} color="#6C63FF" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Informations du salon */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations du salon</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom du salon</Text>
            {editingMode && salon ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Nom du salon"
              />
            ) : (
              <Text style={styles.value}>{salon?.name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Adresse</Text>
            {editingMode && salon ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Adresse du salon"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>{salon?.address}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Statut de validation</Text>
            {salon && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: salon.is_validated ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.statusText}>
                  {salon.is_validated ? 'Validé' : 'En attente'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date de création</Text>
            <Text style={styles.value}>
              {salon ? new Date(salon.created_at).toLocaleDateString('fr-FR') : ''}
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addressContainer: {
    position: 'relative',
  },
  addressInput: {
    paddingRight: 120, // Space for the button
  },
  addressSelectorButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addressSelectorText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});
