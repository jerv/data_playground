// This file ensures we're using development settings
// Import this first in any file that connects to the database

process.env.MONGODB_URI = 'mongodb://localhost:27017/dev_playground_completely_separate';
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'dev_secret_key_for_testing';
process.env.REGISTRATION_CODE = 'welcome123';
process.env.PORT = '5000';

console.log('[Development Mode Forced] Using database:', process.env.MONGODB_URI); 