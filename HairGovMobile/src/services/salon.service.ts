import api from '../api';

export interface Salon {
  id: string;
  hairdresser_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalonResponse {
  success: boolean;
  data: Salon;
  message?: string;
}

export interface CreateSalonData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  email?: string;
  business_hours?: string;
  photos?: string[];
}

// Créer un nouveau salon avec photos
export const createSalonWithPhotos = async (salonData: CreateSalonData): Promise<SalonResponse> => {
  try {
    console.log('Creating salon with data:', salonData);
    
    // Créer FormData pour gérer les fichiers
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('name', salonData.name);
    formData.append('address', salonData.address);
    formData.append('latitude', salonData.latitude.toString());
    formData.append('longitude', salonData.longitude.toString());
    
    if (salonData.description) {
      formData.append('description', salonData.description);
    }
    if (salonData.phone) {
      formData.append('phone', salonData.phone);
    }
    if (salonData.email) {
      formData.append('email', salonData.email);
    }
    if (salonData.business_hours) {
      formData.append('business_hours', salonData.business_hours);
    }
    
    // Ajouter les photos si elles existent
    if (salonData.photos && salonData.photos.length > 0) {
      salonData.photos.forEach((photoUri, index) => {
        if (photoUri.startsWith('file://')) {
          // C'est une URI locale, créer un fichier blob
          const localUri = photoUri;
          const filename = localUri.split('/').pop() || `photo-${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('photos', {
            uri: localUri,
            name: filename,
            type,
          } as any);
        } else {
          // C'est une URL distante, l'ajouter comme texte
          formData.append('photoUrls', photoUri);
        }
      });
    }
    
    // Utiliser une requête personnalisée pour FormData
    const response = await fetch('https://hairgov2.onrender.com/api/v1/salons', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('userToken') || ''}`,
      },
      body: formData,
    });
    
    const responseData = await response.json();
    console.log('Salon creation response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Erreur lors de la création du salon');
    }
    
    return responseData;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
};

// Créer un nouveau salon (version simple sans photos)
export const createSalon = async (salonData: CreateSalonData): Promise<SalonResponse> => {
  try {
    console.log('Creating salon with data:', salonData);
    const response = await api.post<SalonResponse>('/salons', salonData);
    console.log('Salon creation response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
};

// Récupérer les informations du salon du coiffeur connecté
export const getMySalon = async (): Promise<SalonResponse> => {
  try {
    console.log('Fetching my salon...');
    const response = await api.get<SalonResponse>('/salons/my-salon');
    console.log('My salon response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching my salon:', error);
    throw error;
  }
};

// Mettre à jour les informations du salon
export const updateSalon = async (salonId: string, salonData: Partial<CreateSalonData>): Promise<SalonResponse> => {
  try {
    const response = await api.put<SalonResponse>(`/salons/${salonId}`, salonData);
    return response.data;
  } catch (error) {
    console.error('Error updating salon:', error);
    throw error;
  }
};

// Supprimer un salon
export const deleteSalon = async (salonId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/salons/${salonId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting salon:', error);
    throw error;
  }
};
