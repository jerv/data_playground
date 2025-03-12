# Data Playground

A personal data management tool that allows users to create custom collections with dynamic fields and manage entries within those collections.

## Project Overview

Data Playground is a React-based web application that enables users to:

1. Create and manage custom data collections with different field types (text, number, date)
2. Add, edit, and delete entries within collections
3. Manage their user profile
4. Authenticate securely

The application uses modern React patterns including hooks, context API, and TypeScript for type safety.

## Project Structure

```
webapp/
├── public/                 # Static assets
│   ├── index.html          # HTML entry point
│   ├── manifest.json       # Web app manifest
│   └── favicon.ico         # Favicon
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Login.tsx       # Login form
│   │   ├── Register.tsx    # Registration form
│   │   ├── Profile.tsx     # User profile management
│   │   ├── CollectionList.tsx    # List of collections
│   │   ├── CollectionForm.tsx    # Create/edit collection form
│   │   ├── CollectionDetail.tsx  # Collection details view
│   │   ├── CollectionEdit.tsx    # Edit collection page
│   │   ├── EntryForm.tsx         # Create/edit entry form
│   │   ├── EntryFormExample.tsx  # Example usage of EntryForm
│   │   └── NotFound.tsx          # 404 page
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   └── useCollection.ts # Collection management hook
│   ├── services/           # API services
│   │   └── api.ts          # API client
│   ├── types/              # TypeScript type definitions
│   │   ├── user.ts         # User-related types
│   │   └── collection.ts   # Collection-related types
│   ├── App.tsx             # Main application component
│   ├── index.js            # JavaScript entry point
│   └── index.css           # Global styles
├── package.json            # NPM dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Key Components

### Authentication

- **Login.tsx**: Handles user login with email/password
- **Register.tsx**: Handles new user registration
- **Profile.tsx**: Allows users to view and update their profile information
- **useAuth.ts**: Custom hook that provides authentication state and methods

### Collection Management

- **CollectionList.tsx**: Displays all user collections with options to create, edit, and delete
- **CollectionForm.tsx**: Form for creating and editing collections
- **CollectionDetail.tsx**: Displays collection details and entries
- **CollectionEdit.tsx**: Page for editing an existing collection
- **useCollection.ts**: Custom hook that provides collection state and CRUD operations

### Entry Management

- **EntryForm.tsx**: Dynamic form for creating and editing entries based on collection fields
- **EntryFormExample.tsx**: Example component showing how to use EntryForm

## Data Models

### User

```typescript
interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Collection

```typescript
type FieldType = 'text' | 'number' | 'date';

interface Field {
  name: string;
  type: FieldType;
}

interface Entry {
  [key: string]: string | number | Date;
}

interface Collection {
  id: string;
  name: string;
  fields: Field[];
  entries?: Entry[];
  entriesCount?: number;
}
```

## Hooks

### useAuth

Provides authentication functionality:

```typescript
const { 
  authState,          // Current authentication state
  login,              // Function to log in
  register,           // Function to register
  logout,             // Function to log out
  updateProfile       // Function to update user profile
} = useAuth();
```

### useCollection

Provides collection management functionality:

```typescript
const {
  collectionState,    // Current collection state
  fetchCollections,   // Function to fetch all collections
  fetchCollection,    // Function to fetch a single collection
  createCollection,   // Function to create a collection
  updateCollection,   // Function to update a collection
  deleteCollection,   // Function to delete a collection
  addEntry,           // Function to add an entry
  updateEntry,        // Function to update an entry
  deleteEntry         // Function to delete an entry
} = useCollection();
```

## Styling

The application uses Tailwind CSS for styling with custom utility classes defined in `index.css`:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`: Button styles
- `.card`, `.card-hover`: Card container styles
- `.form-input`, `.form-label`, `.form-error`: Form element styles
- `.table-*`: Table styles for displaying entries

## Running the Project

To run the project locally:

1. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

To build the project for production:

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Troubleshooting WSL Issues

If you encounter issues running the app in WSL:

1. Make sure you're using WSL2 (check with `wsl -l -v`)
2. Configure npm to use bash: `echo "script-shell=/bin/bash" > ~/.npmrc`
3. Ensure your .bashrc doesn't have syntax errors
4. Run from the correct directory: `cd ~/code_projects/data_playground/webapp`

## Next Steps

Potential improvements for the project:

1. Add data visualization features
2. Implement data import/export functionality
3. Add collaboration features for sharing collections
4. Enhance the mobile experience
5. Add more field types (e.g., boolean, array, object) 