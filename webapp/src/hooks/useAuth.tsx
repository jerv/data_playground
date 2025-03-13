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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (authState.isLoading) {
      timeoutId = setTimeout(() => {
        console.log('Loading timeout triggered, resetting loading state');
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: prev.error || 'Operation timed out. Please try again.'
        }));
      }, 5000); // Reduced to 5 seconds for faster recovery
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [authState.isLoading]);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authState.token && !initialLoadComplete) {
        try {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          
          // Add a timeout to the API call
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timed out')), 3000)
          );
          
          const profilePromise = authAPI.getProfile();
          
          // Race between the API call and the timeout
          const { user } = await Promise.race([profilePromise, timeoutPromise]) as { user: any };
          
          setAuthState({
            user,
            token: authState.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Token is invalid or expired
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired or timed out. Please login again.',
          });
          navigate('/login');
        } finally {
          setInitialLoadComplete(true);
        }
      } else {
        // Ensure loading is false if no token
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));
        setInitialLoadComplete(true);
      }
    };

    loadUser();
  }, [authState.token, navigate, initialLoadComplete]);

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
      console.log('Login attempt with:', credentials);
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      toast.success('Login successful!');
      navigate('/playground');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Get a more specific error message if available
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        token: null,
      }));
      
      // Clear any existing token if login fails
      localStorage.removeItem('token');
      
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