export type FieldType = 'text' | 'number' | 'date' | 'rating' | 'time';
export type AccessLevel = 'read' | 'write' | 'admin';

export interface Field {
  name: string;
  type: FieldType;
}

export interface SharedUser {
  email: string;
  accessLevel: AccessLevel;
  userId?: string;
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
  createdAt?: string;
  isOwner?: boolean;
  accessLevel?: AccessLevel;
  sharedWith?: SharedUser[];
}

export interface CollectionFormData {
  name: string;
  fields: Field[];
}

export interface ShareFormData {
  email: string;
  accessLevel: AccessLevel;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  searchTerm: string;
} 