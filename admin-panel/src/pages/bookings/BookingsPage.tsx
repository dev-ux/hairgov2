import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

const BookingsPage: React.FC = () => {
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
        Gestion des Réservations
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
            <CalendarIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6">Gestion des réservations</Typography>
            <Typography>Cette page affichera la liste des réservations à venir et passées.</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingsPage;
