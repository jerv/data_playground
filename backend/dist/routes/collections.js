"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const collection_1 = require("../models/collection");
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
const entrySchema = zod_1.z.record(zod_1.z.string(), zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.date(),
    zod_1.z.number().min(0).max(5),
    zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
]));
// Apply authentication middleware to all collection routes
router.use(auth_1.authenticate);
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
// Get all collections for the current user
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const skip = (page - 1) * limit;
        // Build query with optional search filter
        const query = { user: req.user?._id };
        // Add search filter if provided
        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
        }
        // Get total count for pagination info
        const totalCount = await collection_1.Collection.countDocuments(query);
        // Get paginated collections
        const collections = await collection_1.Collection.find(query)
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error fetching collections',
        });
    }
});
// Get a single collection by ID
router.get('/:id', async (req, res) => {
    try {
        const collection = await collection_1.Collection.findOne({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error fetching collection',
        });
    }
});
// Update a collection
router.put('/:id', async (req, res) => {
    try {
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
        // Find collection
        const collection = await collection_1.Collection.findOne({
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
        const result = await collection_1.Collection.deleteOne({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error deleting collection',
        });
    }
});
// Add an entry to a collection
router.post('/:id/entries', async (req, res) => {
    try {
        // Find collection
        const collection = await collection_1.Collection.findOne({
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
        return res.status(500).json({
            success: false,
            message: 'Server error adding entry',
        });
    }
});
// Update an entry in a collection
router.put('/:id/entries/:entryIndex', async (req, res) => {
    try {
        // Find collection
        const collection = await collection_1.Collection.findOne({
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
        return res.status(500).json({
            success: false,
            message: 'Server error updating entry',
        });
    }
});
// Delete an entry from a collection
router.delete('/:id/entries/:entryIndex', async (req, res) => {
    try {
        // Find collection
        const collection = await collection_1.Collection.findOne({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error deleting entry',
        });
    }
});
exports.default = router;
