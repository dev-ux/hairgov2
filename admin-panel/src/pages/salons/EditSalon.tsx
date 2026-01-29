import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface Salon {
  id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  photos: string[];
  is_validated: boolean;
  hairdresser: {
    user: {
      full_name: string;
      email: string;
      phone: string;
    };
  };
}

const EditSalon: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchSalon();
  }, [id]);

  const fetchSalon = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/salons/${id}`);
      
      if (response.data.success) {
        const salonData = response.data.data;
        setSalon(salonData);
        setFormData({
          name: salonData.name || '',
          address: salonData.address || '',
          latitude: salonData.latitude || '',
          longitude: salonData.longitude || '',
        });
      } else {
        setError('Salon non trouvé');
      }
    } catch (err) {
      console.error('Error fetching salon:', err);
      setError('Erreur lors du chargement du salon');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    if (!salon) return;

    try {
      setSaving(true);
      const response = await api.put(`/admin/salons/${salon.id}`, formData);
      
      if (response.data.success) {
        alert('Salon mis à jour avec succès');
        navigate(`/salons/${salon.id}`);
      } else {
        setError('Erreur lors de la mise à jour du salon');
      }
    } catch (err) {
      console.error('Error updating salon:', err);
      setError('Une erreur est survenue lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (photoIndex: number) => {
    if (!salon) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      try {
        const updatedPhotos = salon.photos.filter((_, index) => index !== photoIndex);
        const response = await api.put(`/admin/salons/${salon.id}`, {
          photos: updatedPhotos
        });
        
        if (response.data.success) {
          setSalon(prev => prev ? {
            ...prev,
            photos: updatedPhotos
          } : null);
          alert('Photo supprimée avec succès');
        }
      } catch (err) {
        console.error('Error deleting photo:', err);
        alert('Erreur lors de la suppression de la photo');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !salon) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Salon non trouvé'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/salons/${salon.id}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Modifier le salon
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations du salon
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du salon"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  variant="outlined"
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.latitude}
                  onChange={handleInputChange('latitude')}
                  variant="outlined"
                  type="number"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.longitude}
                  onChange={handleInputChange('longitude')}
                  variant="outlined"
                  type="number"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/salons/${salon.id}`)}
              >
                Annuler
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Informations du coiffeur */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Coiffeur propriétaire
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nom complet
              </Typography>
              <Typography variant="body1">
                {salon.hairdresser?.user?.full_name || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body1">
                  {salon.hairdresser?.user?.email || 'N/A'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Téléphone
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body1">
                  {salon.hairdresser?.user?.phone || 'N/A'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Statut
              </Typography>
              <Typography variant="body1">
                {salon.is_validated ? 'Validé' : 'En attente'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Photos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photos du salon
            </Typography>
            
            {salon.photos && salon.photos.length > 0 ? (
              <Grid container spacing={2}>
                {salon.photos.map((photo, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }}
                        onClick={() => handleDeletePhoto(index)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                Aucune photo disponible pour ce salon
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditSalon;
