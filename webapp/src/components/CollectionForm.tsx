import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { useCollection } from '../hooks/useCollection';
import { Field, FieldType } from '../types/collection';

interface CollectionFormProps {
  isEditing?: boolean;
  collectionId?: string;
  initialData?: {
    name: string;
    fields: Field[];
  };
  onCancel?: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
  isEditing = false,
  collectionId,
  initialData,
  onCancel,
}) => {
  const { createCollection, updateCollection, collectionState } = useCollection();
  const [name, setName] = useState(initialData?.name || '');
  const [fields, setFields] = useState<Field[]>(
    initialData?.fields || [{ name: '', type: 'text' }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleFieldNameChange = (index: number, value: string) => {
    const updatedFields = [...fields];
    updatedFields[index].name = value;
    setFields(updatedFields);
    
    if (errors[`field-${index}`]) {
      setErrors(prev => ({ ...prev, [`field-${index}`]: '' }));
    }
  };

  const handleFieldTypeChange = (index: number, value: FieldType) => {
    const updatedFields = [...fields];
    updatedFields[index].type = value;
    setFields(updatedFields);
  };

  const addField = () => {
    setFields([...fields, { name: '', type: 'text' }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const updatedFields = [...fields];
      updatedFields.splice(index, 1);
      setFields(updatedFields);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Collection name is required';
    }
    
    fields.forEach((field, index) => {
      if (!field.name.trim()) {
        newErrors[`field-${index}`] = 'Field name is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const data = {
        name,
        fields: fields.map(field => ({
          name: field.name.trim(),
          type: field.type,
        })),
      };
      
      if (isEditing && collectionId) {
        await updateCollection(collectionId, data);
      } else {
        await createCollection(data);
      }
      
      if (onCancel && !collectionState.error) {
        onCancel();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Collection' : 'Create New Collection'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="form-label">
            Collection Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className={`form-input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., Movie Ratings"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label mb-0">Fields</label>
            <button
              type="button"
              onClick={addField}
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
            >
              <FiPlus className="mr-1" />
              Add Field
            </button>
          </div>
          
          {fields.map((field, index) => (
            <div key={index} className="flex space-x-3 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={field.name}
                  onChange={e => handleFieldNameChange(index, e.target.value)}
                  className={`form-input ${
                    errors[`field-${index}`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Field name"
                />
                {errors[`field-${index}`] && (
                  <p className="form-error">{errors[`field-${index}`]}</p>
                )}
              </div>
              
              <div className="w-1/3">
                <select
                  value={field.type}
                  onChange={e => handleFieldTypeChange(index, e.target.value as FieldType)}
                  className="form-input"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  disabled={fields.length <= 1}
                  className={`p-2 rounded-md ${
                    fields.length <= 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                >
                  <FiTrash2 />
                </button>
              </div>
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
            ) : (
              <FiSave className="mr-2" />
            )}
            {collectionState.isLoading
              ? 'Saving...'
              : isEditing
              ? 'Update Collection'
              : 'Create Collection'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default CollectionForm; 