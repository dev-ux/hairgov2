import { customInstance } from './api/mutator/custom-instance';

// Create an axios-like interface using the custom instance
const api = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    const data = await customInstance<T>(url, { method: 'GET' });
    return { data };
  },
  
  post: async <T>(url: string, requestData?: any): Promise<{ data: T }> => {
    const data = await customInstance<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    return { data };
  },
  
  put: async <T>(url: string, requestData?: any): Promise<{ data: T }> => {
    const data = await customInstance<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    return { data };
  },
  
  delete: async <T>(url: string): Promise<{ data: T }> => {
    const data = await customInstance<T>(url, { method: 'DELETE' });
    return { data };
  },
};

export default api;
