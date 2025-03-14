import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/user';
import { Collection } from '../models/collection';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data_playground_dev';

async function initDevDatabase() {
  console.log('Initializing development database...');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Collection.deleteMany({});
    console.log('Collections cleared');

    // Create a test user
    console.log('Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    });
    await testUser.save();
    console.log('Test user created with email: test@example.com and password: password123');

    // Create a sample collection
    console.log('Creating sample collection...');
    const sampleCollection = new Collection({
      name: 'Sample Collection',
      description: 'A sample collection for development',
      owner: testUser._id,
      fields: [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'isActive', type: 'boolean' }
      ],
      entries: [
        { name: 'John Doe', age: 30, isActive: true },
        { name: 'Jane Smith', age: 25, isActive: false },
        { name: 'Bob Johnson', age: 40, isActive: true }
      ]
    });
    await sampleCollection.save();
    console.log('Sample collection created');

    console.log('Development database initialized successfully!');
    console.log('You can now log in with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error initializing development database:', error);
    process.exit(1);
  }
}

// Run the initialization
initDevDatabase(); 