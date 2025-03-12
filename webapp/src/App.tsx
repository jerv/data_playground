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
import CollectionEdit from './components/CollectionEdit';
import NotFound from './components/NotFound';
import Header from './components/Header';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary-500" viewBox="0 0 24 24">
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
      </div>
    );
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      <Header />
      {children}
    </>
  );
};

// App routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
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
      
      <Route path="/collections/:id/edit" element={
        <ProtectedRoute>
          <CollectionEdit />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/playground" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
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
        </CollectionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 