import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { getAllBookings, Booking, deleteBooking } from '../../services/booking.service';

const STATUS_MAP: Record<string, { label: string; color: 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default' }> = {
  pending:     { label: 'En attente', color: 'warning'  },
  confirmed:   { label: 'Confirmé',   color: 'info'     },
  in_progress: { label: 'En cours',   color: 'primary'  },
  completed:   { label: 'Terminé',    color: 'success'  },
  cancelled:   { label: 'Annulé',     color: 'error'    },
};

function formatDate(d: string) {
  if (!d) return '–';
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBookings = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings(signal);
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Erreur lors de la récupération des réservations');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED') {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchBookings(controller.signal);
    return () => controller.abort();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await deleteBooking(deleteTarget.id);
      if (response.success) {
        setBookings(prev => prev.filter(b => b.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4">Réservations</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {bookings.length} réservation{bookings.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Tooltip title="Actualiser">
          <IconButton onClick={() => fetchBookings()} size="small" sx={{ bgcolor: '#F0F2F8' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Coiffeur</TableCell>
                <TableCell>Date prévue</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CalendarIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Aucune réservation</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map(booking => {
                  const s = STATUS_MAP[booking.status] || { label: booking.status, color: 'default' as const };
                  return (
                    <TableRow
                      key={booking.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => setSelected(booking)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#6C63FF', fontSize: 12 }}>
                            {booking.client_name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{booking.client_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{booking.client_phone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={booking.service_type === 'home' ? <HomeIcon /> : <StoreIcon />}
                          label={booking.service_type === 'home' ? 'À domicile' : 'En salon'}
                          size="small" variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.hairdresser?.full_name || '–'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(booking.scheduled_time)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {booking.client_price ? `${Number(booking.client_price).toLocaleString('fr-FR')} FCFA` : '–'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={s.label} color={s.color as any} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small" color="error"
                            onClick={e => { e.stopPropagation(); setDeleteTarget(booking); }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Détails dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle fontWeight={700}>Détails de la réservation</DialogTitle>
        <DialogContent>
          {selected && (
            <Grid container spacing={2.5} sx={{ pt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Client</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{selected.client_name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{selected.client_phone}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Service</Typography>
                <Box mt={0.5}>
                  <Chip
                    icon={selected.service_type === 'home' ? <HomeIcon /> : <StoreIcon />}
                    label={selected.service_type === 'home' ? 'À domicile' : 'En salon'}
                    size="small" variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Statut</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={(STATUS_MAP[selected.status] || { label: selected.status }).label}
                    color={(STATUS_MAP[selected.status]?.color || 'default') as any}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Date prévue</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{formatDate(selected.scheduled_time)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Durée estimée</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{selected.estimated_duration} min</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Frais service</Typography>
                <Typography variant="body2" fontWeight={500} mt={0.5}>
                  {selected.service_fee ? `${Number(selected.service_fee).toLocaleString('fr-FR')} FCFA` : '–'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Prix client</Typography>
                <Typography variant="body2" fontWeight={500} mt={0.5}>
                  {selected.client_price ? `${Number(selected.client_price).toLocaleString('fr-FR')} FCFA` : '–'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Adresse</Typography>
                <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
                  <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.25 }} />
                  <Typography variant="body2" fontWeight={500}>{selected.location_address}</Typography>
                </Box>
              </Grid>

              {/* ── Carte de localisation ── */}
              {selected.latitude && selected.longitude && (
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '10px',
                        background: 'linear-gradient(135deg,#6C63FF,#9D97FF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LocationIcon sx={{ fontSize: 16, color: '#fff' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Position de la réservation</Typography>
                        <Typography variant="caption" color="text.secondary">{selected.location_address}</Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Ouvrir dans Google Maps">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LocationIcon />}
                        href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        component="a"
                        sx={{ fontSize: 12, borderRadius: 2 }}
                      >
                        Google Maps
                      </Button>
                    </Tooltip>
                  </Box>

                  <Box sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #E8EAF0',
                    position: 'relative',
                    height: 300,
                    boxShadow: '0 2px 12px rgba(108,99,255,0.08)',
                  }}>
                    <iframe
                      title="Localisation réservation"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.longitude - 0.008}%2C${selected.latitude - 0.008}%2C${selected.longitude + 0.008}%2C${selected.latitude + 0.008}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`}
                      style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
                      loading="lazy"
                    />
                    {/* Badge coordonnées */}
                    <Box sx={{
                      position: 'absolute', bottom: 10, left: 10,
                      bgcolor: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(6px)',
                      borderRadius: 2,
                      px: 1.5, py: 0.75,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      display: 'flex', alignItems: 'center', gap: 0.5,
                    }}>
                      <LocationIcon sx={{ fontSize: 13, color: '#6C63FF' }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                        {Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {selected.hairdresser && (
                <>
                  <Grid item xs={12}><Divider /></Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Coiffeur</Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      {selected.hairdresser.profile_photo ? (
                        <Avatar src={selected.hairdresser.profile_photo} sx={{ width: 28, height: 28 }} />
                      ) : (
                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {selected.hairdresser.full_name || '–'}
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}

              {selected.hairstyle && (
                <>
                  <Grid item xs={12}><Divider /></Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Coiffure</Typography>
                    <Typography variant="body2" fontWeight={500} mt={0.5}>{selected.hairstyle.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Catégorie</Typography>
                    <Typography variant="body2" fontWeight={500} mt={0.5}>{selected.hairstyle.category || '–'}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer cette réservation ?</DialogTitle>
        <DialogContent>
          <Typography>
            La réservation de <strong>{deleteTarget?.client_name}</strong> sera définitivement supprimée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Annuler</Button>
          <Button
            variant="contained" color="error" disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            onClick={handleDelete}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;
