import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import api from '../../config/api';

const MigrationButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleMigration = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/migration/images-to-cloudinary');
      
      if (response.data.success) {
        setMessage({ type: 'success', text: '✅ Migration terminée avec succès!' });
      } else {
        setMessage({ type: 'error', text: '❌ Erreur lors de la migration' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `❌ Erreur: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Migration des images
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Cette action va migrer toutes les images locales vers Cloudinary. 
        Cela peut prendre quelques minutes selon le nombre d'images.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        onClick={handleMigration}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Migration en cours...' : 'Migrer les images vers Cloudinary'}
      </Button>

      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}
    </Box>
  );
};

export default MigrationButton;
