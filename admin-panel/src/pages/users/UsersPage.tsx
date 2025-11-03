import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Switch, 
  CircularProgress, 
  Alert, 
  Chip, 
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import { getUsers, updateUserStatus } from '../../services/user.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';


interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'client' | 'hairdresser' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        console.log('Fetched users response:', response); // Debug log
        
        if (response && response.success && Array.isArray(response.data)) {
          setUsers(response.data);
          setError(null);
        } else {
          console.error('Invalid response format:', response);
          setError('Format de données invalide reçu du serveur');
          setUsers([]);
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des utilisateurs');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus(userId, isActive);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const getUserTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      admin: 'Administrateur',
      hairdresser: 'Coiffeur',
      client: 'Client'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        px: { xs: 2, md: 4 },
        py: 3,
        bgcolor: '#f5f6fa',
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Gestion des Utilisateurs
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mt: 2, overflow: 'visible' }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Inscription</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!users || users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {user.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {user.full_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user.id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getUserTypeLabel(user.user_type)}
                          color={
                            user.user_type === 'admin' ? 'primary' : 
                            user.user_type === 'hairdresser' ? 'secondary' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'PPpp')}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={user.is_active ? 'Désactiver' : 'Activer'}>
                          <Box display="inline-flex" alignItems="center">
                            {user.is_active ? (
                              <ActiveIcon color="success" sx={{ mr: 1 }} />
                            ) : (
                              <InactiveIcon color="action" sx={{ mr: 1 }} />
                            )}
                            <Switch
                              checked={user.is_active}
                              onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsersPage;
