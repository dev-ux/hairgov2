import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAllBookings, Booking } from '../../services/booking.service';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings();
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Erreur lors de la récupération des réservations');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          px: { xs: 2, md: 4 },
          py: 3,
          bgcolor: '#f5f6fa',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Réservations
        </Typography>
        <Tooltip title="Actualiser">
          <IconButton onClick={fetchBookings} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        <CalendarIcon sx={{ fontSize: 64, mb: 2 }} />
                        <Typography variant="h6">Aucune réservation</Typography>
                        <Typography>Aucune réservation trouvée dans le système</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow 
                      key={booking.id} 
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleRowClick(booking)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          {booking.client_name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.service_type === 'home' ? 'À domicile' : 'En salon'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(booking.status)} 
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Modal pour les détails de la réservation */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Détails de la réservation
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ID Réservation
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {selectedBooking.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Client
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{selectedBooking.client_name}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Téléphone
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{selectedBooking.client_phone}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Service
                </Typography>
                <Chip 
                  label={selectedBooking.service_type === 'home' ? 'À domicile' : 'En salon'} 
                  size="small" 
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Frais service
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.service_fee ? `${Number(selectedBooking.service_fee).toFixed(2)} €` : '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Prix client
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.client_price ? `${Number(selectedBooking.client_price).toFixed(2)} €` : '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Statut
                </Typography>
                <Chip 
                  label={getStatusText(selectedBooking.status)} 
                  color={getStatusColor(selectedBooking.status) as any}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Adresse
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary', mt: 0.5 }} />
                  <Typography variant="body1">{selectedBooking.location_address}</Typography>
                </Box>
                
                {/* Carte Google Maps */}
                <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedBooking.location_address)}&output=embed`}
                    allowFullScreen
                  />
                </Box>
              </Grid>

              {/* Section Coiffeur */}
              {selectedBooking.hairdresser && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Informations du Coiffeur
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nom du coiffeur
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {selectedBooking.hairdresser.full_name || 'Non spécifié'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Photo de profil
                    </Typography>
                    {selectedBooking.hairdresser.profile_photo ? (
                      <Box
                        component="img"
                        src={selectedBooking.hairdresser.profile_photo}
                        alt="Photo du coiffeur"
                        sx={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aucune photo
                      </Typography>
                    )}
                  </Grid>
                </>
              )}

              {/* Section Service */}
              {selectedBooking.hairstyle && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Détails du Service
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nom du service
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedBooking.hairstyle.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Catégorie
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking.hairstyle.category || 'Non spécifiée'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking.hairstyle.description || 'Aucune description'}
                    </Typography>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Durée estimée
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{selectedBooking.estimated_duration} minutes</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Date prévue
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedBooking.scheduled_time)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Créé le
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedBooking.created_at)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;
