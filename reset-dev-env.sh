#!/bin/bash

# Reset Development Environment Script
echo "=== Resetting Development Environment ==="

# Stop any running MongoDB instances (if using local MongoDB)
echo "Stopping any running MongoDB instances..."
if command -v mongod &> /dev/null; then
    if pgrep mongod > /dev/null; then
        pkill mongod
        echo "MongoDB stopped"
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
else
    echo "MongoDB command not found, skipping start"
    echo "Make sure your MongoDB instance is running"
fi

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
npm run init-dev-db

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
echo "=== Development Environment Reset Complete ==="
echo ""
echo "IMPORTANT: Before testing, please clear your browser data:"
echo "1. Open your browser's developer tools (F12)"
echo "2. Go to Application tab → Storage → Clear site data"
echo "3. This will remove any stored tokens that might be connecting to production"
echo ""
echo "To start the development environment:"
echo "1. In one terminal: cd backend && npm run dev"
echo "2. In another terminal: cd webapp && npm start"
echo ""
echo "You can log in with:"
echo "Email: test@example.com"
echo "Password: password123" 