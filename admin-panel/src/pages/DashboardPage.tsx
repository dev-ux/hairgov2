import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  styled,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

// Carte de statistiques avec effet au survol
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState([
    { title: 'Coiffeurs', value: '...', icon: <PeopleIcon fontSize="large" color="primary" />, loading: true },
    { title: 'Salons', value: '...', icon: <StoreIcon fontSize="large" color="secondary" />, loading: true },
    { title: 'Réservations', value: '...', icon: <CalendarIcon fontSize="large" color="success" />, loading: true },
    { title: 'Revenus', value: '...', icon: <MoneyIcon fontSize="large" color="warning" />, loading: true },

  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        
        if (response.data.success) {
          setStats([
            { 
              title: 'Coiffeurs', 
              value: response.data.data.hairdressersCount.toString(), 
              icon: <PeopleIcon fontSize="large" color="primary" />,
              loading: false
            },
            { 
              title: 'Salons', 
              value: response.data.data.salonsCount.toString(), 
              icon: <StoreIcon fontSize="large" color="secondary" />,
              loading: false
            },
            { 
              title: 'Réservations', 
              value: response.data.data.bookingsCount.toString(), 
              icon: <CalendarIcon fontSize="large" color="success" />,
              loading: false
            },
            { 
              title: 'Revenus', 
              value: `${response.data.data.revenue.toLocaleString('fr-FR')} €`, 
              icon: <MoneyIcon fontSize="large" color="warning" />,
              loading: false
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        py: 4,
        px: { xs: 2, md: 6 },
        bgcolor: '#f5f6fa',
        maxWidth: 'calc(100vw - 200px)',
        marginLeft: 'auto',
      }}
    >
      {/* Titre principal */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Tableau de bord
      </Typography>

      {/* Cartes de statistiques */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item key={index} xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                {stat.icon}
                {stat.loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Typography
                    variant="h5"
                    sx={{ mt: 1, fontWeight: 'bold' }}
                  >
                    {stat.value}
                  </Typography>
                )}
                <Typography variant="body1" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Dernières réservations
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '85%',
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  Graphique des réservations récentes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4} sx={{ minWidth: 0 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Statistiques
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '85%',
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  Graphique circulaire des statistiques
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
