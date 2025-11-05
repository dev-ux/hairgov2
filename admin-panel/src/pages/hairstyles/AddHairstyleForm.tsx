// Assurez-vous que tous ces imports sont présents en haut du fichier
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  IconButton,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material';
// Types
interface HairstyleFormData {
  name: string;
  description: string;
  estimated_duration: number;
  category: string;
  is_active: boolean;
  photos: File[];
  photoPreviews: string[];
}

interface AddHairstyleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<HairstyleFormData, 'photoPreviews'>) => void;
  loading?: boolean;
}

const StyledDropZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[400]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const PreviewContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '16px',
});

const PreviewItem = styled(Box)({
  position: 'relative',
  width: 100,
  height: 100,
  '&:hover .delete-button': {
    opacity: 1,
  },
});

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '4px',
  opacity: 0,
  transition: 'opacity 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  '&.MuiIconButton-root': {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
}));

const categories = [
  'Coupe Homme',
  'Coupe Femme',
  'Coloration',
  'Mèches',
  'Lissage',
  'Permanente',
  'Autre',
];

const AddHairstyleForm: React.FC<AddHairstyleFormProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<HairstyleFormData>({
    name: '',
    description: '',
    estimated_duration: 30,
    category: '',
    is_active: true,
    photos: [],
    photoPreviews: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files);
    const newPhotoPreviews = newPhotos.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
      photoPreviews: [...prev.photoPreviews, ...newPhotoPreviews],
    }));

    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    const newPhotoPreviews = [...formData.photoPreviews];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPhotoPreviews[index]);
    
    newPhotos.splice(index, 1);
    newPhotoPreviews.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      photos: newPhotos,
      photoPreviews: newPhotoPreviews,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { photoPreviews, ...dataToSubmit } = formData;
    onSubmit(dataToSubmit);
  };

  const handleClose = () => {
    // Clean up object URLs to prevent memory leaks
    formData.photoPreviews.forEach(url => URL.revokeObjectURL(url));
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      estimated_duration: 30,
      category: '',
      is_active: true,
      photos: [],
      photoPreviews: [],
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Ajouter une nouvelle coiffure</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de la coiffure"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                margin="normal"
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Durée estimée (minutes)"
                    name="estimated_duration"
                    type="number"
                    value={formData.estimated_duration}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    inputProps={{ min: 5, step: 5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="category-label">Catégorie</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Catégorie"
                      required
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleSwitchChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Activée"
                sx={{ mt: 2, display: 'block' }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="hairstyle-photo-upload"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="hairstyle-photo-upload">
                <StyledDropZone>
                  <AddIcon fontSize="large" color="action" />
                  <Typography variant="subtitle1" gutterBottom>
                    Ajouter des photos
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Glissez-déposez des images ici ou cliquez pour sélectionner
                  </Typography>
                  {formData.photoPreviews.length > 0 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {formData.photoPreviews.length} photo(s) sélectionnée(s)
                    </Typography>
                  )}
                </StyledDropZone>
              </label>
              
              {formData.photoPreviews.length > 0 && (
                <PreviewContainer>
                  {formData.photoPreviews.map((preview, index) => (
                    <PreviewItem key={index}>
                      <Avatar
                        src={preview}
                        variant="rounded"
                        sx={{ width: '100%', height: '100%' }}
                      />
                      <DeleteButton
                        className="delete-button"
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </DeleteButton>
                    </PreviewItem>
                  ))}
                </PreviewContainer>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formData.name || !formData.category}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddHairstyleForm;
