import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  TextInput,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE_URL = 'https://hairgov2.onrender.com';
const { width, height } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList, 'HairstylesGallery'>;

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

const CATEGORIES = ['Tout', 'Tresses', 'Lissage', 'Naturel', 'Afro', 'Locks', 'Coloration', 'Chignon'];

const HairstylesGalleryScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [filtered, setFiltered] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [zoomItem, setZoomItem] = useState<Hairstyle | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadHairstyles();
  }, []);

  useEffect(() => {
    applyFilters(hairstyles, selectedCategory, search);
  }, [selectedCategory, search, hairstyles]);

  const loadHairstyles = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/v1/hairstyles`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        const list: Hairstyle[] = data.data.hairstyles || [];
        setHairstyles(list);
        setFiltered(list);
      } else {
        setError(data.error?.message || 'Erreur lors du chargement');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (list: Hairstyle[], category: string, query: string) => {
    let result = list;
    if (category !== 'Tout') {
      result = result.filter(h =>
        h.category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(h =>
        h.name.toLowerCase().includes(q) || h.category?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHairstyles();
  };

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const renderCard = ({ item, index }: { item: Hairstyle; index: number }) => {
    const isFav = favorites.has(item.id);
    const isOdd = index % 2 !== 0;
    const cardHeight = isOdd ? 220 : 190;

    return (
      <TouchableOpacity
        style={[styles.card, { height: cardHeight, backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('HairstyleDetail', { hairstyleId: item.id })}
        activeOpacity={0.92}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => item.photo && setZoomItem(item)}
          activeOpacity={1}
        >
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImage, styles.cardPlaceholder, { backgroundColor: colors.input }]}>
              <Ionicons name="cut-outline" size={36} color={colors.textSecondary} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={styles.cardGradient}
          />
        </TouchableOpacity>

        {/* Category badge */}
        {item.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        ) : null}

        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => toggleFavorite(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#FF6B6B' : 'white'}
          />
        </TouchableOpacity>

        {/* Bottom info */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardPrice}>{item.price} FCFA</Text>
            <View style={styles.durationPill}>
              <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.8)" />
              <Text style={styles.durationText}>{item.estimated_duration}min</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Hero */}
      <LinearGradient
        colors={['#6C63FF', '#8B84FF', '#B8B0FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>Explorez notre</Text>
          <Text style={styles.heroTitle}>Galerie de{'\n'}Coiffures</Text>
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{hairstyles.length}</Text>
              <Text style={styles.statLabel}>Styles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{CATEGORIES.length - 1}</Text>
              <Text style={styles.statLabel}>Catégories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favorites.size}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroDecor1} />
        <View style={styles.heroDecor2} />
      </LinearGradient>

      {/* Search bar */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.input }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher une coiffure..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={{ backgroundColor: colors.background }}
      >
        {CATEGORIES.map(cat => {
          const active = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                active
                  ? styles.categoryChipActive
                  : { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              {active && (
                <LinearGradient
                  colors={['#6C63FF', '#8B84FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                  {...{ borderRadius: 20 } as any}
                />
              )}
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results count */}
      <View style={[styles.resultsRow, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filtered.length} coiffure{filtered.length !== 1 ? 's' : ''}
          {selectedCategory !== 'Tout' ? ` · ${selectedCategory}` : ''}
        </Text>
        <Ionicons name="grid-outline" size={18} color={colors.textSecondary} />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={['#6C63FF22', '#8B84FF11']} style={styles.emptyIcon}>
        <Ionicons name="cut-outline" size={40} color="#6C63FF" />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune coiffure trouvée</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Essayez une autre catégorie ou modifiez votre recherche
      </Text>
      <TouchableOpacity
        style={styles.emptyAction}
        onPress={() => { setSelectedCategory('Tout'); setSearch(''); }}
      >
        <Text style={styles.emptyActionText}>Voir tout</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.loadingHero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Galerie de Coiffures</Text>
        </LinearGradient>
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des coiffures...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Floating compact header on scroll */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity, backgroundColor: colors.card }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.floatingHeaderInner}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.floatingTitle, { color: colors.text }]}>Galerie de Coiffures</Text>
            <View style={{ width: 22 }} />
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Absolute back button over hero */}
      <SafeAreaView edges={['top']} style={styles.absoluteBack} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {error ? (
        <>
          {renderHeader()}
          <View style={styles.errorContainer}>
            <Ionicons name="wifi-outline" size={48} color="#F44336" />
            <Text style={[styles.errorTitle, { color: colors.text }]}>Connexion impossible</Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setLoading(true); loadHairstyles(); }}
            >
              <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.retryGradient}>
                <Text style={styles.retryText}>Réessayer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Animated.FlatList
          data={filtered}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[styles.gridContainer, { backgroundColor: colors.background }]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6C63FF"
              colors={['#6C63FF']}
            />
          }
        />
      )}

      {/* Zoom modal */}
      <Modal
        visible={!!zoomItem}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomItem(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setZoomItem(null)}>
            {zoomItem?.photo && (
              <Image
                source={{ uri: zoomItem.photo }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>

          {/* Modal info bar */}
          {zoomItem && (
            <View style={styles.modalInfoBar}>
              <View style={styles.modalInfoLeft}>
                <Text style={styles.modalInfoName}>{zoomItem.name}</Text>
                <Text style={styles.modalInfoCategory}>{zoomItem.category}</Text>
              </View>
              <View style={styles.modalInfoRight}>
                <Text style={styles.modalInfoPrice}>{zoomItem.price} FCFA</Text>
                <Text style={styles.modalInfoDuration}>{zoomItem.estimated_duration} min</Text>
              </View>
            </View>
          )}

          {/* Close + Book */}
          <SafeAreaView edges={['top', 'bottom']} style={styles.modalControls} pointerEvents="box-none">
            <TouchableOpacity style={styles.modalClose} onPress={() => setZoomItem(null)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            {zoomItem && (
              <TouchableOpacity
                style={styles.modalBook}
                onPress={() => {
                  setZoomItem(null);
                  navigation.navigate('HairstyleDetail', { hairstyleId: zoomItem.id });
                }}
              >
                <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.modalBookGradient}>
                  <Text style={styles.modalBookText}>Voir les détails</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },

  /* Floating header */
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  floatingTitle: { fontSize: 17, fontWeight: '700' },

  /* Absolute back button */
  absoluteBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 101,
    pointerEvents: 'box-none',
  },
  backBtn: {
    margin: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Hero */
  hero: {
    paddingTop: 90,
    paddingBottom: 32,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  heroContent: { zIndex: 2 },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  heroTitle: { color: 'white', fontSize: 30, fontWeight: '800', lineHeight: 36, marginTop: 4 },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: 'white', fontSize: 22, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  heroDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  heroDecor2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    right: 80,
  },

  /* Search */
  searchWrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },

  /* Categories */
  categoriesContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: { borderColor: 'transparent' },
  categoryChipText: { fontSize: 13, fontWeight: '500', color: '#888' },
  categoryChipTextActive: { color: 'white', fontWeight: '700' },

  /* Results row */
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  resultsText: { fontSize: 13 },

  /* Grid */
  gridContainer: { paddingBottom: 32 },
  columnWrapper: { paddingHorizontal: 12, gap: 12, marginBottom: 12 },

  /* Card */
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: { width: '100%', height: '100%' },
  cardPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },

  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(108,99,255,0.85)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },

  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  cardName: { color: 'white', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { color: '#FFD700', fontSize: 12, fontWeight: '800' },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: 'rgba(255,255,255,0.85)', fontSize: 10 },

  /* Empty */
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyAction: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  emptyActionText: { color: 'white', fontWeight: '700', fontSize: 14 },

  /* Error */
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  errorText: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  retryBtn: { marginTop: 20, borderRadius: 14, overflow: 'hidden' },
  retryGradient: { paddingHorizontal: 28, paddingVertical: 12 },
  retryText: { color: 'white', fontWeight: '700', fontSize: 15 },

  /* Loading */
  loadingHero: { paddingTop: 80, paddingBottom: 32, paddingHorizontal: 24 },
  loadingBody: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
  },
  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.68,
  },
  modalInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modalInfoLeft: { flex: 1 },
  modalInfoName: { color: 'white', fontSize: 16, fontWeight: '700' },
  modalInfoCategory: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 },
  modalInfoRight: { alignItems: 'flex-end' },
  modalInfoPrice: { color: '#FFD700', fontSize: 16, fontWeight: '800' },
  modalInfoDuration: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },

  modalControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBook: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalBookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  modalBookText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

export default HairstylesGalleryScreen;
