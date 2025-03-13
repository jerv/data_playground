import express, { Request, Response } from 'express';
import { z } from 'zod';
import sanitize from 'mongo-sanitize';
import { Collection, IField, FieldType } from '../models/collection';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validation schemas using Zod
const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').refine(
    name => name.trim().length > 0,
    { message: 'Field name cannot be empty' }
  ),
  type: z.enum(['text', 'number', 'date', 'rating', 'time'] as const, {
    errorMap: () => ({ message: 'Invalid field type. Must be one of: text, number, date, rating, time' })
  }),
});

// Log the valid field types to help with debugging
console.log('Valid field types:', ['text', 'number', 'date', 'rating', 'time']);

const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required').refine(
    fields => {
      // Check for duplicate field names
      const fieldNames = new Set();
      return fields.every(field => {
        const name = field.name.toLowerCase().trim();
        if (fieldNames.has(name)) {
          return false;
        }
        fieldNames.add(name);
        return true;
      });
    },
    { message: 'Field names must be unique (case-insensitive)' }
  ),
});

const entrySchema = z.record(z.string(), z.union([
  z.string(),
  z.number(),
  z.date(),
  z.number().min(0).max(5),
  z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
]));

// Apply authentication middleware to all collection routes
router.use(authenticate);

// Create a new collection
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Received collection creation request:', JSON.stringify(req.body, null, 2));
    console.log('Field types in request:', req.body.fields?.map((f: any) => ({ name: f.name, type: f.type })));
    
    // Validate request body
    try {
      const validatedData = collectionSchema.parse(req.body);
      console.log('Validation successful, validated data:', JSON.stringify(validatedData, null, 2));
      
      // Sanitize inputs
      const sanitizedData = {
        name: sanitize(validatedData.name),
        fields: validatedData.fields.map(field => ({
          name: sanitize(field.name.trim()),
          type: field.type,
        })),
        user: req.user?._id,
      };

      console.log('Creating collection with sanitized data:', JSON.stringify(sanitizedData, null, 2));

      // Create new collection
      const collection = await Collection.create(sanitizedData);
      console.log('Collection created successfully:', collection);

      return res.status(201).json({
        success: true,
        message: 'Collection created successfully',
        collection: {
          id: collection._id,
          name: collection.name,
          fields: collection.fields,
          entriesCount: 0,
        },
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('Validation error details:', JSON.stringify(validationError.errors, null, 2));
        console.error('Validation error format issues:', validationError.format());
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationError.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error creating collection:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error creating collection',
    });
  }
});

// Get all collections for the current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.search as string || '';
    const skip = (page - 1) * limit;

    // Build query with optional search filter
    const query: any = { user: req.user?._id };
    
    // Add search filter if provided
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
    }

    // Get total count for pagination info
    const totalCount = await Collection.countDocuments(query);
    
    // Get paginated collections
    const collections = await Collection.find(query)
      .sort({ _id: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      collections: collections.map(collection => ({
        id: collection._id,
        name: collection.name,
        fields: collection.fields,
        entriesCount: collection.entries.length,
        createdAt: collection.createdAt,
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching collections',
    });
  }
});

// Get a single collection by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    return res.status(200).json({
      success: true,
      collection: {
        id: collection._id,
        name: collection.name,
        fields: collection.fields,
        entries: collection.entries,
        createdAt: collection.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching collection',
    });
  }
});

// Update a collection
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = collectionSchema.parse(req.body);
    
    // Sanitize inputs
    const sanitizedData = {
      name: sanitize(validatedData.name),
      fields: validatedData.fields.map(field => ({
        name: sanitize(field.name),
        type: field.type,
      })),
    };

    // Find collection
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    // Update collection
    collection.name = sanitizedData.name;
    collection.fields = sanitizedData.fields;
    await collection.save();

    return res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      collection: {
        id: collection._id,
        name: collection.name,
        fields: collection.fields,
        entriesCount: collection.entries.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error updating collection',
    });
  }
});

// Delete a collection
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await Collection.deleteOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting collection',
    });
  }
});

// Add an entry to a collection
router.post('/:id/entries', async (req: Request, res: Response) => {
  try {
    // Find collection
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    // Validate entry against collection fields
    const fieldValidators: Record<string, z.ZodType<any>> = {};
    
    collection.fields.forEach(field => {
      const fieldName = field.name;
      
      switch (field.type) {
        case 'text':
          fieldValidators[fieldName] = z.string();
          break;
        case 'number':
          fieldValidators[fieldName] = z.number();
          break;
        case 'date':
          fieldValidators[fieldName] = z.string().refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
          });
          break;
        case 'rating':
          fieldValidators[fieldName] = z.number().min(0).max(5);
          break;
        case 'time':
          fieldValidators[fieldName] = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
            message: 'Time must be in format HH:MM',
          });
          break;
      }
    });

    const dynamicEntrySchema = z.object(fieldValidators);
    
    // Validate and sanitize entry
    const validatedEntry = dynamicEntrySchema.parse(req.body);
    const sanitizedEntry: Record<string, any> = {};
    
    // Sanitize and convert values based on field types
    collection.fields.forEach(field => {
      const fieldName = field.name;
      const value = validatedEntry[fieldName];
      
      if (field.type === 'text' || field.type === 'time') {
        sanitizedEntry[fieldName] = sanitize(value);
      } else if (field.type === 'number' || field.type === 'rating') {
        sanitizedEntry[fieldName] = Number(value);
      } else if (field.type === 'date') {
        sanitizedEntry[fieldName] = new Date(value);
      }
    });

    // Add entry to collection
    collection.entries.push(sanitizedEntry);
    await collection.save();

    return res.status(201).json({
      success: true,
      message: 'Entry added successfully',
      entry: sanitizedEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error adding entry',
    });
  }
});

// Update an entry in a collection
router.put('/:id/entries/:entryIndex', async (req: Request, res: Response) => {
  try {
    // Find collection
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    const entryIndex = parseInt(req.params.entryIndex);
    
    if (isNaN(entryIndex) || entryIndex < 0 || entryIndex >= collection.entries.length) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found',
      });
    }

    // Validate entry against collection fields
    const fieldValidators: Record<string, z.ZodType<any>> = {};
    
    collection.fields.forEach(field => {
      const fieldName = field.name;
      
      switch (field.type) {
        case 'text':
          fieldValidators[fieldName] = z.string();
          break;
        case 'number':
          fieldValidators[fieldName] = z.number();
          break;
        case 'date':
          fieldValidators[fieldName] = z.string().refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
          });
          break;
        case 'rating':
          fieldValidators[fieldName] = z.number().min(0).max(5);
          break;
        case 'time':
          fieldValidators[fieldName] = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
            message: 'Time must be in format HH:MM',
          });
          break;
      }
    });

    const dynamicEntrySchema = z.object(fieldValidators);
    
    // Validate and sanitize entry
    const validatedEntry = dynamicEntrySchema.parse(req.body);
    const sanitizedEntry: Record<string, any> = {};
    
    // Sanitize and convert values based on field types
    collection.fields.forEach(field => {
      const fieldName = field.name;
      const value = validatedEntry[fieldName];
      
      if (field.type === 'text' || field.type === 'time') {
        sanitizedEntry[fieldName] = sanitize(value);
      } else if (field.type === 'number' || field.type === 'rating') {
        sanitizedEntry[fieldName] = Number(value);
      } else if (field.type === 'date') {
        sanitizedEntry[fieldName] = new Date(value);
      }
    });

    // Update entry
    collection.entries[entryIndex] = sanitizedEntry;
    await collection.save();

    return res.status(200).json({
      success: true,
      message: 'Entry updated successfully',
      entry: sanitizedEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error updating entry',
    });
  }
});

// Delete an entry from a collection
router.delete('/:id/entries/:entryIndex', async (req: Request, res: Response) => {
  try {
    // Find collection
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    const entryIndex = parseInt(req.params.entryIndex);
    
    if (isNaN(entryIndex) || entryIndex < 0 || entryIndex >= collection.entries.length) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found',
      });
    }

    // Remove entry
    collection.entries.splice(entryIndex, 1);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting entry',
    });
  }
});

export default router; 