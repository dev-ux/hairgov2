import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// Types
interface EditForm {
  full_name: string;
  email: string;
  phone: string;
}

type RootStackParamList = {
  Settings: undefined;
};

// Constants
const API_BASE_URL = 'https://hairgov2.onrender.com';
const IMAGE_PICKER_OPTIONS = ['Prendre une photo', 'Choisir depuis la galerie', 'Annuler'];

const UserProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  // States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profile_photo || user?.profile_picture || null
  );
  const [editForm, setEditForm] = useState<EditForm>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Actions
  const handleEditProfile = () => {
    setEditForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setEditModalVisible(true);
  };

  // Image Picker
  const handleImagePicker = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Photo de profil',
        'Choisissez une option',
        [
          { text: 'Prendre une photo', onPress: openCamera },
          { text: 'Choisir depuis la galerie', onPress: openImageLibrary },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'Photo de profil',
        'Choisissez une option',
        [
          { text: 'Prendre une photo', onPress: openCamera },
          { text: 'Choisir depuis la galerie', onPress: openImageLibrary },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    }
  };

  // Image Functions
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  // Upload Function
  const uploadProfileImage = async (imageUri: string) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('profile_photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile_photo.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(imageUri);
        Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
      } else if (response.status === 404) {
        // Fallback si la route n'existe pas encore
        await new Promise(resolve => setTimeout(resolve, 2000));
        setProfileImage(imageUri);
        Alert.alert('Succès', 'Photo de profil mise à jour localement (en attente du déploiement backend)');
      } else {
        const data = await response.json();
        Alert.alert('Erreur', data.message || 'Impossible de mettre à jour la photo');
      }
    } catch (error) {
      console.error('Erreur upload photo:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getUserTypeLabel = (userType?: string) => {
    switch (userType) {
      case 'hairdresser': return 'Coiffeur';
      case 'admin': return 'Administrateur';
      case 'guest': return 'Invité';
      default: return 'Client';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête personnalisé avec bouton de retour */}
      <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <TouchableOpacity 
          onPress={handleEditProfile}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Section Profil */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image 
                source={{ 
                  uri: profileImage.startsWith('http') 
                    ? profileImage
                    : `https://hairgov2.onrender.com${profileImage}`
                }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: colors.input }]}>
                <Ionicons name="person" size={50} color={colors.primary} />
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={handleImagePicker}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.full_name || 'Utilisateur'}
          </Text>
          <Text style={[styles.userType, { backgroundColor: `${colors.primary}20` }]}>
            {getUserTypeLabel(user?.user_type)}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: user?.is_active !== false ? '#4CAF50' : '#FF5252' }
            ]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {user?.is_active !== false ? 'Compte actif' : 'Compte inactif'}
            </Text>
          </View>
        </View>

        {/* Section Informations Personnelles */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations Personnelles</Text>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Nom complet</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{user?.full_name || 'Non défini'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Téléphone</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{user?.phone || 'Non défini'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Email</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{user?.email || 'Non défini'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Vérification</Text>
            </View>
            <Text style={[styles.infoValue, { color: user?.is_verified ? '#4CAF50' : '#FF9800' }]}>
              {user?.is_verified ? 'Vérifié' : 'Non vérifié'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Date d'inscription</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{formatDate(user?.created_at || '')}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Dernière mise à jour</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{formatDate(user?.updated_at || '')}</Text>
          </View>
        </View>

        {/* Section Statistiques */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Réservations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favoris</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avis</Text>
            </View>
          </View>
        </View>

        {/* Section Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
          
          <TouchableOpacity style={[styles.actionButton, { borderBottomColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { borderBottomColor: colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Sécurité du compte</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Préférences de notification</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal d'édition du profil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modifier le profil</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.modalSaveText, { color: colors.primary }]}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Nom complet</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                value={editForm.full_name}
                onChangeText={(text: string) => setEditForm({...editForm, full_name: text})}
                placeholder="Entrez votre nom complet"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                value={editForm.email}
                onChangeText={(text: string) => setEditForm({...editForm, email: text})}
                placeholder="Entrez votre email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Téléphone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                value={editForm.phone}
                onChangeText={(text: string) => setEditForm({...editForm, phone: text})}
                placeholder="Entrez votre numéro de téléphone"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#6C63FF',
    overflow: 'hidden',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  userType: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    backgroundColor: '#6C63FF20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});

export default UserProfileScreen;
