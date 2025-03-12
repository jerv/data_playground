import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  ProfileUpdateData 
} from '../types/user';
import { authAPI } from '../services/api';

// Initial auth state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Create context
export const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
}>({
  authState: initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authState.token) {
        try {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          const { user } = await authAPI.getProfile();
          setAuthState({
            user,
            token: authState.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.',
          });
          navigate('/login');
        }
      }
    };

    loadUser();
  }, [authState.token, navigate]);

  // Register user
  const register = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authAPI.register(credentials);
      setAuthState({
        ...authState,
        isLoading: false,
        error: null,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setAuthState({
        ...authState,
        isLoading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { token, user } = await authAPI.login(credentials);
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      toast.success('Login successful!');
      navigate('/playground');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState({
        ...authState,
        isLoading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  // Logout user
  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Reset auth state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // Update profile
  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { user } = await authAPI.updateProfile(data);
      
      setAuthState({
        ...authState,
        user,
        isLoading: false,
        error: null,
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setAuthState({
        ...authState,
        isLoading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 