import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import * as Location from 'expo-location';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultSalonImage: number = require('../assets/url_de_l_image_1.jpg');
const { width } = Dimensions.get('window');

const formatImageUrl = (url: string) => {
  try {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    let cleanUrl = url.replace(/[{}"']/g, '').trim();
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    if (cleanUrl.startsWith('/uploads/')) return `${baseUrl}${cleanUrl}`;
    if (cleanUrl.startsWith('profiles-')) return `${baseUrl}/uploads/${cleanUrl}`;
    if (cleanUrl.startsWith('photos-')) return `${baseUrl}/uploads/photos/${cleanUrl}`;
    if (!cleanUrl.includes('/')) return `${baseUrl}/uploads/photos/${cleanUrl}`;
    const fileName = cleanUrl.split('/').pop();
    return `${baseUrl}/uploads/photos/${fileName}`;
  } catch {
    return null;
  }
};

export interface Hairstyle {
  id: string;
  name: string;
  photo: string;
  estimated_duration: number;
  price: number;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  photos: string[];
  average_rating: number;
  latitude: string | number;
  longitude: string | number;
  distance?: number;
  hairdresser: { id: string; full_name: string; profile_photo: string | null };
}

interface Trend {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  duration: number;
  price_range: string;
  trending_score: number;
}

interface UserData { full_name: string }

interface Hairdresser {
  id: string;
  full_name: string;
  profile_photo: string | null;
  average_rating: number;
  total_jobs: number;
  is_available: boolean;
  profession: string;
}

export default function HomeScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [salons, setSalons] = useState<Salon[] | null>(null);
  const [nearbySalons, setNearbySalons] = useState<Salon[] | null>(null);
  const [hairstyles, setHairstyles] = useState<Hairstyle[] | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loadingHairdressers, setLoadingHairdressers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [loadingHairstyles, setLoadingHairstyles] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const promoFlatListRef = useRef<FlatList>(null);

  const promotions = [
    { id: '1', title: 'Jour Spécial 30%', subtitle: '30% off', description: 'Bénéficiez d\'une réduction pour chaque commande de service ! Valable aujourd\'hui uniquement !', color1: '#6C63FF', color2: '#8B84FF' },
    { id: '2', title: 'Service Premium', subtitle: '20% off', description: 'Découvrez nos services premium avec une réduction exclusive !', color1: '#FF6B6B', color2: '#FF4E4E' },
    { id: '3', title: 'Nouveaux Clients', subtitle: '15% off', description: 'Offre spéciale pour nos nouveaux clients ! Profitez-en maintenant !', color1: '#4CAF50', color2: '#43A047' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => {
        const next = prev === promotions.length - 1 ? 0 : prev + 1;
        promoFlatListRef.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0.5 });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const computeDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getUserLocation = async (currentSalons?: Salon[]) => {
    try {
      setLoadingNearby(true);
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationError('Permission de localisation refusée'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ latitude, longitude });
      const src = currentSalons ?? salons ?? [];
      if (src.length > 0) {
        const withDist = src.map((s) => {
          const sLat = parseFloat(s.latitude as string);
          const sLng = parseFloat(s.longitude as string);
          return isNaN(sLat) || isNaN(sLng) ? { ...s, distance: Infinity } : { ...s, distance: computeDistance(latitude, longitude, sLat, sLng) };
        });
        setNearbySalons(withDist.filter((s) => s.distance < 50 && s.distance !== Infinity).sort((a, b) => a.distance! - b.distance!).slice(0, 5));
      }
    } catch {
      setLocationError('Impossible d\'obtenir votre position');
    } finally {
      setLoadingNearby(false);
    }
  };

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch(`${API_URL}/salons?_=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setSalons(data.data);
          setTimeout(() => getUserLocation(data.data), 800);
        } else {
          setError(data?.message || 'Erreur chargement salons');
        }
      } catch {
        setError('Impossible de se connecter au serveur');
      } finally {
        setLoading(false);
      }
    };

    const fetchHairstyles = async () => {
      try {
        const res = await fetch(`${API_URL}/hairstyles`);
        const data = await res.json();
        if (res.ok && data.success) setHairstyles(Array.isArray(data.data?.hairstyles) ? data.data.hairstyles : []);
      } catch { /* silent */ } finally { setLoadingHairstyles(false); }
    };

    const fetchTrends = async () => {
      try {
        const res = await fetch(`${API_URL}/trending-hairstyles`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setTrends(data.data.slice(0, 6));
      } catch { /* silent */ } finally { setLoadingTrends(false); }
    };

    const fetchHairdressers = async () => {
      try {
        const res = await fetch(`${API_URL}/hairdressers`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.hairdressers)) {
          setHairdressers(
            data.data.hairdressers
              .filter((h: any) => h.is_available)
              .slice(0, 6)
              .map((h: any) => ({
                id: h.id,
                full_name: h.user?.full_name || 'Coiffeur',
                profile_photo: h.user?.profile_photo || null,
                average_rating: h.average_rating || 0,
                total_jobs: h.total_jobs || 0,
                is_available: h.is_available || false,
                profession: h.profession || 'Coiffeur',
              }))
          );
        }
      } catch { /* silent */ } finally { setLoadingHairdressers(false); }
    };

    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) setUser(JSON.parse(raw));
      } catch { /* silent */ }
    };

    fetchSalons();
    fetchHairstyles();
    fetchTrends();
    fetchHairdressers();
    loadUser();
  }, []);

  const mapSalons = (nearbySalons ?? salons ?? []).filter((s) => {
    const lat = parseFloat(s.latitude as string);
    const lon = parseFloat(s.longitude as string);
    return !isNaN(lat) && !isNaN(lon);
  });

  const mapRegion = (() => {
    if (userLocation) return { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    if (mapSalons.length > 0) {
      return { latitude: parseFloat(mapSalons[0].latitude as string), longitude: parseFloat(mapSalons[0].longitude as string), latitudeDelta: 0.06, longitudeDelta: 0.06 };
    }
    return { latitude: 5.36, longitude: -4.0083, latitudeDelta: 0.06, longitudeDelta: 0.06 };
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bonjour, {user?.full_name || 'Client'} 👋
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Trouvez votre salon</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Salon, coiffeur, service..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Promo Carousel */}
        <View style={styles.carouselSection}>
          <FlatList
            ref={promoFlatListRef}
            data={promotions}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.id}
            snapToInterval={width - 40}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({ length: width - 40, offset: (width - 40) * index, index })}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            onMomentumScrollEnd={(e) => setCurrentPromoIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 40)))}
            renderItem={({ item }) => (
              <LinearGradient
                colors={[item.color1, item.color2]}
                style={styles.promoCard}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoDesc}>{item.description}</Text>
                <View style={styles.promoDots}>
                  {promotions.map((_, i) => (
                    <View key={i} style={[styles.promoDot, i === currentPromoIndex ? styles.promoDotActive : styles.promoDotInactive]} />
                  ))}
                </View>
              </LinearGradient>
            )}
          />
        </View>

        {/* Quick filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            {[
              { label: 'Offres spéciales', icon: 'pricetag', route: 'SpecialOffers', active: true },
              { label: 'Tendances', icon: 'trending-up', route: 'TrendingHairstyles', active: false },
              { label: 'Spécialistes', icon: 'ribbon', route: 'Specialists', active: false },
            ].map((f) => (
              <TouchableOpacity
                key={f.route}
                style={[styles.filterChip, f.active ? styles.filterChipActive : { backgroundColor: colors.surface }]}
                onPress={() => {
                  try { navigation.getParent()?.navigate(f.route) ?? navigation.navigate(f.route as never); }
                  catch { navigation.navigate(f.route as never); }
                }}
              >
                <Ionicons name={f.icon as any} size={14} color={f.active ? '#fff' : colors.text} />
                <Text style={[styles.filterChipText, { color: f.active ? '#fff' : colors.text }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── MINI MAP ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Salons sur la carte</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map' as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.miniMapContainer}
            onPress={() => navigation.navigate('Map' as never)}
            activeOpacity={0.95}
          >
            <MapView
              style={styles.miniMap}
              provider={PROVIDER_DEFAULT}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              showsUserLocation
              pointerEvents="none"
            >
              {mapSalons.slice(0, 8).map((s) => (
                <Marker
                  key={s.id}
                  coordinate={{ latitude: parseFloat(s.latitude as string), longitude: parseFloat(s.longitude as string) }}
                >
                  <View style={styles.miniMarker}>
                    <Ionicons name="cut" size={10} color="#fff" />
                  </View>
                </Marker>
              ))}
            </MapView>

            {/* Tap overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(108,99,255,0.15)']}
              style={styles.miniMapOverlay}
              pointerEvents="none"
            >
              <View style={styles.miniMapBadge}>
                <Ionicons name="map" size={14} color="#fff" />
                <Text style={styles.miniMapBadgeText}>{mapSalons.length} salon{mapSalons.length > 1 ? 's' : ''}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* ── NOS SALONS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos Salons</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllSalons')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
          ) : error ? (
            <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
          ) : !salons || salons.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun salon disponible</Text>
          ) : (
            <FlatList
              data={salons.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(s) => s.id}
              contentContainerStyle={styles.salonList}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.salonCard, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}>
                  <View style={styles.salonImgWrap}>
                    <Image
                      source={item.photos?.[0] && formatImageUrl(item.photos[0]) ? { uri: formatImageUrl(item.photos[0])! } : defaultSalonImage}
                      style={styles.salonImg}
                      resizeMode="cover"
                      defaultSource={defaultSalonImage}
                    />
                    <View style={styles.salonRatingBadge}>
                      <Ionicons name="star" size={10} color="#FFD700" />
                      <Text style={styles.salonRatingText}>{item.average_rating > 0 ? item.average_rating.toFixed(1) : 'Nouveau'}</Text>
                    </View>
                  </View>
                  <View style={styles.salonInfo}>
                    <Text style={[styles.salonName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.salonAddr, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                    <Text style={[styles.salonHairdresser, { color: colors.primary }]} numberOfLines={1}>{item.hairdresser?.full_name || 'Coiffeur'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ── COIFFEURS À DOMICILE ── */}
        <View style={styles.section}>
          <LinearGradient colors={['#6C63FF', '#9B94FF']} style={styles.homeBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.homeBannerLeft}>
              <Text style={styles.homeBannerTag}>NOUVEAU</Text>
              <Text style={styles.homeBannerTitle}>Coiffeur à domicile</Text>
              <Text style={styles.homeBannerDesc}>Réservez un coiffeur qui se déplace chez vous</Text>
              <TouchableOpacity style={styles.homeBannerBtn} onPress={() => navigation.navigate('Barber' as never)}>
                <Text style={styles.homeBannerBtnText}>Voir les coiffeurs</Text>
                <Ionicons name="arrow-forward" size={14} color="#6C63FF" />
              </TouchableOpacity>
            </View>
            <View style={styles.homeBannerIcon}>
              <Ionicons name="home" size={48} color="rgba(255,255,255,0.25)" />
            </View>
          </LinearGradient>

          {loadingHairdressers ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
          ) : hairdressers.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun coiffeur disponible pour le moment</Text>
          ) : (
            <FlatList
              data={hairdressers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(h) => h.id}
              contentContainerStyle={[styles.salonList, { marginTop: 14 }]}
              renderItem={({ item }) => (
                <View style={[styles.barberCard, { backgroundColor: colors.card }]}>
                  <TouchableOpacity onPress={() => navigation.navigate('BarberDetail', { barberId: item.id })}>
                    {item.profile_photo ? (
                      <Image source={{ uri: item.profile_photo }} style={styles.barberAvatar} resizeMode="cover" />
                    ) : (
                      <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.barberAvatar}>
                        <Ionicons name="person" size={28} color="#6C63FF" />
                      </LinearGradient>
                    )}
                    <View style={styles.barberAvailDot} />
                    <Text style={[styles.barberName, { color: colors.text }]} numberOfLines={1}>{item.full_name}</Text>
                    <View style={styles.barberRatingRow}>
                      <Ionicons name="star" size={11} color="#FF9800" />
                      <Text style={[styles.barberRating, { color: colors.textSecondary }]}>{item.average_rating.toFixed(1)}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.barberBookBtn}
                    onPress={() => navigation.navigate('HairdresserBooking', { hairdresserId: item.id, hairdresserName: item.full_name, serviceType: 'home' })}
                  >
                    <Ionicons name="home-outline" size={12} color="#fff" />
                    <Text style={styles.barberBookBtnText}>À domicile</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        {/* ── TENDANCES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tendances</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={12} color="#FF6B6B" />
                <Text style={styles.trendBadgeText}>HOT</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => { try { navigation.getParent()?.navigate('TrendingHairstyles'); } catch { navigation.navigate('TrendingHairstyles' as never); } }}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loadingTrends ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
          ) : trends.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune tendance disponible</Text>
          ) : (
            <FlatList
              data={trends}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(t) => t.id}
              contentContainerStyle={styles.trendList}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.trendCard, { backgroundColor: colors.card }]}>
                  <Image
                    source={item.image ? { uri: item.image } : defaultSalonImage}
                    style={styles.trendImg}
                    resizeMode="cover"
                    defaultSource={defaultSalonImage}
                  />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.trendGrad}>
                    <Text style={styles.trendName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.trendMeta}>
                      <View style={[styles.trendDiffBadge, { backgroundColor: item.difficulty === 'facile' ? '#4CAF50' : item.difficulty === 'moyen' ? '#FF9800' : '#F44336' }]}>
                        <Text style={styles.trendDiffText}>{item.difficulty}</Text>
                      </View>
                      <View style={styles.trendScoreRow}>
                        <Ionicons name="trending-up" size={11} color="#FF6B6B" />
                        <Text style={styles.trendScore}>{item.trending_score}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ── NOS COIFFURES ── */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos Coiffures</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HairstylesGallery')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loadingHairstyles ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
          ) : !hairstyles || hairstyles.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune coiffure disponible</Text>
          ) : (
            <FlatList
              data={hairstyles.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(h) => h.id.toString()}
              contentContainerStyle={styles.salonList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.hairstyleCard} onPress={() => navigation.navigate('HairstyleDetail', { hairstyleId: item.id })}>
                  {item.photo ? (
                    <Image source={{ uri: formatImageUrl(item.photo) ?? '' }} style={styles.hairstyleImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.hairstyleImg, styles.hairstylePlaceholder]}>
                      <Ionicons name="cut-outline" size={28} color="#999" />
                    </View>
                  )}
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.hairstyleGrad}>
                    <Text style={styles.hairstyleName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.hairstyleMeta}>{item.estimated_duration} min</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B' },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, marginHorizontal: 20, marginVertical: 12, paddingHorizontal: 14, height: 48 },
  searchInput: { flex: 1, fontSize: 15 },

  // Promo
  carouselSection: { marginBottom: 4 },
  promoCard: { width: width - 40, height: 170, borderRadius: 18, padding: 22, marginRight: 0, justifyContent: 'flex-end' },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 4 },
  promoTitle: { fontSize: 26, color: '#fff', fontWeight: '800', marginBottom: 6 },
  promoDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: 12 },
  promoDots: { flexDirection: 'row', gap: 6 },
  promoDot: { height: 4, borderRadius: 2 },
  promoDotActive: { width: 20, backgroundColor: '#fff' },
  promoDotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },

  // Filters
  filterSection: { marginBottom: 4 },
  filterList: { paddingHorizontal: 20, gap: 10, paddingVertical: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  filterChipActive: { backgroundColor: '#6C63FF' },
  filterChipText: { fontSize: 13, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', fontSize: 14, marginVertical: 12, fontStyle: 'italic' },
  locationErrorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  locationErrorText: { fontSize: 13, flex: 1 },
  errorBox: { padding: 12 },
  errorText: { color: '#FF6B6B', textAlign: 'center', fontSize: 14 },

  // Mini map
  miniMapContainer: { borderRadius: 18, overflow: 'hidden', height: 180, position: 'relative' },
  miniMap: { width: '100%', height: '100%' },
  miniMapOverlay: { position: 'absolute', inset: 0, justifyContent: 'flex-end', padding: 12 },
  miniMapBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#6C63FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  miniMapBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  miniMarker: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },

  // Salon cards
  salonList: { paddingRight: 20, gap: 14 },
  salonCard: { width: 200, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  salonImgWrap: { height: 130, position: 'relative' },
  salonImg: { width: '100%', height: '100%' },
  salonRatingBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  salonRatingText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  distanceBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  distanceText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  salonInfo: { padding: 10 },
  salonName: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  salonAddr: { fontSize: 11, marginBottom: 3 },
  salonHairdresser: { fontSize: 11, fontWeight: '600' },

  // Trends
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFEBEE', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  trendBadgeText: { fontSize: 10, fontWeight: '800', color: '#FF6B6B' },
  trendList: { paddingRight: 20, gap: 12 },
  trendCard: { width: 160, height: 210, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  trendImg: { width: '100%', height: '100%', position: 'absolute' },
  trendGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, padding: 10, justifyContent: 'flex-end' },
  trendName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 5 },
  trendMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trendDiffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendDiffText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  trendScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendScore: { fontSize: 11, color: '#FF6B6B', fontWeight: '700' },

  // Hairstyles
  hairstyleCard: { width: 150, height: 190, borderRadius: 16, overflow: 'hidden', marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  hairstyleImg: { width: '100%', height: '100%', position: 'absolute' },
  hairstylePlaceholder: { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  hairstyleGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, padding: 10, justifyContent: 'flex-end' },
  hairstyleName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 2 },
  hairstyleMeta: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  // Coiffeur à domicile banner
  homeBanner: { borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  homeBannerLeft: { flex: 1 },
  homeBannerTag: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.2, marginBottom: 6 },
  homeBannerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  homeBannerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14, lineHeight: 18 },
  homeBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  homeBannerBtnText: { fontSize: 13, fontWeight: '700', color: '#6C63FF' },
  homeBannerIcon: { marginLeft: 12 },

  // Barber cards (à domicile section)
  barberCard: { width: 130, borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  barberAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  barberAvailDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff', position: 'absolute', top: 50, right: 30 },
  barberName: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 3, marginTop: 6 },
  barberRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  barberRating: { fontSize: 11 },
  barberBookBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#6C63FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  barberBookBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
});
