import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiPlus } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import { Field, Entry } from '../types/collection';
import StarRating from './StarRating';

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
      if (field.type === 'number' || field.type === 'rating') {
        acc[field.name] = field.type === 'rating' ? 0 : '';
      } else if (field.type === 'time') {
        acc[field.name] = '';
      } else {
        acc[field.name] = '';
      }
      return acc;
    }, {} as Entry)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldName: string, fieldType: string, value: string | number) => {
    let processedValue: string | number = value;
    
    // Process value based on field type
    if (fieldType === 'number' && typeof value === 'string' && value !== '') {
      processedValue = Number(value);
    } else if (fieldType === 'rating' && typeof value === 'number') {
      processedValue = value;
    } else if (fieldType === 'time' && typeof value === 'string') {
      // Ensure time format is valid
      processedValue = value;
    }
    
    console.log(`Field change: ${fieldName} (${fieldType}) = ${processedValue}`);
    
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
      } else if (field.type === 'rating') {
        // Rating is optional, but if provided must be a number between 0-5
        if (value !== '' && value !== undefined) {
          const ratingValue = Number(value);
          if (isNaN(ratingValue)) {
            newErrors[field.name] = `${field.name} must be a number`;
          } else if (ratingValue < 0 || ratingValue > 5) {
            newErrors[field.name] = `${field.name} must be between 0 and 5`;
          }
        }
      } else if (field.type === 'time') {
        if (!value || String(value).trim() === '') {
          newErrors[field.name] = `${field.name} is required`;
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(String(value))) {
          newErrors[field.name] = `${field.name} must be in format HH:MM`;
        }
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
      
      // Process data based on field types
      fields.forEach(field => {
        if (field.type === 'date' && processedData[field.name]) {
          processedData[field.name] = new Date(processedData[field.name]);
        } else if (field.type === 'number' && processedData[field.name] === '') {
          // Convert empty string to 0 for number fields
          processedData[field.name] = 0;
        } else if (field.type === 'rating' && (processedData[field.name] === '' || processedData[field.name] === undefined)) {
          // Ensure rating is a number
          processedData[field.name] = 0;
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

  // Helper function to render field guidance text
  const renderFieldGuidance = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return <p className="text-xs text-gray-500 mt-1">Enter any text value</p>;
      case 'number':
        return <p className="text-xs text-gray-500 mt-1">Enter a numeric value</p>;
      case 'date':
        return <p className="text-xs text-gray-500 mt-1">Select a date from the calendar</p>;
      case 'time':
        return <p className="text-xs text-gray-500 mt-1">Enter time in 24-hour format (HH:MM)</p>;
      case 'rating':
        return <p className="text-xs text-gray-500 mt-1">Click on stars to set rating (0-5)</p>;
      default:
        return null;
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
            <div key={index} className="mb-2">
              <label htmlFor={field.name} className="form-label flex items-center">
                {field.name}
                <span className="ml-2 text-xs text-gray-500 italic">({field.type})</span>
              </label>
              
              {field.type === 'text' && (
                <div>
                  <input
                    type="text"
                    id={field.name}
                    value={formData[field.name] as string}
                    onChange={e => handleChange(field.name, field.type, e.target.value)}
                    className={`form-input ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter text"
                  />
                  {renderFieldGuidance(field.type)}
                </div>
              )}
              
              {field.type === 'number' && (
                <div>
                  <input
                    type="number"
                    id={field.name}
                    value={formData[field.name] as number}
                    onChange={e => handleChange(field.name, field.type, e.target.value)}
                    className={`form-input ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter a number"
                    step="any"
                  />
                  {renderFieldGuidance(field.type)}
                </div>
              )}
              
              {field.type === 'date' && (
                <div>
                  <input
                    type="date"
                    id={field.name}
                    value={formData[field.name] as string}
                    onChange={e => handleChange(field.name, field.type, e.target.value)}
                    className={`form-input ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {renderFieldGuidance(field.type)}
                </div>
              )}
              
              {field.type === 'time' && (
                <div>
                  <input
                    type="time"
                    id={field.name}
                    value={formData[field.name] as string}
                    onChange={e => handleChange(field.name, field.type, e.target.value)}
                    className={`form-input ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="HH:MM"
                  />
                  {renderFieldGuidance(field.type)}
                </div>
              )}
              
              {field.type === 'rating' && (
                <div className={`p-2 rounded-md ${errors[field.name] ? 'border border-red-500' : 'border border-gray-200'}`}>
                  <StarRating
                    value={Number(formData[field.name]) || 0}
                    onChange={value => handleChange(field.name, field.type, value)}
                    disabled={collectionState.isLoading}
                  />
                  {renderFieldGuidance(field.type)}
                </div>
              )}
              
              {errors[field.name] && (
                <p className="form-error">{errors[field.name]}</p>
              )}
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