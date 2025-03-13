import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiEdit, FiSave, FiX, FiLock, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useCollection';
import Modal from './Modal';
import { toast } from 'react-hot-toast';

interface UserStats {
  totalCollections: number;
  totalEntries: number;
  createdAt: string;
  lastActive: string;
}

const Profile: React.FC = () => {
  const { authState, updateProfile, logout } = useAuth();
  const { deleteAllCollections, getUserStats } = useCollection();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [formData, setFormData] = useState({
    username: authState.user?.username || '',
    email: authState.user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoadingStats(true);
      try {
        const stats = await getUserStats();
        if (stats) {
          setUserStats(stats);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [getUserStats]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
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

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await updateProfile(formData);
      setIsEditing(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setShowPasswordForm(false);
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

  const cancelPasswordEdit = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
    setShowPasswordForm(false);
  };

  // Get user initials for avatar
  const getInitials = () => {
    const username = authState.user?.username || '';
    return username.charAt(0).toUpperCase();
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle delete all collections
  const handleDeleteAllCollections = async () => {
    if (deleteConfirmation !== authState.user?.username) {
      return;
    }

    try {
      setIsLoading(true);
      const success = await deleteAllCollections();
      
      if (success) {
        setShowDeleteAllModal(false);
        setDeleteConfirmation('');
        toast.success('All collections deleted successfully');
      } else {
        toast.error('Failed to delete all collections');
      }
    } catch (error) {
      console.error('Error in handleDeleteAllCollections:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      
      // Force reset loading state after a timeout
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card mb-6">
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
          
          {/* Password Change Section */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-dark-800 mb-4">Change Password</h2>
            
            {showPasswordForm ? (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`form-input pl-10 ${passwordErrors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  </div>
                  {passwordErrors.currentPassword && <p className="form-error">{passwordErrors.currentPassword}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`form-input pl-10 ${passwordErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  </div>
                  {passwordErrors.newPassword && <p className="form-error">{passwordErrors.newPassword}</p>}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`form-input pl-10 ${passwordErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  </div>
                  {passwordErrors.confirmPassword && <p className="form-error">{passwordErrors.confirmPassword}</p>}
                </div>
                
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
                    {authState.isLoading ? 'Saving...' : 'Update Password'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={cancelPasswordEdit}
                    className="btn-secondary flex items-center justify-center px-4"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-primary w-full flex items-center justify-center"
              >
                <FiLock className="mr-2" />
                Change Password
              </button>
            )}
          </div>

          {/* User Stats Section */}
          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <FiDatabase className="text-primary-500 mr-2" size={20} />
              <h2 className="text-xl font-bold text-dark-800">Account Statistics</h2>
            </div>
            
            {isLoadingStats ? (
              <div className="flex justify-center py-6">
                <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
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
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-dark-500">Total Collections</span>
                  <span className="font-medium text-dark-800">{userStats?.totalCollections || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-dark-500">Total Entries</span>
                  <span className="font-medium text-dark-800">{userStats?.totalEntries || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-dark-500">Account Created</span>
                  <span className="font-medium text-dark-800">{formatDate(userStats?.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-dark-500">Last Active</span>
                  <span className="font-medium text-dark-800">{formatDate(userStats?.lastActive)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone Section */}
          <div className="card border border-red-200">
            <div className="flex items-center mb-4">
              <FiLock className="text-red-500 mr-2" size={20} />
              <h2 className="text-xl font-bold text-dark-800">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-md">
                <h3 className="font-medium text-dark-800 mb-1">Delete All Collections</h3>
                <p className="text-dark-500 text-sm mb-3">
                  This will permanently delete all your collections and their entries. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="btn-danger"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete All Collections'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete All Collections Confirmation Modal */}
      <Modal
        isOpen={showDeleteAllModal}
        onClose={() => {
          setShowDeleteAllModal(false);
          setDeleteConfirmation('');
        }}
        title="Delete All Collections"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-red-50 text-red-800 rounded-md">
            <FiLock className="mr-2 flex-shrink-0" size={20} />
            <p>
              This action will permanently delete all your collections and their entries. 
              This cannot be undone.
            </p>
          </div>
          
          <p className="text-dark-500">
            To confirm, please type your username <strong>{authState.user?.username}</strong> below:
          </p>
          
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="form-input"
            placeholder="Enter your username"
          />
          
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleDeleteAllCollections}
              disabled={deleteConfirmation !== authState.user?.username || isLoading}
              className={`btn-danger flex-1 ${
                deleteConfirmation !== authState.user?.username || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete All Collections'
              )}
            </button>
            
            <button
              onClick={() => {
                setShowDeleteAllModal(false);
                setDeleteConfirmation('');
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile; 