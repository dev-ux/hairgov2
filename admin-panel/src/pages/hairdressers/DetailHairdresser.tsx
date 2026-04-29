import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Avatar, Chip, Grid, Paper, Button, IconButton,
  CircularProgress, Alert, Stack, Divider,
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
  HourglassEmpty as PendingIcon,
  ContentCut as ScissorsIcon,
} from '@mui/icons-material';
import { hairdresserService, UpdateHairdresserPayload } from '../../services/hairdresser.service';
import EditHairdresserForm from '../../components/hairdressers/EditHairdresserForm';
import { useSnackbar } from 'notistack';

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

const STATUS_MAP = {
  approved: { label: 'Approuvé',  color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> },
  rejected: { label: 'Rejeté',    color: 'error'   as const, icon: <CancelIcon fontSize="small" /> },
  pending:  { label: 'En attente', color: 'warning' as const, icon: <PendingIcon fontSize="small" /> },
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={1.5} py={1.25}
      sx={{ borderBottom: '1px solid #F1F3F9', '&:last-child': { borderBottom: 0 } }}
    >
      <Box sx={{ color: 'text.secondary', mt: 0.25 }}>{icon}</Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body2" fontWeight={500}>{value || 'Non renseigné'}</Typography>
      </Box>
    </Box>
  );
}

const DetailHairdresser: React.FC = () => {
  const navigate = useNavigate();
  const { id: hairdresserId } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [hairdresser, setHairdresser] = useState<Hairdresser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!hairdresserId) { setError('ID manquant'); setLoading(false); return; }
    const fetchHairdresser = async () => {
      try {
        setLoading(true);
        const response = await hairdresserService.getHairdresserById(hairdresserId);
        if (response.success && response.data) {
          setHairdresser(response.data);
        } else {
          setError('Coiffeur non trouvé');
        }
      } catch {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchHairdresser();
  }, [hairdresserId]);

  const handleSave = async (id: string, payload: UpdateHairdresserPayload) => {
    const response = await hairdresserService.updateHairdresser(id, payload);
    if (response.success) {
      setHairdresser(response.data);
      setEditOpen(false);
      enqueueSnackbar('Coiffeur mis à jour avec succès', { variant: 'success' });
    } else {
      enqueueSnackbar(response.error?.message || 'Erreur lors de la mise à jour', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !hairdresser) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/hairdressers')} sx={{ mb: 2 }}>
          Retour
        </Button>
        <Alert severity="error">{error || 'Coiffeur non trouvé'}</Alert>
      </Box>
    );
  }

  const status = STATUS_MAP[hairdresser.registration_status] || STATUS_MAP.pending;
  const photoUrl = hairdresser.user.profile_photo?.startsWith('http')
    ? hairdresser.user.profile_photo
    : hairdresser.user.profile_photo
      ? `https://hairgov2.onrender.com${hairdresser.user.profile_photo}`
      : undefined;

  return (
    <Box sx={{ pb: 4 }}>
      {/* ─── Hero banner ─── */}
      <Box
        sx={{
          position: 'relative', height: 220, borderRadius: 3,
          overflow: 'hidden', mb: 3,
          background: 'linear-gradient(135deg, #1A1A2E 0%, #6C63FF 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute', inset: 0, px: 4,
            display: 'flex', alignItems: 'center', gap: 3,
          }}
        >
          <Avatar
            src={photoUrl}
            sx={{
              width: 88, height: 88,
              border: '3px solid rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.15)',
              fontSize: 32,
            }}
          >
            {!photoUrl && <ScissorsIcon sx={{ fontSize: 40, color: '#fff' }} />}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} color="#fff">
              {hairdresser.user.full_name}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.75)" mt={0.5}>
              {hairdresser.profession || 'Coiffeur'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={status.icon}
              label={status.label}
              color={status.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={hairdresser.user.is_active ? <CheckCircleIcon /> : <CancelIcon />}
              label={hairdresser.user.is_active ? 'Actif' : 'Inactif'}
              color={hairdresser.user.is_active ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        {/* Actions */}
        <Box sx={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 1 }}>
          <Button
            variant="contained" size="small" startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', fontWeight: 600 }}
          >
            Modifier
          </Button>
        </Box>
        <IconButton
          onClick={() => navigate('/hairdressers')}
          sx={{ position: 'absolute', top: 12, left: 12, color: '#fff', bgcolor: 'rgba(0,0,0,0.25)' }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* ─── Colonne gauche ─── */}
        <Grid item xs={12} md={4}>
          {/* Stats */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Statistiques</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Note moyenne', value: `${hairdresser.average_rating ? parseFloat(String(hairdresser.average_rating)).toFixed(1) : '0.0'} / 5`, icon: <StarIcon sx={{ color: '#F59E0B' }} fontSize="small" /> },
                { label: 'Prestations', value: String(hairdresser.total_jobs || 0), icon: <ScissorsIcon color="primary" fontSize="small" /> },
                { label: 'Inscription', value: new Date(hairdresser.created_at).toLocaleDateString('fr-FR'), icon: <CalendarIcon sx={{ color: 'text.secondary' }} fontSize="small" /> },
              ].map(({ label, value, icon }) => (
                <Grid item xs={12} key={label}>
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: 2, bgcolor: '#F8F9FD',
                    }}
                  >
                    {icon}
                    <Box>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{value}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Coordonnées */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Coordonnées</Typography>
            <InfoRow icon={<EmailIcon fontSize="small" />} label="Email" value={hairdresser.user.email} />
            <InfoRow icon={<PhoneIcon fontSize="small" />} label="Téléphone" value={hairdresser.user.phone} />
            <InfoRow icon={<LocationIcon fontSize="small" />} label="Adresse" value={hairdresser.residential_address} />
          </Paper>
        </Grid>

        {/* ─── Colonne droite ─── */}
        <Grid item xs={12} md={8}>
          {/* Informations professionnelles */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <WorkIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Informations professionnelles</Typography>
            </Box>
            <InfoRow icon={<WorkIcon fontSize="small" />} label="Profession" value={hairdresser.profession} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label="Statut du dossier" value={status.label} />
          </Paper>

          {/* Description */}
          {hairdresser.description && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={1.5}>Description</Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
                {hairdresser.description}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <EditHairdresserForm
        open={editOpen}
        hairdresser={hairdresser}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
};

export default DetailHairdresser;
