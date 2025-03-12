import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import CollectionForm from './CollectionForm';

const CollectionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchCollection, collectionState } = useCollection();

  useEffect(() => {
    if (id) {
      fetchCollection(id);
    }
  }, [id, fetchCollection]);

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
            The collection you are trying to edit doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/playground')}
            className="btn-primary mt-6"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-dark-800 mb-6">Edit Collection</h1>
        <CollectionForm
          isEditing={true}
          collectionId={id}
          initialData={{
            name: collectionState.currentCollection.name,
            fields: collectionState.currentCollection.fields,
          }}
          onCancel={() => navigate(`/collections/${id}`)}
        />
      </div>
    </div>
  );
};

export default CollectionEdit; 