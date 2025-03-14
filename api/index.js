// Serverless entry point for Vercel
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Import the compiled backend app
const app = require('../backend/dist/index').default;

// Export the Express app as a serverless function
module.exports = app; 