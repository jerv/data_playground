export type FieldType = 'text' | 'number' | 'date';

export interface Field {
  name: string;
  type: FieldType;
}

export interface Entry {
  [key: string]: string | number | Date;
}

export interface Collection {
  id: string;
  name: string;
  fields: Field[];
  entries?: Entry[];
  entriesCount?: number;
}

export interface CollectionFormData {
  name: string;
  fields: Field[];
}

export interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
} 