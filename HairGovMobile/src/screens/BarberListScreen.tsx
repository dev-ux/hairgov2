import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../config/constants';
import { FavoriteButton } from '../components/FavoriteButton';

type BarberListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Barber'>;

interface Hairdresser {
  id: string;
  full_name: string;
  average_rating: number;
  total_jobs: number;
  profile_photo?: string | null;
  profession?: string;
  address?: string;
  is_available: boolean;
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_photo: string | null;
  };
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const BarberListScreen: React.FC = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const navigation = useNavigation<BarberListScreenNavigationProp>();

  const fetchHairdressers = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/hairdressers`, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.hairdressers)) {
        const mapped: Hairdresser[] = data.data.hairdressers.map((h: any) => ({
          id: h.user?.id || h.id,
          full_name: h.user?.full_name || 'Nom inconnu',
          profession: h.profession || 'Coiffeur',
          average_rating: h.average_rating || 0,
          total_jobs: h.total_jobs || 0,
          profile_photo: h.user?.profile_photo || null,
          address: h.address || '',
          is_available: h.is_available || false,
          user: h.user,
        }));
        setHairdressers(mapped);
      } else {
        setHairdressers([]);
      }
    } catch {
      setError('Impossible de charger la liste des coiffeurs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHairdressers(); }, [fetchHairdressers]);

  const onRefresh = () => { setRefreshing(true); fetchHairdressers(); };

  const filtered = hairdressers.filter((h) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      h.full_name?.toLowerCase().includes(q) ||
      h.profession?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q);
    return matchSearch && (!filterAvailable || h.is_available);
  });

  const availableCount = hairdressers.filter((h) => h.is_available).length;

  const renderItem = ({ item }: { item: Hairdresser }) => {
    const barberId = String(item.id);
    const photoUri = item.profile_photo && !item.profile_photo.startsWith('file://')
      ? item.profile_photo
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BarberDetail', { barberId })}
        activeOpacity={0.85}
      >
        {/* Favorite button */}
        <View style={styles.favoriteBtn}>
          <FavoriteButton itemId={item.id} itemType="hairdresser" size={14} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarRing, { borderColor: item.is_available ? '#4CAF50' : '#ddd' }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="#6C63FF" />
              </LinearGradient>
            )}
          </View>
          <View style={[styles.availDot, { backgroundColor: item.is_available ? '#4CAF50' : '#bbb' }]} />
        </View>

        {/* Info */}
        <Text style={styles.cardName} numberOfLines={1}>{item.full_name}</Text>

        <View style={styles.professionChip}>
          <Ionicons name="cut" size={10} color="#6C63FF" />
          <Text style={styles.professionText} numberOfLines={1}>{item.profession || 'Coiffeur'}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#FF9800" />
          <Text style={styles.ratingNum}>{(item.average_rating || 0).toFixed(1)}</Text>
          <Text style={styles.ratingJobs}>· {item.total_jobs} jobs</Text>
        </View>

        {/* Availability label */}
        <Text style={[styles.availLabel, { color: item.is_available ? '#4CAF50' : '#bbb' }]}>
          {item.is_available ? 'Disponible' : 'Indisponible'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.header}>
          <Text style={styles.headerTitle}>Nos Coiffeurs</Text>
        </LinearGradient>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.header}>
          <Text style={styles.headerTitle}>Nos Coiffeurs</Text>
        </LinearGradient>
        <View style={styles.centered}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="wifi-outline" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.errorTitle}>Connexion impossible</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchHairdressers}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#6C63FF', '#8B84FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Nos Coiffeurs</Text>
            <Text style={styles.headerSub}>
              {hairdressers.length} coiffeur{hairdressers.length > 1 ? 's' : ''} · {availableCount} disponible{availableCount > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un coiffeur..."
            placeholderTextColor="#bbb"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter chip */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, filterAvailable && styles.chipActive]}
          onPress={() => setFilterAvailable(!filterAvailable)}
        >
          <View style={[styles.chipDot, { backgroundColor: filterAvailable ? '#4CAF50' : '#bbb' }]} />
          <Text style={[styles.chipText, filterAvailable && styles.chipTextActive]}>
            Disponibles seulement
          </Text>
        </TouchableOpacity>
        <Text style={styles.resultCount}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</Text>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="cut-outline" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.emptyTitle}>Aucun coiffeur trouvé</Text>
          <Text style={styles.emptySubtext}>Essayez d'autres mots-clés</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, color: '#888', fontWeight: '500' },
  chipTextActive: { color: '#388E3C', fontWeight: '700' },
  resultCount: { fontSize: 12, color: '#aaa', fontWeight: '500' },

  grid: { padding: 16, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12 },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 4,
  },

  avatarWrapper: { position: 'relative', marginBottom: 10, marginTop: 4 },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  availDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },

  cardName: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', textAlign: 'center', marginBottom: 5 },

  professionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  professionText: { fontSize: 11, color: '#6C63FF', fontWeight: '600' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  ratingNum: { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  ratingJobs: { fontSize: 11, color: '#aaa' },

  availLabel: { fontSize: 11, fontWeight: '600' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  loadingText: { fontSize: 14, color: '#999' },

  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  errorSubtext: { fontSize: 13, color: '#999', textAlign: 'center' },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#999' },
});

export default BarberListScreen;
