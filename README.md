# Data Playground Web Application

A React-based web application for managing collections and entries with a modern, type-safe architecture.

## 🚀 Features

- Collection management (Create, Read, Update, Delete)
- Entry management within collections
- Type-safe development with TypeScript
- Real-time notifications using React Hot Toast
- Context-based state management
- RESTful API integration
- User authentication and profile management
- Collection sharing and collaboration with customizable access levels
- Support for multiple field types (text, number, date, rating, time)

## 🛠️ Tech Stack

- React 18+
- TypeScript
- React Context API for state management
- React Hot Toast for notifications
- RESTful API integration
- JWT for authentication
- MongoDB with Mongoose for data storage
- Zod for validation

## 📋 Prerequisites

- Node.js (v16.x or higher recommended)
- npm or yarn package manager
- Git

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd data_playground/webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add necessary environment variables:
```bash
REACT_APP_API_URL=your_api_url_here
```

## 🚀 Running the Application

### Development Mode

```bash
npm start
# or
yarn start
```

This will start the development server on `http://localhost:3000`

### Production Build

```bash
npm run build
# or
yarn build
```

## 📁 Project Structure

```
webapp/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   │   ├── useCollection.tsx  # Collection management hook
│   │   └── useAuth.tsx        # Authentication hook
│   ├── services/      # API services
│   │   └── api.ts     # API integration
│   ├── types/         # TypeScript type definitions
│   │   ├── collection.ts
│   │   └── user.ts
│   └── App.tsx        # Root component
├── public/            # Static files
└── package.json       # Project dependencies and scripts
```

## 🔄 State Management

The application uses React Context API for state management. The main state providers are:

### Collection Provider
Manages:
- Collections list
- Current collection
- Loading states
- Error handling
- Collection sharing

### Auth Provider
Manages:
- User authentication state
- Login/logout functionality
- User profile data
- Token management

### Using the Collection Context

```typescript
import { useCollection } from '../hooks/useCollection';

function MyComponent() {
  const { 
    collectionState, 
    fetchCollections,
    createCollection,
    shareCollection,
    // ... other methods
  } = useCollection();
  
  // Use the context methods and state
}
```

### Using the Auth Context

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const {
    authState,
    login,
    register,
    logout,
    updateProfile
  } = useAuth();
  
  // Use the auth methods and state
}
```

## 🔌 API Integration

The application communicates with a backend API through various services:

### Collections API
- `GET /collections` - Fetch all collections
- `GET /collections/:id` - Fetch single collection
- `POST /collections` - Create collection
- `PUT /collections/:id` - Update collection
- `DELETE /collections/:id` - Delete collection
- `POST /collections/:id/entries` - Add entry
- `PUT /collections/:id/entries/:index` - Update entry
- `DELETE /collections/:id/entries/:index` - Delete entry
- `POST /collections/:id/share` - Share collection with a user
- `DELETE /collections/:id/share/:email` - Remove share access
- `GET /collections/:id/share` - Get all users with whom the collection is shared

### Auth API
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile
- `PATCH /auth/profile` - Update user profile

## 📊 Field Types

The application supports the following field types:

- **Text**: For storing text data like names, descriptions, etc.
- **Number**: For storing numerical values
- **Date**: For storing date values
- **Rating**: For storing rating values
- **Time**: For storing time values

## 👥 Collaboration Features

The application supports sharing collections with other users with different access levels:

- **Read**: Users can only view the collection and its entries
- **Write**: Users can view and modify entries, but cannot change collection structure
- **Admin**: Users have full control over the collection, including sharing with others

## 🧪 Development Guidelines

1. **Type Safety**
   - Always define TypeScript interfaces for your props and state
   - Use type inference where possible
   - Avoid using `any` type

2. **State Management**
   - Use the Collection context for collection-related state
   - Use the Auth context for authentication-related state
   - Utilize local state for component-specific data
   - Handle loading and error states appropriately

3. **Error Handling**
   - Use try-catch blocks for API calls
   - Display user-friendly error messages using toast notifications
   - Log errors appropriately

4. **Code Style**
   - Follow the existing project structure
   - Use functional components with hooks
   - Implement proper error boundaries
   - Write clean, self-documenting code

## 📝 License

[Your License Here]

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 