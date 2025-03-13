"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const collection_1 = require("../models/collection");
const user_1 = require("../models/user");
// Load environment variables
dotenv_1.default.config();
// Field types
const fieldTypes = ['text', 'number', 'date'];
// Example field names by type
const fieldNamesByType = {
    text: [
        'Name', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Tags',
        'Location', 'Address', 'City', 'Country', 'Notes', 'Comments', 'Author',
        'Genre', 'Color', 'Size', 'Material', 'Brand', 'Model', 'SKU'
    ],
    number: [
        'Age', 'Price', 'Quantity', 'Rating', 'Score', 'Duration', 'Weight',
        'Height', 'Width', 'Length', 'Distance', 'Temperature', 'Percentage',
        'Count', 'ID', 'Year', 'Month', 'Day', 'Hour', 'Minute'
    ],
    date: [
        'Date', 'Created At', 'Updated At', 'Due Date', 'Start Date', 'End Date',
        'Birth Date', 'Expiry Date', 'Release Date', 'Delivery Date', 'Arrival Date'
    ]
};
// Example collection names
const collectionNames = [
    'Movies to Watch', 'Books I\'ve Read', 'Favorite Recipes', 'Travel Destinations',
    'Project Ideas', 'Workout Routines', 'Shopping List', 'Gift Ideas',
    'Home Inventory', 'Contacts', 'Meeting Notes', 'Expenses', 'Income Tracker',
    'Habit Tracker', 'Goals', 'Bucket List', 'Quotes', 'Jokes', 'Recipes',
    'Wine Collection', 'Beer Collection', 'Whiskey Collection', 'Coffee Notes',
    'Tea Collection', 'Plant Care', 'Pet Information', 'Medical Records',
    'Medication Tracker', 'Fitness Progress', 'Meal Plan', 'Grocery List',
    'Restaurant Reviews', 'Movie Reviews', 'Book Reviews', 'Product Reviews',
    'Subscription Tracker', 'Password Manager', 'Software Licenses', 'Warranty Information',
    'Vehicle Maintenance', 'Home Maintenance', 'Cleaning Schedule', 'Event Planning',
    'Birthday Tracker', 'Anniversary Tracker', 'Holiday Gift List', 'Packing List',
    'Learning Resources', 'Course Notes'
];
// Generate random text value
const generateTextValue = (fieldName) => {
    const textValues = {
        Name: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'David Brown'],
        Title: ['The Great Gatsby', 'To Kill a Mockingbird', 'Pride and Prejudice', '1984', 'The Catcher in the Rye'],
        Description: ['A fascinating story about...', 'An interesting product that...', 'A beautiful place where...', 'A delicious recipe for...', 'A useful tool for...'],
        Category: ['Fiction', 'Non-fiction', 'Science', 'History', 'Technology', 'Art', 'Music', 'Food', 'Travel', 'Sports'],
        Status: ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled', 'On Hold', 'In Progress', 'Delayed', 'Scheduled', 'Delivered'],
        Priority: ['High', 'Medium', 'Low', 'Critical', 'Urgent'],
        Tags: ['Important', 'Personal', 'Work', 'Family', 'Health', 'Finance', 'Education', 'Entertainment', 'Social', 'Hobby'],
        Location: ['New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Berlin', 'Rome', 'Madrid', 'Toronto', 'Singapore'],
        Address: ['123 Main St', '456 Elm St', '789 Oak St', '321 Pine St', '654 Maple St'],
        City: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
        Country: ['USA', 'Canada', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'Japan', 'Australia', 'China'],
        Notes: ['Remember to follow up', 'Check back next week', 'Important information', 'Need more details', 'Verify before proceeding'],
        Comments: ['Great job!', 'Needs improvement', 'Well done', 'Keep up the good work', 'Excellent progress'],
        Author: ['J.K. Rowling', 'Stephen King', 'Jane Austen', 'George Orwell', 'Ernest Hemingway'],
        Genre: ['Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Thriller', 'Horror', 'Biography', 'History', 'Self-help', 'Comedy'],
        Color: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Gray'],
        Size: ['Small', 'Medium', 'Large', 'X-Large', 'XX-Large', 'Tiny', 'Huge', 'Compact', 'Oversized', 'Standard'],
        Material: ['Wood', 'Metal', 'Plastic', 'Glass', 'Ceramic', 'Leather', 'Cotton', 'Wool', 'Silk', 'Polyester'],
        Brand: ['Apple', 'Samsung', 'Google', 'Microsoft', 'Amazon', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell'],
        Model: ['iPhone 13', 'Galaxy S21', 'Pixel 6', 'Surface Pro', 'MacBook Air', 'iPad Pro', 'Echo Dot', 'PlayStation 5', 'Xbox Series X', 'ThinkPad X1'],
        SKU: ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890']
    };
    // Default to random text if field name not in the list
    const defaultTexts = ['Lorem ipsum', 'Dolor sit amet', 'Consectetur adipiscing', 'Elit sed do', 'Eiusmod tempor'];
    const options = textValues[fieldName] || defaultTexts;
    return options[Math.floor(Math.random() * options.length)];
};
// Generate random number value
const generateNumberValue = (fieldName) => {
    const ranges = {
        Age: { min: 1, max: 100 },
        Price: { min: 1, max: 1000 },
        Quantity: { min: 1, max: 100 },
        Rating: { min: 1, max: 5 },
        Score: { min: 0, max: 100 },
        Duration: { min: 1, max: 240 },
        Weight: { min: 1, max: 500 },
        Height: { min: 1, max: 250 },
        Width: { min: 1, max: 200 },
        Length: { min: 1, max: 200 },
        Distance: { min: 1, max: 1000 },
        Temperature: { min: -20, max: 40 },
        Percentage: { min: 0, max: 100 },
        Count: { min: 0, max: 1000 },
        ID: { min: 1000, max: 9999 },
        Year: { min: 1900, max: 2023 },
        Month: { min: 1, max: 12 },
        Day: { min: 1, max: 31 },
        Hour: { min: 0, max: 23 },
        Minute: { min: 0, max: 59 }
    };
    // Default range if field name not in the list
    const defaultRange = { min: 0, max: 100 };
    const range = ranges[fieldName] || defaultRange;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};
// Generate random date value
const generateDateValue = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
// Generate random fields for a collection
const generateFields = (count) => {
    const fields = [];
    const usedNames = new Set();
    for (let i = 0; i < count; i++) {
        const type = fieldTypes[Math.floor(Math.random() * fieldTypes.length)];
        const typeNames = fieldNamesByType[type];
        // Find an unused name
        let name;
        do {
            name = typeNames[Math.floor(Math.random() * typeNames.length)];
        } while (usedNames.has(name) && usedNames.size < typeNames.length);
        // If all names are used, add a number suffix
        if (usedNames.has(name)) {
            name = `${name} ${usedNames.size + 1}`;
        }
        usedNames.add(name);
        fields.push({ name, type });
    }
    return fields;
};
// Generate random entries for a collection
const generateEntries = (fields, count) => {
    const entries = [];
    for (let i = 0; i < count; i++) {
        const entry = {};
        fields.forEach(field => {
            switch (field.type) {
                case 'text':
                    entry[field.name] = generateTextValue(field.name);
                    break;
                case 'number':
                    entry[field.name] = generateNumberValue(field.name);
                    break;
                case 'date':
                    entry[field.name] = generateDateValue();
                    break;
            }
        });
        entries.push(entry);
    }
    return entries;
};
// Main function to populate collections
const populateCollections = async (email, count) => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/data-playground');
        console.log('Connected to MongoDB');
        // Find user by email
        const user = await user_1.User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }
        console.log(`Found user: ${user.username} (${user._id})`);
        // Delete existing collections for this user
        await collection_1.Collection.deleteMany({ user: user._id });
        console.log('Deleted existing collections');
        // Create new collections
        const collections = [];
        for (let i = 0; i < count; i++) {
            // Generate a unique collection name
            let name = collectionNames[i % collectionNames.length];
            if (i >= collectionNames.length) {
                name = `${name} ${Math.floor(i / collectionNames.length) + 1}`;
            }
            // Generate 3-7 fields
            const fieldCount = Math.floor(Math.random() * 5) + 3;
            const fields = generateFields(fieldCount);
            // Generate 5-15 entries
            const entryCount = Math.floor(Math.random() * 11) + 5;
            const entries = generateEntries(fields, entryCount);
            collections.push({
                name,
                fields,
                entries,
                user: user._id
            });
        }
        // Insert collections in batches
        const batchSize = 10;
        for (let i = 0; i < collections.length; i += batchSize) {
            const batch = collections.slice(i, i + batchSize);
            await collection_1.Collection.insertMany(batch);
            console.log(`Inserted collections ${i + 1} to ${Math.min(i + batchSize, collections.length)}`);
        }
        console.log(`Successfully created ${count} collections for ${email}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
// Check command line arguments
const email = process.argv[2] || 'dirtychump@gmail.com';
const count = parseInt(process.argv[3]) || 50;
// Run the script
populateCollections(email, count)
    .then(() => console.log('Done!'))
    .catch(err => console.error('Script failed:', err));
