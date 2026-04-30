import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE_URL = 'https://hairgov2.onrender.com';
const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.52;

type Nav = NativeStackNavigationProp<RootStackParamList, 'HairstyleDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'HairstyleDetail'>;

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

const TIPS = [
  { icon: 'water-outline', label: 'Cheveux propres' },
  { icon: 'sunny-outline', label: 'Bien séchés' },
  { icon: 'cut-outline', label: 'Démêlés' },
  { icon: 'time-outline', label: 'Ponctualité' },
];

const HairstyleDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { colors } = useTheme();
  const { hairstyleId } = route.params;

  const [hairstyle, setHairstyle] = useState<Hairstyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const imageTranslate = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT * 0.4, 0, -HERO_HEIGHT * 0.25],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  const headerBg = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadHairstyleDetail();
  }, [hairstyleId]);

  const loadHairstyleDetail = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/hairstyles`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        const found = (data.data.hairstyles || []).find((h: Hairstyle) => h.id === hairstyleId);
        found ? setHairstyle(found) : setError('Coiffure non trouvée');
      } else {
        setError(data.error?.message || 'Erreur lors du chargement');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = useCallback(async () => {
    if (!hairstyle) return;
    await Share.share({ message: `Découvrez "${hairstyle.name}" sur HairGov — à partir de ${hairstyle.price} FCFA` });
  }, [hairstyle]);

  /* ── Loading ── */
  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.loadingHero} />
        <SafeAreaView edges={['top']} style={styles.absoluteControls} pointerEvents="box-none">
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement…</Text>
        </View>
      </View>
    );
  }

  /* ── Error ── */
  if (error || !hairstyle) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient colors={['#FF6B6B22', '#FF6B6B11']} style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF6B6B" />
        </LinearGradient>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Oups !</Text>
        <Text style={[styles.errorSub, { color: colors.textSecondary }]}>{error || 'Coiffure non trouvée'}</Text>
        <TouchableOpacity style={styles.backPill} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={16} color="white" />
          <Text style={styles.backPillText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ── Main ── */
  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Animated floating header */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            backgroundColor: colors.card,
            opacity: headerBg,
            shadowOpacity: headerBg as any,
          },
        ]}
        pointerEvents="none"
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.floatingHeaderInner}>
            <Text style={[styles.floatingTitle, { color: colors.text }]} numberOfLines={1}>
              {hairstyle.name}
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Floating action buttons */}
      <SafeAreaView edges={['top']} style={styles.absoluteControls} pointerEvents="box-none">
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={styles.controlsRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFav(v => !v)}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#FF6B6B' : 'white'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* ── Hero image ── */}
        <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateY: imageTranslate }, { scale: imageScale }],
            }}
          >
            {hairstyle.photo ? (
              <Image source={{ uri: hairstyle.photo }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.heroPlaceholder}>
                <Ionicons name="cut-outline" size={72} color="rgba(255,255,255,0.4)" />
              </LinearGradient>
            )}
          </Animated.View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)', colors.background]}
            style={styles.heroGradient}
          />

          {/* Status badge over hero */}
          <View style={styles.heroBadges}>
            <View style={[styles.categoryTag, { backgroundColor: 'rgba(108,99,255,0.88)' }]}>
              <Text style={styles.categoryTagText}>{hairstyle.category}</Text>
            </View>
            <View
              style={[
                styles.statusTag,
                { backgroundColor: hairstyle.is_active ? 'rgba(76,175,80,0.88)' : 'rgba(255,152,0,0.88)' },
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusTagText}>{hairstyle.is_active ? 'Disponible' : 'Indisponible'}</Text>
            </View>
          </View>
        </View>

        {/* ── Content card ── */}
        <View style={[styles.contentCard, { backgroundColor: colors.background }]}>
          {/* Name */}
          <Text style={[styles.name, { color: colors.text }]}>{hairstyle.name}</Text>

          {/* Stats pills */}
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { backgroundColor: '#6C63FF18' }]}>
              <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.statIconBg}>
                <Ionicons name="pricetag" size={14} color="white" />
              </LinearGradient>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{hairstyle.price} FCFA</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Prix</Text>
              </View>
            </View>

            <View style={[styles.statPill, { backgroundColor: '#FF6B6B18' }]}>
              <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.statIconBg}>
                <Ionicons name="time" size={14} color="white" />
              </LinearGradient>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{hairstyle.estimated_duration} min</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Durée</Text>
              </View>
            </View>

            <View style={[styles.statPill, { backgroundColor: '#4CAF5018' }]}>
              <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.statIconBg}>
                <Ionicons name="star" size={14} color="white" />
              </LinearGradient>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>Pro</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Niveau</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          {hairstyle.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{hairstyle.description}</Text>
          ) : (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Un style élégant et tendance pour sublimer votre silhouette. Réalisé par nos coiffeurs experts avec des
              produits de qualité premium adaptés à votre type de cheveux.
            </Text>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Tips */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Comment se préparer</Text>
          <View style={styles.tipsGrid}>
            {TIPS.map(tip => (
              <View key={tip.label} style={[styles.tipCard, { backgroundColor: colors.surface }]}>
                <View style={styles.tipIconWrap}>
                  <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.tipIconBg}>
                    <Ionicons name={tip.icon as any} size={18} color="white" />
                  </LinearGradient>
                </View>
                <Text style={[styles.tipLabel, { color: colors.text }]}>{tip.label}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Included */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Inclus dans le service</Text>
          {[
            'Consultation personnalisée',
            'Shampooing & soin avant coiffure',
            'Finition et mise en forme',
            'Conseils d\'entretien',
          ].map(item => (
            <View key={item} style={styles.includeRow}>
              <View style={styles.includeDot}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
              <Text style={[styles.includeText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}

          {/* Bottom spacer for sticky CTA */}
          <View style={{ height: 110 }} />
        </View>
      </Animated.ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={[styles.cta, { backgroundColor: colors.card }]}>
        <SafeAreaView edges={['bottom']}>
          <View style={styles.ctaInner}>
            <View style={styles.ctaPrice}>
              <Text style={[styles.ctaFrom, { color: colors.textSecondary }]}>À partir de</Text>
              <Text style={styles.ctaAmount}>{hairstyle.price} FCFA</Text>
            </View>
            <TouchableOpacity
              style={[styles.ctaBtn, !hairstyle.is_active && styles.ctaBtnDisabled]}
              onPress={() => navigation.navigate('CreateBooking')}
              disabled={!hairstyle.is_active}
              activeOpacity={0.88}
            >
              {hairstyle.is_active ? (
                <LinearGradient
                  colors={['#6C63FF', '#8B84FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaBtnGradient}
                >
                  <Ionicons name="calendar" size={18} color="white" />
                  <Text style={styles.ctaBtnText}>Réserver</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.ctaBtnGradient, { backgroundColor: colors.border }]}>
                  <Ionicons name="ban-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.ctaBtnText, { color: colors.textSecondary }]}>Indisponible</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },

  /* Floating header */
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
  },
  floatingHeaderInner: { paddingHorizontal: 60, paddingVertical: 12 },
  floatingTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },

  /* Floating controls */
  absoluteControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 101,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  controlsRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Hero */
  heroImage: { width, height: HERO_HEIGHT },
  heroPlaceholder: { width, height: HERO_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.55,
  },
  heroBadges: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryTagText: { color: 'white', fontSize: 12, fontWeight: '700' },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white' },
  statusTagText: { color: 'white', fontSize: 12, fontWeight: '700' },

  /* Content */
  contentCard: { borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingHorizontal: 20, paddingTop: 24 },

  name: { fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 20 },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  statIconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 1 },

  divider: { height: 1, marginVertical: 20 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24 },

  /* Tips */
  tipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tipCard: {
    width: (width - 60) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
  },
  tipIconWrap: {},
  tipIconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tipLabel: { fontSize: 13, fontWeight: '600', flex: 1 },

  /* Included */
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  includeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  includeText: { fontSize: 14, flex: 1 },

  /* CTA */
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  ctaPrice: {},
  ctaFrom: { fontSize: 12 },
  ctaAmount: { fontSize: 20, fontWeight: '800', color: '#6C63FF' },
  ctaBtn: { borderRadius: 16, overflow: 'hidden', minWidth: 160 },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  ctaBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  /* Loading */
  loadingHero: { height: HERO_HEIGHT * 0.6 },
  loadingBody: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15 },

  /* Error */
  errorIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  errorSub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backPillText: { color: 'white', fontWeight: '700', fontSize: 15 },
});

export default HairstyleDetailScreen;
