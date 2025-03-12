import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const { authState, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: authState.user?.username || '',
    email: authState.user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await updateProfile(formData);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      username: authState.user?.username || '',
      email: authState.user?.email || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  // Get user initials for avatar
  const getInitials = () => {
    const username = authState.user?.username || '';
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-800">My Profile</h1>
                <p className="text-dark-500">Manage your account information</p>
              </div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`form-input pl-10 ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  </div>
                  {errors.username && <p className="form-error">{errors.username}</p>}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                
                {authState.error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {authState.error}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={authState.isLoading}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    {authState.isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                    ) : (
                      <FiSave className="mr-2" />
                    )}
                    {authState.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn-secondary flex items-center justify-center px-4"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-dark-500 mb-1">Username</p>
                  <p className="text-dark-800 font-medium">{authState.user?.username}</p>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-dark-500 mb-1">Email</p>
                  <p className="text-dark-800 font-medium">{authState.user?.email}</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    <FiEdit className="mr-2" />
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={logout}
                    className="btn-secondary flex items-center justify-center px-4"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 