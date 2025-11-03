import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import api from '../../services/api';
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
  TableFooter
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
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface Hairdresser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  profile_photo?: string;
  created_at: string;
  status?: 'active' | 'inactive' | 'pending';
  specialty?: string;
  rating?: number;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  hairdresserProfile?: {
    profession?: string;
    residential_address?: string;
    average_rating?: number;
    registration_status?: string;
    is_available?: boolean;
    total_jobs?: number;
  };
}

type Order = 'asc' | 'desc';

export const HairdressersPage: React.FC = () => {
  const navigate = useNavigate();
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Hairdresser>('created_at');

  useEffect(() => {
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

    fetchHairdressers();
  }, [page, rowsPerPage, searchTerm, order, orderBy]);

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
      (hairdresser.full_name || '').toLowerCase().includes(searchLower) ||
      (hairdresser.email || '').toLowerCase().includes(searchLower) ||
      (hairdresser.phone || '').toLowerCase().includes(searchLower) ||
      (hairdresser.hairdresserProfile?.profession || '').toLowerCase().includes(searchLower) ||
      (hairdresser.hairdresserProfile?.registration_status || '').toLowerCase().includes(searchLower)
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

  const getStatusColor = (status?: string) => {
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
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Coiffeurs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            // Logique pour ajouter un nouveau coiffeur
          }}
        >
          Ajouter un Coiffeur
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
              <TableCell>Spécialité</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHairdressers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((hairdresser) => (
                <TableRow key={hairdresser.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <WorkIcon
                            color="primary"
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              p: 0.5,
                            }}
                          />
                        }
                      >
                        <Avatar
                          src={hairdresser.profile_photo}
                          alt={hairdresser.full_name}
                        />
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {hairdresser.full_name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{hairdresser.hairdresserProfile?.profession || 'Non spécifié'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{hairdresser.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {hairdresser.phone || 'Non renseigné'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon color="warning" />
                      <Typography>
                        {hairdresser.hairdresserProfile?.average_rating || '0.00'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={hairdresser.hairdresserProfile?.registration_status === 'approved' ? 'Approuvé' : 
                            hairdresser.hairdresserProfile?.registration_status === 'pending' ? 'En attente' : 'Rejeté'}
                      color={hairdresser.hairdresserProfile?.registration_status === 'approved' ? 'success' : 
                            hairdresser.hairdresserProfile?.registration_status === 'pending' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          // Logique de modification
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => {
                          // Logique de suppression
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
    </Box>
  );
};

export default HairdressersPage;
