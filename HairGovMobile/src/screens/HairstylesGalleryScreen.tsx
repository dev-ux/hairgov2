import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config/constants';

const { width, height } = Dimensions.get('window');

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (url: string) => {
  try {
    console.log('🔥🔥🔥 NOUVELLE VERSION formatImageUrl appelée 🔥🔥🔥');
    console.log('=== IMAGE URL DEBUG ===');
    console.log('URL originale reçue:', url);
    console.log('API_URL:', API_URL);
    
    if (!url) {
      console.log('URL vide, retourne null');
      return null;
    }

    // Vérifier si l'URL contient déjà un domaine (URL externe comme Unsplash)
    if (url.includes('://') && (url.includes('.com') || url.includes('.jpg') || url.includes('.png') || url.includes('.unsplash'))) {
      console.log('URL externe détectée pour la coiffure:', url);
      return url;
    }

    // Si l'URL commence par /uploads/, la retourner avec le domaine complet
    if (url.startsWith('/uploads/hairstyles')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${url}`;
      console.log('✅ URL uploads/hairstyles détectée:');
      console.log('- Base URL:', baseUrl);
      console.log('- URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL est un chemin relatif simple, construire l'URL complète
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    const fullUrl = `${baseUrl}${url}`;
    console.log('URL relative détectée, URL finale:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Erreur lors du formatage de l\'URL:', error);
    return null;
  }
};

const HairstylesGalleryScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [hairstyles, setHairstyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState<any>(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fetchHairstyles = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/hairstyles`);
      const data = await response.json();
      
      console.log('=== HAIRSTYLES API RESPONSE ===');
      console.log('Success:', data.success);
      console.log('Count:', data.count);
      console.log('Data length:', data.data?.length);
      
      if (data.data && data.data.length > 0) {
        console.log('Sample hairstyle data:');
        console.log('First item:', data.data[0]);
        console.log('Photo field:', data.data[0].photo);
        console.log('All photo fields:', data.data.map((item: any) => ({ name: item.name, photo: item.photo })));
      }
      console.log('================================');
      
      if (data.success) {
        setHairstyles(data.data);
      } else {
        setError('Erreur lors du chargement des coiffures');
      }
    } catch (error) {
      console.error('Erreur fetchHairstyles:', error);
      setError('Impossible de charger les coiffures');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHairstyles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHairstyles();
  };

  const renderHairstyleCard = ({ item, index }: { item: any; index: number }) => {
    const imageUrl = formatImageUrl(item.photo);
    console.log('=== GALLERY DEBUG ===');
    console.log('Item:', item);
    console.log('Photo originale:', item.photo);
    console.log('URL formatée:', imageUrl);
    console.log('==================');
    
    const animatedValue = new Animated.Value(0);
    
    const handlePressIn = () => {
      Animated.spring(animatedValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    // Utiliser uniquement l'URL formatée, avec fallback
    const finalImageUrl = imageUrl || item.photo;
    console.log('URL finale utilisée:', finalImageUrl);

    return (
      <Animated.View
        style={[
          styles.hairstyleCard,
          {
            backgroundColor: colors.card,
            transform: [{ scale: animatedValue }],
            shadowColor: colors.shadow,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setSelectedHairstyle(item)}
        >
          <View style={styles.imageContainer}>
            {finalImageUrl ? (
              <Image
                source={{ uri: finalImageUrl }}
                style={styles.hairstyleImage}
                resizeMode="cover"
                onError={(e) => {
                  console.log('ERREUR IMAGE GALLERY:', item.name, e);
                  console.log('URL tentée:', finalImageUrl);
                }}
              />
            ) : (
              <View style={[styles.defaultImageContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.overlay}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{item.price || '0'} FCFA</Text>
              </View>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="white" />
                <Text style={styles.duration}>{item.estimated_duration || '30'} min</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.hairstyleName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.hairstyleDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.categoryContainer}>
              <Text style={[styles.category, { backgroundColor: colors.primary }]}>
                {item.category || 'Classique'}
              </Text>
              {item.is_active && (
                <View style={styles.activeIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderModal = () => {
    if (!selectedHairstyle) return null;

    const imageUrl = formatImageUrl(selectedHairstyle.photo);

    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setSelectedHairstyle(null)}
        />
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedHairstyle(null)}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.modalDefaultImage, { backgroundColor: colors.surface }]}>
              <Ionicons name="image-outline" size={60} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.modalInfo}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedHairstyle.name}
            </Text>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              {selectedHairstyle.description}
            </Text>
            
            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedHairstyle.price || '0'} FCFA
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedHairstyle.estimated_duration || '30'} minutes
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Ionicons name="grid-outline" size={20} color={colors.primary} />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedHairstyle.category || 'Classique'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setSelectedHairstyle(null);
                // TODO: Naviguer vers la page de réservation
                console.log('Réserver pour:', selectedHairstyle.name);
              }}
            >
              <Text style={styles.bookButtonText}>Réserver maintenant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Galerie de Coiffures</Text>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      {viewMode === 'grid' ? (
        <FlatList
          key="grid"
          data={hairstyles}
          renderItem={renderHairstyleCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune coiffure disponible
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="list"
          data={hairstyles}
          renderItem={renderHairstyleCard}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune coiffure disponible
              </Text>
            </View>
          }
        />
      )}

      {renderModal()}
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewModeButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  hairstyleCard: {
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  hairstyleImage: {
    width: '100%',
    height: '100%',
  },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  priceContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  price: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
  },
  hairstyleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hairstyleDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalDefaultImage: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 16,
    marginLeft: 12,
  },
  bookButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default HairstylesGalleryScreen;
