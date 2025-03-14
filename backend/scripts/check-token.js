/**
 * JWT Token Validation Script
 * 
 * This script helps validate JWT tokens across different environments.
 * It can check if a token is valid in both development and production environments.
 * 
 * Run with: node scripts/check-token.js <token>
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get the token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error('Please provide a token to check.');
  console.error('Usage: node scripts/check-token.js <token>');
  process.exit(1);
}

console.log('\n=== JWT Token Validator ===\n');
console.log(`Token: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);

// Check with local JWT secret
const localSecret = process.env.JWT_SECRET || 'fallback_secret';
console.log('\nChecking with LOCAL environment JWT secret:');
console.log(`Secret (first 3 chars): ${localSecret.substring(0, 3)}...`);

try {
  const decodedLocal = jwt.verify(token, localSecret);
  console.log('✅ Token is VALID in LOCAL environment');
  console.log('Decoded payload:', JSON.stringify(decodedLocal, null, 2));
} catch (error) {
  console.log('❌ Token is INVALID in LOCAL environment');
  console.log('Error:', error.message);
}

// Ask for production secret if not provided
console.log('\nTo check if this token is valid in PRODUCTION:');
console.log('1. Go to your Render.com dashboard');
console.log('2. Find your JWT_SECRET environment variable');
console.log('3. Run this command with your production secret:');
console.log(`   JWT_PROD_SECRET=your_production_secret node scripts/check-token.js ${token}`);

// Check with production JWT secret if provided
const prodSecret = process.env.JWT_PROD_SECRET;
if (prodSecret) {
  console.log('\nChecking with PRODUCTION environment JWT secret:');
  console.log(`Secret (first 3 chars): ${prodSecret.substring(0, 3)}...`);
  
  try {
    const decodedProd = jwt.verify(token, prodSecret);
    console.log('✅ Token is VALID in PRODUCTION environment');
    console.log('Decoded payload:', JSON.stringify(decodedProd, null, 2));
  } catch (error) {
    console.log('❌ Token is INVALID in PRODUCTION environment');
    console.log('Error:', error.message);
  }
}

console.log('\n=== Recommendations ===');
if (localSecret === prodSecret) {
  console.log('⚠️ Your LOCAL and PRODUCTION secrets appear to be the same.');
  console.log('For better security, consider using different secrets in each environment.');
} else if (prodSecret) {
  console.log('✅ You are using different JWT secrets in LOCAL and PRODUCTION environments.');
  console.log('This is good for security, but means tokens generated in one environment');
  console.log('will not work in the other environment.');
}

console.log('\nFor a more secure setup:');
console.log('1. Generate a strong random secret for production:');
console.log('   node scripts/generate-jwt-secret.js');
console.log('2. Set this secret in your Render.com environment variables');
console.log('3. Keep your local secret different for development');
console.log('4. Be aware that users will need to log in again when moving between environments'); 