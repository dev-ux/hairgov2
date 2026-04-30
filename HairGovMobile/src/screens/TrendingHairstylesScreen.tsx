import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FavoriteButton } from '../components/FavoriteButton';
import { API_URL } from '../config/constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Trend {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  duration: number;
  price_range: string;
  trending_score: number;
  hairstyle_id?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const CATEGORIES = ['Tous', 'Femme', 'Homme', 'Mixte', 'Enfant'];

const DIFFICULTY_CONFIG = {
  facile:    { color: '#4CAF50', bg: '#E8F5E9', label: 'Facile' },
  moyen:     { color: '#FF9800', bg: '#FFF3E0', label: 'Moyen' },
  difficile: { color: '#F44336', bg: '#FFEBEE', label: 'Difficile' },
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560069492-856-cc730e8775d5?w=800&q=80';

const TrendingHairstylesScreen = () => {
  const navigation = useNavigation<Nav>();
  const [trends, setTrends]         = useState<Trend[]>([]);
  const [filtered, setFiltered]     = useState<Trend[]>([]);
  const [activeCategory, setActive] = useState('Tous');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setFiltered(
      activeCategory === 'Tous' ? trends : trends.filter(t => t.category === activeCategory)
    );
  }, [activeCategory, trends]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${API_URL}/trending-hairstyles`);
      const data = await res.json();
      if (data.success) {
        setTrends(data.data);
      } else {
        setError('Impossible de charger les tendances');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = useCallback((trend: Trend) => {
    if (trend.hairstyle_id) {
      (navigation as any).navigate('HairstyleDetail', { hairstyleId: trend.hairstyle_id });
    }
  }, [navigation]);

  const renderCategory = useCallback((cat: string) => (
    <TouchableOpacity
      key={cat}
      onPress={() => setActive(cat)}
      style={[styles.chip, activeCategory === cat && styles.chipActive]}
    >
      <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
    </TouchableOpacity>
  ), [activeCategory]);

  const renderTrend = useCallback(({ item, index }: { item: Trend; index: number }) => {
    const diff   = DIFFICULTY_CONFIG[item.difficulty] ?? DIFFICULTY_CONFIG.moyen;
    const score  = item.trending_score?.toFixed(1);
    const isTop3 = index < 3;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => handleCardPress(item)}
      >
        {/* Hero image */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.image || FALLBACK_IMAGE }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.imageGradient}
          />

          {/* Rank badge */}
          {isTop3 && (
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.rankBadge}
            >
              <Text style={styles.rankText}>#{index + 1}</Text>
            </LinearGradient>
          )}

          {/* Category tag */}
          <View style={styles.catTag}>
            <Text style={styles.catTagText}>{item.category}</Text>
          </View>

          {/* Favorite button */}
          <View style={styles.favWrap}>
            <FavoriteButton
              itemId={item.hairstyle_id ?? item.id}
              itemType="hairstyle"
              size={20}
              style={styles.favBtn}
            />
          </View>

          {/* Score */}
          <View style={styles.scoreWrap}>
            <Ionicons name="trending-up" size={13} color="#FF6B6B" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.price_range}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6C63FF', '#8B84FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.bookGradient}
            >
              <Ionicons name="calendar-outline" size={15} color="white" />
              <Text style={styles.bookText}>Voir les détails</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [handleCardPress]);

  /* ── Loading ── */
  if (loading) {
    return (
      <View style={styles.flex}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.headerGradient}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Coiffures Tendances</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Chargement des tendances…</Text>
        </View>
      </View>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <View style={styles.flex}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.headerGradient}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Coiffures Tendances</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={52} color="#ccc" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Main ── */
  return (
    <View style={styles.flex}>
      {/* Header */}
      <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.headerGradient}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Coiffures Tendances</Text>
              <Text style={styles.headerSub}>{filtered.length} style{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Category chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {CATEGORIES.map(renderCategory)}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderTrend}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="color-wand-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucune coiffure dans cette catégorie</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F5F5' },

  /* Header */
  headerGradient: { paddingBottom: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white', textAlign: 'center' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 2 },

  /* Category chips */
  chipRow: { paddingHorizontal: 16, paddingBottom: 4, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipActive: { backgroundColor: 'white' },
  chipText:       { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  chipTextActive: { color: '#6C63FF', fontWeight: '700' },

  /* List */
  list:     { padding: 16, gap: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  /* Card */
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrap: { width: '100%', height: 210 },
  image:     { width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
  },

  rankBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  rankText: { color: 'white', fontSize: 12, fontWeight: '800' },

  catTag: {
    position: 'absolute', top: 12, right: 60,
    backgroundColor: 'rgba(108,99,255,0.85)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  catTagText: { color: 'white', fontSize: 11, fontWeight: '700' },

  favWrap: { position: 'absolute', top: 6, right: 6 },
  favBtn:  {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },

  scoreWrap: {
    position: 'absolute', bottom: 10, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  scoreText: { color: 'white', fontSize: 12, fontWeight: '700' },

  /* Content */
  content:     { padding: 14 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  name:        { fontSize: 17, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  diffBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffText:    { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 10 },
  metaRow:     { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:    { fontSize: 12, color: '#888' },

  bookBtn: { borderRadius: 10, overflow: 'hidden' },
  bookGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
  },
  bookText: { color: 'white', fontSize: 14, fontWeight: '700' },

  /* Empty / error */
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#aaa', textAlign: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#888' },
  errorText:   { marginTop: 10, fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 16 },
  retryBtn:    { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText:   { color: 'white', fontWeight: '700', fontSize: 15 },
});

export default TrendingHairstylesScreen;
