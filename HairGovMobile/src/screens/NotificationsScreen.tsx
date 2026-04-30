import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  NotificationDetail: { notification: Notification };
};

type NotificationType = 'booking' | 'appointment' | 'promotion' | 'system' | 'payment';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: NotificationType;
  content?: string;
  date?: string;
};

type Filter = 'all' | 'unread' | 'read';

const TYPE_CONFIG: Record<string, { icon: string; colors: [string, string]; label: string }> = {
  booking:     { icon: 'calendar',            colors: ['#6C63FF', '#8B84FF'], label: 'Réservation' },
  appointment: { icon: 'calendar',            colors: ['#6C63FF', '#8B84FF'], label: 'Rendez-vous' },
  promotion:   { icon: 'pricetag',            colors: ['#FF9800', '#FFB74D'], label: 'Promotion' },
  system:      { icon: 'information-circle',  colors: ['#4CAF50', '#66BB6A'], label: 'Système' },
  payment:     { icon: 'card',                colors: ['#00BCD4', '#26C6DA'], label: 'Paiement' },
  default:     { icon: 'notifications',       colors: ['#6C63FF', '#8B84FF'], label: 'Notification' },
};

const getConfig = (type?: string) => TYPE_CONFIG[type ?? ''] ?? TYPE_CONFIG.default;

const formatRelativeTime = (time: string) => {
  const date = new Date(time);
  if (isNaN(date.getTime())) return time;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 7)  return `Il y a ${days} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/notifications`);
      const result = await res.json();
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError('Impossible de charger les notifications');
      }
    } catch {
      setError('Vérifiez votre connexion et réessayez');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read')   return  n.read;
    return true;
  });

  const handlePress = async (item: Notification) => {
    if (!item.read) {
      try {
        await fetch(`${API_URL}/notifications/${item.id}/read`, { method: 'PUT' });
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
      } catch { /* silent */ }
    }
    navigation.navigate('NotificationDetail', { notification: { ...item, read: true } });
  };

  const handleMarkAll = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT' });
    } catch { /* silent */ }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const cfg = getConfig(item.type);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }, !item.read && styles.cardUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.88}
      >
        {!item.read && <View style={styles.cardAccent} />}

        <LinearGradient colors={cfg.colors} style={styles.iconCircle}>
          <Ionicons name={cfg.icon as any} size={20} color="white" />
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardTitle, { color: colors.text }, !item.read && styles.cardTitleBold]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardTime}>{formatRelativeTime(item.date ?? item.time)}</Text>
          </View>
          <Text style={[styles.cardMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.cardFooter}>
            <View style={[styles.typePill, { backgroundColor: cfg.colors[0] + '18' }]}>
              <Text style={[styles.typePillText, { color: cfg.colors[0] }]}>{cfg.label}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      {/* ── Header gradient ── */}
      <LinearGradient
        colors={['#6C63FF', '#8B84FF', '#B0AAFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.heroBg1} />
        <View style={styles.heroBg2} />

        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{unreadCount} nouvelles</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAll}>
              <Ionicons name="checkmark-done" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'unread', 'read'] as Filter[]).map(f => {
            const labels = { all: 'Toutes', unread: 'Non lues', read: 'Lues' };
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {labels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>Chargement…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <LinearGradient colors={['#FF6B6B22', '#FF6B6B11']} style={styles.errorIcon}>
            <Ionicons name="cloud-offline-outline" size={36} color="#FF6B6B" />
          </LinearGradient>
          <Text style={[styles.centerTitle, { color: colors.text }]}>Oups !</Text>
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchNotifications}>
            <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.retryGrad}>
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.retryText}>Réessayer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <LinearGradient colors={['#EEF0FF', '#D8D5FF']} style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={36} color="#6C63FF" />
          </LinearGradient>
          <Text style={[styles.centerTitle, { color: colors.text }]}>Tout est calme ici</Text>
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            {filter === 'unread' ? 'Aucune notification non lue' : 'Vous n\'avez aucune notification'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Header ── */
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  heroBg1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -50,
  },
  heroBg2: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
  badgePill: {
    marginTop: 4, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2,
  },
  badgePillText: { fontSize: 11, color: 'white', fontWeight: '700' },
  markAllBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },

  /* ── Filter tabs ── */
  filterRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  filterTab: {
    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
  },
  filterTabActive: { backgroundColor: 'white' },
  filterTabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  filterTabTextActive: { color: '#6C63FF' },

  /* ── List ── */
  list: { padding: 16, paddingTop: 14 },

  /* ── Card ── */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: '#6C63FF18',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#6C63FF',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  cardTitleBold: { fontWeight: '800' },
  cardTime: { fontSize: 11, color: '#999', flexShrink: 0 },
  cardMessage: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typePill: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  typePillText: { fontSize: 11, fontWeight: '700' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#6C63FF',
  },

  /* ── States ── */
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  errorIcon: {
    width: 80, height: 80, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  centerTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  centerText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  retryGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  retryText: { color: 'white', fontSize: 14, fontWeight: '700' },
});
