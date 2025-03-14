#!/bin/bash
set -e

# Install dependencies for webapp
echo "Installing webapp dependencies..."
cd webapp
npm install

# Build webapp
echo "Building webapp..."
npm run build

# Install dependencies for backend
echo "Installing backend dependencies..."
cd ../backend
npm install

# Build backend
echo "Building backend..."
npm run build

# Return to root directory
cd ..

echo "Build completed successfully!" 