import React, { useState } from 'react';
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
} from '@mui/icons-material';

// Données temporaires - À remplacer par un appel API
const mockHairdressers = [
  {
    id: 1,
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@example.com',
    phone: '06 12 34 56 78',
    specialty: 'Coloration',
    rating: 4.8,
    status: 'actif',
    avatar: '/static/images/avatar/1.jpg',
  },
  {
    id: 2,
    firstName: 'Thomas',
    lastName: 'Dubois',
    email: 'thomas.dubois@example.com',
    phone: '06 98 76 54 32',
    specialty: 'Coupe Homme',
    rating: 4.9,
    status: 'actif',
    avatar: '/static/images/avatar/2.jpg',
  },
  // Ajoutez plus de coiffeurs selon vos besoins
];

const HairdressersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredHairdressers = mockHairdressers.filter(
    (hairdresser) =>
      `${hairdresser.firstName} ${hairdresser.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hairdresser.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                          src={hairdresser.avatar}
                          alt={`${hairdresser.firstName} ${hairdresser.lastName}`}
                        />
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {hairdresser.firstName} {hairdresser.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={hairdresser.specialty}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="action" fontSize="small" />
                        <Typography variant="body2">{hairdresser.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="action" fontSize="small" />
                        <Typography variant="body2">{hairdresser.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon color="warning" fontSize="small" />
                      <Typography variant="body1">
                        {hairdresser.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={hairdresser.status === 'actif' ? 'Actif' : 'Inactif'}
                      color={hairdresser.status === 'actif' ? 'success' : 'default'}
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
