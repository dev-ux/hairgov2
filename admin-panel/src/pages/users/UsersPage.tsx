import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, CircularProgress, Alert, Chip, Avatar,
  Tooltip, TablePagination, TextField, InputAdornment,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getUsers, updateHairdresserStatus, User } from '../../services/user.service';

const TYPE_MAP: Record<string, { label: string; color: 'primary' | 'secondary' | 'default' }> = {
  admin:       { label: 'Administrateur', color: 'primary'   },
  hairdresser: { label: 'Coiffeur',       color: 'secondary' },
  client:      { label: 'Client',         color: 'default'   },
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        if (response?.success && Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          setError('Format de données invalide');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleStatusChange = async (user: User, isActive: boolean) => {
    if (user.user_type !== 'hairdresser' || !user.hairdresser_id) return;
    try {
      await updateHairdresserStatus(user.hairdresser_id, isActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: isActive } : u));
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Erreur lors de la mise à jour du statut');
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4">Utilisateurs</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {users.length} utilisateur{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Search */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Rechercher par nom, email, téléphone..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
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
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Inscription</TableCell>
                <TableCell align="center">Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(user => {
                    const type = TYPE_MAP[user.user_type] || { label: user.user_type, color: 'default' as const };
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6C63FF', fontSize: 13 }}>
                              {user.full_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{user.full_name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.id.substring(0, 8)}…
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email || '–'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.phone || '–'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={type.label} color={type.color} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={
                            user.user_type !== 'hairdresser'
                              ? 'Disponible uniquement pour les coiffeurs'
                              : user.is_active ? 'Désactiver' : 'Activer'
                          }>
                            <Box display="inline-flex" alignItems="center" gap={0.5}>
                              {user.is_active ? (
                                <ActiveIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              ) : (
                                <InactiveIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                              )}
                              <Switch
                                checked={user.is_active}
                                onChange={e => handleStatusChange(user, e.target.checked)}
                                color="primary" size="small"
                                disabled={user.user_type !== 'hairdresser'}
                              />
                            </Box>
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
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default UsersPage;
