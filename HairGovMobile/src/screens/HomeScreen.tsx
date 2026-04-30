import { useState, useEffect, useRef } from 'react';
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
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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

const QUICK_SERVICES = [
  { label: 'Salons', icon: 'storefront', colors: ['#6C63FF', '#8B84FF'] as [string, string], route: 'AllSalons' },
  { label: 'Coiffeurs', icon: 'cut', colors: ['#FF6B6B', '#FF8E53'] as [string, string], route: 'Barber' },
  { label: 'Galerie', icon: 'images', colors: ['#4CAF50', '#66BB6A'] as [string, string], route: 'HairstylesGallery' },
  { label: 'Offres', icon: 'pricetag', colors: ['#FF9800', '#FFB74D'] as [string, string], route: 'SpecialOffers' },
];

export default function HomeScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [salons, setSalons] = useState<Salon[] | null>(null);
  const [nearbySalons, setNearbySalons] = useState<Salon[] | null>(null);
  const [hairstyles, setHairstyles] = useState<Hairstyle[] | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loadingHairdressers, setLoadingHairdressers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingHairstyles, setLoadingHairstyles] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const promoFlatListRef = useRef<FlatList>(null);

  const promotions = [
    { id: '1', title: 'Jour Spécial', subtitle: '30% OFF', description: 'Bénéficiez d\'une réduction sur chaque service. Valable aujourd\'hui uniquement !', color1: '#6C63FF', color2: '#8B84FF' },
    { id: '2', title: 'Service Premium', subtitle: '20% OFF', description: 'Découvrez nos services premium avec une réduction exclusive !', color1: '#FF6B6B', color2: '#FF4E4E' },
    { id: '3', title: 'Nouveaux Clients', subtitle: '15% OFF', description: 'Offre spéciale pour nos nouveaux clients ! Profitez-en maintenant !', color1: '#4CAF50', color2: '#43A047' },
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
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
        setNearbySalons(withDist.filter((s) => s.distance! < 50 && s.distance !== Infinity).sort((a, b) => a.distance! - b.distance!).slice(0, 5));
      }
    } catch { /* silent */ }
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

  const displaySalons = salons ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#6C63FF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* ══════════════════════════════ HERO ══════════════════════════════ */}
        <LinearGradient
          colors={['#6C63FF', '#8B84FF', '#B0AAFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 16 }]}
        >
          {/* Decorative circles */}
          <View style={styles.heroBg1} />
          <View style={styles.heroBg2} />
          <View style={styles.heroBg3} />

          {/* Top row */}
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGreeting}>{getGreeting()} 👋</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                {user?.full_name || 'Bienvenue'}
              </Text>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="white" />
                <View style={styles.heroDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroAvatarBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.heroAvatarText}>
                  {getInitials(user?.full_name || 'HG')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tagline */}
          <Text style={styles.heroTagline}>Trouvez le salon parfait{'\n'}près de chez vous ✨</Text>

          {/* Search — sits inside hero */}
          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Salon, coiffeur, service..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.filterBtnGrad}>
                <Ionicons name="options-outline" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ═══════════════════════ QUICK SERVICES ═══════════════════════ */}
        <View style={[styles.quickServices, { backgroundColor: colors.background }]}>
          {QUICK_SERVICES.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.quickTile}
              onPress={() => {
                try { navigation.navigate(s.route as never); }
                catch { navigation.getParent()?.navigate(s.route); }
              }}
            >
              <LinearGradient colors={s.colors} style={styles.quickTileIcon}>
                <Ionicons name={s.icon as any} size={22} color="white" />
              </LinearGradient>
              <Text style={[styles.quickTileLabel, { color: colors.text }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══════════════════════ PROMO CAROUSEL ═══════════════════════ */}
        <View style={styles.promoSection}>
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
            onMomentumScrollEnd={(e) =>
              setCurrentPromoIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 40)))
            }
            renderItem={({ item }) => (
              <LinearGradient
                colors={[item.color1, item.color2]}
                style={styles.promoCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.promoDecor1} />
                <View style={styles.promoDecor2} />

                <View style={styles.promoLeft}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoDesc} numberOfLines={2}>{item.description}</Text>
                  <TouchableOpacity style={styles.promoBtn}>
                    <Text style={[styles.promoBtnText, { color: item.color1 }]}>Profiter →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.promoDots}>
                  {promotions.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.promoDot,
                        i === currentPromoIndex ? styles.promoDotActive : styles.promoDotInactive,
                      ]}
                    />
                  ))}
                </View>
              </LinearGradient>
            )}
          />
        </View>

        {/* ═══════════════════════ NOS SALONS ═══════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos Salons</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Les meilleurs près de vous</Text>
            </View>
            <TouchableOpacity
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('AllSalons')}
            >
              <Text style={[styles.seeAllText, { color: '#6C63FF' }]}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={12} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#6C63FF" style={{ marginVertical: 20 }} />
          ) : error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : displaySalons.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun salon disponible</Text>
          ) : (
            <FlatList
              data={displaySalons.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(s) => s.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => {
                const imgUrl = item.photos?.[0] ? formatImageUrl(item.photos[0]) : null;
                return (
                  <TouchableOpacity
                    style={[styles.salonCard, { backgroundColor: colors.card }]}
                    onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
                    activeOpacity={0.92}
                  >
                    <View style={styles.salonImgWrap}>
                      <Image
                        source={imgUrl ? { uri: imgUrl } : defaultSalonImage}
                        style={styles.salonImg}
                        resizeMode="cover"
                        defaultSource={defaultSalonImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)']}
                        style={styles.salonImgGrad}
                      />
                      {item.average_rating > 0 && (
                        <View style={styles.salonRatingBadge}>
                          <Ionicons name="star" size={10} color="#FFD700" />
                          <Text style={styles.salonRatingText}>{item.average_rating.toFixed(1)}</Text>
                        </View>
                      )}
                      {item.distance !== undefined && item.distance < Infinity && (
                        <View style={styles.salonDistBadge}>
                          <Ionicons name="location" size={9} color="white" />
                          <Text style={styles.salonDistText}>
                            {item.distance < 1
                              ? `${Math.round(item.distance * 1000)}m`
                              : `${item.distance.toFixed(1)}km`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.salonInfo}>
                      <Text style={[styles.salonName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.salonAddrRow}>
                        <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
                        <Text style={[styles.salonAddr, { color: colors.textSecondary }]} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                      <View style={styles.salonHdRow}>
                        <View style={styles.salonHdDot} />
                        <Text style={[styles.salonHd, { color: '#6C63FF' }]} numberOfLines={1}>
                          {item.hairdresser?.full_name || 'Coiffeur'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* ══════════════════ COIFFEURS À DOMICILE ══════════════════ */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#6C63FF', '#9B94FF']}
            style={styles.homeBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.homeBannerDecor1} />
            <View style={styles.homeBannerDecor2} />
            <View style={styles.homeBannerLeft}>
              <View style={styles.homeBannerTag}>
                <Ionicons name="star" size={10} color="#FFD700" />
                <Text style={styles.homeBannerTagText}>NOUVEAU</Text>
              </View>
              <Text style={styles.homeBannerTitle}>Coiffeur à domicile</Text>
              <Text style={styles.homeBannerDesc}>Réservez un coiffeur qui se déplace chez vous</Text>
              <TouchableOpacity
                style={styles.homeBannerBtn}
                onPress={() => navigation.navigate('Barber' as never)}
              >
                <Text style={styles.homeBannerBtnText}>Voir les coiffeurs</Text>
                <Ionicons name="arrow-forward" size={13} color="#6C63FF" />
              </TouchableOpacity>
            </View>
            <View style={styles.homeBannerRight}>
              <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)']}
                style={styles.homeBannerIconCircle}
              >
                <Ionicons name="home" size={42} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
            </View>
          </LinearGradient>

          {loadingHairdressers ? (
            <ActivityIndicator size="small" color="#6C63FF" style={{ marginTop: 16 }} />
          ) : hairdressers.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun coiffeur disponible</Text>
          ) : (
            <FlatList
              data={hairdressers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(h) => h.id}
              contentContainerStyle={[styles.horizontalList, { marginTop: 14 }]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.barberCard, { backgroundColor: colors.card }]}
                  onPress={() => navigation.navigate('BarberDetail', { barberId: item.id })}
                  activeOpacity={0.92}
                >
                  {item.profile_photo ? (
                    <Image source={{ uri: item.profile_photo }} style={styles.barberAvatar} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.barberAvatar}>
                      <Ionicons name="person" size={28} color="#6C63FF" />
                    </LinearGradient>
                  )}
                  <View style={styles.barberAvailDot} />
                  <Text style={[styles.barberName, { color: colors.text }]} numberOfLines={1}>
                    {item.full_name}
                  </Text>
                  <View style={styles.barberRatingRow}>
                    <Ionicons name="star" size={10} color="#FF9800" />
                    <Text style={[styles.barberRating, { color: colors.textSecondary }]}>
                      {item.average_rating.toFixed(1)}
                    </Text>
                    <Text style={[styles.barberJobs, { color: colors.textSecondary }]}>
                      · {item.total_jobs}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.barberBookBtn}
                    onPress={() =>
                      navigation.navigate('HairdresserBooking', {
                        hairdresserId: item.id,
                        hairdresserName: item.full_name,
                        serviceType: 'home',
                      })
                    }
                  >
                    <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.barberBookGrad}>
                      <Ionicons name="home-outline" size={12} color="white" />
                      <Text style={styles.barberBookText}>À domicile</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ══════════════════════ CARTE DES SALONS ══════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Carte des salons</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                {mapSalons.length} salon{mapSalons.length > 1 ? 's' : ''} trouvé{mapSalons.length > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('Map' as never)}
            >
              <Text style={[styles.seeAllText, { color: '#6C63FF' }]}>Carte</Text>
              <Ionicons name="arrow-forward" size={12} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.miniMapCard}
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
                  coordinate={{
                    latitude: parseFloat(s.latitude as string),
                    longitude: parseFloat(s.longitude as string),
                  }}
                >
                  <View style={styles.miniMarker}>
                    <Ionicons name="cut" size={10} color="white" />
                  </View>
                </Marker>
              ))}
            </MapView>
            <LinearGradient
              colors={['transparent', 'rgba(108,99,255,0.22)']}
              style={styles.miniMapGrad}
              pointerEvents="none"
            >
              <View style={styles.miniMapCTA}>
                <Ionicons name="map" size={14} color="white" />
                <Text style={styles.miniMapCTAText}>Explorer la carte</Text>
                <Ionicons name="arrow-forward" size={14} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════ TENDANCES ═══════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tendances</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Les styles du moment</Text>
            </View>
            <TouchableOpacity
              style={styles.hotBadge}
              onPress={() => {
                try { navigation.getParent()?.navigate('TrendingHairstyles'); }
                catch { navigation.navigate('TrendingHairstyles' as never); }
              }}
            >
              <Ionicons name="flame" size={12} color="#FF6B6B" />
              <Text style={styles.hotBadgeText}>HOT</Text>
            </TouchableOpacity>
          </View>

          {loadingTrends ? (
            <ActivityIndicator size="small" color="#6C63FF" style={{ marginVertical: 16 }} />
          ) : trends.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune tendance disponible</Text>
          ) : (
            <FlatList
              data={trends}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(t) => t.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.trendCard} activeOpacity={0.92}>
                  <Image
                    source={item.image ? { uri: item.image } : defaultSalonImage}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                    defaultSource={defaultSalonImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.82)']}
                    style={styles.trendGrad}
                  >
                    <Text style={styles.trendName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.trendMeta}>
                      <View
                        style={[
                          styles.trendDiffBadge,
                          {
                            backgroundColor:
                              item.difficulty === 'facile' ? '#4CAF50'
                              : item.difficulty === 'moyen' ? '#FF9800'
                              : '#F44336',
                          },
                        ]}
                      >
                        <Text style={styles.trendDiffText}>{item.difficulty}</Text>
                      </View>
                      <View style={styles.trendScoreRow}>
                        <Ionicons name="flame" size={11} color="#FF6B6B" />
                        <Text style={styles.trendScore}>{item.trending_score}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ═══════════════════════ NOS COIFFURES ═══════════════════════ */}
        <View style={[styles.section, { paddingBottom: 36 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos Coiffures</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Découvrez notre collection</Text>
            </View>
            <TouchableOpacity
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('HairstylesGallery')}
            >
              <Text style={[styles.seeAllText, { color: '#6C63FF' }]}>Galerie</Text>
              <Ionicons name="arrow-forward" size={12} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          {loadingHairstyles ? (
            <ActivityIndicator size="small" color="#6C63FF" style={{ marginVertical: 20 }} />
          ) : !hairstyles || hairstyles.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune coiffure disponible</Text>
          ) : (
            <FlatList
              data={hairstyles.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(h) => h.id.toString()}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.hairstyleCard}
                  onPress={() => navigation.navigate('HairstyleDetail', { hairstyleId: item.id })}
                  activeOpacity={0.92}
                >
                  {item.photo ? (
                    <Image
                      source={{ uri: formatImageUrl(item.photo) ?? '' }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={StyleSheet.absoluteFillObject}>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="cut-outline" size={28} color="#6C63FF" />
                      </View>
                    </LinearGradient>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.76)']}
                    style={styles.hairstyleGrad}
                  >
                    <Text style={styles.hairstyleName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.hairstylePriceRow}>
                      <Text style={styles.hairstylePrice}>{item.price} FCFA</Text>
                      <View style={styles.hairstyleDurPill}>
                        <Ionicons name="time-outline" size={9} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.hairstyleDur}>{item.estimated_duration}min</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Hero ── */
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroBg1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -90,
    right: -60,
  },
  heroBg2: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    left: -40,
  },
  heroBg3: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 100,
    right: 50,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  heroGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroName: { fontSize: 22, color: 'white', fontWeight: '800', marginTop: 2 },
  heroActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  heroAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAvatarText: { color: 'white', fontSize: 14, fontWeight: '800' },
  heroTagline: {
    fontSize: 26,
    color: 'white',
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 20,
  },

  /* ── Search ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBtnGrad: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Quick Services ── */
  quickServices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  quickTile: { alignItems: 'center', gap: 7 },
  quickTileIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickTileLabel: { fontSize: 12, fontWeight: '600' },

  /* ── Promo Carousel ── */
  promoSection: { marginTop: 20 },
  promoCard: {
    width: width - 40,
    height: 158,
    borderRadius: 22,
    padding: 20,
    marginRight: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoDecor1: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.09)',
    top: -60,
    right: -40,
  },
  promoDecor2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -35,
    right: 80,
  },
  promoLeft: { flex: 1, zIndex: 2 },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  promoBadgeText: { color: 'white', fontSize: 12, fontWeight: '800' },
  promoTitle: { fontSize: 22, color: 'white', fontWeight: '800', marginBottom: 4 },
  promoDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, marginBottom: 12 },
  promoBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  promoBtnText: { fontSize: 13, fontWeight: '700' },
  promoDots: { position: 'absolute', bottom: 14, right: 16, flexDirection: 'row', gap: 5 },
  promoDot: { height: 4, borderRadius: 2 },
  promoDotActive: { width: 18, backgroundColor: 'white' },
  promoDotInactive: { width: 5, backgroundColor: 'rgba(255,255,255,0.4)' },

  /* ── Sections ── */
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSub: { fontSize: 12, marginTop: 2 },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  seeAllText: { fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', fontSize: 14, marginVertical: 16, fontStyle: 'italic' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  errorText: { color: '#FF6B6B', fontSize: 14, flex: 1 },
  horizontalList: { gap: 14, paddingRight: 20 },

  /* ── Salon cards ── */
  salonCard: {
    width: 195,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  salonImgWrap: { height: 120, position: 'relative' },
  salonImg: { width: '100%', height: '100%' },
  salonImgGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  salonRatingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  salonRatingText: { fontSize: 11, color: 'white', fontWeight: '700' },
  salonDistBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  salonDistText: { fontSize: 10, color: 'white', fontWeight: '700' },
  salonInfo: { padding: 10 },
  salonName: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  salonAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 },
  salonAddr: { fontSize: 11, flex: 1 },
  salonHdRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  salonHdDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  salonHd: { fontSize: 11, fontWeight: '600' },

  /* ── À domicile banner ── */
  homeBanner: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 134,
  },
  homeBannerDecor1: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -70,
    right: -55,
  },
  homeBannerDecor2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -45,
    left: 110,
  },
  homeBannerLeft: { flex: 1, zIndex: 2 },
  homeBannerTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  homeBannerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
  },
  homeBannerTitle: { fontSize: 19, fontWeight: '800', color: 'white', marginBottom: 4 },
  homeBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 14, lineHeight: 18 },
  homeBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  homeBannerBtnText: { fontSize: 13, fontWeight: '700', color: '#6C63FF' },
  homeBannerRight: { marginLeft: 12, zIndex: 2 },
  homeBannerIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Barber cards ── */
  barberCard: {
    width: 130,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  barberAvatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  barberAvailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    top: 50,
    right: 32,
  },
  barberName: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 6, marginBottom: 3 },
  barberRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
  barberRating: { fontSize: 11 },
  barberJobs: { fontSize: 11 },
  barberBookBtn: { borderRadius: 10, overflow: 'hidden', width: '100%' },
  barberBookGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  barberBookText: { fontSize: 11, fontWeight: '700', color: 'white' },

  /* ── Mini map ── */
  miniMapCard: { borderRadius: 20, overflow: 'hidden', height: 180 },
  miniMap: { width: '100%', height: '100%' },
  miniMapGrad: { position: 'absolute', inset: 0, justifyContent: 'flex-end', padding: 14 },
  miniMapCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(108,99,255,0.9)',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
  },
  miniMapCTAText: { color: 'white', fontSize: 13, fontWeight: '700' },
  miniMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  /* ── Tendances ── */
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  hotBadgeText: { fontSize: 11, fontWeight: '800', color: '#FF6B6B' },
  trendCard: {
    width: 155,
    height: 205,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trendGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    padding: 12,
    justifyContent: 'flex-end',
  },
  trendName: { fontSize: 13, fontWeight: '700', color: 'white', marginBottom: 6 },
  trendMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trendDiffBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  trendDiffText: { fontSize: 10, color: 'white', fontWeight: '700' },
  trendScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendScore: { fontSize: 11, color: '#FF6B6B', fontWeight: '700' },

  /* ── Hairstyle cards ── */
  hairstyleCard: {
    width: 145,
    height: 185,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hairstyleGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    padding: 10,
    justifyContent: 'flex-end',
  },
  hairstyleName: { fontSize: 12, fontWeight: '700', color: 'white', marginBottom: 4 },
  hairstylePriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hairstylePrice: { fontSize: 11, color: '#FFD700', fontWeight: '800' },
  hairstyleDurPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hairstyleDur: { fontSize: 9, color: 'rgba(255,255,255,0.85)' },
});
