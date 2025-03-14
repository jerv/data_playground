#!/bin/bash

# COMPLETE RESET - Force complete reset of development environment
echo "===== FORCE RESETTING DEVELOPMENT ENVIRONMENT ====="

# Kill any running Node.js processes related to this project
echo "Killing any running Node.js processes..."
pkill -f "node.*data_playground" || echo "No matching Node.js processes found"
sleep 2

# Stop any running MongoDB instances
echo "Stopping any running MongoDB instances..."
if command -v mongod &> /dev/null; then
    if pgrep mongod > /dev/null; then
        pkill mongod
        echo "MongoDB stopped"
        sleep 2
    else
        echo "No running MongoDB instances found"
    fi
else
    echo "MongoDB command not found, skipping stop"
fi

# Start MongoDB (if using local MongoDB)
echo "Starting MongoDB..."
if command -v mongod &> /dev/null; then
    mongod --fork --logpath /tmp/mongodb.log --dbpath /data/db || echo "Failed to start MongoDB, it may already be running or you need to create the data directory"
    echo "MongoDB started"
    sleep 2
else
    echo "MongoDB command not found, skipping start"
    echo "Make sure your MongoDB instance is running"
fi

# Create completely new database name
NEW_DB_NAME="dev_playground_completely_separate"
echo "Using completely separate database: $NEW_DB_NAME"

# Drop the development database if it exists
echo "Dropping the development database if it exists..."
if command -v mongo &> /dev/null; then
    mongo $NEW_DB_NAME --eval "db.dropDatabase()" || echo "Failed to drop database"
    echo "Database dropped"
else
    echo "MongoDB client command not found, skipping database drop"
fi

# Create necessary directories
mkdir -p temp

# Update environment files
echo "Updating environment files..."

# Create a temporary .env file
cat > temp/.env.temp << EOL
# DEVELOPMENT ENVIRONMENT ONLY
# This overrides all other .env files

# Frontend environment variables
REACT_APP_API_URL=http://localhost:5000/api

# Backend environment variables
MONGODB_URI=mongodb://localhost:27017/$NEW_DB_NAME
JWT_SECRET=dev_secret_key_for_testing
PORT=5000
REGISTRATION_CODE=welcome123
EOL

# Update root .env file
cp temp/.env.temp .env
echo "Root .env file updated"

# Update backend .env file
cp temp/.env.temp backend/.env
echo "Backend .env file updated"

# Update webapp .env.development file
cat > webapp/.env.development << EOL
# Development environment variables for the frontend
# This points to your local backend ONLY
REACT_APP_API_URL=http://localhost:5000/api
EOL
echo "Frontend .env.development file updated"

# Create a file to force environmental isolation
cat > backend/src/force-development-mode.ts << EOL
// This file ensures we're using development settings
// Import this first in any file that connects to the database

process.env.MONGODB_URI = 'mongodb://localhost:27017/$NEW_DB_NAME';
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'dev_secret_key_for_testing';
process.env.REGISTRATION_CODE = 'welcome123';
process.env.PORT = '5000';

console.log('[Development Mode Forced] Using database:', process.env.MONGODB_URI);
EOL
echo "Development mode force file created"

# Update the index.ts file to use the force-development-mode
cat > backend/src/index.ts << EOL
// DEVELOPMENT MODE ENFORCED
import './force-development-mode'; // This must be first

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import collectionsRoutes from './routes/collections';

// Load environment variables (after forcing development mode)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Log requests (with environment info)
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next();
});

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/$NEW_DB_NAME';
console.log('==== CONNECTING TO MONGODB ====');
console.log('MongoDB URI:', mongoUri);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('==== END CONNECTION INFO ====');

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB database:', mongoUri);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: 'development',
    database: mongoUri
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Development server running on port \${PORT}\`);
});
EOL
echo "Index.ts file updated to force development mode"

# Navigate to backend directory
echo "Navigating to backend directory..."
cd backend || { echo "Backend directory not found"; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Initialize development database
echo "Initializing development database..."
ts-node src/scripts/init-dev-db.ts

# Navigate back to root
cd ..

# Navigate to webapp directory
echo "Navigating to webapp directory..."
cd webapp || { echo "Webapp directory not found"; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Clear browser cache instructions
echo ""
echo "=== DEVELOPMENT ENVIRONMENT FORCED RESET COMPLETE ==="
echo ""
echo "CRITICALLY IMPORTANT: YOU MUST CLEAR YOUR BROWSER DATA:"
echo "1. Open Chrome and press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "2. Set time range to 'All time'"
echo "3. Check 'Cookies and site data' and 'Cached images and files'"
echo "4. Click 'Clear data'"
echo "5. Close and reopen your browser"
echo ""
echo "To start the development environment:"
echo "1. In one terminal: cd backend && npm run dev"
echo "2. In another terminal: cd webapp && npm start"
echo ""
echo "You can log in with:"
echo "Email: test@example.com"
echo "Password: password123"

# Remove temp directory
rm -rf temp

echo ""
echo "If you're STILL seeing production data after this, please let me know"
echo "and I'll provide additional troubleshooting steps." 