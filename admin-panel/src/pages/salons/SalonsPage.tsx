import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton,
  Tooltip, Chip, TextField, InputAdornment, CircularProgress, Alert, Avatar,
} from '@mui/material';
import AddSalonForm from '../../components/salons/AddSalonForm';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Store as StoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface Salon {
  id: string;
  name: string;
  address: string;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  hairdresser?: {
    user?: {
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
  pagination: { total: number; page: number; totalPages: number };
}

const SalonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchSalons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/admin/salons', {
        params: { page: page + 1, limit: rowsPerPage, search: searchTerm },
      });
      if (response.data.success) {
        setSalons(response.data.data);
      } else {
        setError('Erreur lors du chargement des salons');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => { fetchSalons(); }, [fetchSalons]);

  const filtered = salons.filter(s => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q) ||
      (s.hairdresser?.user?.full_name || '').toLowerCase().includes(q)
    );
  });

  const firstPhotoUrl = (salon: Salon) => {
    const p = salon.photos?.[0];
    if (!p) return undefined;
    if (p.startsWith('http')) return p;
    if (p.startsWith('/uploads/')) return `https://hairgov2.onrender.com${p}`;
    return undefined;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4">Salons</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {salons.length} salon{salons.length !== 1 ? 's' : ''} enregistré{salons.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Actualiser">
            <IconButton onClick={fetchSalons} size="small" sx={{ bgcolor: '#F0F2F8' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
            Ajouter un salon
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Search */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Rechercher un salon..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
          }}
        />
      </Paper>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Salon</TableCell>
                <TableCell>Coiffeur</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Création</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <StoreIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Aucun salon trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(salon => (
                    <TableRow
                      key={salon.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/salons/${salon.id}`)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={firstPhotoUrl(salon)}
                            variant="rounded"
                            sx={{ width: 40, height: 40, bgcolor: '#6C63FF' }}
                          >
                            <StoreIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="subtitle2">{salon.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={salon.hairdresser?.user?.profile_photo || undefined}
                            sx={{ width: 28, height: 28, bgcolor: '#FF6584', fontSize: 11 }}
                          >
                            {salon.hairdresser?.user?.full_name?.charAt(0) || <PersonIcon sx={{ fontSize: 14 }} />}
                          </Avatar>
                          <Typography variant="body2">
                            {salon.hairdresser?.user?.full_name || '–'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">{salon.address}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={salon.is_validated ? <CheckCircleIcon /> : <CancelIcon />}
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
                      <TableCell align="center">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small" color="primary"
                            onClick={e => { e.stopPropagation(); navigate(`/salons/edit/${salon.id}`); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

      <AddSalonForm
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={() => { setAddDialogOpen(false); fetchSalons(); }}
      />
    </Box>
  );
};

export default SalonsPage;
