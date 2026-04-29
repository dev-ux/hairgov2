import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { favoriteService } from '../services/favoriteService';
import { FavoriteButton } from '../components/FavoriteButton';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export const FavoritesScreen = () => {
  const navigation = useNavigation<Nav>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    try {
      setError(null);
      const data = await favoriteService.getFavorites();
      setFavorites(data.filter((f: any) => f.favorite_type === 'hairdresser' && f.hairdresser));
    } catch {
      setError('Impossible de charger les favoris');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));

  const onRefresh = () => { setRefreshing(true); loadFavorites(); };

  const renderItem = ({ item }: { item: any }) => {
    const h = item.hairdresser;
    const photoUri = h.user?.profile_photo && !h.user.profile_photo.startsWith('file://')
      ? h.user.profile_photo : null;
    const rating = typeof h.average_rating === 'number'
      ? h.average_rating : parseFloat(h.average_rating || '0');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BarberDetail' as any, { barberId: h.id })}
        activeOpacity={0.85}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={26} color="#6C63FF" />
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{h.user?.full_name || 'Nom inconnu'}</Text>
          <View style={styles.profChip}>
            <Ionicons name="cut" size={10} color="#6C63FF" />
            <Text style={styles.profText}>{h.profession || 'Coiffeur'}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FF9800" />
            <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
            {h.total_jobs !== undefined && (
              <Text style={styles.ratingJobs}>· {h.total_jobs} prestations</Text>
            )}
          </View>
        </View>

        {/* Favorite + arrow */}
        <View style={styles.actions}>
          <FavoriteButton itemId={h.id} itemType="hairdresser" size={18} />
          <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginTop: 8 }} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
          <View style={{ width: 38 }} />
        </LinearGradient>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
          <Text style={styles.headerSub}>{favorites.length} coiffeur{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      {error ? (
        <View style={styles.centered}>
          <View style={styles.iconWrap}><Ionicons name="wifi-outline" size={36} color="#6C63FF" /></View>
          <Text style={styles.emptyTitle}>Impossible de charger</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadFavorites}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.iconWrap}><Ionicons name="heart-outline" size={36} color="#6C63FF" /></View>
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySubtext}>Ajoutez des coiffeurs à vos favoris pour les retrouver facilement</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.navigate('Barber' as any)}>
            <Text style={styles.retryText}>Découvrir les coiffeurs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.hairdresser?.id || Math.random().toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 2 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: '#EEF0FF' },
  avatarPlaceholder: { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },

  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 5 },
  profChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF0FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6 },
  profText: { fontSize: 11, color: '#6C63FF', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingNum: { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  ratingJobs: { fontSize: 11, color: '#aaa' },

  actions: { alignItems: 'center' },
});

export default FavoritesScreen;
