import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import {
  Box, Typography, Paper, Button, Grid, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Divider, Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PhotoLibrary as GalleryIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

interface BusinessHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface Salon {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  logo?: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
  hairdresser?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_photo?: string;
  };
  business_hours?: Record<string, BusinessHours | string>;
}

const DAYS_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function formatHours(value: BusinessHours | string | undefined): string {
  if (!value) return 'Fermé';
  if (typeof value === 'string') return value || 'Fermé';
  if (value.closed) return 'Fermé';
  return `${value.open} – ${value.close}`;
}

function formatImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `https://hairgov2.onrender.com${url}`;
  return '';
}

const DetailSalon: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSalon = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/salons/${id}`, { signal: controller.signal });
        if (response.data.success) {
          setSalon({ ...response.data.data, photos: response.data.data.photos || [] });
        } else {
          setError(response.data.message || 'Impossible de charger le salon');
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED') {
          setError(err.response?.data?.message || 'Erreur lors du chargement');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
    return () => controller.abort();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/admin/salons/${id}`);
      navigate('/salons');
    } catch {
      setError('Erreur lors de la suppression');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !salon) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/salons')} sx={{ mb: 2 }}>
          Retour
        </Button>
        <Typography color="error">{error || 'Salon non trouvé'}</Typography>
      </Box>
    );
  }

  const logoUrl = salon.logo ? formatImageUrl(salon.logo) : '';
  const sortedDays = DAY_ORDER.filter(d => salon.business_hours && d in salon.business_hours);

  return (
    <Box sx={{ pb: 4 }}>
      {/* ─── Hero banner ─── */}
      <Box
        sx={{
          position: 'relative',
          height: 220,
          borderRadius: 3,
          overflow: 'hidden',
          mb: 3,
          background: 'linear-gradient(135deg, #1a237e 0%, #6C63FF 100%)',
        }}
      >
        {salon.photos[0] && (
          <Box
            component="img"
            src={formatImageUrl(salon.photos[0])}
            alt={salon.name}
            sx={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: 0.35,
            }}
            onError={(e: any) => { e.target.style.display = 'none'; }}
          />
        )}
        <Box
          sx={{
            position: 'absolute', inset: 0, px: 4,
            display: 'flex', alignItems: 'center', gap: 3,
          }}
        >
          <Avatar
            src={logoUrl || undefined}
            sx={{
              width: 88, height: 88,
              border: '3px solid rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.15)',
              fontSize: 32,
            }}
          >
            {!logoUrl && <StoreIcon sx={{ fontSize: 40, color: '#fff' }} />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} color="#fff">
              {salon.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <LocationIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.75)' }} />
              <Typography variant="body2" color="rgba(255,255,255,0.85)">
                {salon.address}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={salon.is_validated ? <CheckCircleIcon /> : <CancelIcon />}
              label={salon.is_validated ? 'Validé' : 'Non validé'}
              color={salon.is_validated ? 'success' : 'warning'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>
        {/* Actions */}
        <Box sx={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/salons/edit/${salon.id}`)}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', fontWeight: 600 }}
          >
            Modifier
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ borderColor: 'rgba(255,100,100,0.7)', color: '#ffcdd2', fontWeight: 600 }}
          >
            Supprimer
          </Button>
        </Box>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: 'absolute', top: 12, left: 12, color: '#fff', bgcolor: 'rgba(0,0,0,0.25)' }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* ─── Colonne gauche ─── */}
        <Grid item xs={12} md={8}>

          {/* Galerie */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <GalleryIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Galerie photos</Typography>
              <Chip label={`${salon.photos.length} photo${salon.photos.length !== 1 ? 's' : ''}`} size="small" sx={{ ml: 'auto' }} />
            </Box>
            {salon.photos.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 1.5,
                }}
              >
                {salon.photos.map((photo, i) => {
                  const url = formatImageUrl(photo);
                  return url ? (
                    <Box
                      key={i}
                      component="img"
                      src={url}
                      alt={`${salon.name} ${i + 1}`}
                      onClick={() => setSelectedPhoto(url)}
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                      sx={{
                        width: '100%', height: 130, objectFit: 'cover',
                        borderRadius: 2, cursor: 'pointer',
                        transition: 'transform .2s, box-shadow .2s',
                        '&:hover': { transform: 'scale(1.03)', boxShadow: 4 },
                      }}
                    />
                  ) : null;
                })}
              </Box>
            ) : (
              <Box
                sx={{
                  height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: '#f5f5f5', borderRadius: 2, border: '2px dashed #ddd',
                }}
              >
                <Typography color="text.secondary">Aucune photo disponible</Typography>
              </Box>
            )}
          </Paper>

          {/* Informations du coiffeur */}
          {salon.hairdresser && (
            <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Coiffeur propriétaire</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={salon.hairdresser.profile_photo ? formatImageUrl(salon.hairdresser.profile_photo) : undefined}
                  sx={{ width: 56, height: 56, bgcolor: '#6C63FF' }}
                >
                  {salon.hairdresser.full_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Typography fontWeight={600} variant="body1">
                    {salon.hairdresser.full_name}
                  </Typography>
                  <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                    {salon.hairdresser.phone && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{salon.hairdresser.phone}</Typography>
                      </Box>
                    )}
                    {salon.hairdresser.email && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{salon.hairdresser.email}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/hairdressers/${salon.hairdresser!.id}`)}
                >
                  Voir le profil
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* ─── Colonne droite ─── */}
        <Grid item xs={12} md={4}>

          {/* Localisation */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <LocationIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Localisation</Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 1 }}>{salon.address}</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Latitude</Typography>
                <Typography variant="body2" fontWeight={500}>{Number(salon.latitude).toFixed(6)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Longitude</Typography>
                <Typography variant="body2" fontWeight={500}>{Number(salon.longitude).toFixed(6)}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Horaires */}
          <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Horaires</Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/salons/edit/${salon.id}`)}
                sx={{ ml: 'auto', fontSize: 12 }}
              >
                Modifier
              </Button>
            </Box>
            {sortedDays.length > 0 ? (
              <Stack spacing={0.5}>
                {sortedDays.map(day => {
                  const hours = salon.business_hours![day];
                  const isClosed = !hours || (typeof hours === 'object' && hours.closed);
                  return (
                    <Box
                      key={day}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        borderRadius: 1.5,
                        bgcolor: isClosed ? 'transparent' : 'rgba(108,99,255,0.06)',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {DAYS_FR[day]}
                      </Typography>
                      <Chip
                        label={formatHours(hours)}
                        size="small"
                        color={isClosed ? 'default' : 'primary'}
                        variant={isClosed ? 'outlined' : 'filled'}
                        sx={{ fontSize: 11, height: 22 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 3, textAlign: 'center', bgcolor: '#f9f9f9',
                  borderRadius: 2, border: '1px dashed #ddd',
                }}
              >
                <AccessTimeIcon sx={{ color: '#ccc', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Aucun horaire défini
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/salons/edit/${salon.id}`)}
                >
                  Ajouter des horaires
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Lightbox photo */}
      <Dialog open={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          {selectedPhoto && (
            <Box
              component="img"
              src={selectedPhoto}
              alt="Agrandissement"
              sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer ce salon ?</DialogTitle>
        <DialogContent>
          <Typography>Cette action est irréversible. Le salon <strong>{salon.name}</strong> sera définitivement supprimé.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetailSalon;
