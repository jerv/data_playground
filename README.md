# Data Playground Web Application

A React-based web application for managing collections and entries with a modern, type-safe architecture.

## 🚀 Features

- Collection management (Create, Read, Update, Delete)
- Entry management within collections
- Type-safe development with TypeScript
- Real-time notifications using React Hot Toast
- Context-based state management
- RESTful API integration

## 🛠️ Tech Stack

- React 18+
- TypeScript
- React Context API for state management
- React Hot Toast for notifications
- RESTful API integration

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
│   │   └── useCollection.tsx  # Collection management hook
│   ├── services/      # API services
│   │   └── api.ts     # API integration
│   ├── types/         # TypeScript type definitions
│   │   └── collection.ts
│   └── App.tsx        # Root component
├── public/            # Static files
└── package.json       # Project dependencies and scripts
```

## 🔄 State Management

The application uses React Context API for state management. The main state provider is `CollectionProvider` which manages:

- Collections list
- Current collection
- Loading states
- Error handling

### Using the Collection Context

```typescript
import { useCollection } from '../hooks/useCollection';

function MyComponent() {
  const { 
    collectionState, 
    fetchCollections,
    createCollection,
    // ... other methods
  } = useCollection();
  
  // Use the context methods and state
}
```

## 🔌 API Integration

The application communicates with a backend API through the `collectionsAPI` service. Available endpoints:

- `GET /collections` - Fetch all collections
- `GET /collections/:id` - Fetch single collection
- `POST /collections` - Create collection
- `PUT /collections/:id` - Update collection
- `DELETE /collections/:id` - Delete collection
- `POST /collections/:id/entries` - Add entry
- `PUT /collections/:id/entries/:index` - Update entry
- `DELETE /collections/:id/entries/:index` - Delete entry

## 🧪 Development Guidelines

1. **Type Safety**
   - Always define TypeScript interfaces for your props and state
   - Use type inference where possible
   - Avoid using `any` type

2. **State Management**
   - Use the Collection context for collection-related state
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