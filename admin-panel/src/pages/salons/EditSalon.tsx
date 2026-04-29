import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, CircularProgress,
  Alert, Grid, IconButton, Switch, FormControlLabel, Stack,
  Divider, Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  Store as StoreIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

interface SalonForm {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  business_hours: Record<string, BusinessHours>;
}

const DAYS = [
  { key: 'monday',    label: 'Lundi' },
  { key: 'tuesday',   label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday',  label: 'Jeudi' },
  { key: 'friday',    label: 'Vendredi' },
  { key: 'saturday',  label: 'Samedi' },
  { key: 'sunday',    label: 'Dimanche' },
];

const DEFAULT_HOURS: BusinessHours = { open: '09:00', close: '18:00', closed: false };

function toBusinessHours(raw: Record<string, any> | undefined): Record<string, BusinessHours> {
  const result: Record<string, BusinessHours> = {};
  DAYS.forEach(({ key }) => {
    const val = raw?.[key];
    if (!val) {
      result[key] = { ...DEFAULT_HOURS };
    } else if (typeof val === 'string') {
      if (val === 'Fermé' || !val) {
        result[key] = { open: '09:00', close: '18:00', closed: true };
      } else {
        const [open, close] = val.split(/[-–]/);
        result[key] = { open: open?.trim() || '09:00', close: close?.trim() || '18:00', closed: false };
      }
    } else {
      result[key] = { open: val.open || '09:00', close: val.close || '18:00', closed: !!val.closed };
    }
  });
  return result;
}

const EditSalon: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [salonName, setSalonName] = useState('');

  const [form, setForm] = useState<SalonForm>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    business_hours: toBusinessHours(undefined),
  });

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/salons/${id}`);
        if (response.data.success) {
          const s = response.data.data;
          setSalonName(s.name || '');
          setExistingPhotos(s.photos || []);
          setForm({
            name: s.name || '',
            address: s.address || '',
            latitude: String(s.latitude || ''),
            longitude: String(s.longitude || ''),
            business_hours: toBusinessHours(s.business_hours),
          });
        } else {
          setError('Salon non trouvé');
        }
      } catch {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, [id]);

  const setHours = (day: string, field: keyof BusinessHours, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: { ...prev.business_hours[day], [field]: value },
      },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleDeleteExistingPhoto = async (index: number) => {
    if (!window.confirm('Supprimer cette photo ?')) return;
    const updated = existingPhotos.filter((_, i) => i !== index);
    try {
      await api.put(`/admin/salons/${id}`, { photos: updated });
      setExistingPhotos(updated);
    } catch {
      setError('Erreur lors de la suppression de la photo');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('address', form.address);
      fd.append('latitude', form.latitude);
      fd.append('longitude', form.longitude);
      fd.append('business_hours', JSON.stringify(form.business_hours));
      newPhotos.forEach(p => fd.append('photos', p));
      const response = await api.put(`/admin/salons/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setSuccess(true);
        setNewPhotos([]);
        setTimeout(() => navigate(`/salons/${id}`), 1200);
      } else {
        setError('Erreur lors de la mise à jour');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const formatPhotoUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `https://hairgov2.onrender.com${url}`;
    return '';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(`/salons/${id}`)} sx={{ bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Modifier le salon</Typography>
          <Typography variant="body2" color="text.secondary">{salonName}</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate(`/salons/${id}`)} disabled={saving}>
            Annuler
          </Button>
          <Button
            variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* ─── Infos principales ─── */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
              <StoreIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Informations générales</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Nom du salon" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Adresse" value={form.address} multiline rows={2}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  InputProps={{ startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} /> }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Latitude" type="number" value={form.latitude}
                  onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Longitude" type="number" value={form.longitude}
                  onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* ─── Horaires ─── */}
          <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Horaires d'ouverture</Typography>
            </Box>
            <Stack spacing={1}>
              {DAYS.map(({ key, label }) => {
                const h = form.business_hours[key];
                return (
                  <Box key={key}>
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        p: 1.5, borderRadius: 2,
                        bgcolor: h.closed ? '#fafafa' : 'rgba(108,99,255,0.04)',
                        border: '1px solid',
                        borderColor: h.closed ? '#eee' : 'rgba(108,99,255,0.15)',
                      }}
                    >
                      <Typography
                        sx={{ width: 95, fontWeight: h.closed ? 400 : 600, color: h.closed ? 'text.disabled' : 'text.primary' }}
                      >
                        {label}
                      </Typography>

                      {h.closed ? (
                        <Typography variant="body2" color="text.disabled" sx={{ flex: 1 }}>
                          Fermé
                        </Typography>
                      ) : (
                        <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
                          <TextField
                            size="small" type="time" label="Ouverture"
                            value={h.open}
                            onChange={e => setHours(key, 'open', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                          />
                          <Typography color="text.secondary">–</Typography>
                          <TextField
                            size="small" type="time" label="Fermeture"
                            value={h.close}
                            onChange={e => setHours(key, 'close', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                          />
                        </Stack>
                      )}

                      <FormControlLabel
                        control={
                          <Switch
                            checked={!h.closed}
                            onChange={e => setHours(key, 'closed', !e.target.checked)}
                            color="primary" size="small"
                          />
                        }
                        label={<Typography variant="caption">{h.closed ? 'Fermé' : 'Ouvert'}</Typography>}
                        sx={{ mr: 0, ml: 'auto' }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* ─── Colonne droite ─── */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
              <GalleryIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Photos</Typography>
            </Box>

            {/* Photos existantes */}
            {existingPhotos.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Photos actuelles
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {existingPhotos.map((photo, i) => {
                    const url = formatPhotoUrl(photo);
                    return url ? (
                      <Box key={i} sx={{ position: 'relative' }}>
                        <Box
                          component="img" src={url} alt={`Photo ${i + 1}`}
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                          sx={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 2 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteExistingPhoto(i)}
                          sx={{
                            position: 'absolute', top: 4, right: 4,
                            bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                            '&:hover': { bgcolor: '#d32f2f' },
                            width: 26, height: 26,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ) : null;
                  })}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Nouvelles photos */}
            <Typography variant="body2" color="text.secondary" mb={1}>
              Ajouter des photos
            </Typography>
            <Button
              variant="outlined" component="label" startIcon={<AddIcon />}
              fullWidth sx={{ mb: newPhotos.length > 0 ? 1.5 : 0 }}
            >
              Choisir des images
              <input type="file" hidden multiple accept="image/*" onChange={handlePhotoUpload} />
            </Button>

            {newPhotos.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {newPhotos.map((f, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <Box
                      component="img" src={URL.createObjectURL(f)} alt={`Nouvelle ${i + 1}`}
                      sx={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 2 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setNewPhotos(prev => prev.filter((_, j) => j !== i))}
                      sx={{
                        position: 'absolute', top: 4, right: 4,
                        bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                        '&:hover': { bgcolor: '#d32f2f' },
                        width: 26, height: 26,
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        message="Salon mis à jour avec succès"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default EditSalon;
