import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import api from '../../services/api';
import AddHairdresserForm from '../../components/hairdressers/AddHairdresserForm';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton,
  Tooltip, Avatar, Chip, TextField, InputAdornment, CircularProgress, Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Hairdresser {
  id: string;
  profession: string | null;
  residential_address: string | null;
  registration_status: 'pending' | 'approved' | 'rejected';
  average_rating: string | number | null;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    profile_photo: string | null;
    is_active: boolean;
  };
}

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  approved: { label: 'Approuvé',   color: 'success' },
  rejected: { label: 'Rejeté',     color: 'error'   },
  pending:  { label: 'En attente', color: 'warning'  },
};

const HairdressersPage: React.FC = () => {
  const navigate = useNavigate();
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const fetchHairdressers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/hairdressers');
      if (response.data.success) {
        setHairdressers(response.data.data);
      } else {
        setError('Erreur lors du chargement des coiffeurs');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHairdressers(); }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      await api.patch(`/admin/hairdressers/${id}/status`, { is_active: !currentStatus });
      setHairdressers(prev =>
        prev.map(h => h.id === id ? { ...h, user: { ...h.user, is_active: !currentStatus } } : h)
      );
      enqueueSnackbar(`Coiffeur ${!currentStatus ? 'activé' : 'désactivé'}`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur lors de la mise à jour du statut', { variant: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = hairdressers.filter(h => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (h.user?.full_name || '').toLowerCase().includes(q) ||
      (h.user?.email || '').toLowerCase().includes(q) ||
      (h.profession || '').toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4">Coiffeurs</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {hairdressers.length} coiffeur{hairdressers.length !== 1 ? 's' : ''} enregistré{hairdressers.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Actualiser">
            <IconButton onClick={fetchHairdressers} size="small" sx={{ bgcolor: '#F0F2F8' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Ajouter un coiffeur
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Search */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Rechercher par nom, email, profession..."
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
                <TableCell>Coiffeur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Statut dossier</TableCell>
                <TableCell>Inscription</TableCell>
                <TableCell align="center">Actif</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <PersonIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Aucun coiffeur trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(h => {
                    const chip = STATUS_CHIP[h.registration_status] || { label: h.registration_status, color: 'default' as const };
                    return (
                      <TableRow
                        key={h.id} hover sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/hairdressers/${h.id}`)}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              src={h.user.profile_photo || undefined}
                              sx={{ width: 38, height: 38, bgcolor: '#6C63FF', fontSize: 14 }}
                            >
                              {h.user.full_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{h.user.full_name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {h.profession || '–'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{h.user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{h.user.phone || '–'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <StarIcon fontSize="small" sx={{ color: '#F59E0B' }} />
                            <Typography variant="body2">
                              {h.average_rating ? parseFloat(String(h.average_rating)).toFixed(1) : '0.0'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={chip.label} color={chip.color} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(h.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={h.user.is_active ? 'Désactiver' : 'Activer'}>
                            <IconButton
                              size="small"
                              color={h.user.is_active ? 'error' : 'success'}
                              disabled={updatingId === h.id}
                              onClick={e => { e.stopPropagation(); toggleStatus(h.id, h.user.is_active); }}
                            >
                              {updatingId === h.id ? (
                                <CircularProgress size={18} />
                              ) : h.user.is_active ? (
                                <CancelIcon fontSize="small" />
                              ) : (
                                <CheckCircleIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

      <AddHairdresserForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { setAddOpen(false); fetchHairdressers(); }}
      />
    </Box>
  );
};

export default HairdressersPage;
