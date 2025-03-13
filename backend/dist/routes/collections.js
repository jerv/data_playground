"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const collection_1 = require("../models/collection");
const user_1 = require("../models/user");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation schemas using Zod
const fieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Field name is required').refine(name => name.trim().length > 0, { message: 'Field name cannot be empty' }),
    type: zod_1.z.enum(['text', 'number', 'date', 'rating', 'time'], {
        errorMap: () => ({ message: 'Invalid field type. Must be one of: text, number, date, rating, time' })
    }),
});
// Log the valid field types to help with debugging
console.log('Valid field types:', ['text', 'number', 'date', 'rating', 'time']);
const collectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Collection name is required'),
    fields: zod_1.z.array(fieldSchema).min(1, 'At least one field is required').refine(fields => {
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
    }, { message: 'Field names must be unique (case-insensitive)' }),
});
const shareSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    accessLevel: zod_1.z.enum(['read', 'write', 'admin'], {
        errorMap: () => ({ message: 'Invalid access level. Must be one of: read, write, admin' })
    }),
});
const entrySchema = zod_1.z.record(zod_1.z.string(), zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.date(),
    zod_1.z.number().min(0).max(5),
    zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
]));
// Apply authentication middleware to all collection routes
router.use(auth_1.authenticate);
// Test route to check if the backend is working
router.get('/test', async (req, res) => {
    try {
        console.log('Test route hit');
        return res.status(200).json({
            success: true,
            message: 'Backend is working correctly',
            user: req.user?._id
        });
    }
    catch (error) {
        console.error('Error in test route:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in test route',
        });
    }
});
// Delete all collections for the current user
router.delete('/all', async (req, res) => {
    try {
        console.log('DELETE /all route hit');
        const userId = req.user?._id;
        if (!userId) {
            console.error('No user ID found in request. User object:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User authentication failed. Unable to delete collections.',
            });
        }
        console.log(`Attempting to delete all collections for user ${userId}`);
        // Only delete collections owned by the current user
        const result = await collection_1.Collection.deleteMany({ user: userId });
        console.log(`Delete result:`, result);
        if (result.deletedCount === 0) {
            console.log('No collections found to delete');
            return res.status(200).json({
                success: true,
                message: 'No collections to delete',
            });
        }
        console.log(`Successfully deleted ${result.deletedCount} collections`);
        return res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} collections`,
        });
    }
    catch (error) {
        console.error('Error deleting all collections:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deleting all collections',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Delete all collections for the current user (alternative route)
router.delete('/delete-all', async (req, res) => {
    try {
        console.log('DELETE /delete-all route hit');
        const userId = req.user?._id;
        if (!userId) {
            console.error('No user ID found in request. User object:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User authentication failed. Unable to delete collections.',
            });
        }
        console.log('User ID:', userId);
        // Only delete collections owned by the current user
        const result = await collection_1.Collection.deleteMany({ user: userId });
        console.log('Delete result:', result);
        if (result.deletedCount === 0) {
            console.log('No collections found to delete');
            return res.status(200).json({
                success: true,
                message: 'No collections to delete',
            });
        }
        console.log(`Successfully deleted ${result.deletedCount} collections`);
        return res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} collections`,
        });
    }
    catch (error) {
        console.error('Error deleting all collections:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deleting all collections',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Helper function to check if user has access to a collection
const checkCollectionAccess = async (collectionId, userId, requiredAccessLevel = 'read') => {
    const collection = await collection_1.Collection.findById(collectionId);
    if (!collection) {
        return { hasAccess: false, collection: null, message: 'Collection not found' };
    }
    // Owner has full access
    if (collection.user.toString() === userId) {
        return { hasAccess: true, collection, message: 'Owner access' };
    }
    // Check if user has shared access
    const sharedAccess = collection.sharedWith.find(shared => shared.userId?.toString() === userId ||
        shared.email.toLowerCase() === userId.toLowerCase());
    if (!sharedAccess) {
        return { hasAccess: false, collection, message: 'No access' };
    }
    // Check access level
    const accessLevels = {
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
router.post('/', async (req, res) => {
    try {
        console.log('Received collection creation request:', JSON.stringify(req.body, null, 2));
        console.log('Field types in request:', req.body.fields?.map((f) => ({ name: f.name, type: f.type })));
        // Validate request body
        try {
            const validatedData = collectionSchema.parse(req.body);
            console.log('Validation successful, validated data:', JSON.stringify(validatedData, null, 2));
            // Sanitize inputs
            const sanitizedData = {
                name: (0, mongo_sanitize_1.default)(validatedData.name),
                fields: validatedData.fields.map(field => ({
                    name: (0, mongo_sanitize_1.default)(field.name.trim()),
                    type: field.type,
                })),
                user: req.user?._id,
                sharedWith: [] // Initialize with empty shared users
            };
            console.log('Creating collection with sanitized data:', JSON.stringify(sanitizedData, null, 2));
            // Create new collection
            const collection = await collection_1.Collection.create(sanitizedData);
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
        }
        catch (validationError) {
            if (validationError instanceof zod_1.z.ZodError) {
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
    }
    catch (error) {
        console.error('Error creating collection:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error creating collection',
        });
    }
});
// Get all collections for the current user (including shared collections)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const skip = (page - 1) * limit;
        const userId = req.user?._id;
        const userEmail = req.user?.email.toLowerCase();
        // Build query for owned collections
        const ownedQuery = { user: userId };
        if (searchTerm) {
            ownedQuery.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
        }
        // Build query for shared collections
        const sharedQuery = {
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
        const ownedCount = await collection_1.Collection.countDocuments(ownedQuery);
        const sharedCount = await collection_1.Collection.countDocuments(sharedQuery);
        const totalCount = ownedCount + sharedCount;
        // Get all collections (both owned and shared) without pagination to sort them properly
        const ownedCollections = await collection_1.Collection.find(ownedQuery)
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();
        const sharedCollections = await collection_1.Collection.find(sharedQuery)
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();
        // Combine and sort all collections
        const allCollections = [
            ...ownedCollections.map(collection => ({
                ...collection,
                isOwner: true,
                accessLevel: 'admin'
            })),
            ...sharedCollections.map(collection => {
                const sharedInfo = collection.sharedWith.find(shared => shared.email === userEmail || (shared.userId && shared.userId.toString() === userId?.toString()));
                return {
                    ...collection,
                    isOwner: false,
                    accessLevel: sharedInfo?.accessLevel || 'read'
                };
            })
        ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Apply pagination after sorting
        const paginatedCollections = allCollections.slice(skip, skip + limit);
        return res.status(200).json({
            success: true,
            collections: paginatedCollections.map(collection => ({
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
    }
    catch (error) {
        console.error('Error fetching collections:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching collections',
        });
    }
});
// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user?.id;
        // Get total collections count
        const totalCollections = await collection_1.Collection.countDocuments({ user: userId });
        // Get total entries count across all collections
        const collections = await collection_1.Collection.find({ user: userId });
        const totalEntries = collections.reduce((sum, collection) => {
            return sum + (collection.entries?.length || 0);
        }, 0);
        // Get user creation date and last active date from the User model
        const user = await user_1.User.findById(userId);
        // Since we're using timestamps in the schema, these fields exist on the document
        // but TypeScript doesn't know about them, so we use type assertion
        const userCreatedAt = user ? user.createdAt : null;
        const userLastActive = user ? user.updatedAt : null;
        res.json({
            totalCollections,
            totalEntries,
            createdAt: userCreatedAt,
            lastActive: userLastActive
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
});
// Get a single collection by ID
router.get('/:id', async (req, res) => {
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
        let accessLevel = 'admin'; // Default for owner
        if (!isOwner) {
            const sharedInfo = collection.sharedWith.find(shared => shared.email.toLowerCase() === req.user?.email.toLowerCase() ||
                (shared.userId && shared.userId.toString() === userId));
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
    }
    catch (error) {
        console.error('Error fetching collection:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching collection',
        });
    }
});
// Update a collection
router.put('/:id', async (req, res) => {
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
            name: (0, mongo_sanitize_1.default)(validatedData.name),
            fields: validatedData.fields.map(field => ({
                name: (0, mongo_sanitize_1.default)(field.name),
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
router.delete('/:id', async (req, res) => {
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
        const result = await collection_1.Collection.deleteOne({ _id: req.params.id });
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
    }
    catch (error) {
        console.error('Error deleting collection:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deleting collection',
        });
    }
});
// Share a collection with a user
router.post('/:id/share', async (req, res) => {
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
        const email = (0, mongo_sanitize_1.default)(validatedData.email.toLowerCase());
        const accessLevel = validatedData.accessLevel;
        // Check if already shared with this email
        const alreadyShared = collection.sharedWith.find(shared => shared.email === email);
        if (alreadyShared) {
            // Update existing share
            alreadyShared.accessLevel = accessLevel;
        }
        else {
            // Add new share
            // Try to find user by email to link userId
            const user = await user_1.User.findOne({ email });
            // Create the shared user object with required fields
            const sharedUser = {
                email,
                accessLevel
            };
            // Only add userId if user exists
            if (user) {
                sharedUser.userId = user._id;
            }
            collection.sharedWith.push(sharedUser);
        }
        await collection.save();
        return res.status(200).json({
            success: true,
            message: `Collection shared with ${email} successfully`,
            sharedWith: collection.sharedWith,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
router.delete('/:id/share/:email', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error removing share access:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error removing share access',
        });
    }
});
// Get all users with whom the collection is shared
router.get('/:id/share', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching shared users:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching shared users',
        });
    }
});
// Add an entry to a collection
router.post('/:id/entries', async (req, res) => {
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
        const fieldValidators = {};
        collection.fields.forEach(field => {
            const fieldName = field.name;
            switch (field.type) {
                case 'text':
                    fieldValidators[fieldName] = zod_1.z.string();
                    break;
                case 'number':
                    fieldValidators[fieldName] = zod_1.z.number();
                    break;
                case 'date':
                    fieldValidators[fieldName] = zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
                        message: 'Invalid date format',
                    });
                    break;
                case 'rating':
                    fieldValidators[fieldName] = zod_1.z.number().min(0).max(5);
                    break;
                case 'time':
                    fieldValidators[fieldName] = zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
                        message: 'Time must be in format HH:MM',
                    });
                    break;
            }
        });
        const dynamicEntrySchema = zod_1.z.object(fieldValidators);
        // Validate and sanitize entry
        const validatedEntry = dynamicEntrySchema.parse(req.body);
        const sanitizedEntry = {};
        // Sanitize and convert values based on field types
        collection.fields.forEach(field => {
            const fieldName = field.name;
            const value = validatedEntry[fieldName];
            if (field.type === 'text' || field.type === 'time') {
                sanitizedEntry[fieldName] = (0, mongo_sanitize_1.default)(value);
            }
            else if (field.type === 'number' || field.type === 'rating') {
                sanitizedEntry[fieldName] = Number(value);
            }
            else if (field.type === 'date') {
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
router.put('/:id/entries/:entryIndex', async (req, res) => {
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
        const fieldValidators = {};
        collection.fields.forEach(field => {
            const fieldName = field.name;
            switch (field.type) {
                case 'text':
                    fieldValidators[fieldName] = zod_1.z.string();
                    break;
                case 'number':
                    fieldValidators[fieldName] = zod_1.z.number();
                    break;
                case 'date':
                    fieldValidators[fieldName] = zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
                        message: 'Invalid date format',
                    });
                    break;
                case 'rating':
                    fieldValidators[fieldName] = zod_1.z.number().min(0).max(5);
                    break;
                case 'time':
                    fieldValidators[fieldName] = zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
                        message: 'Time must be in format HH:MM',
                    });
                    break;
            }
        });
        const dynamicEntrySchema = zod_1.z.object(fieldValidators);
        // Validate and sanitize entry
        const validatedEntry = dynamicEntrySchema.parse(req.body);
        const sanitizedEntry = {};
        // Sanitize and convert values based on field types
        collection.fields.forEach(field => {
            const fieldName = field.name;
            const value = validatedEntry[fieldName];
            if (field.type === 'text' || field.type === 'time') {
                sanitizedEntry[fieldName] = (0, mongo_sanitize_1.default)(value);
            }
            else if (field.type === 'number' || field.type === 'rating') {
                sanitizedEntry[fieldName] = Number(value);
            }
            else if (field.type === 'date') {
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
router.delete('/:id/entries/:entryIndex', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting entry:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deleting entry',
        });
    }
});
exports.default = router;
