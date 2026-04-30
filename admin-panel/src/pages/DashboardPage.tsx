import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Paper, Stack, Avatar, Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Clock, CheckCircle2, XCircle, Activity, Ban,
  Scissors, UserPlus, Store, CheckCircle as LucideCheck,
} from 'lucide-react';

/* ── Types ── */
interface Stats {
  hairdressersCount: number;
  salonsCount: number;
  bookingsCount: number;
  revenue: number;
}

interface ActivityEvent {
  id: string;
  type: 'booking' | 'user' | 'salon';
  icon: string;
  color: string;
  title: string;
  description: string;
  timestamp: string;
}

/* ── Helpers ── */
const STAT_CARDS = (s: Stats) => [
  { label: 'Coiffeurs',      value: s.hairdressersCount,               icon: <PeopleIcon />,    gradient: 'linear-gradient(135deg,#6C63FF,#9D97FF)', light: '#EEF0FF' },
  { label: 'Salons',         value: s.salonsCount,                     icon: <StoreIcon />,     gradient: 'linear-gradient(135deg,#FF6584,#FFB3C1)', light: '#FFF0F3' },
  { label: 'Réservations',   value: s.bookingsCount,                   icon: <CalendarIcon />,  gradient: 'linear-gradient(135deg,#22C55E,#86EFAC)', light: '#F0FDF4' },
  { label: 'Revenus (FCFA)', value: s.revenue.toLocaleString('fr-FR'), icon: <TrendingUpIcon />,gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', light: '#FFFBEB' },
];

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'clock':           Clock,
  'check-circle':    CheckCircle2,
  'check-circle-2':  CheckCircle2,
  'x-circle':        XCircle,
  'activity':        Activity,
  'ban':             Ban,
  'scissors':        Scissors,
  'user-plus':       UserPlus,
  'store':           Store,
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'À l\'instant';
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Hier' : `Il y a ${d} jours`;
};

const TYPE_LABELS: Record<string, string> = {
  booking: 'Réservation',
  user:    'Utilisateur',
  salon:   'Salon',
};

const BOOKING_STATUSES = [
  { label: 'En attente',  color: '#F59E0B', icon: <PendingIcon fontSize="small" /> },
  { label: 'Confirmées',  color: '#3B82F6', icon: <CheckCircleIcon fontSize="small" /> },
  { label: 'En cours',    color: '#6C63FF', icon: <TrendingUpIcon fontSize="small" /> },
  { label: 'Terminées',   color: '#22C55E', icon: <CheckCircleIcon fontSize="small" /> },
];

/* ── Component ── */
const DashboardPage: React.FC = () => {
  const [stats, setStats]         = useState<Stats | null>(null);
  const [activity, setActivity]   = useState<ActivityEvent[]>([]);
  const [loadingStats, setLoadingStats]       = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [refreshing, setRefreshing]           = useState(false);

  const fetchStats = () => {
    const ctrl = new AbortController();
    setLoadingStats(true);
    api.get('/admin/dashboard/stats', { signal: ctrl.signal })
      .then(r => { if (r.data.success) setStats(r.data.data); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
    return ctrl;
  };

  const fetchActivity = async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoadingActivity(true);
    try {
      const r = await api.get('/admin/dashboard/activity');
      if (r.data.success) setActivity(r.data.data);
    } catch { /* silent */ }
    finally {
      setLoadingActivity(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const ctrl = fetchStats();
    fetchActivity();
    return () => ctrl.abort();
  }, []);

  return (
    <Box>
      {/* ── Header ── */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>Tableau de bord</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Bienvenue sur le panneau d'administration HairGov
        </Typography>
      </Box>

      {/* ── Stat cards ── */}
      <Grid container spacing={2.5} mb={4}>
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={28} />
                </Card>
              </Grid>
            ))
          : stats && STAT_CARDS(stats).map((card, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card sx={{
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform .2s, box-shadow .2s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{card.label}</Typography>
                        <Typography variant="h4" fontWeight={700} mt={0.5}>{card.value}</Typography>
                      </Box>
                      <Avatar sx={{ width: 48, height: 48, background: card.gradient, borderRadius: 2.5 }}>
                        {React.cloneElement(card.icon, { sx: { color: '#fff', fontSize: 22 } })}
                      </Avatar>
                    </Box>
                  </CardContent>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: card.gradient }} />
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* ── Bottom section ── */}
      <Grid container spacing={2.5}>

        {/* Activity feed */}
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Activité récente</Typography>
                <Typography variant="body2" color="text.secondary">
                  Dernières actions effectuées sur la plateforme
                </Typography>
              </Box>
              <Box
                component="button"
                onClick={() => fetchActivity(true)}
                disabled={refreshing}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.75, border: '1px solid #E5E7EB',
                  borderRadius: 2, background: 'white', cursor: 'pointer',
                  fontSize: 13, color: '#6B7280', fontWeight: 600,
                  '&:hover': { background: '#F9FAFB' },
                  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                }}
              >
                <RefreshIcon sx={{ fontSize: 15, animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                Actualiser
              </Box>
            </Box>

            {loadingActivity ? (
              <Box display="flex" alignItems="center" justifyContent="center" height={260}>
                <CircularProgress size={32} sx={{ color: '#6C63FF' }} />
              </Box>
            ) : activity.length === 0 ? (
              <Box sx={{
                height: 260, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                bgcolor: '#F8F9FD', borderRadius: 2, border: '2px dashed #E8EAF0', gap: 1,
              }}>
                <CalendarIcon sx={{ fontSize: 44, color: '#C7D2FE' }} />
                <Typography color="text.secondary" variant="body2">Aucune activité récente</Typography>
              </Box>
            ) : (
              <Stack spacing={0}>
                {activity.map((event, idx) => {
                  const IconComp = ICON_MAP[event.icon] ?? LucideCheck;
                  const isLast   = idx === activity.length - 1;
                  return (
                    <Box key={event.id} display="flex" gap={1.5}>
                      {/* Timeline line */}
                      <Box display="flex" flexDirection="column" alignItems="center" flexShrink={0}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '10px',
                          background: event.color + '18',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <IconComp size={16} color={event.color} />
                        </Box>
                        {!isLast && (
                          <Box sx={{ width: '2px', flex: 1, minHeight: 16, background: '#F0F0F5', my: 0.5 }} />
                        )}
                      </Box>

                      {/* Content */}
                      <Box pb={isLast ? 0 : 1.5} pt={0.25} flex={1}>
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="text.primary" lineHeight={1.3}>
                              {event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" mt={0.3} display="block">
                              {event.description}
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5} flexShrink={0}>
                            <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                              {formatRelative(event.timestamp)}
                            </Typography>
                            <Chip
                              label={TYPE_LABELS[event.type]}
                              size="small"
                              sx={{
                                fontSize: 10, height: 18, fontWeight: 700,
                                bgcolor: event.color + '15', color: event.color,
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Booking statuses */}
        <Grid item xs={12} lg={4}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>Statuts des réservations</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>Vue d'ensemble</Typography>
            <Stack spacing={1.5}>
              {BOOKING_STATUSES.map(({ label, color, icon }) => (
                <Box key={label} display="flex" alignItems="center" justifyContent="space-between"
                  sx={{ p: 1.5, bgcolor: '#F8F9FD', borderRadius: 2 }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ color }}>{icon}</Box>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                  </Box>
                  <Chip
                    label={loadingStats ? '…' : '–'}
                    size="small"
                    sx={{ bgcolor: color + '20', color, fontWeight: 700 }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
};

export default DashboardPage;
