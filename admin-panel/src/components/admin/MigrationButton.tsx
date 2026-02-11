import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress, Stack } from '@mui/material';
import { CloudUpload as CloudUploadIcon, CleaningServices as CleanIcon } from '@mui/icons-material';
import api from '../../config/api';

const MigrationButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
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

  const handleCleanPaths = async () => {
    if (!window.confirm('⚠️ Cette action va supprimer TOUS les chemins locaux de la base de données. Les images qui n\'existent plus seront retirées des salons. Continuer?')) {
      return;
    }

    setCleaning(true);
    setMessage(null);

    try {
      const response = await api.post('/migration/clean-local-paths');
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${response.data.message}` 
        });
      } else {
        setMessage({ type: 'error', text: '❌ Erreur lors du nettoyage' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `❌ Erreur: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Box sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Migration des images
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Ces actions vont nettoyer les chemins d'images locaux et les remplacer par des URLs Cloudinary.
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          onClick={handleMigration}
          disabled={loading || cleaning}
        >
          {loading ? 'Migration en cours...' : 'Migrer vers Cloudinary'}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={cleaning ? <CircularProgress size={20} /> : <CleanIcon />}
          onClick={handleCleanPaths}
          disabled={loading || cleaning}
        >
          {cleaning ? 'Nettoyage en cours...' : 'Nettoyer les chemins locaux'}
        </Button>
      </Stack>

      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}
    </Box>
  );
};

export default MigrationButton;
