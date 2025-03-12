import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Collection, CollectionFormData, Entry, CollectionState } from '../types/collection';
import { collectionsAPI } from '../services/api';

// Initial collection state
const initialState: CollectionState = {
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,
};

// Create context
export const CollectionContext = createContext<{
  collectionState: CollectionState;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<void>;
  createCollection: (data: CollectionFormData) => Promise<void>;
  updateCollection: (id: string, data: CollectionFormData) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addEntry: (collectionId: string, entry: Entry) => Promise<void>;
  updateEntry: (collectionId: string, entryIndex: number, entry: Entry) => Promise<void>;
  deleteEntry: (collectionId: string, entryIndex: number) => Promise<void>;
}>({
  collectionState: initialState,
  fetchCollections: async () => {},
  fetchCollection: async () => {},
  createCollection: async () => {},
  updateCollection: async () => {},
  deleteCollection: async () => {},
  addEntry: async () => {},
  updateEntry: async () => {},
  deleteEntry: async () => {},
});

// Collection provider component
export const CollectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [collectionState, setCollectionState] = useState<CollectionState>(initialState);

  // Fetch all collections
  const fetchCollections = useCallback(async () => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const { collections } = await collectionsAPI.getCollections();
      setCollectionState(prev => ({
        ...prev,
        collections,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch collections';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

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
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      const { collection } = await collectionsAPI.createCollection(data);
      setCollectionState(prev => ({
        ...prev,
        collections: [...prev.collections, collection],
        isLoading: false,
        error: null,
      }));
      toast.success('Collection created successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create collection';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update collection';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  // Delete a collection
  const deleteCollection = useCallback(async (id: string) => {
    try {
      setCollectionState(prev => ({ ...prev, isLoading: true }));
      await collectionsAPI.deleteCollection(id);
      
      setCollectionState(prev => {
        // Remove collection from state
        const updatedCollections = prev.collections.filter(c => c.id !== id);
        
        return {
          ...prev,
          collections: updatedCollections,
          currentCollection: prev.currentCollection?.id === id ? null : prev.currentCollection,
          isLoading: false,
          error: null,
        };
      });
      
      toast.success('Collection deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete collection';
      setCollectionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

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
        fetchCollection, 
        createCollection, 
        updateCollection, 
        deleteCollection, 
        addEntry, 
        updateEntry, 
        deleteEntry 
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