import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiPlus } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import { Field, Entry } from '../types/collection';

interface EntryFormProps {
  collectionId: string;
  fields: Field[];
  entryIndex: number | null;
  initialData?: Entry;
  onCancel: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({
  collectionId,
  fields,
  entryIndex,
  initialData,
  onCancel,
}) => {
  const { addEntry, updateEntry, collectionState } = useCollection();
  const [formData, setFormData] = useState<Entry>(
    initialData || fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'number' ? 0 : '';
      return acc;
    }, {} as Entry)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldName: string, fieldType: string, value: string) => {
    let processedValue: string | number = value;
    
    // Convert to number if field type is number
    if (fieldType === 'number' && value !== '') {
      processedValue = Number(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: processedValue,
    }));
    
    // Clear error when user types
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.type === 'text' && (!value || String(value).trim() === '')) {
        newErrors[field.name] = `${field.name} is required`;
      } else if (field.type === 'number') {
        if (value === '' || value === undefined) {
          newErrors[field.name] = `${field.name} is required`;
        } else if (isNaN(Number(value))) {
          newErrors[field.name] = `${field.name} must be a number`;
        }
      } else if (field.type === 'date' && (!value || String(value).trim() === '')) {
        newErrors[field.name] = `${field.name} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Process data for submission
      const processedData: Entry = { ...formData };
      
      // Convert date strings to Date objects for the API
      fields.forEach(field => {
        if (field.type === 'date' && processedData[field.name]) {
          processedData[field.name] = new Date(processedData[field.name]);
        }
      });
      
      if (entryIndex !== null) {
        await updateEntry(collectionId, entryIndex, processedData);
      } else {
        await addEntry(collectionId, processedData);
      }
      
      if (!collectionState.error) {
        onCancel();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card"
    >
      <h3 className="text-xl font-bold mb-4">
        {entryIndex !== null ? 'Edit Entry' : 'Add New Entry'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {fields.map((field, index) => (
            <div key={index}>
              <label htmlFor={field.name} className="form-label">
                {field.name}
              </label>
              
              {field.type === 'text' && (
                <input
                  type="text"
                  id={field.name}
                  value={formData[field.name] as string}
                  onChange={e => handleChange(field.name, field.type, e.target.value)}
                  className={`form-input ${
                    errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
              )}
              
              {field.type === 'number' && (
                <input
                  type="number"
                  id={field.name}
                  value={formData[field.name] as number}
                  onChange={e => handleChange(field.name, field.type, e.target.value)}
                  className={`form-input ${
                    errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
              )}
              
              {field.type === 'date' && (
                <input
                  type="date"
                  id={field.name}
                  value={formData[field.name] as string}
                  onChange={e => handleChange(field.name, field.type, e.target.value)}
                  className={`form-input ${
                    errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
              )}
              
              {errors[field.name] && <p className="form-error">{errors[field.name]}</p>}
            </div>
          ))}
        </div>
        
        {collectionState.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {collectionState.error}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={collectionState.isLoading}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            {collectionState.isLoading ? (
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
            ) : entryIndex !== null ? (
              <FiSave className="mr-2" />
            ) : (
              <FiPlus className="mr-2" />
            )}
            {collectionState.isLoading
              ? 'Saving...'
              : entryIndex !== null
              ? 'Update Entry'
              : 'Add Entry'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex items-center justify-center"
          >
            <FiX className="mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EntryForm; 