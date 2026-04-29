import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, IconButton, Chip,
  CircularProgress, Alert, Avatar, Tooltip, TextField, InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  ContentCut as ScissorsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import AddHairstyleForm, { HairstyleFormData } from './AddHairstyleForm';

interface Hairstyle {
  id: string;
  name: string;
  description: string;
  photo?: string;
  estimated_duration: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

function formatPhotoUrl(photo?: string) {
  if (!photo) return undefined;
  if (photo.startsWith('http')) return photo;
  if (photo.startsWith('/uploads/')) return `https://hairgov2.onrender.com${photo}`;
  return undefined;
}

const HairstylesPage: React.FC = () => {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Hairstyle | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hairstyles');
      setHairstyles(response.data.data?.hairstyles || []);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des coiffures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHairstyles(); }, []);

  const handleAdd = async (formData: Omit<HairstyleFormData, 'photoPreviews'>) => {
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('estimated_duration', formData.estimated_duration.toString());
      fd.append('category', formData.category);
      fd.append('is_active', formData.is_active.toString());
      if (formData.photos?.length) fd.append('photo', formData.photos[0]);
      await api.post('/hairstyles', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAddOpen(false);
      fetchHairstyles();
      enqueueSnackbar('Coiffure ajoutée avec succès', { variant: 'success' });
    } catch {
      enqueueSnackbar("Erreur lors de l'ajout", { variant: 'error' });
    }
  };

  const handleUpdate = async (formData: Omit<HairstyleFormData, 'photoPreviews'>) => {
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('estimated_duration', formData.estimated_duration.toString());
      fd.append('category', formData.category);
      fd.append('is_active', formData.is_active.toString());
      if (formData.photos?.length && formData.photos[0] instanceof File) {
        fd.append('photo', formData.photos[0]);
      }
      await api.put(`/hairstyles/${editing?.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditing(null);
      fetchHairstyles();
      enqueueSnackbar('Coiffure modifiée avec succès', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur lors de la modification', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette coiffure ?')) return;
    try {
      await api.delete(`/hairstyles/${id}`);
      enqueueSnackbar('Coiffure supprimée', { variant: 'success' });
      fetchHairstyles();
    } catch {
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  };

  const handleAddToTrends = async (hairstyle: Hairstyle) => {
    try {
      const trendingScore = window.prompt('Score de tendance (0.00 - 5.00) :', '4.0');
      let validCategory = 'Mixte';
      const cat = hairstyle.category?.toLowerCase() || '';
      if (cat.includes('femme')) validCategory = 'Femme';
      else if (cat.includes('homme')) validCategory = 'Homme';
      else if (cat.includes('enfant')) validCategory = 'Enfant';
      const category = window.prompt('Catégorie (Homme, Femme, Mixte, Enfant) :', validCategory);
      const difficulty = window.prompt('Difficulté (facile, moyen, difficile) :', 'moyen');
      const duration = window.prompt('Durée en minutes :', '45');
      const priceRange = window.prompt('Gamme de prix (ex: 30-50€) :', '30-50€');
      if (!trendingScore || !category || !difficulty || !duration || !priceRange) return;
      await api.post('/admin/trending-hairstyles', {
        hairstyle_id: hairstyle.id,
        trending_score: parseFloat(trendingScore),
        category, difficulty,
        duration_minutes: parseInt(duration),
        price_range: priceRange,
        is_active: true,
      });
      enqueueSnackbar('Ajouté aux tendances', { variant: 'success' });
    } catch {
      enqueueSnackbar("Erreur lors de l'ajout aux tendances", { variant: 'error' });
    }
  };

  const filtered = hairstyles.filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    return h.name.toLowerCase().includes(q) || (h.category || '').toLowerCase().includes(q);
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4">Coiffures</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {hairstyles.length} coiffure{hairstyles.length !== 1 ? 's' : ''} disponible{hairstyles.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Ajouter une coiffure
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Search */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Rechercher par nom, catégorie..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
          }}
        />
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <ScissorsIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography color="text.secondary">Aucune coiffure trouvée</Typography>
                      <Button variant="outlined" startIcon={<AddIcon />} sx={{ mt: 1.5 }} onClick={() => setAddOpen(true)}>
                        Ajouter la première coiffure
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(h => (
                      <TableRow hover key={h.id}>
                        <TableCell>
                          <Avatar
                            src={formatPhotoUrl(h.photo)}
                            variant="rounded"
                            sx={{ width: 52, height: 52, bgcolor: '#EEF0FF' }}
                          >
                            <ScissorsIcon sx={{ color: '#6C63FF' }} />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{h.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2" color="text.secondary"
                            sx={{
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 280,
                            }}
                          >
                            {h.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{h.estimated_duration} min</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={h.category || '–'} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={h.is_active ? 'Actif' : 'Inactif'}
                            color={h.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="Modifier">
                              <IconButton size="small" color="primary" onClick={() => setEditing(h)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Ajouter aux tendances">
                              <IconButton size="small" color="secondary" onClick={() => handleAddToTrends(h)}>
                                <TrendingIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" color="error" onClick={() => handleDelete(h.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
      )}

      <AddHairstyleForm open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
      <AddHairstyleForm open={!!editing} onClose={() => setEditing(null)} onSubmit={handleUpdate} editingHairstyle={editing} />
    </Box>
  );
};

export default HairstylesPage;
