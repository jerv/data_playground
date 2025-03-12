#!/bin/bash

# Check if nvm is installed
if [ ! -d "$HOME/.nvm" ]; then
  echo "Installing nvm (Node Version Manager)..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  
  # Load nvm
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  echo "nvm is already installed."
  # Load nvm
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node.js LTS version
echo "Installing Node.js LTS version..."
nvm install --lts
nvm use --lts

# Install MongoDB (if not already installed)
if ! command -v mongod &> /dev/null; then
  echo "MongoDB is not installed. Please install MongoDB manually."
  echo "Visit: https://www.mongodb.com/docs/manual/installation/"
  echo "Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
else
  echo "MongoDB is already installed."
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../webapp
npm install

echo "Environment setup complete!"
echo "To start the backend: cd backend && npm run dev"
echo "To start the frontend: cd webapp && npm start" 