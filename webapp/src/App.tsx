import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CollectionProvider } from './hooks/useCollection';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import CollectionList from './components/CollectionList';
import CollectionDetail from './components/CollectionDetail';
import NotFound from './components/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import TestConnection from './components/TestConnection';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  // Add a timeout to detect stuck loading states
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (authState.isLoading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 seconds timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [authState.isLoading]);
  
  // Force reload the page if loading times out
  const handleForceReload = () => {
    window.location.reload();
  };
  
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary-500 mb-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-dark-500 mb-2">Loading...</p>
        
        {loadingTimeout && (
          <div className="text-center mt-4">
            <p className="text-red-600 mb-2">Loading is taking longer than expected.</p>
            <button 
              onClick={handleForceReload}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    );
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
};

// Public route component with footer
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  
  // If user is authenticated, redirect to playground
  if (authState.isAuthenticated && !authState.isLoading) {
    return <Navigate to="/playground" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
};

// App routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/playground" element={
        <ProtectedRoute>
          <CollectionList />
        </ProtectedRoute>
      } />
      
      <Route path="/collections/:id" element={
        <ProtectedRoute>
          <CollectionDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/test" element={<TestConnection />} />
      
      <Route path="/" element={<Navigate to="/playground" />} />
      <Route path="*" element={
        <PublicRoute>
          <NotFound />
        </PublicRoute>
      } />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  // Add a global reset function that can be triggered by pressing Escape key 5 times quickly
  const [keyPressCount, setKeyPressCount] = React.useState(0);
  const [showResetOption, setShowResetOption] = React.useState(false);
  const keyPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setKeyPressCount(prev => prev + 1);
        
        if (keyPressTimer.current) {
          clearTimeout(keyPressTimer.current);
        }
        
        keyPressTimer.current = setTimeout(() => {
          setKeyPressCount(0);
        }, 2000);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyPressTimer.current) {
        clearTimeout(keyPressTimer.current);
      }
    };
  }, []);
  
  React.useEffect(() => {
    if (keyPressCount >= 5) {
      setShowResetOption(true);
      setKeyPressCount(0);
    }
  }, [keyPressCount]);
  
  const handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };
  
  const handleDismiss = () => {
    setShowResetOption(false);
  };
  
  return (
    <Router>
      <AuthProvider>
        <CollectionProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#1F2937',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '0.375rem',
                padding: '0.75rem 1rem',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          <AppRoutes />
          
          {/* Emergency reset dialog */}
          {showResetOption && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h2 className="text-xl font-bold mb-4">App Recovery</h2>
                <p className="mb-4">
                  It looks like you may be experiencing issues with the app. 
                  Would you like to reset the app state? This will log you out and clear local data.
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reset App
                  </button>
                  <button 
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </CollectionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 