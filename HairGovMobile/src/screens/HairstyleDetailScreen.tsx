import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

// Constants
const API_BASE_URL = 'https://hairgov2.onrender.com';

type HairstyleDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HairstyleDetail'>;
type HairstyleDetailScreenRouteProp = RouteProp<RootStackParamList, 'HairstyleDetail'>;

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

const HairstyleDetailScreen = () => {
  const navigation = useNavigation<HairstyleDetailScreenNavigationProp>();
  const route = useRoute<HairstyleDetailScreenRouteProp>();
  const { colors } = useTheme();
  const { hairstyleId } = route.params;
  
  const [hairstyle, setHairstyle] = useState<Hairstyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHairstyleDetail();
  }, [hairstyleId]);

  const loadHairstyleDetail = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/hairstyles`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const hairstyles = data.data.hairstyles || [];
        const foundHairstyle = hairstyles.find((h: Hairstyle) => h.id === hairstyleId);
        
        if (foundHairstyle) {
          setHairstyle(foundHairstyle);
        } else {
          setError('Coiffure non trouvée');
        }
      } else {
        setError(data.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Error loading hairstyle detail:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    // Naviguer vers l'écran de création de réservation
    navigation.navigate('CreateBooking');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des détails...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !hairstyle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error || 'Coiffure non trouvée'}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Détails de la Coiffure</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {hairstyle.photo ? (
            <Image 
              source={{ uri: hairstyle.photo }}
              style={styles.hairstyleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.hairstyleImage, { backgroundColor: colors.input, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="cut-outline" size={60} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Informations */}
        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.hairstyleName, { color: colors.text }]}>
            {hairstyle.name}
          </Text>
          
          <Text style={[styles.hairstyleCategory, { color: colors.textSecondary }]}>
            {hairstyle.category}
          </Text>

          {hairstyle.description && (
            <Text style={[styles.hairstyleDescription, { color: colors.text }]}>
              {hairstyle.description}
            </Text>
          )}

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {hairstyle.estimated_duration} min
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {hairstyle.price} €
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: hairstyle.is_active ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.statusText}>
                {hairstyle.is_active ? 'Disponible' : 'Indisponible'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity 
          style={[styles.bookingButton, { backgroundColor: hairstyle.is_active ? colors.primary : colors.border }]}
          onPress={handleBooking}
          disabled={!hairstyle.is_active}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={hairstyle.is_active ? '#fff' : colors.textSecondary} 
            style={styles.bookingButtonIcon}
          />
          <Text style={[styles.bookingButtonText, { color: hairstyle.is_active ? '#fff' : colors.textSecondary }]}>
            {hairstyle.is_active ? 'Réserver maintenant' : 'Indisponible'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    borderBottomColor: '#eee',
    marginTop: 80,
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
  content: {
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hairstyleImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  infoContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  hairstyleName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  hairstyleCategory: {
    fontSize: 16,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hairstyleDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bookingButtonIcon: {
    marginRight: 8,
  },
  bookingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HairstyleDetailScreen;
