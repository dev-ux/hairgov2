import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  styled,
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
  const stats = [
    { title: 'Coiffeurs', value: '24', icon: <PeopleIcon fontSize="large" color="primary" /> },
    { title: 'Salons', value: '12', icon: <StoreIcon fontSize="large" color="secondary" /> },
    { title: 'Réservations', value: '156', icon: <CalendarIcon fontSize="large" color="success" /> },
    { title: 'Revenus', value: '2,450 €', icon: <MoneyIcon fontSize="large" color="warning" /> },
  ];

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        px: { xs: 2, md: 4 },
        py: 3,
        bgcolor: '#f5f6fa',
      }}
    >
      {/* Titre principal */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Tableau de bord
      </Typography>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {stats.map((stat, index) => (
          <Grid item key={index} xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                {stat.icon}
                <Typography
                  variant="h5"
                  sx={{ mt: 1, fontWeight: 'bold' }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} lg={8}>
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

        <Grid item xs={12} lg={4}>
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
