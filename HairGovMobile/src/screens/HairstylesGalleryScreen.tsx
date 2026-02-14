import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const API_BASE_URL = 'https://hairgov2.onrender.com';
const { width, height } = Dimensions.get('window');

type HairstylesGalleryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HairstylesGallery'>;

interface Hairstyle {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  category: string;
  price: number;
  estimated_duration: number;
  is_active: boolean;
}

const HairstylesGalleryScreen = () => {
  const navigation = useNavigation<HairstylesGalleryScreenNavigationProp>();
  const { colors } = useTheme();
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    loadHairstyles();
  }, []);

  const loadHairstyles = async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/hairstyles`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setHairstyles(data.data.hairstyles || []);
      } else {
        setError(data.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Error loading hairstyles:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHairstyles();
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const renderHairstyleItem = ({ item }: { item: Hairstyle }) => (
    <TouchableOpacity 
      style={[styles.hairstyleCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('HairstyleDetail', { hairstyleId: item.id })}
    >
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => item.photo && openImageModal(item.photo)}
        activeOpacity={0.9}
      >
        {item.photo ? (
          <Image 
            source={{ uri: item.photo }}
            style={styles.hairstyleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.hairstyleImage, { backgroundColor: colors.input, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="cut-outline" size={40} color={colors.textSecondary} />
          </View>
        )}
       
      </TouchableOpacity>
      <View style={styles.hairstyleInfo}>
        <Text style={[styles.hairstyleName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.hairstyleCategory, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.category}
        </Text>
        <View style={styles.hairstyleMeta}>
          <Text style={[styles.hairstylePrice, { color: colors.primary }]}>
            {item.price} €
          </Text>
          <Text style={[styles.hairstyleDuration, { color: colors.textSecondary }]}>
            {item.estimated_duration} min
          </Text>
        </View>
      </View>
     
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Galerie de Coiffures</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des coiffures...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Galerie de Coiffures</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={loadHairstyles}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={hairstyles}
          renderItem={renderHairstyleItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cut-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune coiffure disponible
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Revenez plus tard pour découvrir nos dernières créations
              </Text>
            </View>
          }
        />
      )}

      {/* Modal pour le zoom d'image */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={closeImageModal}
            activeOpacity={0.9}
          >
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={closeImageModal}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#F44336',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  hairstyleCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  hairstyleImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hairstyleInfo: {
    padding: 12,
  },
  hairstyleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hairstyleCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  hairstyleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hairstylePrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  hairstyleDuration: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HairstylesGalleryScreen;
