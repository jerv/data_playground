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
      
      if (match) {
        console.log(`  Match: ✅ Yes - Same secret in both environments`);
        console.log(`  Note: For better security, consider using different JWT secrets in each environment.`);
      } else {
        console.log(`  Match: ❌ No - Different secrets in each environment (more secure)`);
        console.log(`  Note: This means tokens generated in one environment won't work in the other.`);
      }
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
  // Special handling for JWT_SECRET
  if (key === 'JWT_SECRET') {
    console.log(`${key}=<your-secure-production-secret>`);
    console.log('# Note: For security, use a different JWT_SECRET in production than in development');
    console.log('# Generate one with: node scripts/generate-jwt-secret.js');
  } else {
    // Prefer production value, fall back to dev value
    const value = prodEnvReference[key] || devEnv[key] || '';
    console.log(`${key}=${value}`);
  }
});

console.log('\nRemember to click "Save Changes" and select "Save and Deploy" after setting these variables.');

// Security recommendations
console.log('\n=== Security Recommendations ===');
console.log('1. Use different JWT_SECRET values in development and production');
console.log('   - This is more secure but means tokens won\'t work across environments');
console.log('   - Users will need to log in again when moving between environments');
console.log('2. Use a strong, randomly generated secret for production');
console.log('   - Generate one with: node scripts/generate-jwt-secret.js');
console.log('3. Never commit your actual JWT secrets to Git');
console.log('4. Use a secure MongoDB connection string with proper authentication'); 