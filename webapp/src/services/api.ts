import axios, { AxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterCredentials, ProfileUpdateData, User } from '../types/user';
import { Collection, CollectionFormData, Entry } from '../types/collection';

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
  getCollections: async () => {
    const response = await api.get('/collections');
    return response.data;
  },
  
  getCollection: async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },
  
  createCollection: async (data: CollectionFormData) => {
    const response = await api.post('/collections', data);
    return response.data;
  },
  
  updateCollection: async (id: string, data: CollectionFormData) => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },
  
  deleteCollection: async (id: string) => {
    const response = await api.delete(`/collections/${id}`);
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