import mongoose, { Document, Schema, Types } from 'mongoose';

// Field types
export type FieldType = 'text' | 'number' | 'date';

// Field interface
export interface IField {
  name: string;
  type: FieldType;
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
}

// Collection document interface for Mongoose
export interface ICollectionDocument extends ICollection, Document {}

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
      enum: ['text', 'number', 'date'],
      required: [true, 'Field type is required'],
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
    entries: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Collection model
export const Collection = mongoose.model<ICollectionDocument>('Collection', collectionSchema); 