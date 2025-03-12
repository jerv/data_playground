import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDatabase, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import CollectionForm from './CollectionForm';

const CollectionList: React.FC = () => {
  const { fetchCollections, deleteCollection, collectionState } = useCollection();
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleDelete = async (id: string) => {
    await deleteCollection(id);
    setConfirmDelete(null);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark-800">My Collections</h1>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            New Collection
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <CollectionForm onCancel={() => setShowForm(false)} />
          </div>
        )}

        {collectionState.isLoading && !showForm ? (
          <div className="flex justify-center py-12">
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
        ) : collectionState.collections.length === 0 && !showForm ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FiDatabase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-dark-800">No collections yet</h3>
            <p className="mt-1 text-dark-500">
              Get started by creating your first collection.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center"
              >
                <FiPlus className="mr-2" />
                Create Collection
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {collectionState.collections.map(collection => (
              <motion.div
                key={collection.id}
                variants={item}
                className="card card-hover"
              >
                {confirmDelete === collection.id ? (
                  <div className="p-4 bg-red-50 rounded-md mb-4">
                    <p className="text-red-800 font-medium mb-3">
                      Are you sure you want to delete this collection?
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDelete(collection.id)}
                        className="btn-danger flex-1"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-dark-800 mb-2">
                        {collection.name}
                      </h2>
                      <div className="flex space-x-1">
                        <Link
                          to={`/collections/${collection.id}/edit`}
                          className="p-2 text-dark-500 hover:text-primary-600 hover:bg-gray-100 rounded-md"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(collection.id)}
                          className="p-2 text-dark-500 hover:text-red-600 hover:bg-gray-100 rounded-md"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-dark-500 text-sm">
                        {collection.fields.length} field{collection.fields.length !== 1 ? 's' : ''}
                        {' • '}
                        {collection.entriesCount || 0} entr{collection.entriesCount !== 1 ? 'ies' : 'y'}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="mb-7">
                        <p className="text-xs text-dark-500 uppercase font-medium mb-1">
                          Fields
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {collection.fields.map((field, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
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

                      <Link
                        to={`/collections/${collection.id}`}
                        className="btn-primary w-full text-center"
                      >
                        View Collection
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CollectionList; 