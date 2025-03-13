import axios, { AxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterCredentials, ProfileUpdateData, User } from '../types/user';
import { Collection, CollectionFormData, Entry, FieldType, ShareFormData, SharedUser } from '../types/collection';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Auth API
export const authAPI = {
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },
  
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: ProfileUpdateData) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
};

// Collections API
export const collectionsAPI = {
  getCollections: async (page = 1, limit = 10, search = '') => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      const response = await api.get(`/collections?${queryParams.toString()}`);
      
      // Ensure pagination data exists with default values if not present
      const defaultPagination = {
        total: 0,
        page,
        limit,
        pages: 0,
        hasMore: false
      };
      
      return {
        ...response.data,
        pagination: response.data.pagination || defaultPagination
      };
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Return empty data with default pagination on error
      return {
        success: false,
        collections: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
          hasMore: false
        }
      };
    }
  },
  
  getCollection: async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },
  
  createCollection: async (data: CollectionFormData) => {
    console.log('API service: Creating collection with data:', JSON.stringify(data, null, 2));
    try {
      // Ensure field types are strings to avoid serialization issues
      const processedData = {
        ...data,
        fields: data.fields.map(field => ({
          name: field.name.trim(),
          type: String(field.type) as FieldType
        }))
      };
      
      console.log('API service: Processed data:', JSON.stringify(processedData, null, 2));
      
      const response = await api.post('/collections', processedData);
      console.log('API service: Collection created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API service: Error creating collection:', error);
      console.error('API service: Error response data:', error.response?.data);
      throw error;
    }
  },
  
  updateCollection: async (id: string, data: CollectionFormData) => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },
  
  deleteCollection: async (id: string) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  },
  
  // Sharing
  shareCollection: async (id: string, data: ShareFormData) => {
    const response = await api.post(`/collections/${id}/share`, data);
    return response.data;
  },
  
  getSharedUsers: async (id: string) => {
    const response = await api.get(`/collections/${id}/share`);
    return response.data;
  },
  
  removeSharedUser: async (id: string, email: string) => {
    const response = await api.delete(`/collections/${id}/share/${email}`);
    return response.data;
  },
  
  // Entries
  addEntry: async (collectionId: string, entry: Entry) => {
    const response = await api.post(`/collections/${collectionId}/entries`, entry);
    return response.data;
  },
  
  updateEntry: async (collectionId: string, entryIndex: number, entry: Entry) => {
    const response = await api.put(`/collections/${collectionId}/entries/${entryIndex}`, entry);
    return response.data;
  },
  
  deleteEntry: async (collectionId: string, entryIndex: number) => {
    const response = await api.delete(`/collections/${collectionId}/entries/${entryIndex}`);
    return response.data;
  },
};

export default api; 