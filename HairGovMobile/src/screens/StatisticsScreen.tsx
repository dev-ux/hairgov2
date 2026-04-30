import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { API_URL, STORAGE_KEYS } from '../config/constants';

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_H = 90;
const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// ── Types ──────────────────────────────────────────────────────────────────
type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
type Booking = {
  id: string;
  status: BookingStatus;
  service_type: 'home' | 'salon';
  client_price: number;
  service_fee: number;
  created_at: string;
  hairstyle?: { id: string; name: string };
  hairdresser?: { id: string };
};

// ── Stats computation ──────────────────────────────────────────────────────
function computeStats(bookings: Booking[]) {
  const count = (s: BookingStatus) => bookings.filter(b => b.status === s).length;
  const completed = count('completed');
  const cancelled  = count('cancelled');

  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (Number(b.client_price) || 0) + (Number(b.service_fee) || 0), 0);

  const hairstyleCounts: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.hairstyle?.name)
      hairstyleCounts[b.hairstyle.name] = (hairstyleCounts[b.hairstyle.name] || 0) + 1;
  });

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: MONTHS_FR[d.getMonth()],
      count: bookings.filter(b => {
        const bd = new Date(b.created_at);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      }).length,
    };
  });

  return {
    total:        bookings.length,
    completed,
    cancelled,
    pending:      count('pending'),
    accepted:     count('accepted'),
    in_progress:  count('in_progress'),
    rejected:     count('rejected'),
    totalSpent:   Math.round(totalSpent),
    avgPerBooking: completed > 0 ? Math.round(totalSpent / completed) : 0,
    completionRate: (completed + cancelled) > 0
      ? Math.round((completed / (completed + cancelled)) * 100) : 0,
    homeCount:  bookings.filter(b => b.service_type === 'home').length,
    salonCount: bookings.filter(b => b.service_type === 'salon').length,
    topHairstyles: Object.entries(hairstyleCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
    monthlyData,
    uniqueHairdressers: new Set(
      bookings.filter(b => b.hairdresser?.id).map(b => b.hairdresser!.id)
    ).size,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────
const KpiCard = ({ icon, iconColor, label, value, bg }: {
  icon: any; iconColor: string; label: string; value: string; bg: string;
}) => (
  <View style={[styles.kpiCard, { backgroundColor: bg }]}>
    <View style={[styles.kpiIcon, { backgroundColor: iconColor + '22' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

const ServiceBar = ({ label, count, total, color, icon }: {
  label: string; count: number; total: number; color: string; icon: any;
}) => (
  <View style={styles.svcRow}>
    <View style={styles.svcLeft}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={styles.svcLabel}>{label}</Text>
    </View>
    <View style={styles.svcTrack}>
      <View style={[styles.svcFill, {
        width: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%',
        backgroundColor: color,
      }]} />
    </View>
    <Text style={[styles.svcCount, { color }]}>{count}</Text>
  </View>
);

// ── Main Screen ────────────────────────────────────────────────────────────
const RANK_BG    = ['#FFD700', '#C0C0C0', '#CD7F32', '#EEF0FF'];
const RANK_TEXT  = ['#fff',    '#fff',    '#fff',    '#6C63FF'];

const PIE_ITEMS = [
  { key: 'completed',   label: 'Terminé',    color: '#22C55E' },
  { key: 'accepted',    label: 'Confirmé',   color: '#3B82F6' },
  { key: 'pending',     label: 'En attente', color: '#F59E0B' },
  { key: 'in_progress', label: 'En cours',   color: '#6C63FF' },
  { key: 'cancelled',   label: 'Annulé',     color: '#EF4444' },
  { key: 'rejected',    label: 'Refusé',     color: '#9CA3AF' },
] as const;

export const StatisticsScreen = () => {
  const navigation = useNavigation<any>();
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (!token) { setError('Vous devez être connecté'); return; }

      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const [r1, r2] = await Promise.all([
        fetch(`${API_URL}/bookings/client`, { headers }),
        fetch(`${API_URL}/history/client`,  { headers }),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

      const seen = new Set<string>();
      const all: Booking[] = [];
      const push = (b: Booking) => { if (!seen.has(b.id)) { seen.add(b.id); all.push(b); } };
      (d1.success ? d1.data?.bookings ?? [] : []).forEach(push);
      (d2.success ? d2.data?.bookings ?? [] : []).forEach(push);
      setBookings(all);
    } catch {
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const Header = ({ showRefresh = false }) => (
    <LinearGradient
      colors={['#6C63FF', '#8B84FF']}
      style={styles.headerGrad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiques</Text>
        {showRefresh ? (
          <TouchableOpacity onPress={() => { setRefreshing(true); fetchData(); }} style={styles.headerBtn}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
          </TouchableOpacity>
        ) : <View style={styles.headerBtn} />}
      </View>
    </LinearGradient>
  );

  if (loading) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <View style={styles.loadBox}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadText}>Chargement des statistiques...</Text>
      </View>
    </SafeAreaView>
  );

  const s = computeStats(bookings);
  const maxMonthly   = Math.max(...s.monthlyData.map(m => m.count), 1);
  const maxHairstyle = s.topHairstyles[0]?.count || 1;

  const pieData = PIE_ITEMS
    .map(p => ({
      name: p.label,
      population: s[p.key as keyof typeof s] as number,
      color: p.color,
      legendFontColor: '#555',
      legendFontSize: 12,
    }))
    .filter(d => d.population > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            colors={['#6C63FF']}
            tintColor="#6C63FF"
          />
        }
      >
        {/* ── Header + KPIs ── */}
        <LinearGradient
          colors={['#6C63FF', '#8B84FF']}
          style={styles.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Statistiques</Text>
            <TouchableOpacity
              onPress={() => { setRefreshing(true); fetchData(); }}
              style={styles.headerBtn}
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerStats}>
            {[
              { label: 'Total',      value: String(s.total) },
              { label: 'Terminées',  value: String(s.completed) },
              { label: 'Réussite',   value: `${s.completionRate}%` },
              { label: 'En attente', value: String(s.pending) },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <View style={styles.hStatBox}>
                  <Text style={styles.hStatVal}>{item.value}</Text>
                  <Text style={styles.hStatLabel}>{item.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.hStatDiv} />}
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Error ── */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Empty state ── */}
          {s.total === 0 && !error && (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="bar-chart-outline" size={40} color="#6C63FF" />
              </View>
              <Text style={styles.emptyTitle}>Aucune donnée</Text>
              <Text style={styles.emptyText}>Vos statistiques apparaîtront ici après vos premières réservations.</Text>
            </View>
          )}

          {s.total > 0 && (
            <>
              {/* ── Résumé financier ── */}
              <Text style={styles.sectionTitle}>Résumé financier</Text>
              <View style={styles.kpiGrid}>
                <KpiCard
                  icon="cash-outline" iconColor="#22C55E"
                  label="Total dépensé"
                  value={`${s.totalSpent.toLocaleString('fr-FR')} FCFA`}
                  bg="#E8F5E9"
                />
                <KpiCard
                  icon="calculator-outline" iconColor="#3B82F6"
                  label="Moy. par prestation"
                  value={`${s.avgPerBooking.toLocaleString('fr-FR')} FCFA`}
                  bg="#E3F2FD"
                />
                <KpiCard
                  icon="cut-outline" iconColor="#8B5CF6"
                  label="Coiffeurs consultés"
                  value={String(s.uniqueHairdressers)}
                  bg="#EDE7F6"
                />
                <KpiCard
                  icon="close-circle-outline" iconColor="#EF4444"
                  label="Annulations"
                  value={String(s.cancelled)}
                  bg="#FFEBEE"
                />
              </View>

              {/* ── Type de service ── */}
              <Text style={styles.sectionTitle}>Type de service</Text>
              <View style={styles.card}>
                <ServiceBar label="À domicile" count={s.homeCount}  total={s.total} color="#6C63FF" icon="home-outline" />
                <View style={{ height: 16 }} />
                <ServiceBar label="En salon"   count={s.salonCount} total={s.total} color="#FF9800" icon="storefront-outline" />
              </View>

              {/* ── Répartition des statuts ── */}
              {pieData.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Répartition des statuts</Text>
                  <View style={[styles.card, { paddingHorizontal: 0, overflow: 'hidden' }]}>
                    <PieChart
                      data={pieData}
                      width={SCREEN_W - 32}
                      height={200}
                      chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="10"
                      absolute
                    />
                  </View>
                </>
              )}

              {/* ── Services les plus demandés ── */}
              {s.topHairstyles.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Services les plus demandés</Text>
                  <View style={styles.card}>
                    {s.topHairstyles.map((h, i) => (
                      <View key={h.name} style={[styles.hsRow, i > 0 && { marginTop: 14 }]}>
                        <View style={[styles.rankBadge, { backgroundColor: RANK_BG[i] }]}>
                          <Text style={[styles.rankText, { color: RANK_TEXT[i] }]}>{i + 1}</Text>
                        </View>
                        <Text style={styles.hsName} numberOfLines={1}>{h.name}</Text>
                        <View style={styles.hsTrack}>
                          <View style={[styles.hsFill, {
                            width: `${Math.round((h.count / maxHairstyle) * 100)}%`,
                          }]} />
                        </View>
                        <Text style={styles.hsCount}>{h.count}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* ── Évolution sur 6 mois ── */}
              <Text style={styles.sectionTitle}>Évolution sur 6 mois</Text>
              <View style={styles.card}>
                <View style={styles.barChart}>
                  {s.monthlyData.map((m) => {
                    const fillH = m.count > 0
                      ? Math.max(Math.round((m.count / maxMonthly) * BAR_H), 6)
                      : 0;
                    return (
                      <View key={m.month} style={styles.barCol}>
                        <Text style={styles.barVal}>{m.count > 0 ? m.count : ''}</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { height: fillH }]} />
                        </View>
                        <Text style={styles.barLabel}>{m.month}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },

  // Header
  headerGrad:  { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 12 },
  hStatBox:    { flex: 1, alignItems: 'center' },
  hStatVal:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  hStatLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  hStatDiv:    { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Loading / empty / error
  loadBox:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadText:      { fontSize: 15, color: '#666' },
  emptyBox:      { alignItems: 'center', padding: 32, gap: 10 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center' },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyText:     { fontSize: 14, color: '#999', textAlign: 'center' },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF5F5', borderRadius: 10, padding: 12, marginBottom: 8 },
  errorText:     { fontSize: 13, color: '#ff6b6b', flex: 1 },

  // Layout
  body:         { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginTop: 20, marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: { width: (SCREEN_W - 42) / 2, borderRadius: 14, padding: 14 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 3 },
  kpiLabel: { fontSize: 11.5, color: '#888' },

  // Service bars
  svcRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  svcLeft:  { flexDirection: 'row', alignItems: 'center', gap: 6, width: 112 },
  svcLabel: { fontSize: 13, fontWeight: '500', color: '#444' },
  svcTrack: { flex: 1, height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  svcFill:  { height: '100%', borderRadius: 5 },
  svcCount: { width: 24, fontSize: 13, fontWeight: '700', textAlign: 'right' },

  // Top hairstyles
  hsRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankBadge:  { width: 22, height: 22, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  rankText:   { fontSize: 11, fontWeight: '800' },
  hsName:     { flex: 1, fontSize: 13, fontWeight: '600', color: '#333' },
  hsTrack:    { width: 80, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  hsFill:     { height: '100%', backgroundColor: '#6C63FF', borderRadius: 4 },
  hsCount:    { width: 20, fontSize: 13, fontWeight: '700', color: '#6C63FF', textAlign: 'right' },

  // Monthly bar chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_H + 44 },
  barCol:   { flex: 1, alignItems: 'center' },
  barVal:   { fontSize: 11, fontWeight: '700', color: '#6C63FF', height: 16, textAlign: 'center' },
  barTrack: { height: BAR_H, justifyContent: 'flex-end', width: '65%' },
  barFill:  { width: '100%', backgroundColor: '#6C63FF', borderRadius: 4, opacity: 0.85 },
  barLabel: { fontSize: 10, color: '#888', marginTop: 6 },
});

export default StatisticsScreen;
