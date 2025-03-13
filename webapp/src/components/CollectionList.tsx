import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDatabase, FiEdit, FiTrash2, FiPlus, FiMoreVertical, FiGrid, FiList, FiX, FiUser } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import CollectionForm from './CollectionForm';
import Modal from './Modal';
import ShareCollectionForm from './ShareCollectionForm';

const CollectionList: React.FC = () => {
  const { fetchCollections, setSearchTerm, deleteCollection, collectionState } = useCollection();
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(collectionState.searchTerm);
  const [sharingCollectionId, setSharingCollectionId] = useState<string | null>(null);
  const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Maximum number of fields to display before truncating
  const MAX_FIELDS_TO_SHOW = 5;

  useEffect(() => {
    fetchCollections(1, true); // Reset and fetch first page on initial load
  }, [fetchCollections]);

  // Handle search input changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    
    // Clear any existing timeout
    if (searchDebounceTimeout.current) {
      clearTimeout(searchDebounceTimeout.current);
    }
    
    // Set a new timeout for debouncing
    searchDebounceTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      fetchCollections(1, true, value);
    }, 300); // 300ms debounce
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchTerm('');
    fetchCollections(1, true, '');
  };

  // Implement infinite scrolling with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting && 
          !collectionState.isLoading && 
          !isLoadingMore && 
          collectionState.pagination?.hasMore
        ) {
          setIsLoadingMore(true);
          const nextPage = (collectionState.pagination?.page || 1) + 1;
          await fetchCollections(nextPage);
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [
    collectionState.isLoading, 
    collectionState.pagination?.hasMore, 
    collectionState.pagination?.page, 
    fetchCollections, 
    isLoadingMore
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside any dropdown menu
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.menu-trigger')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async (id: string) => {
    await deleteCollection(id);
    setConfirmDelete(null);
  };

  const toggleMenu = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleShareCollection = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    setSharingCollectionId(id);
    setOpenMenuId(null);
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

  // Render field badges with truncation
  const renderFieldBadges = (fields: any[], maxToShow = MAX_FIELDS_TO_SHOW) => {
    const visibleFields = fields.slice(0, maxToShow);
    const remainingCount = fields.length - maxToShow;
    
    return (
      <>
        {visibleFields.map((field, index) => (
          <span
            key={index}
            className={`text-xs px-2 py-1 rounded-full ${
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
        {remainingCount > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            +{remainingCount} more
          </span>
        )}
      </>
    );
  };

  // Render collection in card view
  const renderCardView = (collection: any) => (
    <motion.div
      key={collection.id}
      variants={item}
      className="card card-hover flex flex-col h-full relative"
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
          <Link 
            to={`/collections/${collection.id}`}
            className="absolute inset-0 z-0 rounded-lg"
            aria-label={`View ${collection.name} collection`}
          />
          <div className="flex flex-col h-full w-full relative z-10 pointer-events-none">
            <div className="flex justify-between items-start">
              <div className="hover:text-primary-600 transition-colors duration-200 pointer-events-none">
                <h2 className="text-xl font-bold text-dark-800 mb-2 truncate max-w-[200px]" title={collection.name}>
                  {collection.name}
                </h2>
              </div>
              <div className="relative pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu(collection.id, e);
                  }}
                  className="p-2 text-dark-500 hover:text-primary-600 hover:bg-gray-100 rounded-md menu-trigger"
                >
                  <FiMoreVertical />
                </button>
                {openMenuId === collection.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 dropdown-menu">
                    <Link
                      to={`/collections/${collection.id}/edit`}
                      className="flex items-center px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 hover:text-primary-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                      }}
                    >
                      <FiEdit className="mr-2" />
                      Edit Collection
                    </Link>
                    {(collection.isOwner || collection.accessLevel === 'admin') && (
                      <Link
                        to="#"
                        className="flex items-center px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 hover:text-primary-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShareCollection(collection.id, e);
                        }}
                      >
                        <FiUser className="mr-2" />
                        Share Collection
                      </Link>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDelete(collection.id);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 hover:text-red-600"
                    >
                      <FiTrash2 className="mr-2" />
                      Delete Collection
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4 pointer-events-none">
              <p className="text-dark-500 text-sm">
                {collection.fields.length} field{collection.fields.length !== 1 ? 's' : ''}
                {' • '}
                {collection.entriesCount || 0} entr{collection.entriesCount !== 1 ? 'ies' : 'y'}
              </p>
              <p className="text-dark-500 text-sm mt-1">
                Created: {formatDate(collection.createdAt)}
              </p>
            </div>

            <div className="flex-grow pointer-events-none">
              <div className="border-t border-gray-200 pt-4">
                <div>
                  <p className="text-xs text-dark-500 uppercase font-medium mb-1">
                    Fields
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {renderFieldBadges(collection.fields)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  // Render collection in list view
  const renderListView = (collection: any) => (
    <motion.div
      key={collection.id}
      variants={item}
      className="bg-white rounded-lg shadow-sm p-4"
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
        <div className="flex items-center justify-between">
          <div className="flex-grow overflow-hidden">
            <div className="flex items-center">
              <Link 
                to={`/collections/${collection.id}`}
                className="hover:text-primary-600 transition-colors duration-200"
              >
                <h2 className="text-lg font-bold text-dark-800 truncate max-w-[250px]" title={collection.name}>
                  {collection.name}
                </h2>
              </Link>
              <p className="text-dark-500 text-sm ml-4 whitespace-nowrap">
                {collection.fields.length} field{collection.fields.length !== 1 ? 's' : ''}
                {' • '}
                {collection.entriesCount || 0} entr{collection.entriesCount !== 1 ? 'ies' : 'y'}
              </p>
            </div>
            
            <div className="flex items-center mt-1">
              <p className="text-dark-500 text-xs">
                Created: {formatDate(collection.createdAt)}
              </p>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2 max-w-full overflow-hidden">
              {renderFieldBadges(collection.fields, 3)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4 shrink-0">
            <Link
              to={`/collections/${collection.id}`}
              className="btn-outline text-sm px-4 py-2"
            >
              View
            </Link>
            
            <div className="relative">
              <button
                onClick={(e) => toggleMenu(collection.id, e)}
                className="p-2 text-dark-500 hover:text-primary-600 hover:bg-gray-100 rounded-md menu-trigger"
              >
                <FiMoreVertical />
              </button>
              {openMenuId === collection.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 dropdown-menu">
                  <Link
                    to={`/collections/${collection.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 hover:text-primary-600"
                    onClick={() => setOpenMenuId(null)}
                  >
                    <FiEdit className="mr-2" />
                    Edit Collection
                  </Link>
                  {(collection.isOwner || collection.accessLevel === 'admin') && (
                    <Link
                      to="#"
                      className="flex items-center px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 hover:text-primary-600"
                      onClick={(e) => handleShareCollection(collection.id, e)}
                    >
                      <FiUser className="mr-2" />
                      Share Collection
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setConfirmDelete(collection.id);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 hover:text-red-600"
                  >
                    <FiTrash2 className="mr-2" />
                    Delete Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-800">My Collections</h1>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-white rounded-md shadow-sm p-1 flex">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-md mr-1 ${
                  viewMode === 'card'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-dark-500 hover:bg-gray-100'
                }`}
                title="Card View"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-dark-500 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <FiList />
              </button>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              New Collection
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-6 w-full">
          <div className="relative max-w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-400"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              value={searchInputValue}
              onChange={handleSearchChange}
              placeholder="Search collections by name..."
              className="form-input pl-10 pr-10 w-full text-sm sm:text-base"
              aria-label="Search collections"
            />
            {searchInputValue && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Modal for collection form */}
        <Modal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)}
          title={`Create New Collection`}
        >
          <CollectionForm onCancel={() => setShowForm(false)} />
        </Modal>

        {/* Modal for sharing collection */}
        <Modal
          isOpen={sharingCollectionId !== null}
          onClose={() => setSharingCollectionId(null)}
          title="Share Collection"
          maxWidth="max-w-xl"
        >
          {sharingCollectionId && (
            <ShareCollectionForm
              collectionId={sharingCollectionId}
              onClose={() => setSharingCollectionId(null)}
            />
          )}
        </Modal>

        {collectionState.isLoading && collectionState.collections.length === 0 && !showForm ? (
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
            <h3 className="mt-2 text-lg font-medium text-dark-800">
              {collectionState.searchTerm 
                ? `No collections found matching "${collectionState.searchTerm}"` 
                : "No collections yet"}
            </h3>
            <p className="mt-1 text-dark-500">
              {collectionState.searchTerm 
                ? "Try a different search term or create a new collection." 
                : "Get started by creating your first collection."}
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              {collectionState.searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="btn-secondary inline-flex items-center"
                >
                  <FiX className="mr-2" />
                  Clear Search
                </button>
              )}
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
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={viewMode === 'card' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "flex flex-col space-y-4"
              }
            >
              {collectionState.collections.map(collection => 
                viewMode === 'card' 
                  ? renderCardView(collection) 
                  : renderListView(collection)
              )}
            </motion.div>
            
            {/* Infinite scroll observer target */}
            <div 
              ref={observerTarget} 
              className="h-10 w-full flex justify-center items-center mt-8"
            >
              {(isLoadingMore || (collectionState.isLoading && collectionState.collections.length > 0)) && (
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
              )}
              {!collectionState.pagination?.hasMore && collectionState.collections.length > 0 && (
                <p className="text-dark-500 text-sm">
                  {collectionState.searchTerm 
                    ? `End of results for "${collectionState.searchTerm}"` 
                    : "No more collections to load"}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionList; 