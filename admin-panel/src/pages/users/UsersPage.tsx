import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

const UsersPage: React.FC = () => {
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
        Gestion des Utilisateurs
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              color: 'text.secondary',
            }}
          >
            <PeopleIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6">Gestion des utilisateurs</Typography>
            <Typography>Cette page permettra de gérer les comptes utilisateurs et leurs permissions.</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsersPage;
