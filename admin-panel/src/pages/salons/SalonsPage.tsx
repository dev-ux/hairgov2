import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  Badge
} from '@mui/material';
import AddSalonForm from '../../components/salons/AddSalonForm';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../services/api';

interface Salon {
  id: string;
  hairdresser_id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
  hairdresser: {
    id: string;
    user_id: string;
    profession: string | null;
    residential_address: string | null;
    date_of_birth: string | null;
    id_card_number: string | null;
    id_card_photo: string | null;
    has_salon: boolean;
    education_level: string | null;
    registration_status: string;
    balance: string;
    total_earnings: string;
    average_rating: string;
    total_jobs: number;
    is_available: boolean;
    current_job_id: string | null;
    latitude: string | null;
    longitude: string | null;
    created_at: string;
    updated_at: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      profile_photo: string | null;
    };
  };
}

interface ApiResponse {
  success: boolean;
  data: Salon[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

const SalonsPage: React.FC = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchSalons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/admin/salons', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        },
      });

      if (response.data.success) {
        setSalons(response.data.data);
      } else {
        setError('Erreur lors du chargement des salons');
      }
    } catch (err) {
      console.error('Error fetching salons:', err);
      setError('Une erreur est survenue lors du chargement des salons');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };

  const handleAddSuccess = () => {
    setAddDialogOpen(false);
    fetchSalons(); // Rafraîchir la liste des salons
  };

  const handleToggleSalonValidation = async (salonId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await api.post(`/salons/${salonId}/validate`, {
        is_validated: newStatus
      });

      if (response.data.success) {
        // Mettre à jour l'état local
        setSalons(prevSalons => 
          prevSalons.map(salon => 
            salon.id === salonId 
              ? { ...salon, is_validated: newStatus }
              : salon
          )
        );
        
        // Afficher un message de succès
        alert(newStatus ? 'Salon activé avec succès' : 'Salon désactivé avec succès');
      } else {
        alert('Erreur lors de la mise à jour du statut du salon');
      }
    } catch (error) {
      console.error('Error toggling salon validation:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut');
    }
  };

  const filteredSalons = salons.filter((salon) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (salon.name || '').toLowerCase().includes(searchLower) ||
      (salon.address || '').toLowerCase().includes(searchLower) ||
      (salon.hairdresser?.user?.full_name || '').toLowerCase().includes(searchLower) ||
      (salon.hairdresser?.user?.email || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Salons
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{ mb: 2 }}
        >
          Ajouter un salon
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un salon..."
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
              <TableCell>Nom du Salon</TableCell>
              <TableCell>Coiffeur</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de création</TableCell>
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
            ) : filteredSalons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun salon trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredSalons
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((salon) => (
                  <TableRow 
                    key={salon.id} 
                    hover
                    onClick={() => navigate(`/salons/${salon.id}`)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {salon.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={salon.hairdresser?.user?.profile_photo || undefined}
                          alt={salon.hairdresser?.user?.full_name}
                          sx={{ width: 32, height: 32 }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">
                          {salon.hairdresser?.user?.full_name || 'Non spécifié'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon color="action" fontSize="small" />
                        <Typography variant="body2">{salon.address}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {salon.hairdresser?.user?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <PhoneIcon color="action" fontSize="small" />
                          <Typography variant="body2">{salon.hairdresser.user.phone}</Typography>
                        </Box>
                      )}
                      {salon.hairdresser?.user?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="action" fontSize="small" />
                          <Typography variant="body2" noWrap>
                            {salon.hairdresser.user.email}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={salon.is_validated ? 'Validé' : 'En attente'}
                        color={salon.is_validated ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(salon.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher la redirection vers les détails
                            navigate(`/salons/edit/${salon.id}`);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={salon.is_validated ? 'Désactiver' : 'Activer'}>
                        <IconButton
                          size="small"
                          color={salon.is_validated ? 'error' : 'success'}
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher la redirection vers les détails
                            handleToggleSalonValidation(salon.id, salon.is_validated);
                          }}
                        >
                          {salon.is_validated ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
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
          count={filteredSalons.length}
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

      {/* Formulaire d'ajout de salon */}
      <AddSalonForm
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        onSuccess={handleAddSuccess}
      />
    </Box>
  );
};

export default SalonsPage;
