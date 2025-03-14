/**
 * Environment Variable Management Script
 * 
 * This script helps manage environment variables across different environments.
 * It can:
 * 1. Compare local and production environment variables
 * 2. Generate a template for setting variables in Render.com
 * 
 * Run with: node scripts/manage-env.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files
const loadEnvFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return dotenv.parse(fs.readFileSync(filePath));
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
  }
  return {};
};

// Root directory
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
const devEnv = loadEnvFile(path.join(rootDir, '.env'));
const prodEnvReference = loadEnvFile(path.join(rootDir, '.env.production'));

console.log('\n=== Environment Variable Manager ===\n');

// Compare environments
console.log('Comparing Development and Production Environment Variables:');
console.log('--------------------------------------------------------');

// Get all unique keys
const allKeys = [...new Set([
  ...Object.keys(devEnv),
  ...Object.keys(prodEnvReference)
])];

// Compare each key
allKeys.forEach(key => {
  const devValue = devEnv[key];
  const prodValue = prodEnvReference[key];
  
  console.log(`${key}:`);
  
  if (devValue && prodValue) {
    if (key === 'JWT_SECRET') {
      // For sensitive values, just show if they match
      const match = devValue === prodValue;
      console.log(`  Dev:  ${devValue.substring(0, 3)}... (${devValue.length} chars)`);
      console.log(`  Prod: ${prodValue.substring(0, 3)}... (${prodValue.length} chars)`);
      console.log(`  Match: ${match ? '✅ Yes' : '❌ No - Tokens will not work across environments!'}`);
    } else {
      console.log(`  Dev:  ${devValue}`);
      console.log(`  Prod: ${prodValue}`);
      console.log(`  Match: ${devValue === prodValue ? '✅ Yes' : '❌ No'}`);
    }
  } else if (devValue) {
    console.log(`  Dev:  ${key === 'JWT_SECRET' ? devValue.substring(0, 3) + '...' : devValue}`);
    console.log(`  Prod: ❌ Missing in production reference`);
  } else if (prodValue) {
    console.log(`  Dev:  ❌ Missing in development`);
    console.log(`  Prod: ${key === 'JWT_SECRET' ? prodValue.substring(0, 3) + '...' : prodValue}`);
  }
  
  console.log('');
});

// Generate Render.com setup instructions
console.log('\nRender.com Environment Variable Setup:');
console.log('------------------------------------');
console.log('Copy and paste these values into your Render.com dashboard:');
console.log('');

allKeys.forEach(key => {
  // Prefer production value, fall back to dev value
  const value = prodEnvReference[key] || devEnv[key] || '';
  console.log(`${key}=${value}`);
});

console.log('\nRemember to click "Save Changes" and select "Save and Deploy" after setting these variables.');
console.log('\nNote: For security, consider generating a new JWT_SECRET for production using:');
console.log('node scripts/generate-jwt-secret.js');
console.log('\nJust remember that if you change JWT_SECRET, all existing tokens will be invalidated,');
console.log('and users will need to log in again.'); 