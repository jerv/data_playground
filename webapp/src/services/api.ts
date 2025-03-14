import axios from 'axios';
import { LoginCredentials, RegisterCredentials, ProfileUpdateData, User } from '../types/user';
import { Collection, PaginationInfo, CollectionFormData, Entry, FieldType, ShareFormData, SharedUser } from '../types/collection';

// Get the API URL from environment variables with fallbacks
// First check window.env (runtime), then process.env (build time), then fallback
const API_URL = (window as any).env?.REACT_APP_API_URL || 
                process.env.REACT_APP_API_URL || 
                'https://data-playground.onrender.com/api';

console.log('API Service initialized with URL:', API_URL);

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Global timeout of 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Log request details in development
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request data:', config.data);
    console.log('Token exists:', !!token);
    console.log('Full request URL:', `${API_URL}${config.url}`);

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle common responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    // If request timed out
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('Request timed out');
      error.isTimeout = true;
      return Promise.reject(error);
    }

    // If the error has a response (HTTP error)
    if (error.response) {
      console.error(`API Error: ${error.response.status} ${error.config?.url}`);
      console.error('Error details:', error.response.data);
      console.error('Request data:', error.config?.data);
      
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        console.log('Auth token invalid or expired. Clearing token and redirecting to login.');
        // Clear token and redirect to login page
        localStorage.removeItem('token');
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else {
      // Network error or other error without response
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login with credentials:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: RegisterCredentials) => {
    try {
      console.log('Attempting registration with data:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      console.log('Fetching user profile');
      const response = await api.get('/auth/profile');
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },
  
  updateProfile: async (data: ProfileUpdateData) => {
    try {
      console.log('Updating profile with data:', data);
      const response = await api.put('/auth/profile', data);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
};

// Collections API
export const collectionsAPI = {
  getCollections: async (page = 1, limit = 10, search = '', sort = 'createdAt:desc') => {
    try {
      console.log(`Fetching collections: page=${page}, limit=${limit}, search=${search}, sort=${sort}`);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sort
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      const response = await api.get(`/collections?${queryParams.toString()}`);
      console.log('Collections response:', response.data);
      
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
  
  deleteAllCollections: async () => {
    try {
      console.log('Attempting to delete all collections...');
      
      // Try the main route first
      try {
        const response = await api.delete('/collections/all');
        console.log('Delete all collections response from /all:', response.data);
        return response.data;
      } catch (error) {
        console.log('First attempt failed, trying alternative route...');
        // If the first attempt fails, try the alternative route
        const response = await api.delete('/collections/delete-all');
        console.log('Delete all collections response from /delete-all:', response.data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Error deleting all collections:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // For debugging, log the current token status
      const hasToken = !!localStorage.getItem('token');
      console.log('Token exists:', hasToken);
      
      throw error;
    }
  },
  
  getUserStats: async () => {
    try {
      const response = await api.get('/collections/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },
};

export { api }; 