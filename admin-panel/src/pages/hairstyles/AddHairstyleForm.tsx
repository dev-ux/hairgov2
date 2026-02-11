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
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material';
// Types
export interface HairstyleFormData {
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
  editingHairstyle?: any; // Ajout de la prop pour l'édition
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
  editingHairstyle,
}) => {
  // Fonction pour formater les URLs des photos
  const formatPhotoUrl = (photo: string | undefined) => {
    if (!photo) return '';
    
    // Si l'URL est déjà complète (Cloudinary, Unsplash, etc.), la retourner telle quelle
    if (photo.startsWith('http')) {
      return photo;
    }
    
    // Si l'URL commence par /uploads/, construire l'URL complète
    if (photo.startsWith('/uploads/')) {
      return `https://hairgov2.onrender.com${photo}`;
    }
    
    // Sinon, retourner une chaîne vide
    return '';
  };

  const [formData, setFormData] = useState<HairstyleFormData>({
    name: '',
    description: '',
    estimated_duration: 30,
    category: '',
    is_active: true,
    photos: [],
    photoPreviews: [],
  });

  // Initialiser le formulaire avec les données de la coiffure à éditer
  React.useEffect(() => {
    if (editingHairstyle && open) {
      setFormData({
        name: editingHairstyle.name || '',
        description: editingHairstyle.description || '',
        estimated_duration: editingHairstyle.estimated_duration || 30,
        category: editingHairstyle.category || '',
        is_active: editingHairstyle.is_active !== undefined ? editingHairstyle.is_active : true,
        photos: [],
        photoPreviews: editingHairstyle.photo ? [formatPhotoUrl(editingHairstyle.photo)] : [],
      });
    } else if (!editingHairstyle && open) {
      // Réinitialiser le formulaire pour l'ajout
      setFormData({
        name: '',
        description: '',
        estimated_duration: 30,
        category: '',
        is_active: true,
        photos: [],
        photoPreviews: [],
      });
    }
  }, [editingHairstyle, open]);

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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        '& .MuiDialogTitle-root': {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#333',
        }
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          {editingHairstyle ? (
            <EditIcon sx={{ color: '#1976d2', fontSize: '1.5rem' }} />
          ) : (
            <AddIcon sx={{ color: '#2e7d32', fontSize: '1.5rem' }} />
          )}
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {editingHairstyle ? 'Modifier la coiffure' : 'Ajouter une nouvelle coiffure'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          p: 3,
          minHeight: 500,
          '&.MuiDialogContent-root': {
            backgroundColor: '#ffffff',
          }
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de la coiffure"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                margin="normal"
                variant="outlined"
                placeholder="Décrivez cette coiffure en détail..."
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Durée estimée (minutes)"
                  name="estimated_duration"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  variant="outlined"
                  helperText="Temps moyen estimé pour réaliser cette coiffure"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          ⏱️
                        </Typography>
                      </Box>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel 
                    id="category-label"
                    sx={{ 
                      backgroundColor: '#ffffff',
                      '&.Mui-focused': {
                        color: '#1976d2',
                      }
                    }}
                  >
                    Catégorie
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Catégorie"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">{category}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3, 
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: '#f5f5f5',
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  multiple
                  style={{ 
                    display: 'none',
                    cursor: 'pointer'
                  }}
                  id="hairstyle-photo-input"
                />
                
                <Box onClick={() => document.getElementById('hairstyle-photo-input')?.click()}>
                  {formData.photoPreviews.length > 0 ? (
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                      {formData.photoPreviews.map((preview, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={preview}
                              alt={`Aperçu ${index + 1}`}
                              variant="rounded"
                              sx={{ 
                                width: '100%', 
                                height: 120,
                                border: '2px solid #e0e0e0',
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePhoto(index);
                              }}
                              sx={{ 
                                position: 'absolute', 
                                top: -8, 
                                right: -8,
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                '&:hover': {
                                  backgroundColor: 'rgba(244,67,54,1)',
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ py: 4 }}>
                      <CloudUploadIcon sx={{ fontSize: '3rem', color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                        Glissez-déposez vos images ici
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ou cliquez pour parcourir vos fichiers
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Formats acceptés : JPG, PNG, WebP (max 5MB par image)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}>
                <Switch
                  checked={formData.is_active}
                  onChange={handleSwitchChange}
                  name="is_active"
                  color="primary"
                  size="medium"
                />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Coiffure {formData.is_active ? 'active' : 'inactive'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formData.is_active ? 'Visible pour les clients' : 'Masquée pour les clients'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: '#fafafa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              mr: 2,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name || !formData.category}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            {loading ? 'Enregistrement...' : (editingHairstyle ? 'Mettre à jour' : 'Enregistrer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddHairstyleForm;
