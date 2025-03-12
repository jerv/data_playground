import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import EntryForm from './EntryForm';

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchCollection, deleteCollection, deleteEntry, collectionState } = useCollection();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<number | null>(null);
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCollection(id);
    }
  }, [id, fetchCollection]);

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

  if (collectionState.isLoading && !collectionState.currentCollection) {
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

  if (!collectionState.currentCollection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
            <h1 className="text-2xl md:text-3xl font-bold text-dark-800">{collection.name}</h1>
          </div>
          
          <div className="flex space-x-3">
            <Link
              to={`/collections/${id}/edit`}
              className="btn-secondary flex items-center"
            >
              <FiEdit className="mr-2" />
              Edit Collection
            </Link>
            <button
              onClick={() => setConfirmDeleteCollection(true)}
              className="btn-danger flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
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
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {field.name}: {field.type}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark-800">
              Entries {entries.length > 0 && `(${entries.length})`}
            </h2>
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
              <p className="text-dark-500 mb-4">No entries yet. Add your first entry to get started.</p>
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
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      {collection.fields.map((field, index) => (
                        <th key={index} className="table-header-cell">
                          {field.name}
                        </th>
                      ))}
                      <th className="table-header-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {entries.map((entry, entryIndex) => (
                      <tr key={entryIndex} className="table-row table-row-zebra">
                        {collection.fields.map((field, fieldIndex) => (
                          <td key={fieldIndex} className="table-cell">
                            {field.type === 'date'
                              ? new Date(entry[field.name] as string).toLocaleDateString()
                              : String(entry[field.name])}
                          </td>
                        ))}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail; 