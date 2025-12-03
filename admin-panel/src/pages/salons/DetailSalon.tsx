import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface Salon {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
  hairdresser: {
    id: string;
    user: {
      full_name: string;
      email: string;
      phone: string;
    };
  };
  business_hours?: Record<string, string>;
}

const DetailSalon: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        setLoading(true);
        // Utiliser la route publique pour récupérer les détails du salon
        // L'URL de base contient déjà /api/v1, donc on utilise directement /salons/${id}
        const response = await api.get(`/salons/${id}`);
        console.log('Réponse API:', response);
        
        if (response.data.success) {
          console.log('Détails du salon:', response.data.data);
          setSalon({
            ...response.data.data,
            // S'assurer que les photos sont toujours un tableau
            photos: response.data.data.photos || []
          });
        } else {
          setError(response.data.message || 'Impossible de charger les détails du salon');
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement du salon:', err);
        setError(
          err.response?.data?.message || 
          'Une erreur est survenue lors du chargement des détails du salon. ' +
          'Veuillez vérifier votre connexion et réessayer.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/admin/salons/${id}`);
      navigate('/salons');
    } catch (err) {
      console.error('Erreur lors de la suppression du salon:', err);
      setError('Une erreur est survenue lors de la suppression du salon');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Fonction pour formater l'URL de l'image
  const formatImageUrl = (url: string) => {
    console.log('URL originale:', url);
    if (!url) {
      console.log('URL vide');
      return '';
    }
    
    // Supprimer les accolades si présentes
    let cleanUrl = url.replace(/[{}]/g, '');
    console.log('URL après suppression des accolades:', cleanUrl);
    
    // Supprimer le slash initial s'il y en a un
    if (cleanUrl.startsWith('/')) {
      cleanUrl = cleanUrl.substring(1);
    }
    
    // Construire l'URL complète
    const baseUrl = api.defaults.baseURL || 'http://localhost:3001';
    console.log('URL de base de l\'API:', baseUrl);
    
    // S'assurer qu'il n'y a pas de double slash
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const finalUrl = `${base.replace('/api/v1', '')}/${cleanUrl}`;
    
    console.log('URL finale de l\'image:', finalUrl);
    return finalUrl;
  };

  // Afficher les données du salon dans la console pour le débogage
  useEffect(() => {
    if (salon) {
      console.log('Données du salon:', salon);
      console.log('Photos du salon:', salon.photos);
    }
  }, [salon]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!salon) {
    return (
      <Box p={3}>
        <Typography>Salon non trouvé</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {salon.name}
        </Typography>
        <Box flexGrow={1} />
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/salons/edit/${salon.id}`)}
            sx={{ mr: 1 }}
          >
            Modifier
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Supprimer
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Photos du salon */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Galerie
            </Typography>
            {salon.photos && salon.photos.length > 0 ? (
              <Box display="flex" flexWrap="wrap" gap={2}>
                {salon.photos.map((photo, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={formatImageUrl(photo)}
                    alt={`${salon.name} ${index + 1}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/200x150?text=Image+non+disponible';
                    }}
                    sx={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #eee',
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">Aucune photo disponible</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Adresse</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {salon.address}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Coordonnées: {salon.latitude}, {salon.longitude}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Horaires d'ouverture</Typography>
            </Box>
            {salon.business_hours && Object.keys(salon.business_hours).length > 0 ? (
              <Box>
                {Object.entries(salon.business_hours).map(([day, hours]) => (
                  <Box key={day} display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {hours || 'Fermé'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Aucun horaire défini
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informations du coiffeur
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Nom:</Typography>
                  <Typography>{salon.hairdresser?.user?.full_name || 'Non spécifié'}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {salon.hairdresser?.user?.phone || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {salon.hairdresser?.user?.email || 'Non spécifié'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce salon ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetailSalon;