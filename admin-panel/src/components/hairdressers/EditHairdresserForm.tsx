import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, CircularProgress,
  IconButton, Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UpdateHairdresserPayload } from '../../services/hairdresser.service';

interface HairdresserData {
  id: string;
  user: { id: string; full_name: string; email: string; phone?: string };
  profession?: string;
  residential_address?: string;
  description?: string;
  registration_status: 'pending' | 'approved' | 'rejected';
}

interface Props {
  open: boolean;
  hairdresser: HairdresserData | null;
  onClose: () => void;
  onSave: (id: string, payload: UpdateHairdresserPayload) => Promise<void>;
}

const validationSchema = Yup.object({
  full_name: Yup.string().required('Nom requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  phone: Yup.string(),
  profession: Yup.string(),
  residential_address: Yup.string(),
  description: Yup.string(),
  registration_status: Yup.string().oneOf(['pending', 'approved', 'rejected']),
});

export default function EditHairdresserForm({ open, hairdresser, onClose, onSave }: Props) {
  const formik = useFormik<UpdateHairdresserPayload & { full_name: string; email: string; phone: string }>({
    initialValues: {
      full_name: '',
      email: '',
      phone: '',
      profession: '',
      residential_address: '',
      description: '',
      registration_status: 'pending',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!hairdresser) return;
      await onSave(hairdresser.id, values);
    },
  });

  useEffect(() => {
    if (hairdresser) {
      formik.resetForm({
        values: {
          full_name: hairdresser.user.full_name || '',
          email: hairdresser.user.email || '',
          phone: hairdresser.user.phone || '',
          profession: hairdresser.profession || '',
          residential_address: hairdresser.residential_address || '',
          description: hairdresser.description || '',
          registration_status: hairdresser.registration_status || 'pending',
        },
      });
    }
  }, [hairdresser]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="span">Modifier le coiffeur</Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Compte</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Nom complet" name="full_name"
                value={formik.values.full_name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                helperText={formik.touched.full_name && formik.errors.full_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Email" name="email" type="email"
                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Téléphone" name="phone"
                value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Statut" name="registration_status"
                value={formik.values.registration_status} onChange={formik.handleChange}
              >
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="approved">Approuvé</MenuItem>
                <MenuItem value="rejected">Rejeté</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Profil</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Profession" name="profession"
                value={formik.values.profession} onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Adresse résidentielle" name="residential_address"
                value={formik.values.residential_address} onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={3} label="Description" name="description"
                value={formik.values.description} onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={formik.isSubmitting}>Annuler</Button>
          <Button
            type="submit" variant="contained"
            disabled={formik.isSubmitting || !formik.dirty}
            startIcon={formik.isSubmitting ? <CircularProgress size={18} /> : null}
          >
            {formik.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
