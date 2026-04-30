import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { favoriteService, salonFavoriteService, hairstyleFavoriteService } from '../services/favoriteService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
type TabKey = 'hairdresser' | 'salon' | 'hairstyle';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'hairdresser', label: 'Coiffeurs',  icon: 'cut-outline' },
  { key: 'salon',       label: 'Salons',     icon: 'storefront-outline' },
  { key: 'hairstyle',   label: 'Coiffures',  icon: 'color-wand-outline' },
];

export const FavoritesScreen = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab]             = useState<TabKey>('hairdresser');
  const [hairdresserFavs, setHairdresserFavs] = useState<any[]>([]);
  const [salonFavs, setSalonFavs]             = useState<any[]>([]);
  const [hairstyleFavs, setHairstyleFavs]     = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  // ── Chargement ────────────────────────────────────────────────
  const loadFavorites = async () => {
    try {
      setError(null);
      const data = await favoriteService.getFavorites();
      setHairdresserFavs(data.filter((f: any) => f.favorite_type === 'hairdresser' && f.hairdresser));
      setSalonFavs(data.filter((f: any) => f.favorite_type === 'salon' && f.salon));
      setHairstyleFavs(data.filter((f: any) => f.favorite_type === 'hairstyle' && f.hairstyle));
    } catch {
      setError('Impossible de charger les favoris');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));
  const onRefresh = () => { setRefreshing(true); loadFavorites(); };

  // ── Suppression ───────────────────────────────────────────────
  const confirmRemove = (label: string, onConfirm: () => void) => {
    Alert.alert(
      'Retirer des favoris',
      `Voulez-vous retirer "${label}" de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', style: 'destructive', onPress: onConfirm },
      ],
    );
  };

  const handleRemoveHairdresser = (hairdresserId: string, name: string) => {
    confirmRemove(name, async () => {
      await favoriteService.removeFromFavorites(hairdresserId);
      setHairdresserFavs(prev => prev.filter(f => f.hairdresser?.id !== hairdresserId));
    });
  };

  const handleRemoveSalon = (salonId: string, name: string) => {
    confirmRemove(name, async () => {
      await salonFavoriteService.removeFromFavorites(salonId);
      setSalonFavs(prev => prev.filter(f => f.salon?.id !== salonId));
    });
  };

  const handleRemoveHairstyle = (hairstyleId: string, name: string) => {
    confirmRemove(name, async () => {
      await hairstyleFavoriteService.removeFromFavorites(hairstyleId);
      setHairstyleFavs(prev => prev.filter(f => f.hairstyle?.id !== hairstyleId));
    });
  };

  // ── Cartes coiffeur ───────────────────────────────────────────
  const renderHairdresser = ({ item }: { item: any }) => {
    const h = item.hairdresser;
    const photoUri = h.user?.profile_photo && !h.user.profile_photo.startsWith('file://')
      ? h.user.profile_photo : null;
    const rating = typeof h.average_rating === 'number'
      ? h.average_rating : parseFloat(h.average_rating || '0');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BarberDetail', { barberId: h.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardStripe} />

        <View style={styles.avatarWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={26} color="#6C63FF" />
            </LinearGradient>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.cardName} numberOfLines={1}>{h.user?.full_name || 'Nom inconnu'}</Text>
          <View style={styles.chip}>
            <Ionicons name="cut" size={10} color="#6C63FF" />
            <Text style={styles.chipText}>{h.profession || 'Coiffeur'}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FF9800" />
            <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
            {h.total_jobs !== undefined && (
              <Text style={styles.ratingJobs}>· {h.total_jobs} prestations</Text>
            )}
          </View>
        </View>

        <View style={styles.cardRight}>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => handleRemoveHairdresser(h.id, h.user?.full_name || 'ce coiffeur')}
          >
            <Ionicons name="heart" size={20} color="#FF4757" />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={17} color="#ddd" style={{ marginTop: 6 }} />
        </View>
      </TouchableOpacity>
    );
  };

  // ── Cartes salon ──────────────────────────────────────────────
  const renderSalon = ({ item }: { item: any }) => {
    const s = item.salon;
    const photoUri = s.photos?.[0]?.url || s.photo_url || s.cover_photo || null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SalonDetail' as any, { salonId: s.id })}
        activeOpacity={0.85}
      >
        <View style={[styles.cardStripe, { backgroundColor: '#FF9800' }]} />

        <View style={styles.avatarWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.avatarPlaceholder}>
              <Ionicons name="storefront" size={26} color="#FF9800" />
            </LinearGradient>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.cardName} numberOfLines={1}>{s.name || 'Salon'}</Text>
          <View style={[styles.chip, styles.chipSalon]}>
            <Ionicons name="storefront-outline" size={10} color="#FF9800" />
            <Text style={[styles.chipText, { color: '#FF9800' }]}>Salon</Text>
          </View>
          {s.address ? (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={12} color="#aaa" />
              <Text style={styles.addressText} numberOfLines={1}>{s.address}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardRight}>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => handleRemoveSalon(s.id, s.name || 'ce salon')}
          >
            <Ionicons name="heart" size={20} color="#FF4757" />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={17} color="#ddd" style={{ marginTop: 6 }} />
        </View>
      </TouchableOpacity>
    );
  };

  // ── Cartes coiffure ───────────────────────────────────────────
  const renderHairstyle = ({ item }: { item: any }) => {
    const h = item.hairstyle;
    const photoUri = h.photo || h.photo_url || null;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85}>
        <View style={[styles.cardStripe, { backgroundColor: '#E91E8C' }]} />

        <View style={styles.avatarWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#FCE4EC', '#F8BBD0']} style={styles.avatarPlaceholder}>
              <Ionicons name="color-wand" size={26} color="#E91E8C" />
            </LinearGradient>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.cardName} numberOfLines={1}>{h.name || 'Coiffure'}</Text>
          <View style={[styles.chip, styles.chipHairstyle]}>
            <Ionicons name="color-wand-outline" size={10} color="#E91E8C" />
            <Text style={[styles.chipText, { color: '#E91E8C' }]}>{h.category || 'Coiffure'}</Text>
          </View>
          {h.estimated_duration ? (
            <View style={styles.addressRow}>
              <Ionicons name="time-outline" size={12} color="#aaa" />
              <Text style={styles.addressText}>{h.estimated_duration} min</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardRight}>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => handleRemoveHairstyle(h.id, h.name || 'cette coiffure')}
          >
            <Ionicons name="heart" size={20} color="#FF4757" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ── État vide ─────────────────────────────────────────────────
  const EMPTY_CONFIG: Record<TabKey, { icon: string; title: string; hint: string }> = {
    hairdresser: { icon: 'cut-outline',        title: 'Aucun coiffeur favori',  hint: 'Appuyez sur ♡ sur un coiffeur pour l\'ajouter ici' },
    salon:       { icon: 'storefront-outline', title: 'Aucun salon favori',     hint: 'Appuyez sur ♡ sur un salon pour l\'ajouter ici' },
    hairstyle:   { icon: 'color-wand-outline', title: 'Aucune coiffure favorite', hint: 'Appuyez sur ♡ sur une coiffure pour l\'ajouter ici' },
  };

  const EmptyState = ({ tab }: { tab: TabKey }) => {
    const cfg = EMPTY_CONFIG[tab];
    return (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name={cfg.icon as any} size={36} color="#6C63FF" />
        </View>
        <Text style={styles.emptyTitle}>{cfg.title}</Text>
        <Text style={styles.emptySubtext}>{cfg.hint}</Text>
      </View>
    );
  };

  // ── Données actives ───────────────────────────────────────────
  const activeList = activeTab === 'hairdresser' ? hairdresserFavs : activeTab === 'salon' ? salonFavs : hairstyleFavs;
  const renderItem = activeTab === 'hairdresser' ? renderHairdresser : activeTab === 'salon' ? renderSalon : renderHairstyle;
  const totalLabel = `${hairdresserFavs.length} coiffeur${hairdresserFavs.length !== 1 ? 's' : ''} · ${salonFavs.length} salon${salonFavs.length !== 1 ? 's' : ''} · ${hairstyleFavs.length} coiffure${hairstyleFavs.length !== 1 ? 's' : ''}`;

  // ── Header commun ─────────────────────────────────────────────
  const Header = () => (
    <LinearGradient
      colors={['#6C63FF', '#8B84FF']}
      style={styles.headerGrad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
          {!loading && <Text style={styles.headerSub}>{totalLabel}</Text>}
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      {/* ── Onglets ── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const count   = tab.key === 'hairdresser' ? hairdresserFavs.length : salonFavs.length;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon as any}
                size={15}
                color={isActive ? '#6C63FF' : '#999'}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Contenu ── */}
      {error ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="wifi-outline" size={32} color="#6C63FF" />
          </View>
          <Text style={styles.emptyTitle}>Impossible de charger</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadFavorites}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : activeList.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <FlatList
          data={activeList}
          renderItem={renderItem as any}
          keyExtractor={(item) => item.id || item.hairdresser?.id || item.salon?.id || Math.random().toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} tintColor="#6C63FF" />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },

  // Header
  headerGrad:   { paddingHorizontal: 16, paddingVertical: 14 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#6C63FF' },
  tabText:   { fontSize: 14, fontWeight: '600', color: '#aaa' },
  tabTextActive: { color: '#6C63FF' },
  tabBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeActive:     { backgroundColor: '#EEF0FF' },
  tabBadgeText:       { fontSize: 10, fontWeight: '700', color: '#aaa' },
  tabBadgeTextActive: { color: '#6C63FF' },

  // Cards
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardStripe:  { width: 4, alignSelf: 'stretch', backgroundColor: '#6C63FF' },
  avatarWrap:  { marginHorizontal: 14 },
  avatar:          { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#EEF0FF' },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },

  info: { flex: 1, paddingVertical: 14 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 5 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, alignSelf: 'flex-start', marginBottom: 5,
  },
  chipSalon:     { backgroundColor: '#FFF3E0' },
  chipHairstyle: { backgroundColor: '#FCE4EC' },
  chipText:      { fontSize: 11, color: '#6C63FF', fontWeight: '600' },

  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingNum:  { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  ratingJobs: { fontSize: 11, color: '#aaa' },

  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addressText:{ fontSize: 12, color: '#aaa', flex: 1 },

  cardRight:  { paddingRight: 14, alignItems: 'center' },
  heartBtn:   { padding: 6 },

  // States
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  emptyBox:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 10 },
  emptyIconWrap:{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center' },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 16 },
  retryBtn:     { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default FavoritesScreen;
