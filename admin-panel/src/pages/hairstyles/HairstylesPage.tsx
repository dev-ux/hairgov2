import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import AddHairstyleForm, { HairstyleFormData } from './AddHairstyleForm';
import { enqueueSnackbar } from 'notistack';

interface Hairstyle {
  id: string;
  name: string;
  description: string;
  photo?: string;
  estimated_duration: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const HairstylesPage: React.FC = () => {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openAddForm, setOpenAddForm] = useState<boolean>(false);
  const [editingHairstyle, setEditingHairstyle] = useState<Hairstyle | null>(null);

  // Fonction pour formater les URLs des photos
  const formatPhotoUrl = (photo: string | undefined) => {
    if (!photo) return '/default-hairstyle.jpg';
    
    // Si l'URL est déjà complète (Cloudinary, Unsplash, etc.), la retourner telle quelle
    if (photo.startsWith('http')) {
      return photo;
    }
    
    // Si l'URL commence par /uploads/, construire l'URL complète
    if (photo.startsWith('/uploads/')) {
      return `https://hairgov2.onrender.com${photo}`;
    }
    
    // Sinon, retourner l'image par défaut
    return '/default-hairstyle.jpg';
  };
  const [openEditForm, setOpenEditForm] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  // Récupérer la liste des coiffures
  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hairstyles');
      setHairstyles(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des coiffures:', err);
      setError('Erreur lors du chargement des coiffures');
      enqueueSnackbar('Erreur lors du chargement des coiffures', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHairstyles();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddHairstyle = async (formData: Omit<HairstyleFormData, 'photoPreviews'>) => {
    try {
      const formDataToSend = new FormData();
      
      // Ajouter les champs du formulaire
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('estimated_duration', formData.estimated_duration.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      // Ajouter le premier fichier comme 'photo'
      if (formData.photos && formData.photos.length > 0) {
        formDataToSend.append('photo', formData.photos[0]);
      }
      
      await api.post('/hairstyles', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      handleCloseAddForm(true);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la coiffure:', error);
      enqueueSnackbar('Erreur lors de l\'ajout de la coiffure', { variant: 'error' });
    }
  };

  const handleAddToTrends = async (hairstyle: Hairstyle) => {
    try {
      // Demander à l'admin les informations pour la tendance
      const trendingScore = window.prompt('Score de tendance (0.00 - 5.00):', '4.0');
      const category = window.prompt('Catégorie (Homme, Femme, Mixte, Enfant):', hairstyle.category || 'Mixte');
      const difficulty = window.prompt('Difficulté (facile, moyen, difficile):', 'moyen');
      const duration = window.prompt('Durée en minutes:', '45');
      const priceRange = window.prompt('Gamme de prix (ex: 30-50€):', '30-50€');

      if (trendingScore === null || category === null || difficulty === null || duration === null || priceRange === null) {
        enqueueSnackbar('Tous les champs sont obligatoires', { variant: 'error' });
        return;
      }

      const trendData = {
        hairstyle_id: hairstyle.id,
        trending_score: parseFloat(trendingScore),
        category,
        difficulty,
        duration_minutes: parseInt(duration),
        price_range: priceRange,
        is_active: true
      };

      await api.post('/admin/trending-hairstyles', trendData);
      enqueueSnackbar('Coiffure ajoutée aux tendances avec succès!', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux tendances:', error);
      enqueueSnackbar('Erreur lors de l\'ajout aux tendances', { variant: 'error' });
    }
  };

  const handleCloseAddForm = (added = false) => {
    setOpenAddForm(false);
    if (added) {
      fetchHairstyles();
    }
  };

  const handleEditHairstyle = (hairstyle: Hairstyle) => {
    setEditingHairstyle(hairstyle);
    setOpenEditForm(true);
  };

  const handleUpdateHairstyle = async (formData: Omit<HairstyleFormData, 'photoPreviews'>) => {
    try {
      const formDataToSend = new FormData();
      
      // Ajouter les champs du formulaire
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('estimated_duration', formData.estimated_duration.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      // Ajouter le premier fichier comme 'photo' si nouvelle photo
      if (formData.photos && formData.photos.length > 0 && formData.photos[0] instanceof File) {
        formDataToSend.append('photo', formData.photos[0]);
      }
      
      await api.put(`/hairstyles/${editingHairstyle?.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      handleCloseEditForm(true);
    } catch (error) {
      console.error('Erreur lors de la modification de la coiffure:', error);
      enqueueSnackbar('Erreur lors de la modification de la coiffure', { variant: 'error' });
    }
  };

  const handleCloseEditForm = (updated = false) => {
    setOpenEditForm(false);
    setEditingHairstyle(null);
    if (updated) {
      fetchHairstyles();
    }
  };

  const handleDeleteHairstyle = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette coiffure ?')) {
      try {
        await api.delete(`/hairstyles/${id}`);
        enqueueSnackbar('Coiffure supprimée avec succès', { variant: 'success' });
        fetchHairstyles();
      } catch (err) {
        console.error('Erreur lors de la suppression de la coiffure:', err);
        enqueueSnackbar('Erreur lors de la suppression de la coiffure', { variant: 'error' });
      }
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - hairstyles.length) : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Chargement des coiffures...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Gestion des Coiffures
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddForm(true)}
        >
          Ajouter une coiffure
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Durée (min)</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hairstyles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      Aucune coiffure trouvée
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenAddForm(true)}
                      sx={{ mt: 2 }}
                    >
                      Ajouter votre première coiffure
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                hairstyles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((hairstyle) => (
                    <TableRow hover key={hairstyle.id}>
                      <TableCell>
                        <Avatar
                          src={formatPhotoUrl(hairstyle.photo)}
                          alt={hairstyle.name}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{hairstyle.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 300,
                          }}
                        >
                          {hairstyle.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{hairstyle.estimated_duration} min</TableCell>
                      <TableCell>
                        <Chip
                          label={hairstyle.category || 'Non spécifiée'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={hairstyle.is_active ? 'Actif' : 'Inactif'}
                          color={hairstyle.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditHairstyle(hairstyle)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ajouter aux tendances">
                            <IconButton 
                              size="small"
                              color="secondary"
                              onClick={() => handleAddToTrends(hairstyle)}
                            >
                              📈
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteHairstyle(hairstyle.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={hairstyles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
      </Paper>

      <AddHairstyleForm 
        open={openAddForm} 
        onClose={handleCloseAddForm}
        onSubmit={handleAddHairstyle}
      />
      
      <AddHairstyleForm 
        open={openEditForm} 
        onClose={handleCloseEditForm}
        onSubmit={handleUpdateHairstyle}
        editingHairstyle={editingHairstyle}
      />
    </Box>
  );
};

export default HairstylesPage;