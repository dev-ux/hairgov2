import axios from 'axios';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Remplacez cette URL par votre endpoint de téléversement
    const response = await axios.post('https://hairgov2.onrender.com/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.url) {
      return { success: true, url: response.data.url };
    }
    return { success: false, error: 'Réponse inattendue du serveur' };
  } catch (error: any) {
    console.error('Erreur lors du téléversement:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Erreur lors du téléversement du fichier' 
    };
  }
};
