import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import api from '../../services/api';
import AddHairdresserForm from '../../components/hairdressers/AddHairdresserForm';
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
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Badge,
  CircularProgress,
  Alert,
  TableSortLabel,
  TableFooter,
  Fab,
  Zoom,
  useScrollTrigger
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

interface Hairdresser {
  id: string;
  user_id: string;
  profession: string | null;
  residential_address: string | null;
  date_of_birth: string | null;
  id_card_number: string | null;
  id_card_photo: string | null;
  has_salon: boolean;
  education_level: string | null;
  registration_status: 'pending' | 'approved' | 'rejected';
  balance: string;
  total_earnings: string;
  average_rating: string | number | null;
  total_jobs: number;
  is_available: boolean;
  current_job_id: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    profile_photo: string | null;
    is_active: boolean;
  };
}

type Order = 'asc' | 'desc';

export const HairdressersPage: React.FC = () => {
  const navigate = useNavigate();
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  // Interface complète pour le type Hairdresser
  interface Hairdresser {
    id: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      is_active: boolean;
      profile_photo: string | null;
    };
    profession: string;
    registration_status: string;
    residential_address: string | null;
    average_rating: number | null;
    created_at: string;
    updated_at: string;
  }
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Hairdresser>('created_at');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchHairdressers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/hairdressers');
      if (response.data.success) {
        setHairdressers(response.data.data);
        setTotalCount(response.data.count);
      } else {
        setError('Erreur lors du chargement des coiffeurs');
      }
    } catch (err: any) {
      console.error('Error fetching hairdressers:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue lors du chargement des coiffeurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHairdressers();
  }, [page, rowsPerPage, searchTerm, order, orderBy]);

  const handleAddSuccess = () => {
    // Recharger la liste des coiffeurs après l'ajout
    fetchHairdressers();
    setIsAddDialogOpen(false);
  };

  const toggleHairdresserStatus = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      const newStatus = !currentStatus;
      
      // Appel API pour mettre à jour le statut
      await api.patch(`/admin/hairdressers/${id}/status`, { is_active: newStatus });
      
      // Mise à jour de l'état local
      setHairdressers(hairdressers.map(hairdresser => 
        hairdresser.id === id 
          ? { 
              ...hairdresser, 
              user: { ...hairdresser.user, is_active: newStatus } 
            } 
          : hairdresser
      ));
      
      enqueueSnackbar(
        `Coiffeur ${newStatus ? 'activé' : 'désactivé'} avec succès`, 
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      enqueueSnackbar(
        'Une erreur est survenue lors de la mise à jour du statut', 
        { variant: 'error' }
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredHairdressers = hairdressers.filter((hairdresser) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (hairdresser.user?.full_name || '').toLowerCase().includes(searchLower) ||
      (hairdresser.user?.email || '').toLowerCase().includes(searchLower) ||
      (hairdresser.user?.phone || '').toLowerCase().includes(searchLower) ||
      (hairdresser.profession || '').toLowerCase().includes(searchLower) ||
      (hairdresser.registration_status || '').toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
      case 'actif':
        return 'success';
      case 'inactive':
      case 'inactif':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Coiffeurs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Ajouter un coiffeur
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un coiffeur..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Coiffeur</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date d'inscription</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : filteredHairdressers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun coiffeur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredHairdressers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((hairdresser) => (
                  <TableRow key={hairdresser.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={hairdresser.user.profile_photo || undefined}
                          alt={hairdresser.user.full_name}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{hairdresser.user.full_name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {hairdresser.profession || 'Non spécifié'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{hairdresser.user.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{hairdresser.user.phone || 'Non renseigné'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {hairdresser.residential_address || 'Non renseignée'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {hairdresser.average_rating ? parseFloat(hairdresser.average_rating.toString()).toFixed(1) : '0.0'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={hairdresser.registration_status === 'pending' ? 'En attente' : 
                               hairdresser.registration_status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        color={getStatusColor(hairdresser.registration_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(hairdresser.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Logique de modification
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={hairdresser.user.is_active ? 'Désactiver' : 'Activer'}>
                        <IconButton
                          size="small"
                          color={hairdresser.user.is_active ? 'error' : 'success'}
                          disabled={updatingId === hairdresser.id}
                          onClick={async () => {
                            await toggleHairdresserStatus(hairdresser.id, hairdresser.user.is_active);
                          }}
                        >
                          {updatingId === hairdresser.id ? (
                            <CircularProgress size={20} />
                          ) : hairdresser.user.is_active ? (
                            <CancelIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredHairdressers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus que ${to}`}`
          }
        />
      </TableContainer>
      
      {/* Bouton flottant d'ajout */}
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <Fab
          color="primary"
          aria-label="Ajouter un coiffeur"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PersonAddIcon />
        </Fab>
      </Zoom>
      
      {/* Formulaire d'ajout de coiffeur */}
      <AddHairdresserForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </Box>
  );
};

export default HairdressersPage;
