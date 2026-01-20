import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Button, 
  IconButton, 
  Box, 
  Typography, 
  Divider, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormGroup,
  InputAdornment,
  FormLabel,
  RadioGroup,
  Radio,
  Grid,
  Alert
} from '@mui/material';
// Composants de date non nécessaires pour l'instant
import { Close as CloseIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Home as HomeIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

interface AddHairdresserFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  full_name: Yup.string().required('Le nom complet est requis'),
  email: Yup.string().email('Entrez un email valide').required('L\'email est requis'),
  phone: Yup.string().required('Le numéro de téléphone est requis'),
  password: Yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Les mots de passe doivent correspondre')
    .required('La confirmation du mot de passe est requise')
});

const AddHairdresserForm: React.FC<AddHairdresserFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      // Informations utilisateur
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        // Préparer les données pour l'API
        const requestData = {
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          password: values.password,
        };
        
        // Envoyer la requête avec les données structurées
        const response = await api.post('/auth/register/hairdresser', 
          requestData,
          {
            params: {
              is_admin_creation: true,
              auto_approve: true
            }
          }
        );
        
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error('Erreur lors de la création du coiffeur:', err);
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du coiffeur');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Ajouter un coiffeur</Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Informations du compte</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="full_name"
                name="full_name"
                label="Nom complet"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                helperText={formik.touched.full_name && formik.errors.full_name}
                margin="normal"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Téléphone"
                type="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                margin="normal"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Mot de passe"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                margin="normal"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Création...' : 'Créer le coiffeur'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHairdresserForm;
