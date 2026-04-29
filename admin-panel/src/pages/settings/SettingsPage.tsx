import React from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, FormControlLabel,
  Switch, Divider, Avatar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
    <Box display="flex" alignItems="center" gap={1} mb={2.5}>
      <Box sx={{ color: 'primary.main' }}>{icon}</Box>
      <Typography variant="h6" fontWeight={600}>{title}</Typography>
    </Box>
    {children}
  </Paper>
);

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState(true);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4">Paramètres</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Gérez vos préférences et votre compte
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Profil */}
          <Section icon={<PersonIcon />} title="Informations du compte">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Nom complet"
                  defaultValue={(user as any)?.full_name || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Email" type="email"
                  defaultValue={(user as any)?.email || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Téléphone"
                  defaultValue={(user as any)?.phone || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained">Enregistrer les modifications</Button>
              </Grid>
            </Grid>
          </Section>

          {/* Sécurité */}
          <Section icon={<SecurityIcon />} title="Sécurité">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Mot de passe actuel" type="password" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nouveau mot de passe" type="password" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Confirmer le mot de passe" type="password" />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" color="primary">Changer le mot de passe</Button>
              </Grid>
            </Grid>
          </Section>

          {/* Notifications */}
          <Section icon={<NotificationsIcon />} title="Notifications">
            <Box display="flex" flexDirection="column" gap={1.5}>
              {[
                { label: 'Nouvelles réservations', defaultOn: true },
                { label: 'Nouvelles inscriptions coiffeurs', defaultOn: true },
                { label: 'Alertes système', defaultOn: false },
              ].map(({ label, defaultOn }) => (
                <Box key={label} display="flex" alignItems="center" justifyContent="space-between"
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8F9FD' }}
                >
                  <Typography variant="body2" fontWeight={500}>{label}</Typography>
                  <Switch defaultChecked={defaultOn} color="primary" size="small" />
                </Box>
              ))}
            </Box>
          </Section>
        </Grid>

        {/* Colonne droite — profil rapide */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <Avatar
                sx={{
                  width: 80, height: 80, mb: 2,
                  background: 'linear-gradient(135deg, #6C63FF, #9D97FF)',
                  fontSize: 28,
                }}
              >
                {(user as any)?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {(user as any)?.full_name || 'Administrateur'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {(user as any)?.email || ''}
              </Typography>
              <Divider sx={{ width: '100%', mb: 2 }} />
              <Box
                sx={{
                  width: '100%', py: 1, px: 2, borderRadius: 2,
                  bgcolor: 'rgba(108,99,255,0.08)',
                }}
              >
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  ADMINISTRATEUR
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
