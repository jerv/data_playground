import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Collection, CollectionFormData, Entry, CollectionState, PaginationInfo, ShareFormData, SharedUser } from '../types/collection';
import { collectionsAPI } from '../services/api';

// Initial pagination state
const initialPagination: PaginationInfo = {
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
  hasMore: false
};

// Initial collection state
const initialState: CollectionState = {
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,
  pagination: initialPagination,
  searchTerm: ''
};

// Create context
export const CollectionContext = createContext<{
  collectionState: CollectionState;
  fetchCollections: (page?: number, reset?: boolean, search?: string) => Promise<void>;
  setSearchTerm: (search: string) => void;
  fetchCollection: (id: string) => Promise<void>;
  createCollection: (data: CollectionFormData) => Promise<boolean>;
  updateCollection: (id: string, data: CollectionFormData) => Promise<boolean>;
  deleteCollection: (id: string) => Promise<void>;
  deleteAllCollections: () => Promise<boolean>;
  getUserStats: () => Promise<any>;
  shareCollection: (id: string, data: ShareFormData) => Promise<SharedUser[] | null>;
  getSharedUsers: (id: string) => Promise<SharedUser[] | null>;
  removeSharedUser: (id: string, email: string) => Promise<SharedUser[] | null>;
  addEntry: (collectionId: string, entry: Entry) => Promise<void>;
  updateEntry: (collectionId: string, entryIndex: number, entry: Entry) => Promise<void>;
  deleteEntry: (collectionId: string, entryIndex: number) => Promise<void>;
}>({
  collectionState: initialState,
  fetchCollections: async () => {},
  setSearchTerm: () => {},
  fetchCollection: async () => {},
  createCollection: async () => false,
  updateCollection: async () => false,
  deleteCollection: async () => {},
  deleteAllCollections: async () => false,
  getUserStats: async () => ({}),
  shareCollection: async () => null,
  getSharedUsers: async () => null,
  removeSharedUser: async () => null,
  addEntry: async () => {},
  updateEntry: async () => {},
  deleteEntry: async () => {},
});

// Collection provider component
export const CollectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [collectionState, setCollectionState] = useState<CollectionState>(initialState);

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (collectionState.isLoading) {
      timeoutId = setTimeout(() => {
        console.log('Collection loading timeout triggered, resetting loading state');
        setCollectionState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: prev.error || 'Operation timed out. Please try again.'
        }));
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [collectionState.isLoading]);

  // Set search term
  const setSearchTerm = useCallback((search: string) => {
    setCollectionState(prev => ({
      ...prev,
      searchTerm: search
    }));
  }, []);

  // Fetch collections with pagination and search
  const fetchCollections = useCallback(async (page = 1, reset = false, search?: string) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      
      // Use provided search term or the one from state
      const searchTerm = search !== undefined ? search : collectionState.searchTerm;
      
      // Use the current pagination limit or the default
      const limit = collectionState.pagination?.limit || initialPagination.limit;
      
      // Add a timeout to the API call
      const timeoutPromise = new Promise<{ collections: any[], pagination: any }>((_, reject) => 
        setTimeout(() => reject(new Error('Collections fetch timed out')), 5000)
      );
      
      // Sort by newest first (createdAt in descending order)
      const sort = 'createdAt:desc';
      
      const collectionsPromise = collectionsAPI.getCollections(page, limit, searchTerm, sort);
      
      // Race between the API call and the timeout
      const response = await Promise.race([collectionsPromise, timeoutPromise]);
      
      console.log('Fetch collections response:', response);
      
      // Ensure we have pagination data with defaults if missing
      const pagination = response.pagination || {
        ...initialPagination,
        page,
        hasMore: false
      };
      
      setCollectionState(prev => {
        // If reset is true or it's the first page, replace collections
        // Otherwise append new collections to the existing ones
        const updatedCollections = page === 1 || reset
          ? response.collections || []
          : [...prev.collections, ...(response.collections || [])];
          
        return {
          ...prev,
          collections: updatedCollections,
          pagination,
          isLoading: false,
          error: null,
          // Update search term if explicitly provided
          searchTerm: search !== undefined ? search : prev.searchTerm
        };
      });
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to fetch collections';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        // Keep existing pagination data on error
        pagination: prev.pagination,
        // On error, ensure we have at least an empty array for collections if none exist
        collections: prev.collections.length ? prev.collections : []
      }));
      
      // Only show toast for non-timeout errors to avoid spamming the user
      if (!errorMessage.includes('timed out')) {
        toast.error(errorMessage);
      }
    }
  }, [collectionState.searchTerm, collectionState.pagination?.limit]);

  // Fetch a single collection
  const fetchCollection = useCallback(async (id: string) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const { collection } = await collectionsAPI.getCollection(id);
      setCollectionState(prev => ({
        ...prev,
        currentCollection: collection,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch collection';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  // Create a new collection
  const createCollection = useCallback(async (data: CollectionFormData) => {
    console.log('useCollection: Creating collection with data:', JSON.stringify(data, null, 2));
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Ensure field names are trimmed and field types are valid
      const processedData = {
        ...data,
        fields: data.fields.map(field => ({
          name: field.name.trim(),
          type: field.type
        }))
      };
      
      console.log('useCollection: Processed data:', JSON.stringify(processedData, null, 2));
      
      const { collection } = await collectionsAPI.createCollection(processedData);
      console.log('useCollection: Collection created successfully:', collection);
      
      // Add the new collection to the state and ensure it's at the top (newest first)
      setCollectionState(prev => {
        // Add the new collection to the beginning of the array since we're sorting by newest first
        const updatedCollections = [collection, ...prev.collections];
        
        return {
          ...prev,
          collections: updatedCollections,
          isLoading: false,
          error: null,
        };
      });
      
      toast.success('Collection created successfully');
      return true;
    } catch (error: any) {
      console.error('useCollection: Error creating collection:', error);
      console.error('useCollection: Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create collection';
      
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        // Format validation errors
        errorMessage = error.response.data.errors.map((err: any) => {
          // Make field path more user-friendly
          let fieldName = err.field;
          if (fieldName.startsWith('fields.') && fieldName.includes('.type')) {
            const index = parseInt(fieldName.split('.')[1]);
            const fieldLabel = data.fields[index]?.name || `Field ${index + 1}`;
            return `${fieldLabel}: ${err.message}`;
          }
          return `${err.field}: ${err.message}`;
        }).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Update a collection
  const updateCollection = useCallback(async (id: string, data: CollectionFormData) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const { collection } = await collectionsAPI.updateCollection(id, data);
      
      setCollectionState(prev => {
        // Update collections array
        const updatedCollections = prev.collections.map(c => 
          c.id === id ? collection : c
        );
        
        return {
          ...prev,
          collections: updatedCollections,
          currentCollection: collection,
          isLoading: false,
          error: null,
        };
      });
      
      toast.success('Collection updated successfully');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update collection';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Delete a collection
  const deleteCollection = useCallback(async (id: string) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      await collectionsAPI.deleteCollection(id);
      
      // Remove the deleted collection from state
      setCollectionState(prev => ({
        ...prev,
        collections: prev.collections.filter(collection => collection.id !== id),
        isLoading: false,
        error: null
      }));
      
      toast.success('Collection deleted successfully');
    } catch (error) {
      console.error('Error deleting collection:', error);
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to delete collection'
      }));
      toast.error('Failed to delete collection');
    }
  }, []);
  
  // Delete all collections
  const deleteAllCollections = useCallback(async () => {
    try {
      console.log('Starting deleteAllCollections in useCollection hook');
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      
      const response = await collectionsAPI.deleteAllCollections();
      console.log('deleteAllCollections response:', response);
      
      // Clear all collections from state
      setCollectionState(prev => ({
        ...prev,
        collections: [],
        isLoading: false,
        error: null
      }));
      
      toast.success('All collections deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error in useCollection.deleteAllCollections:', error);
      
      // Get a more specific error message if available
      let errorMessage = 'Failed to delete all collections';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Make sure to reset loading state
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      toast.error(errorMessage);
      return false;
    } finally {
      // Ensure loading state is reset no matter what
      setCollectionState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, []);
  
  // Get user stats
  const getUserStats = useCallback(async () => {
    try {
      const stats = await collectionsAPI.getUserStats();
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to fetch user statistics');
      return null;
    }
  }, []);

  // Share a collection with a user
  const shareCollection = useCallback(async (id: string, data: ShareFormData) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const response = await collectionsAPI.shareCollection(id, data);
      
      // Update current collection if it's the one being shared
      if (collectionState.currentCollection && collectionState.currentCollection.id === id) {
        setCollectionState(prev => ({
          ...prev,
          currentCollection: {
            ...prev.currentCollection!,
            sharedWith: response.sharedWith,
          },
          isLoading: false,
          error: null,
        }));
      } else {
        setCollectionState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      }
      
      toast.success(`Collection shared with ${data.email} successfully`);
      return response.sharedWith;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to share collection';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return null;
    }
  }, [collectionState.currentCollection]);

  // Get shared users for a collection
  const getSharedUsers = useCallback(async (id: string) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const response = await collectionsAPI.getSharedUsers(id);
      
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      
      return response.sharedWith;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get shared users';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Remove shared access for a user
  const removeSharedUser = useCallback(async (id: string, email: string) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const response = await collectionsAPI.removeSharedUser(id, email);
      
      // Update current collection if it's the one being modified
      if (collectionState.currentCollection && collectionState.currentCollection.id === id) {
        setCollectionState(prev => ({
          ...prev,
          currentCollection: {
            ...prev.currentCollection!,
            sharedWith: response.sharedWith,
          },
          isLoading: false,
          error: null,
        }));
      } else {
        setCollectionState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      }
      
      toast.success(`Share access removed for ${email}`);
      return response.sharedWith;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove shared access';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return null;
    }
  }, [collectionState.currentCollection]);

  // Add an entry to a collection
  const addEntry = useCallback(async (collectionId: string, entry: Entry) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const { entry: newEntry } = await collectionsAPI.addEntry(collectionId, entry);
      
      setCollectionState(prev => {
        // Update current collection if it's the one being modified
        if (prev.currentCollection && prev.currentCollection.id === collectionId) {
          const updatedCollection = {
            ...prev.currentCollection,
            entries: [...(prev.currentCollection.entries || []), newEntry],
          };
          
          return {
            ...prev,
            currentCollection: updatedCollection,
            isLoading: false,
            error: null,
          };
        }
        
        return {
          ...prev,
          isLoading: false,
          error: null,
        };
      });
      
      toast.success('Entry added successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add entry';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  // Update an entry in a collection
  const updateEntry = useCallback(async (collectionId: string, entryIndex: number, entry: Entry) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const { entry: updatedEntry } = await collectionsAPI.updateEntry(collectionId, entryIndex, entry);
      
      setCollectionState(prev => {
        // Update current collection if it's the one being modified
        if (prev.currentCollection && prev.currentCollection.id === collectionId) {
          const updatedEntries = [...(prev.currentCollection.entries || [])];
          updatedEntries[entryIndex] = updatedEntry;
          
          const updatedCollection = {
            ...prev.currentCollection,
            entries: updatedEntries,
          };
          
          return {
            ...prev,
            currentCollection: updatedCollection,
            isLoading: false,
            error: null,
          };
        }
        
        return {
          ...prev,
          isLoading: false,
          error: null,
        };
      });
      
      toast.success('Entry updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update entry';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  // Delete an entry from a collection
  const deleteEntry = useCallback(async (collectionId: string, entryIndex: number) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      await collectionsAPI.deleteEntry(collectionId, entryIndex);
      
      setCollectionState(prev => {
        // Update current collection if it's the one being modified
        if (prev.currentCollection && prev.currentCollection.id === collectionId) {
          const updatedEntries = [...(prev.currentCollection.entries || [])];
          updatedEntries.splice(entryIndex, 1);
          
          const updatedCollection = {
            ...prev.currentCollection,
            entries: updatedEntries,
          };
          
          return {
            ...prev,
            currentCollection: updatedCollection,
            isLoading: false,
            error: null,
          };
        }
        
        return {
          ...prev,
          isLoading: false,
          error: null,
        };
      });
      
      toast.success('Entry deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete entry';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        collectionState,
        fetchCollections,
        setSearchTerm,
        fetchCollection,
        createCollection,
        updateCollection,
        deleteCollection,
        deleteAllCollections,
        getUserStats,
        shareCollection,
        getSharedUsers,
        removeSharedUser,
        addEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

// Custom hook to use collection context
export const useCollection = () => {
  const context = useContext(CollectionContext);
  
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  
  return context;
}; 