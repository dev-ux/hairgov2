import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  styled
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { hairdresserService } from '../../services/hairdresser.service';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

interface Hairdresser {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    profile_photo?: string;
    is_active: boolean;
  };
  profession?: string;
  residential_address?: string;
  average_rating?: number;
  total_jobs?: number;
  registration_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  id_card_photo?: string;
  description?: string;
}

const DetailHairdresser: React.FC = () => {
  const navigate = useNavigate();
  const [hairdresser, setHairdresser] = useState<Hairdresser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'ID du coiffeur depuis l'URL
  const hairdresserId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchHairdresser = async () => {
      if (!hairdresserId) {
        setError('ID du coiffeur non spécifié');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await hairdresserService.getHairdresserById(hairdresserId);
        
        if (response.success && response.data) {
          setHairdresser(response.data);
        } else {
          setError('Coiffeur non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du coiffeur:', err);
        setError('Erreur lors du chargement du coiffeur');
      } finally {
        setLoading(false);
      }
    };

    fetchHairdresser();
  }, [hairdresserId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !hairdresser) {
    return (
      <Box>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/hairdressers">
            Coiffeurs
          </Link>
          <Typography color="textPrimary">Détail</Typography>
        </Breadcrumbs>
        <Alert severity="error">{error || 'Coiffeur non trouvé'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête avec navigation */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/hairdressers">
            Coiffeurs
          </Link>
          <Typography color="textPrimary">{hairdresser.user.full_name}</Typography>
        </Breadcrumbs>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/hairdressers')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              // TODO: Implémenter la modification
              console.log('Modifier le coiffeur:', hairdresser.id);
            }}
          >
            Modifier
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <Avatar
                src={hairdresser.user.profile_photo || undefined}
                alt={hairdresser.user.full_name}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {hairdresser.user.full_name}
              </Typography>
              <Chip
                icon={getStatusIcon(hairdresser.registration_status) || undefined}
                label={getStatusLabel(hairdresser.registration_status)}
                color={getStatusColor(hairdresser.registration_status) as any}
                sx={{ mb: 2 }}
              />
              <Chip
                icon={hairdresser.user.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                label={hairdresser.user.is_active ? 'Actif' : 'Inactif'}
                color={hairdresser.user.is_active ? 'success' : 'error'}
                sx={{ mb: 2 }}
              />
            </Box>
          </StyledPaper>
        </Grid>

        {/* Informations détaillées */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Informations professionnelles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Profession
                    </Typography>
                    <Typography variant="body1">
                      {hairdresser.profession || 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <StarIcon sx={{ mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Note moyenne
                    </Typography>
                    <Typography variant="body1">
                      {hairdresser.average_rating ? parseFloat(hairdresser.average_rating.toString()).toFixed(1) : '0.0'} / 5.0
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Prestations effectuées
                    </Typography>
                    <Typography variant="body1">
                      {hairdresser.total_jobs || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Date d'inscription
                    </Typography>
                    <Typography variant="body1">
                      {new Date(hairdresser.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {hairdresser.description && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {hairdresser.description}
                </Typography>
              </Box>
            )}
          </StyledPaper>

          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Coordonnées
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {hairdresser.user.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Téléphone
                    </Typography>
                    <Typography variant="body1">
                      {hairdresser.user.phone || 'Non renseigné'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <LocationIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Adresse
                    </Typography>
                    <Typography variant="body1">
                      {hairdresser.residential_address || 'Non renseignée'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetailHairdresser;
