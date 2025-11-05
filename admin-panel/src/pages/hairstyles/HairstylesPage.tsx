import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AddHairstyleForm from './AddHairstyleForm';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchHairstyles = async () => {
      try {
        setLoading(true);
        // TODO: Remplacer par un appel API réel
        // const response = await fetch('/api/hairstyles');
        // const data = await response.json();
        // setHairstyles(data);
        
        // Données factices pour le moment
        setTimeout(() => {
          setHairstyles([
            {
              id: '1',
              name: 'Coupe Homme',
              description: 'Coupe classique pour homme',
              photo: '/placeholder-hairstyle.jpg',
              estimated_duration: 30,
              category: 'Coupe Homme',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Coupe Femme',
              description: 'Coupe avec brushing',
              photo: '/placeholder-hairstyle.jpg',
              estimated_duration: 60,
              category: 'Coupe Femme',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Erreur lors du chargement des coiffures');
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id: string) => {
    // TODO: Implémenter la logique d'édition
    console.log('Modifier la coiffure avec ID:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implémenter la logique de suppression
    console.log('Supprimer la coiffure avec ID:', id);
  };

  const handleAddHairstyle = async (data: Omit<Hairstyle, 'id' | 'created_at' | 'updated_at' | 'photo'> & { photos: File[] }) => {
    try {
      setIsSubmitting(true);
      // TODO: Remplacer par un appel API réel
      console.log('Données du formulaire:', data);
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ici, vous devrez implémenter la logique pour uploader les photos
      // et obtenir l'URL de l'image téléchargée
      const photoUrl = data.photos.length > 0 ? URL.createObjectURL(data.photos[0]) : '';
      
      // Ajouter la nouvelle coiffure à la liste
      const newHairstyle: Hairstyle = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        estimated_duration: data.estimated_duration,
        category: data.category,
        is_active: data.is_active,
        photo: photoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setHairstyles(prev => [newHairstyle, ...prev]);
      
      enqueueSnackbar('Coiffure ajoutée avec succès', { variant: 'success' });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la coiffure:', err);
      enqueueSnackbar('Erreur lors de l\'ajout de la coiffure', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Gestion des Coiffures
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Ajouter une coiffure
        </Button>
      </Box>

      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align="right">Durée (min)</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hairstyles.length > 0 ? (
                hairstyles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((hairstyle) => (
                    <TableRow key={hairstyle.id} hover>
                      <TableCell>{hairstyle.name}</TableCell>
                      <TableCell>{hairstyle.description}</TableCell>
                      <TableCell>{hairstyle.category}</TableCell>
                      <TableCell align="right">{hairstyle.estimated_duration}</TableCell>
                      <TableCell align="center">
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: hairstyle.is_active ? 'success.main' : 'error.main',
                            mr: 1,
                          }}
                        />
                        {hairstyle.is_active ? 'Actif' : 'Inactif'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(hairstyle.id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(hairstyle.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      Aucune coiffure trouvée
                    </Typography>
                  </TableCell>
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
      
      {/* Formulaire d'ajout */}
      <AddHairstyleForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddHairstyle}
        loading={isSubmitting}
      />
    </Box>
  );
};

export default HairstylesPage;
