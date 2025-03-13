import React, { useState, useEffect } from 'react';
import { FiMail, FiTrash2, FiSave, FiX, FiPlus, FiEdit } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import { ShareFormData, SharedUser, AccessLevel } from '../types/collection';

interface ShareCollectionFormProps {
  collectionId: string;
  onClose?: () => void;
}

const ShareCollectionForm: React.FC<ShareCollectionFormProps> = ({
  collectionId,
  onClose,
}) => {
  const { shareCollection, getSharedUsers, removeSharedUser, collectionState } = useCollection();
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('read');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editAccessLevel, setEditAccessLevel] = useState<AccessLevel>('read');

  // Load shared users on component mount
  useEffect(() => {
    const loadSharedUsers = async () => {
      setIsLoading(true);
      const users = await getSharedUsers(collectionId);
      if (users) {
        setSharedUsers(users);
      }
      setIsLoading(false);
    };

    loadSharedUsers();
  }, [collectionId, getSharedUsers]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleAccessLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccessLevel(e.target.value as AccessLevel);
  };

  const handleEditAccessLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditAccessLevel(e.target.value as AccessLevel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const shareData: ShareFormData = {
      email: email.trim(),
      accessLevel,
    };

    const result = await shareCollection(collectionId, shareData);
    
    if (result) {
      setSharedUsers(result);
      setEmail('');
      setAccessLevel('read');
    }
    
    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    setIsLoading(true);
    const result = await removeSharedUser(collectionId, email);
    
    if (result) {
      setSharedUsers(result);
    }
    
    setIsLoading(false);
  };

  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/collections/${collectionId}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const startEditingUser = (email: string, currentAccessLevel: AccessLevel) => {
    setEditingUser(email);
    setEditAccessLevel(currentAccessLevel);
  };

  const updateUserAccess = async () => {
    if (!editingUser) return;
    
    setIsLoading(true);
    const shareData: ShareFormData = {
      email: editingUser,
      accessLevel: editAccessLevel,
    };

    const result = await shareCollection(collectionId, shareData);
    
    if (result) {
      setSharedUsers(result);
      setEditingUser(null);
    }
    
    setIsLoading(false);
  };

  return (
    <div>
      {/* Copy Link Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-medium text-dark-800">Share via Link</h3>
            <p className="text-sm text-dark-500 mt-1">
              Anyone with the link can view this collection if you share it with them
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className={`btn-secondary flex items-center ${linkCopied ? 'bg-green-100 text-green-700 border-green-200' : ''}`}
            disabled={linkCopied}
          >
            {linkCopied ? (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="user@example.com"
                disabled={isLoading}
              />
              {error && <p className="form-error">{error}</p>}
            </div>
            <div className="w-1/3">
              <select
                value={accessLevel}
                onChange={handleAccessLevelChange}
                className="form-input"
                disabled={isLoading}
              >
                <option value="read">Read Only</option>
                <option value="write">Can Edit Entries</option>
                <option value="admin">Full Access</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {accessLevel === 'read' && 'User can only view the collection and its entries'}
            {accessLevel === 'write' && 'User can view and add/edit entries, but cannot modify the collection structure'}
            {accessLevel === 'admin' && 'User has full access to view, edit, and share the collection'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center justify-center"
        >
          {isLoading ? (
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
            <FiPlus className="mr-2" />
          )}
          Share Collection
        </button>
      </form>

      <div>
        <h3 className="text-lg font-medium text-dark-800 mb-4">Shared With</h3>
        {isLoading && sharedUsers.length === 0 ? (
          <div className="flex justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-primary-500" viewBox="0 0 24 24">
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
        ) : sharedUsers.length === 0 ? (
          <p className="text-dark-500 text-center py-4">
            This collection is not shared with anyone yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sharedUsers.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <FiMail className="text-dark-500 mr-2" />
                  <div>
                    <p className="text-dark-800 font-medium">{user.email}</p>
                    {editingUser !== user.email && (
                      <p className="text-xs text-dark-500">
                        {user.accessLevel === 'read' && 'Read Only'}
                        {user.accessLevel === 'write' && 'Can Edit Entries'}
                        {user.accessLevel === 'admin' && 'Full Access'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  {editingUser === user.email ? (
                    <div className="flex items-center mr-2">
                      <select
                        value={editAccessLevel}
                        onChange={handleEditAccessLevelChange}
                        className="form-input text-sm py-1 mr-2"
                        disabled={isLoading}
                      >
                        <option value="read">Read Only</option>
                        <option value="write">Can Edit Entries</option>
                        <option value="admin">Full Access</option>
                      </select>
                      <button
                        onClick={updateUserAccess}
                        className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-md"
                        disabled={isLoading}
                        title="Save changes"
                      >
                        <FiSave />
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="p-1 text-dark-500 hover:text-dark-700 hover:bg-gray-100 rounded-md ml-1"
                        disabled={isLoading}
                        title="Cancel"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingUser(user.email, user.accessLevel)}
                      className="p-1 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-md mr-2"
                      disabled={isLoading}
                      title="Edit access level"
                    >
                      <FiEdit />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveUser(user.email)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                    disabled={isLoading}
                    title="Remove access"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCollectionForm; 