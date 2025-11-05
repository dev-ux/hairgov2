import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

const API_URL = 'http://localhost:3001';

const HairstylesPage: React.FC = () => {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openAddForm, setOpenAddForm] = useState<boolean>(false);

  // Récupérer la liste des coiffures
  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/hairstyles`);
      setHairstyles(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des coiffures:', err);
      setError('Impossible de charger les coiffures. Veuillez réessayer.');
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
      await axios.post(`${API_URL}/hairstyles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      handleCloseAddForm(true);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la coiffure:', error);
      // Vous pourriez ajouter une notification d'erreur ici
    }
  };

  const handleCloseAddForm = (added = false) => {
    setOpenAddForm(false);
    if (added) {
      fetchHairstyles();
    }
  };

  const handleDeleteHairstyle = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette coiffure ?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/hairstyles/${id}`);
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hairstyles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                          src={hairstyle.photo || '/default-hairstyle.jpg'}
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
                        <Tooltip title="Modifier">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
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
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
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
    </Box>
  );
};

export default HairstylesPage;