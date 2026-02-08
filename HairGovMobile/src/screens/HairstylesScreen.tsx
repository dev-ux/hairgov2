import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config/constants';

const { width } = Dimensions.get('window');

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (url: string) => {
  try {
    console.log('Hairstyle URL originale reçue:', url);
    
    if (!url) {
      console.log('Aucune URL fournie pour la coiffure');
      return null;
    }

    // Vérifier si l'URL contient déjà un domaine (URL externe)
    if (url.includes('://') && (url.includes('.com') || url.includes('.jpg') || url.includes('.png') || url.includes('.unsplash'))) {
      console.log('URL externe détectée pour la coiffure:', url);
      return url;
    }

    // Si l'URL commence par /uploads/, construire l'URL complète
    if (url.startsWith('/uploads/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${url}`;
      console.log('URL uploads détectée pour la coiffure, URL finale:', fullUrl);
      return fullUrl;
    }

    // Si l'URL est un chemin relatif simple, construire l'URL complète
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    const fullUrl = `${baseUrl}/uploads/hairstyles/${url}`;
    console.log('URL relative détectée pour la coiffure, URL finale:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Erreur lors du formatage de l\'URL de la coiffure:', error);
    return null;
  }
};

const HairstylesScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [hairstyles, setHairstyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHairstyles = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/v1/hairstyles`);
      const data = await response.json();
      
      if (data.success) {
        setHairstyles(data.data);
      } else {
        setError('Erreur lors du chargement des coiffures');
      }
    } catch (error) {
      setError('Impossible de charger les coiffures');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHairstyles();
  }, []);

  const renderHairstyle = ({ item }) => (
    <TouchableOpacity
      style={[styles.hairstyleCard, { backgroundColor: colors.card }]}
      onPress={() => console.log('Hairstyle selected:', item.name)}
    >
      <View style={styles.hairstyleImageContainer}>
        {item.photo ? (
          (() => {
            const formattedUrl = formatImageUrl(item.photo);
            console.log('=== DEBUG COIFFURE ===');
            console.log('Nom:', item.name);
            console.log('Photo originale:', item.photo);
            console.log('URL formatée:', formattedUrl);
            console.log('========================');
            return (
              <Image 
                source={{ uri: formattedUrl || item.photo }} 
                style={styles.hairstyleImage} 
                resizeMode="cover" 
                onError={(e) => {
                  console.log('Erreur de chargement de l\'image hairstyle:', item.name, e);
                  console.log('URL tentée:', formattedUrl);
                }}
              />
            );
          })()
        ) : (
          <View style={[styles.defaultImageContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.hairstyleInfo}>
        <Text style={[styles.hairstyleName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.hairstyleDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.hairstyleMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {item.category}
            </Text>
          </View>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.durationText, { color: colors.textSecondary }]}>
              {item.estimated_duration}min
            </Text>
          </View>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Nos Coiffures</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nos Coiffures</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchHairstyles}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={hairstyles}
          renderItem={renderHairstyle}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cut-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune coiffure disponible
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  listContainer: { padding: 16 },
  row: { justifyContent: 'space-between' },
  hairstyleCard: {
    width: (width - 48) / 2,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  hairstyleImageContainer: { width: '100%', height: 120 },
  hairstyleImage: { width: '100%', height: '100%' },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hairstyleInfo: { padding: 12 },
  hairstyleName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  hairstyleDescription: { fontSize: 12, marginBottom: 8 },
  hairstyleMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 10, fontWeight: '500' },
  durationContainer: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 10, marginLeft: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 10 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 20 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 10 },
});

export default HairstylesScreen;
