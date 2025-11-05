import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SalonData } from '../../services/salon.service';
import api from '../../config/api';
import { getActiveHairdressers } from '../../services/hairdresser.service';
import InputFile from '../common/InputFile';

interface AddSalonFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Le nom du salon est requis'),
  address: Yup.string().required('L\'adresse est requise'),
  hairdresser_id: Yup.string().required('La sélection d\'un coiffeur est requise'),
  photo: Yup.mixed().required('Une photo est requise'),
});

const AddSalonForm: React.FC<AddSalonFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [hairdressers, setHairdressers] = useState<Array<{id: string, full_name: string}>>([]);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
      hairdresser_id: '',
      photo: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');

        // Créer un FormData pour le téléversement du fichier
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('address', values.address);
        formData.append('hairdresser_id', values.hairdresser_id);
        formData.append('latitude', '48.8566'); // Paris par défaut
        formData.append('longitude', '2.3522'); // Paris par défaut
        formData.append('is_validated', 'true'); // Par défaut, le salon est validé
        
        if (values.photo) {
          formData.append('photos', values.photo);
        }

        // Utiliser la route d'administration pour créer le salon
        const response = await api.post('/admin/salons', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (response.data.success) {
          onSuccess();
          onClose();
        } else {
          throw new Error(response.data.message || 'Erreur lors de la création du salon');
        }
      } catch (err: any) {
        console.error('Erreur lors de la création du salon:', err);
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du salon');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (file: File) => {
    formik.setFieldValue('photo', file);
    formik.setFieldTouched('photo', true, false);
  };

  // Charger la liste des coiffeurs actifs
  useEffect(() => {
    const loadHairdressers = async () => {
      try {
        const hairdressersData = await getActiveHairdressers();
        setHairdressers(hairdressersData.map(h => ({
          id: h.id,
          full_name: h.user.full_name
        })));
      } catch (err) {
        console.error('Erreur lors du chargement des coiffeurs:', err);
        setError('Impossible de charger la liste des coiffeurs');
      }
    };

    if (open) {
      loadHairdressers();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Ajouter un nouveau salon</Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Box mb={2}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Nom du salon"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.hairdresser_id && Boolean(formik.errors.hairdresser_id)}
              >
                <InputLabel id="hairdresser-select-label">Coiffeur</InputLabel>
                <Select
                  labelId="hairdresser-select-label"
                  id="hairdresser_id"
                  name="hairdresser_id"
                  value={formik.values.hairdresser_id}
                  onChange={formik.handleChange}
                  label="Coiffeur"
                  disabled={loading || hairdressers.length === 0}
                >
                  <MenuItem value="" disabled>
                    <em>Sélectionner un coiffeur</em>
                  </MenuItem>
                  {hairdressers.map((hairdresser) => (
                    <MenuItem key={hairdresser.id} value={hairdresser.id}>
                      {hairdresser.full_name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {formik.touched.hairdresser_id && formik.errors.hairdresser_id}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Adresse"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                margin="normal"
                disabled={loading}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <InputFile
                label={formik.values.photo ? formik.values.photo.name : 'Téléverser une photo'}
                onChange={handleFileChange}
                accept="image/*"
                disabled={loading}
                error={formik.touched.photo && formik.errors.photo ? String(formik.errors.photo) : undefined}
                touched={!!formik.touched.photo}
              />
              {formik.values.photo && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    {formik.values.photo.name} ({(formik.values.photo.size / 1024).toFixed(2)} KB)
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formik.isValid}
          >
            {loading ? <CircularProgress size={24} /> : 'Créer le salon'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSalonForm;
