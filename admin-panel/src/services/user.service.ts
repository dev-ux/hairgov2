import api from '../config/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'client' | 'hairdresser' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const getUsers = async (): Promise<{ success: boolean; data: User[]; count: number }> => {
  try {
    const response = await api.get<{ success: boolean; data: User[]; count: number }>('/admin/users');
    if (response.data.success) {
      return response.data;
    }
    throw new Error('Erreur lors de la récupération des utilisateurs');
  } catch (error: any) {
    console.error('Error in getUsers:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    throw error.response?.data?.error || error.message;
  }
};
