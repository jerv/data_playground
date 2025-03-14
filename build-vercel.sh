#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build webapp
echo "Building webapp..."
cd webapp
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm install
npm run build
cd ..

echo "Build completed successfully!" 