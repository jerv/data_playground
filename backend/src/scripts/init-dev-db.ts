import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/user';
import { Collection, FieldType } from '../models/collection';
import bcrypt from 'bcrypt';

// Force override MongoDB URI for development
process.env.MONGODB_URI = 'mongodb://localhost:27017/dev_playground_completely_separate';

// Load environment variables (after overriding)
dotenv.config();

console.log('==== INITIALIZING DEVELOPMENT DATABASE ====');
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('===========================================');

const MONGODB_URI = 'mongodb://localhost:27017/dev_playground_completely_separate';

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
      user: testUser._id,
      fields: [
        { name: 'name', type: 'text' as FieldType },
        { name: 'age', type: 'number' as FieldType },
        { name: 'rating', type: 'rating' as FieldType }
      ],
      entries: [
        { name: 'John Doe', age: 30, rating: 5 },
        { name: 'Jane Smith', age: 25, rating: 3 },
        { name: 'Bob Johnson', age: 40, rating: 4 }
      ],
      sharedWith: []
    });
    await sampleCollection.save();
    console.log('Sample collection created');

    // Create another sample collection
    console.log('Creating another sample collection...');
    const anotherCollection = new Collection({
      name: 'Task List',
      user: testUser._id,
      fields: [
        { name: 'task', type: 'text' as FieldType },
        { name: 'dueDate', type: 'date' as FieldType },
        { name: 'priority', type: 'rating' as FieldType }
      ],
      entries: [
        { task: 'Complete project', dueDate: new Date('2023-12-31'), priority: 5 },
        { task: 'Review code', dueDate: new Date('2023-12-15'), priority: 4 },
        { task: 'Update documentation', dueDate: new Date('2023-12-20'), priority: 3 }
      ],
      sharedWith: []
    });
    await anotherCollection.save();
    console.log('Second sample collection created');

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