import mongoose, { Document, Schema, Types } from 'mongoose';

// Field types
export type FieldType = 'text' | 'number' | 'date' | 'rating' | 'time';

// Access level types
export type AccessLevel = 'read' | 'write' | 'admin';

// Field interface
export interface IField {
  name: string;
  type: FieldType;
}

// Shared user interface
export interface ISharedUser {
  email: string;
  accessLevel: AccessLevel;
  userId?: Types.ObjectId; // Optional as the user might not exist yet
}

// Entry interface (dynamic based on fields)
export interface IEntry {
  [key: string]: string | number | Date;
}

// Collection interface
export interface ICollection {
  name: string;
  user: Types.ObjectId;
  fields: IField[];
  entries: IEntry[];
  sharedWith: ISharedUser[];
}

// Collection document interface for Mongoose
export interface ICollectionDocument extends ICollection, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Field schema
const fieldSchema = new Schema<IField>(
  {
    name: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'rating', 'time'],
      required: [true, 'Field type is required'],
    },
  },
  { _id: false }
);

// Shared user schema
const sharedUserSchema = new Schema<ISharedUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { _id: false }
);

// Collection schema
const collectionSchema = new Schema<ICollectionDocument>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fields: {
      type: [fieldSchema],
      required: [true, 'At least one field is required'],
      validate: {
        validator: function(fields: IField[]) {
          return fields.length > 0;
        },
        message: 'Collection must have at least one field',
      },
    },
    entries: [{}],
    sharedWith: {
      type: [sharedUserSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Collection model
export const Collection = mongoose.model<ICollectionDocument>('Collection', collectionSchema); 