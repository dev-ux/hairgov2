import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_URL } from '../config/constants';
import { FavoriteButton } from '../components/FavoriteButton';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'BarberDetail'>;
type Route = RouteProp<RootStackParamList, 'BarberDetail'>;

interface HairdresserDetail {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_photo: string | null;
    created_at: string;
  };
  profession: string | null;
  average_rating: number;
  total_jobs: number;
  is_available: boolean;
  address: string | null;
  created_at: string;
  description?: string;
  rating_count?: number;
}

const HERO_HEIGHT = 300;

const BarberDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const barberId = String(route.params?.barberId || '');

  const [loading, setLoading] = useState(true);
  const [barber, setBarber] = useState<HairdresserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barberId) { navigation.goBack(); return; }

    const fetchBarberDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const cleanId = barberId.replace(/[^a-zA-Z0-9-]/g, '');
        const response = await fetch(`${API_URL}/hairdressers/${cleanId}`, {
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const data = await response.json();
        if (data.success && data.data) {
          const h = data.data;
          const u = h.user || {};
          setBarber({
            id: h.id,
            user: {
              id: u.id || h.id,
              full_name: u.full_name || 'Nom inconnu',
              email: u.email || '',
              phone: u.phone || '',
              profile_photo: u.profile_photo || null,
              created_at: u.created_at || h.created_at,
            },
            profession: h.profession || 'Coiffeur',
            address: h.address || '',
            is_available: h.is_available || false,
            average_rating: h.average_rating || 0,
            total_jobs: h.total_jobs || 0,
            created_at: h.created_at,
            description: h.description || '',
            rating_count: h.rating_count || 0,
          });
        } else {
          throw new Error('Format de réponse inattendu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchBarberDetails();
  }, [barberId]);

  const renderStars = (rating: number) =>
    [1, 2, 3, 4, 5].map((i) => {
      const name =
        i <= Math.floor(rating) ? 'star' :
        i === Math.floor(rating) + 1 && rating % 1 >= 0.5 ? 'star-half' :
        'star-outline';
      return <Ionicons key={i} name={name as any} size={16} color="#FF9800" />;
    });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !barber) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <View style={styles.errorIconWrap}>
          <Ionicons name="wifi-outline" size={40} color="#6C63FF" />
        </View>
        <Text style={styles.errorTitle}>Impossible de charger</Text>
        <Text style={styles.errorSub}>{error || 'Coiffeur introuvable'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const photoUri =
    barber.user.profile_photo && !barber.user.profile_photo.startsWith('file://')
      ? barber.user.profile_photo
      : null;

  const memberYear = new Date(barber.created_at).getFullYear();

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['#6C63FF', '#9B94FF']}
            style={styles.heroBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Nav buttons */}
          <SafeAreaView style={styles.heroNav} edges={['top']}>
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <View style={styles.favWrap}>
                <FavoriteButton itemId={barber.id} itemType="hairdresser" size={20} />
              </View>
            </View>
          </SafeAreaView>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={52} color="#6C63FF" />
              </LinearGradient>
            )}
            <View style={[styles.statusDot, { backgroundColor: barber.is_available ? '#4CAF50' : '#bbb' }]} />
          </View>

          {/* Name + profession */}
          <Text style={styles.heroName}>{barber.user.full_name}</Text>
          <View style={styles.profChip}>
            <Ionicons name="cut" size={12} color="#6C63FF" />
            <Text style={styles.profChipText}>{barber.profession || 'Coiffeur'}</Text>
          </View>

          {/* Availability pill */}
          <View style={[styles.availPill, { backgroundColor: barber.is_available ? '#E8F5E9' : '#f5f5f5' }]}>
            <View style={[styles.availDot, { backgroundColor: barber.is_available ? '#4CAF50' : '#bbb' }]} />
            <Text style={[styles.availText, { color: barber.is_available ? '#388E3C' : '#999' }]}>
              {barber.is_available ? 'Disponible maintenant' : 'Indisponible'}
            </Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{barber.total_jobs}</Text>
            <Text style={styles.statLabel}>Prestations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Text style={styles.statNum}>{barber.average_rating.toFixed(1)}</Text>
              <Ionicons name="star" size={14} color="#FF9800" />
            </View>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{barber.rating_count || 0}</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{memberYear}</Text>
            <Text style={styles.statLabel}>Membre</Text>
          </View>
        </View>

        {/* ── Rating stars ── */}
        <View style={styles.starsCard}>
          <View style={styles.starsRow}>{renderStars(barber.average_rating)}</View>
          <Text style={styles.starsCaption}>
            {barber.average_rating.toFixed(1)} / 5 · {barber.rating_count || 0} avis clients
          </Text>
        </View>

        {/* ── À propos ── */}
        {barber.description ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="person-outline" size={16} color="#6C63FF" />
              </View>
              <Text style={styles.sectionTitle}>À propos</Text>
            </View>
            <Text style={styles.aboutText}>{barber.description}</Text>
          </View>
        ) : null}

        {/* ── Coordonnées ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="call-outline" size={16} color="#6C63FF" />
            </View>
            <Text style={styles.sectionTitle}>Coordonnées</Text>
          </View>

          {barber.address ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="location-outline" size={18} color="#6C63FF" />
              </View>
              <Text style={styles.infoText}>{barber.address}</Text>
            </View>
          ) : null}

          {barber.user.phone ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="call-outline" size={18} color="#6C63FF" />
              </View>
              <Text style={styles.infoText}>{barber.user.phone}</Text>
            </View>
          ) : null}

          {barber.user.email ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="mail-outline" size={18} color="#6C63FF" />
              </View>
              <Text style={styles.infoText}>{barber.user.email}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={styles.ctaWrapper}>
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaBtnSalon, !barber.is_available && styles.ctaBtnDisabled]}
            disabled={!barber.is_available}
            onPress={() =>
              navigation.navigate('HairdresserBooking', {
                hairdresserId: barber.id,
                hairdresserName: barber.user.full_name,
                serviceType: 'salon',
              })
            }
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={barber.is_available ? ['#6C63FF', '#8B84FF'] : ['#ccc', '#bbb']}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="business-outline" size={18} color="#fff" />
              <Text style={styles.ctaText}>En salon</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaBtnHome, !barber.is_available && styles.ctaBtnDisabled]}
            disabled={!barber.is_available}
            onPress={() =>
              navigation.navigate('HairdresserBooking', {
                hairdresserId: barber.id,
                hairdresserName: barber.user.full_name,
                serviceType: 'home',
              })
            }
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={barber.is_available ? ['#FF6B6B', '#FF8E53'] : ['#ccc', '#bbb']}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="home-outline" size={18} color="#fff" />
              <Text style={styles.ctaText}>À domicile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6fa' },
  scrollContent: { paddingBottom: 24 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#f5f6fa' },
  loadingText: { fontSize: 14, color: '#999' },
  errorIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center',
  },
  errorTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  errorSub: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '700' },

  /* Hero */
  hero: {
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
    overflow: 'visible',
  },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroNav: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  navRight: { flexDirection: 'row', gap: 8 },
  favWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  statusDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5, borderColor: '#fff',
  },

  heroName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  profChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    marginBottom: 10,
  },
  profChipText: { fontSize: 12, fontWeight: '700', color: '#6C63FF' },

  availPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: 12, fontWeight: '700' },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#f0f0f0' },

  /* Stars card */
  starsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  starsRow: { flexDirection: 'row', gap: 4 },
  starsCaption: { fontSize: 12, color: '#999' },

  /* Sections */
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  aboutText: { fontSize: 14, color: '#666', lineHeight: 22 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center',
  },
  infoText: { fontSize: 14, color: '#444', flex: 1 },

  /* CTA */
  ctaWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaBtn: { borderRadius: 16, overflow: 'hidden', flex: 1 },
  ctaBtnSalon: {},
  ctaBtnHome: {},
  ctaBtnDisabled: { opacity: 0.7 },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  ctaText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

export default BarberDetailScreen;
