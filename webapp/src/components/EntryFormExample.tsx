import React, { useState } from 'react';
import { Field } from '../types/collection';
import EntryForm from './EntryForm';

const EntryFormExample: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  
  // Example collection ID
  const collectionId = 'example-collection-id';
  
  // Example fields for a "Task" collection
  const fields: Field[] = [
    { name: 'Title', type: 'text' },
    { name: 'Description', type: 'text' },
    { name: 'Priority', type: 'number' },
    { name: 'DueDate', type: 'date' }
  ];
  
  // Example initial data for editing (optional)
  const initialData = {
    Title: 'Complete project',
    Description: 'Finish the data playground project',
    Priority: 1,
    DueDate: '2023-03-15'
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Entry Form Example</h2>
      
      {!showForm ? (
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-primary"
          >
            Add New Entry
          </button>
          
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-secondary"
          >
            Edit Existing Entry
          </button>
        </div>
      ) : (
        <EntryForm
          collectionId={collectionId}
          fields={fields}
          entryIndex={null} // Set to a number for editing, null for adding
          initialData={initialData} // Optional, remove for adding new entry
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default EntryFormExample; 