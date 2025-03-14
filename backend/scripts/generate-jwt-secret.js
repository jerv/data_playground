/**
 * This script generates a secure random JWT secret
 * Run it with: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate a secure random string for JWT_SECRET
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate a new JWT secret
const newSecret = generateJwtSecret();

console.log('\n=== JWT Secret Generator ===\n');
console.log('New JWT Secret:');
console.log(newSecret);
console.log('\nCopy this value and set it as JWT_SECRET in your Render.com environment variables.');
console.log('Instructions:');
console.log('1. Go to your Render.com dashboard');
console.log('2. Select your backend service');
console.log('3. Click on "Environment" in the left sidebar');
console.log('4. Add or update the JWT_SECRET environment variable with the value above');
console.log('5. Click "Save Changes" and select "Save and Deploy"\n');

// Also check the current JWT_SECRET from .env if available
try {
  require('dotenv').config();
  const currentSecret = process.env.JWT_SECRET;
  
  if (currentSecret) {
    console.log('Current JWT_SECRET from .env file:');
    console.log(currentSecret);
    console.log('\nMake sure to use the SAME secret in both your local environment and Render.com');
    console.log('Otherwise, tokens generated locally won\'t work in production and vice versa.\n');
  }
} catch (error) {
  console.log('Could not read current JWT_SECRET from .env file.');
} 