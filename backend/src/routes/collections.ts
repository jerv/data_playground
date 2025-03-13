import express, { Request, Response } from 'express';
import { z } from 'zod';
import sanitize from 'mongo-sanitize';
import { Collection, IField, FieldType, AccessLevel } from '../models/collection';
import { User } from '../models/user';
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

const shareSchema = z.object({
  email: z.string().email('Invalid email address'),
  accessLevel: z.enum(['read', 'write', 'admin'] as const, {
    errorMap: () => ({ message: 'Invalid access level. Must be one of: read, write, admin' })
  }),
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

// Helper function to check if user has access to a collection
const checkCollectionAccess = async (
  collectionId: string, 
  userId: string, 
  requiredAccessLevel: AccessLevel = 'read'
) => {
  const collection = await Collection.findById(collectionId);
  
  if (!collection) {
    return { hasAccess: false, collection: null, message: 'Collection not found' };
  }
  
  // Owner has full access
  if (collection.user.toString() === userId) {
    return { hasAccess: true, collection, message: 'Owner access' };
  }
  
  // Check if user has shared access
  const sharedAccess = collection.sharedWith.find(shared => 
    shared.userId?.toString() === userId || 
    shared.email.toLowerCase() === userId.toLowerCase()
  );
  
  if (!sharedAccess) {
    return { hasAccess: false, collection, message: 'No access' };
  }
  
  // Check access level
  const accessLevels: { [key in AccessLevel]: number } = {
    'read': 1,
    'write': 2,
    'admin': 3
  };
  
  const hasRequiredAccess = accessLevels[sharedAccess.accessLevel] >= accessLevels[requiredAccessLevel];
  
  return { 
    hasAccess: hasRequiredAccess, 
    collection, 
    message: hasRequiredAccess ? `Has ${sharedAccess.accessLevel} access` : 'Insufficient access level'
  };
};

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
        sharedWith: [] // Initialize with empty shared users
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
          isOwner: true,
          accessLevel: 'admin',
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

// Get all collections for the current user (including shared collections)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.search as string || '';
    const skip = (page - 1) * limit;
    const userId = req.user?._id;
    const userEmail = req.user?.email.toLowerCase();

    // Build query for owned collections
    const ownedQuery: any = { user: userId };
    if (searchTerm) {
      ownedQuery.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
    }

    // Build query for shared collections
    const sharedQuery: any = {
      'sharedWith': {
        $elemMatch: {
          $or: [
            { email: userEmail },
            { userId: userId }
          ]
        }
      }
    };
    if (searchTerm) {
      sharedQuery.name = { $regex: searchTerm, $options: 'i' };
    }

    // Get total count for pagination info (both owned and shared)
    const ownedCount = await Collection.countDocuments(ownedQuery);
    const sharedCount = await Collection.countDocuments(sharedQuery);
    const totalCount = ownedCount + sharedCount;
    
    // Get paginated collections (both owned and shared)
    const ownedCollections = await Collection.find(ownedQuery)
      .sort({ _id: -1 }) // Sort by newest first
      .limit(limit)
      .lean();
    
    const sharedCollections = await Collection.find(sharedQuery)
      .sort({ _id: -1 }) // Sort by newest first
      .limit(limit)
      .lean();
    
    // Combine and sort collections
    const allCollections = [
      ...ownedCollections.map(collection => ({
        ...collection,
        isOwner: true,
        accessLevel: 'admin' as AccessLevel
      })),
      ...sharedCollections.map(collection => {
        const sharedInfo = collection.sharedWith.find(
          shared => shared.email === userEmail || (shared.userId && shared.userId.toString() === userId?.toString())
        );
        return {
          ...collection,
          isOwner: false,
          accessLevel: sharedInfo?.accessLevel || 'read' as AccessLevel
        };
      })
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      collections: allCollections.map(collection => ({
        id: collection._id,
        name: collection.name,
        fields: collection.fields,
        entriesCount: collection.entries.length,
        createdAt: collection.createdAt,
        isOwner: collection.isOwner,
        accessLevel: collection.accessLevel,
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
    console.error('Error fetching collections:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching collections',
    });
  }
});

// Get a single collection by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId);

    if (!hasAccess || !collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    // Determine if user is owner and access level
    const isOwner = collection.user.toString() === userId;
    let accessLevel: AccessLevel = 'admin'; // Default for owner
    
    if (!isOwner) {
      const sharedInfo = collection.sharedWith.find(
        shared => shared.email.toLowerCase() === req.user?.email.toLowerCase() || 
                 (shared.userId && shared.userId.toString() === userId)
      );
      accessLevel = sharedInfo?.accessLevel || 'read';
    }

    return res.status(200).json({
      success: true,
      collection: {
        id: collection._id,
        name: collection.name,
        fields: collection.fields,
        entries: collection.entries,
        createdAt: collection.createdAt,
        isOwner,
        accessLevel,
        sharedWith: isOwner ? collection.sharedWith : undefined, // Only send sharing info to owner
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching collection',
    });
  }
});

// Update a collection
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'admin');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this collection',
      });
    }

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
        isOwner: collection.user.toString() === userId,
        accessLevel: 'admin',
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
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'admin');

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this collection',
      });
    }

    // Only the owner can delete a collection
    if (collection?.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete a collection',
      });
    }

    const result = await Collection.deleteOne({ _id: req.params.id });

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
    console.error('Error deleting collection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting collection',
    });
  }
});

// Share a collection with a user
router.post('/:id/share', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'admin');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to share this collection',
      });
    }

    // Validate request body
    const validatedData = shareSchema.parse(req.body);
    
    // Sanitize inputs
    const email = sanitize(validatedData.email.toLowerCase());
    const accessLevel = validatedData.accessLevel;

    // Check if already shared with this email
    const alreadyShared = collection.sharedWith.find(shared => shared.email === email);
    
    if (alreadyShared) {
      // Update existing share
      alreadyShared.accessLevel = accessLevel;
    } else {
      // Add new share
      // Try to find user by email to link userId
      const user = await User.findOne({ email });
      
      collection.sharedWith.push({
        email,
        accessLevel,
        userId: user?._id
      });
    }
    
    await collection.save();

    return res.status(200).json({
      success: true,
      message: `Collection shared with ${email} successfully`,
      sharedWith: collection.sharedWith,
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

    console.error('Error sharing collection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error sharing collection',
    });
  }
});

// Remove share access for a user
router.delete('/:id/share/:email', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'admin');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify sharing for this collection',
      });
    }

    const email = req.params.email.toLowerCase();
    
    // Remove share access
    collection.sharedWith = collection.sharedWith.filter(shared => shared.email !== email);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: `Share access removed for ${email}`,
      sharedWith: collection.sharedWith,
    });
  } catch (error) {
    console.error('Error removing share access:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing share access',
    });
  }
});

// Get all users with whom the collection is shared
router.get('/:id/share', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'admin');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view sharing for this collection',
      });
    }

    return res.status(200).json({
      success: true,
      sharedWith: collection.sharedWith,
    });
  } catch (error) {
    console.error('Error fetching shared users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching shared users',
    });
  }
});

// Add an entry to a collection
router.post('/:id/entries', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'write');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add entries to this collection',
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

    console.error('Error adding entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding entry',
    });
  }
});

// Update an entry in a collection
router.put('/:id/entries/:entryIndex', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'write');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update entries in this collection',
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

    console.error('Error updating entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating entry',
    });
  }
});

// Delete an entry from a collection
router.delete('/:id/entries/:entryIndex', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();
    const { hasAccess, collection, message } = await checkCollectionAccess(req.params.id, userId, 'write');

    if (!hasAccess || !collection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete entries from this collection',
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
    console.error('Error deleting entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting entry',
    });
  }
});

export default router; 