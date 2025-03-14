#!/bin/bash

# Development Environment Setup Script
echo "=== Setting Up Development Environment ==="

# Check if MongoDB is running
echo "Checking if MongoDB is running..."
if command -v mongod &> /dev/null; then
    if ! pgrep mongod > /dev/null; then
        echo "MongoDB is not running. Starting MongoDB..."
        mongod --fork --logpath /tmp/mongodb.log --dbpath /data/db || echo "Failed to start MongoDB. Please start it manually."
    else
        echo "MongoDB is already running."
    fi
else
    echo "MongoDB command not found. Please ensure MongoDB is installed and running."
fi

# Initialize development database
echo "Initializing development database..."
cd backend
NODE_ENV=development node -r ts-node/register src/scripts/init-dev-db.ts

echo ""
echo "=== Development Environment Setup Complete ==="
echo ""
echo "To start the development servers:"
echo "1. In one terminal: cd backend && NODE_ENV=development npm run dev"
echo "2. In another terminal: cd webapp && npm start"
echo ""
echo "You can log in with:"
echo "Email: test@example.com"
echo "Password: password123"
echo ""
echo "Note: If you're still seeing production data, please clear your browser's localStorage:"
echo "1. Open your browser's developer tools (F12)"
echo "2. Go to Application tab → Storage → Local Storage"
echo "3. Right-click and select 'Clear'" 