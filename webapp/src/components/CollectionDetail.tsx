import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiTrash2, FiPlus, FiUser, FiChevronDown } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import EntryForm from './EntryForm';
import StarRating from './StarRating';
import ShareCollectionForm from './ShareCollectionForm';
import Modal from './Modal';
import CollectionForm from './CollectionForm';

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCollection, deleteCollection, deleteEntry, collectionState } = useCollection();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<number | null>(null);
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (id) {
      fetchCollection(id);
    }
    
    // Debug logs
    console.log('Location state:', location.state);
    console.log('Location search:', location.search);
    
    // Check if we should open the share modal from location state
    if (location.state?.openShareModal) {
      console.log('Opening share modal from state');
      setShowShareModal(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true });
    }
    
    // Check if we should open the share modal from URL query parameter
    const searchParams = new URLSearchParams(location.search);
    console.log('Share param:', searchParams.get('share'));
    if (searchParams.get('share') === 'true') {
      console.log('Opening share modal from query parameter');
      setShowShareModal(true);
      // Clear the query parameter to prevent reopening on refresh
      setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [id, fetchCollection, location, navigate]);

  const handleDeleteEntry = async (entryIndex: number) => {
    if (id) {
      await deleteEntry(id, entryIndex);
      setConfirmDeleteEntry(null);
    }
  };

  const handleDeleteCollection = async () => {
    if (id) {
      await deleteCollection(id);
      if (!collectionState.error) {
        navigate('/playground');
      }
    }
  };

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(fieldName);
      setSortDirection('asc');
    }
  };

  const getSortedEntries = () => {
    if (!sortField) return entries;
    
    return [...entries].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Handle strings and other types
      const aString = String(aValue || '').toLowerCase();
      const bString = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (collectionState.isLoading && !collectionState.currentCollection) {
    return (
      <div className="flex-grow flex items-center justify-center">
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

  if (!collectionState.currentCollection) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-800">Collection not found</h2>
          <p className="text-dark-500 mt-2">
            The collection you are looking for doesn't exist or has been deleted.
          </p>
          <Link to="/playground" className="btn-primary inline-flex items-center mt-6">
            <FiArrowLeft className="mr-2" />
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const collection = collectionState.currentCollection;
  const entries = collection.entries || [];
  const isOwner = collection.isOwner === true;
  const canEdit = isOwner || collection.accessLevel === 'admin' || collection.accessLevel === 'write';
  const canShare = isOwner || collection.accessLevel === 'admin';

  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link
              to="/playground"
              className="mr-4 p-2 text-dark-500 hover:text-primary-600 hover:bg-gray-100 rounded-md"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-dark-800">{collection.name}</h1>
              <p className="text-dark-500 text-sm mt-1">Created: {formatDate(collection.createdAt)}</p>
              {!isOwner && (
                <p className="text-primary-600 text-sm mt-1">
                  Shared with you ({collection.accessLevel} access)
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {canShare && (
              <button
                onClick={() => setShowShareModal(true)}
                className="btn-secondary flex items-center"
              >
                <FiUser className="mr-2" />
                Share
              </button>
            )}
            {(isOwner || collection.accessLevel === 'admin') && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary flex items-center"
                >
                  <FiEdit className="mr-2" />
                  Edit Collection
                </button>
                {isOwner && (
                  <button
                    onClick={() => setConfirmDeleteCollection(true)}
                    className="btn-danger flex items-center"
                  >
                    <FiTrash2 className="mr-2" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {confirmDeleteCollection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-red-800 font-medium mb-3">
              Are you sure you want to delete this collection? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCollection}
                className="btn-danger flex-1"
              >
                Yes, Delete Collection
              </button>
              <button
                onClick={() => setConfirmDeleteCollection(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-dark-800 mb-2">Collection Fields</h2>
            <div className="flex flex-wrap gap-2">
              {collection.fields.map((field, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    field.type === 'text'
                      ? 'bg-blue-100 text-blue-800'
                      : field.type === 'number'
                      ? 'bg-green-100 text-green-800'
                      : field.type === 'date'
                      ? 'bg-purple-100 text-purple-800'
                      : field.type === 'time'
                      ? 'bg-indigo-100 text-indigo-800'
                      : field.type === 'rating'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {field.name}: {field.type}
                </span>
              ))}
            </div>
          </div>
          
          {/* Shared Users Section - Only visible to owner or admin */}
          {(isOwner || collection.accessLevel === 'admin') && collection.sharedWith && collection.sharedWith.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-dark-800 mb-3">Shared With</h2>
              <div className="space-y-2">
                {collection.sharedWith.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <span className="p-1 bg-primary-100 text-primary-600 rounded-full mr-2">
                        <FiUser size={16} />
                      </span>
                      <div>
                        <p className="text-dark-800 font-medium">{user.email}</p>
                        <p className="text-xs text-dark-500">
                          {user.accessLevel === 'read' && 'Read Only'}
                          {user.accessLevel === 'write' && 'Can Edit Entries'}
                          {user.accessLevel === 'admin' && 'Full Access'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark-800">
              Entries {entries.length > 0 && `(${entries.length})`}
            </h2>
            {canEdit && (
              <button
                onClick={() => {
                  setEditingEntryIndex(null);
                  setShowEntryForm(true);
                }}
                className="btn-primary flex items-center"
              >
                <FiPlus className="mr-2" />
                Add Entry
              </button>
            )}
          </div>

          {showEntryForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <EntryForm
                collectionId={id || ''}
                fields={collection.fields}
                entryIndex={editingEntryIndex}
                initialData={
                  editingEntryIndex !== null && entries[editingEntryIndex]
                    ? entries[editingEntryIndex]
                    : undefined
                }
                onCancel={() => {
                  setShowEntryForm(false);
                  setEditingEntryIndex(null);
                }}
              />
            </motion.div>
          )}

          {entries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-dark-500 mb-4">No entries yet. {canEdit ? 'Add your first entry to get started.' : 'The owner has not added any entries yet.'}</p>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingEntryIndex(null);
                    setShowEntryForm(true);
                  }}
                  className="btn-primary inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Add First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      {collection.fields.map((field, index) => (
                        <th 
                          key={index} 
                          className="table-header-cell cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort(field.name)}
                        >
                          <div className="flex items-center">
                            {field.name}
                            {sortField === field.name && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? 
                                  <FiChevronDown className="transform rotate-180" /> : 
                                  <FiChevronDown />
                                }
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      {canEdit && (
                        <th className="table-header-cell text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {getSortedEntries().map((entry, entryIndex) => (
                      <tr key={entryIndex} className="table-row table-row-zebra">
                        {collection.fields.map((field, fieldIndex) => (
                          <td key={fieldIndex} className="table-cell">
                            {field.type === 'date'
                              ? new Date(entry[field.name] as string).toLocaleDateString()
                              : field.type === 'rating'
                              ? <StarRating 
                                  value={Number(entry[field.name]) || 0} 
                                  disabled={true} 
                                  size={18}
                                  hideText={true}
                                />
                              : String(entry[field.name])}
                          </td>
                        ))}
                        {canEdit && (
                          <td className="table-cell text-right">
                            {confirmDeleteEntry === entryIndex ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleDeleteEntry(entryIndex)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteEntry(null)}
                                  className="text-dark-500 hover:text-dark-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingEntryIndex(entryIndex);
                                    setShowEntryForm(true);
                                  }}
                                  className="p-1 text-primary-600 hover:text-primary-800"
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteEntry(entryIndex)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Collection"
        maxWidth="max-w-xl"
      >
        <ShareCollectionForm
          collectionId={id || ''}
          onClose={() => setShowShareModal(false)}
        />
      </Modal>

      {/* Edit Collection Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Collection"
        >
          <CollectionForm
            isEditing={true}
            collectionId={id}
            initialData={{
              name: collection.name,
              fields: collection.fields,
            }}
            onCancel={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              fetchCollection(id!);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default CollectionDetail; 