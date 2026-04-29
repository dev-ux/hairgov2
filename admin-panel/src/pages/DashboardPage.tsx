import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Paper, Divider, Chip, Stack, Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';

interface Stats {
  hairdressersCount: number;
  salonsCount: number;
  bookingsCount: number;
  revenue: number;
}

const STAT_CARDS = (s: Stats) => [
  {
    label: 'Coiffeurs',
    value: s.hairdressersCount,
    icon: <PeopleIcon />,
    gradient: 'linear-gradient(135deg, #6C63FF 0%, #9D97FF 100%)',
    light: '#EEF0FF',
  },
  {
    label: 'Salons',
    value: s.salonsCount,
    icon: <StoreIcon />,
    gradient: 'linear-gradient(135deg, #FF6584 0%, #FFB3C1 100%)',
    light: '#FFF0F3',
  },
  {
    label: 'Réservations',
    value: s.bookingsCount,
    icon: <CalendarIcon />,
    gradient: 'linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)',
    light: '#F0FDF4',
  },
  {
    label: 'Revenus (FCFA)',
    value: s.revenue.toLocaleString('fr-FR'),
    icon: <TrendingUpIcon />,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
    light: '#FFFBEB',
  },
];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/dashboard/stats', { signal: controller.signal })
      .then(r => { if (r.data.success) setStats(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <Box>
      {/* Page header */}
      <Box mb={3}>
        <Typography variant="h4">Tableau de bord</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Bienvenue sur le panneau d'administration Scizz
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} mb={4}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={28} />
                </Card>
              </Grid>
            ))
          : stats && STAT_CARDS(stats).map((card, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card
                  sx={{
                    position: 'relative', overflow: 'hidden', cursor: 'default',
                    transition: 'transform .2s, box-shadow .2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {card.label}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} mt={0.5}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Avatar sx={{ width: 48, height: 48, background: card.gradient, borderRadius: 2.5 }}>
                        {React.cloneElement(card.icon, { sx: { color: '#fff', fontSize: 22 } })}
                      </Avatar>
                    </Box>
                  </CardContent>
                  <Box
                    sx={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                      background: card.gradient,
                    }}
                  />
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Bottom section */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Activité récente</Typography>
            <Box
              sx={{
                height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: '#F8F9FD', borderRadius: 2, border: '2px dashed #E8EAF0',
              }}
            >
              <Box textAlign="center">
                <CalendarIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Graphique des réservations à venir
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" mb={2}>Statuts des réservations</Typography>
            <Stack spacing={1.5}>
              {[
                { label: 'En attente', color: '#F59E0B', icon: <PendingIcon fontSize="small" /> },
                { label: 'Confirmées', color: '#3B82F6', icon: <CheckCircleIcon fontSize="small" /> },
                { label: 'En cours',   color: '#6C63FF', icon: <TrendingUpIcon fontSize="small" /> },
                { label: 'Terminées', color: '#22C55E', icon: <CheckCircleIcon fontSize="small" /> },
              ].map(({ label, color, icon }) => (
                <Box key={label} display="flex" alignItems="center" justifyContent="space-between"
                  sx={{ p: 1.5, bgcolor: '#F8F9FD', borderRadius: 2 }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ color }}>{icon}</Box>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                  </Box>
                  <Chip label="–" size="small" sx={{ bgcolor: color + '20', color, fontWeight: 700 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
