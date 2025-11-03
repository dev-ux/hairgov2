import React from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, FormControlLabel, Switch } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Paramètres
      </Typography>
      
      <Card sx={{ mt: 3, maxWidth: '800px', mx: 'auto' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              p: 3,
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h5">Préférences</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  variant="outlined"
                  defaultValue="admin"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  defaultValue="admin@hairgov.com"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Activer les notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Mode sombre"
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button variant="contained" color="primary">
                  Enregistrer les modifications
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
