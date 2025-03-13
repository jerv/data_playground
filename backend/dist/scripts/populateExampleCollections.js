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
const fieldTypes = ['text', 'number', 'date', 'rating', 'time'];
// Example field names by type
const fieldNamesByType = {
    text: [
        'Name', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Tags',
        'Location', 'Address', 'City', 'Country', 'Notes', 'Comments', 'Author',
        'Genre', 'Color', 'Size', 'Material', 'Brand', 'Model', 'SKU', 'Email',
        'Phone', 'Website', 'ISBN', 'Condition', 'Severity', 'Symptoms',
        'Resolution', 'Steps to Reproduce', 'Manufacturer', 'Seller', 'Warranty Info',
        'Serial Number', 'Ingredients', 'Instructions', 'Currency', 'Payment Method',
        'Account Number', 'Transaction Type', 'Reference Number', 'Course Code',
        'Professor', 'Institution', 'Degree', 'License Number', 'Room', 'Building',
        'Assigned To', 'Department', 'Manager', 'Project Name', 'Source', 'Version'
    ],
    number: [
        'Age', 'Price', 'Quantity', 'Score', 'Duration', 'Weight',
        'Height', 'Width', 'Length', 'Distance', 'Temperature', 'Percentage',
        'Count', 'ID', 'Year', 'Month', 'Day', 'Hour', 'Minute', 'Calories',
        'Reps', 'Sets', 'Amount', 'Balance', 'Interest Rate', 'Tax Rate',
        'Discount', 'Commission', 'Units', 'Installments', 'Credit Score',
        'Deductible', 'Mileage', 'Square Footage', 'Elevation', 'Humidity',
        'Blood Pressure', 'Heart Rate', 'Blood Sugar', 'Cholesterol', 'Dosage',
        'Frequency', 'Grade', 'GPA', 'Rank', 'Stock Level', 'Page Count',
        'Word Count', 'Run Time', 'File Size', 'Resolution', 'Battery Life'
    ],
    date: [
        'Date', 'Created At', 'Updated At', 'Due Date', 'Start Date', 'End Date',
        'Birth Date', 'Expiry Date', 'Release Date', 'Delivery Date', 'Arrival Date',
        'Purchase Date', 'Warranty End Date', 'Reminder Date', 'Appointment Date',
        'Billing Date', 'Payment Date', 'Deadline', 'Graduation Date', 'Enrollment Date',
        'Anniversary', 'Last Service Date', 'Next Service Date', 'Check-in Date',
        'Check-out Date', 'Reservation Date', 'Shipping Date', 'Return Date',
        'Follow-up Date', 'Renewal Date', 'Last Updated', 'Last Accessed'
    ],
    rating: [
        'Rating', 'Satisfaction', 'Importance', 'Difficulty', 'Urgency',
        'Quality', 'Value for Money', 'Effectiveness', 'Taste', 'Comfort',
        'Reliability', 'Performance', 'Customer Service', 'Enjoyment',
        'Recommendation Level', 'Usefulness', 'Relevance', 'Clarity',
        'Accuracy', 'User Experience', 'Safety', 'Ease of Use'
    ],
    time: [
        'Time', 'Start Time', 'End Time', 'Duration', 'Arrival Time',
        'Departure Time', 'Check-in Time', 'Check-out Time', 'Meeting Time',
        'Appointment Time', 'Opening Time', 'Closing Time', 'Preparation Time',
        'Cooking Time', 'Rest Time', 'Notification Time', 'Reminder Time',
        'Break Time', 'Setup Time', 'Estimated Time', 'Actual Time',
        'Processing Time'
    ]
};
// Example collection names with real-world use cases
const collectionNames = [
    // Personal Collections
    'Books I\'ve Read', 'Movies to Watch', 'Travel Destinations', 'Gift Ideas',
    'Favorite Recipes', 'Bucket List', 'Personal Goals', 'Contacts',
    'Household Inventory', 'Vehicle Maintenance',
    // Financial Collections
    'Monthly Expenses', 'Investment Portfolio', 'Subscription Tracker',
    'Bills & Payments', 'Savings Goals', 'Tax Documents', 'Insurance Policies',
    'Financial Accounts', 'Business Expenses', 'Invoices',
    // Project Management
    'Project Tasks', 'Bug Tracker', 'Feature Requests', 'Client Projects',
    'Meeting Notes', 'Team Members', 'Project Timeline', 'Resource Allocation',
    'Project Risks', 'Stakeholders',
    // Health & Wellness
    'Medication Tracker', 'Doctor Appointments', 'Workout Log',
    'Meal Planning', 'Health Metrics', 'Medical History', 'Fitness Goals',
    'Nutritional Information', 'Allergies', 'Mental Health Journal',
    // Home Management
    'Home Maintenance', 'Garden Plants', 'Home Improvement Projects',
    'Cleaning Schedule', 'Utility Usage', 'Warranty Information',
    'Appliance Details', 'Property Documents', 'Service Providers', 'Pet Records',
    // Hobby & Collections
    'Wine Collection', 'Book Library', 'Video Game Collection',
    'Comic Books', 'Art Collection', 'Sports Memorabilia', 'Music Albums',
    'Stamp Collection', 'Coin Collection', 'Collectible Cards',
    // Learning & Education
    'Course Notes', 'Study Schedule', 'Learning Resources',
    'Certifications', 'Research Papers', 'Academic References',
    'Language Learning', 'Continuing Education', 'Skills Development', 'Webinars'
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
        SKU: ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890'],
        Email: ['user@example.com', 'johndoe@gmail.com', 'contact@business.com', 'support@service.net', 'info@organization.org'],
        Phone: ['555-123-4567', '(123) 456-7890', '987-654-3210', '+1 234 567 8901', '321-654-9870'],
        Website: ['https://example.com', 'https://mywebsite.net', 'http://blog.site.com', 'https://shop.store.com', 'https://portfolio.dev'],
        ISBN: ['978-3-16-148410-0', '0-306-40615-2', '978-1-56619-909-4', '978-1-4028-9462-6', '0-14-020652-3'],
        Condition: ['New', 'Like New', 'Very Good', 'Good', 'Acceptable', 'Used', 'Damaged', 'For Parts'],
        Severity: ['Critical', 'Major', 'Moderate', 'Minor', 'Trivial', 'Cosmetic'],
        Symptoms: ['Slow response', 'Crashes on startup', 'Memory leak', 'Unresponsive UI', 'Data corruption', 'Authentication failure'],
        Resolution: ['Fixed in latest update', 'Workaround available', 'Fix pending', 'Cannot reproduce', 'By design', 'Won\'t fix'],
        'Steps to Reproduce': ['Login and navigate to settings', 'Click the button multiple times', 'Enter special characters in the form', 'Use with slow internet connection', 'Try on mobile device'],
        Manufacturer: ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft'],
        Seller: ['Amazon', 'Best Buy', 'Walmart', 'Target', 'Costco', 'eBay', 'Etsy', 'Newegg', 'B&H Photo', 'Home Depot'],
        'Warranty Info': ['1-year limited', '2-year extended', '90-day standard', 'Lifetime warranty', '5-year transferable', 'No warranty'],
        'Serial Number': ['SN12345678', 'ABC-DEF-1234', 'MFG3456789', 'PRD-9876-XYZ', 'SER-5678-ABCD'],
        Ingredients: ['Flour, sugar, eggs, milk', 'Chicken, rice, vegetables', 'Tomatoes, garlic, olive oil', 'Milk, chocolate, vanilla', 'Fresh fruit, honey, yogurt'],
        Instructions: ['Preheat oven to 350°F', 'Simmer for 20 minutes', 'Refrigerate overnight', 'Mix ingredients thoroughly', 'Apply twice daily'],
        Currency: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL', 'MXN'],
        'Payment Method': ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Check', 'Venmo', 'Zelle', 'Apple Pay', 'Google Pay', 'Cryptocurrency'],
        'Transaction Type': ['Deposit', 'Withdrawal', 'Purchase', 'Refund', 'Transfer', 'Payment', 'Subscription', 'Fee', 'Interest', 'Dividend'],
        'Reference Number': ['REF123456', 'TRX-789012', 'INV-345678', 'ORD-901234', 'PAY-567890'],
        'Course Code': ['CS101', 'MATH202', 'BIO330', 'PHYS105', 'ENGL220', 'HIST301', 'CHEM240', 'PSYC110', 'ECON201', 'ART150'],
        Professor: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Davis', 'Dr. Miller', 'Prof. Wilson', 'Dr. Moore', 'Prof. Taylor', 'Dr. Anderson', 'Prof. Thomas'],
        Institution: ['Harvard University', 'Stanford University', 'MIT', 'Yale University', 'Princeton University', 'University of California', 'Oxford University', 'Cambridge University', 'Columbia University', 'University of Chicago'],
        Degree: ['Bachelor of Science', 'Master of Arts', 'Doctor of Philosophy', 'Bachelor of Arts', 'Master of Science', 'Master of Business Administration', 'Associate Degree', 'Certificate', 'Diploma', 'Doctor of Medicine'],
        'License Number': ['LIC-12345', 'PRM-67890', 'REG-23456', 'AUTH-78901', 'CERT-34567'],
        Room: ['Conference Room A', 'Suite 301', 'Office 542', 'Meeting Room B', 'Training Room 3', 'Classroom 204', 'Lab 105', 'Break Room', 'Auditorium', 'Studio 7'],
        Building: ['Main Building', 'West Wing', 'Technology Center', 'Research Facility', 'Corporate Headquarters', 'Manufacturing Plant', 'Distribution Center', 'Regional Office', 'Data Center', 'Training Center'],
        'Assigned To': ['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Jessica Martinez', 'Robert Anderson', 'Jennifer Taylor', 'Christopher Thomas', 'Elizabeth Jackson', 'Daniel White'],
        Department: ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'Human Resources', 'Operations', 'Research and Development', 'Information Technology', 'Legal'],
        Manager: ['Jennifer Smith', 'Robert Johnson', 'Emily Williams', 'Michael Davis', 'Lisa Brown', 'David Wilson', 'Sarah Martinez', 'James Anderson', 'Jessica Taylor', 'John Thomas'],
        'Project Name': ['Website Redesign', 'Mobile App Development', 'Database Migration', 'Cloud Infrastructure Upgrade', 'New Product Launch', 'Customer Portal', 'Internal Dashboard', 'Inventory System', 'Security Audit', 'Analytics Platform'],
        Source: ['Website', 'Email', 'Social Media', 'Referral', 'Direct Mail', 'Phone Call', 'Trade Show', 'Conference', 'Partner', 'Advertisement'],
        Version: ['1.0.0', '2.3.1', 'v3.5', '4.0 Beta', '5.2.3', '6.0 RC1', '7.1 Stable', '8.0.4', '9.2', '10.0 LTS']
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
        Minute: { min: 0, max: 59 },
        Calories: { min: 50, max: 2000 },
        Reps: { min: 5, max: 30 },
        Sets: { min: 1, max: 10 },
        Amount: { min: 1, max: 10000 },
        Balance: { min: 0, max: 100000 },
        'Interest Rate': { min: 0, max: 20 },
        'Tax Rate': { min: 0, max: 40 },
        Discount: { min: 0, max: 75 },
        Commission: { min: 0, max: 30 },
        Units: { min: 1, max: 1000 },
        Installments: { min: 1, max: 60 },
        'Credit Score': { min: 300, max: 850 },
        Deductible: { min: 0, max: 5000 },
        Mileage: { min: 0, max: 200000 },
        'Square Footage': { min: 200, max: 10000 },
        Elevation: { min: 0, max: 14000 },
        Humidity: { min: 0, max: 100 },
        'Blood Pressure': { min: 90, max: 180 },
        'Heart Rate': { min: 40, max: 200 },
        'Blood Sugar': { min: 70, max: 300 },
        Cholesterol: { min: 100, max: 300 },
        Dosage: { min: 1, max: 1000 },
        Frequency: { min: 1, max: 10 },
        Grade: { min: 0, max: 100 },
        GPA: { min: 0, max: 4 },
        Rank: { min: 1, max: 100 },
        'Stock Level': { min: 0, max: 1000 },
        'Page Count': { min: 1, max: 1000 },
        'Word Count': { min: 100, max: 100000 },
        'Run Time': { min: 1, max: 240 },
        'File Size': { min: 1, max: 10000 },
        Resolution: { min: 240, max: 8640 },
        'Battery Life': { min: 1, max: 100 }
    };
    // Default range if field name not in the list
    const defaultRange = { min: 0, max: 100 };
    const range = ranges[fieldName] || defaultRange;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};
// Generate random date value with more flexibility
const generateDateValue = (fieldName) => {
    const dateRanges = {
        'Birth Date': { start: new Date(1950, 0, 1), end: new Date(2010, 11, 31) },
        'Expiry Date': { start: new Date(), end: new Date(new Date().setFullYear(new Date().getFullYear() + 5)) },
        'Purchase Date': { start: new Date(2018, 0, 1), end: new Date() },
        'Warranty End Date': { start: new Date(), end: new Date(new Date().setFullYear(new Date().getFullYear() + 3)) },
        'Due Date': { start: new Date(), end: new Date(new Date().setMonth(new Date().getMonth() + 6)) },
        'Deadline': { start: new Date(), end: new Date(new Date().setMonth(new Date().getMonth() + 3)) },
        'Start Date': { start: new Date(new Date().setMonth(new Date().getMonth() - 3)), end: new Date(new Date().setMonth(new Date().getMonth() + 3)) },
        'End Date': { start: new Date(new Date().setMonth(new Date().getMonth() + 3)), end: new Date(new Date().setMonth(new Date().getMonth() + 9)) },
        'Last Service Date': { start: new Date(2020, 0, 1), end: new Date() },
        'Next Service Date': { start: new Date(), end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) }
    };
    // Default to a date in the last 3 years
    const defaultRange = {
        start: new Date(new Date().setFullYear(new Date().getFullYear() - 3)),
        end: new Date()
    };
    const range = dateRanges[fieldName] || defaultRange;
    return new Date(range.start.getTime() + Math.random() * (range.end.getTime() - range.start.getTime()));
};
// Generate random rating value (1-5)
const generateRatingValue = () => {
    return Math.floor(Math.random() * 5) + 1;
};
// Generate random time value (as string in format HH:MM)
const generateTimeValue = () => {
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
                    entry[field.name] = generateDateValue(field.name);
                    break;
                case 'rating':
                    entry[field.name] = generateRatingValue();
                    break;
                case 'time':
                    entry[field.name] = generateTimeValue();
                    break;
            }
        });
        entries.push(entry);
    }
    return entries;
};
// Generate specialized collections based on categories
const generateSpecializedCollections = (userId) => {
    const specializedCollections = [
        // Health Tracker Collection
        {
            name: 'Health Tracker',
            fields: [
                { name: 'Date', type: 'date' },
                { name: 'Weight (lbs)', type: 'number' },
                { name: 'Blood Pressure', type: 'text' }, // Format: "120/80"
                { name: 'Heart Rate (bpm)', type: 'number' },
                { name: 'Sleep Duration (hours)', type: 'number' },
                { name: 'Water Intake (oz)', type: 'number' },
                { name: 'Mood', type: 'rating' },
                { name: 'Exercise', type: 'text' },
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Date': new Date(2023, 11, 15),
                    'Weight (lbs)': 165,
                    'Blood Pressure': '118/75',
                    'Heart Rate (bpm)': 68,
                    'Sleep Duration (hours)': 7.5,
                    'Water Intake (oz)': 64,
                    'Mood': 4,
                    'Exercise': 'Morning run - 3 miles',
                    'Notes': 'Feeling good today, energy levels stable'
                },
                {
                    'Date': new Date(2023, 11, 16),
                    'Weight (lbs)': 164.5,
                    'Blood Pressure': '120/78',
                    'Heart Rate (bpm)': 72,
                    'Sleep Duration (hours)': 6.5,
                    'Water Intake (oz)': 48,
                    'Mood': 3,
                    'Exercise': 'Weight training - upper body',
                    'Notes': 'Slight headache in the afternoon'
                },
                {
                    'Date': new Date(2023, 11, 17),
                    'Weight (lbs)': 164.8,
                    'Blood Pressure': '122/80',
                    'Heart Rate (bpm)': 65,
                    'Sleep Duration (hours)': 8,
                    'Water Intake (oz)': 72,
                    'Mood': 5,
                    'Exercise': 'Yoga - 45 minutes',
                    'Notes': 'Excellent energy all day, felt very focused'
                },
                {
                    'Date': new Date(2023, 11, 18),
                    'Weight (lbs)': 164.2,
                    'Blood Pressure': '119/76',
                    'Heart Rate (bpm)': 70,
                    'Sleep Duration (hours)': 7,
                    'Water Intake (oz)': 56,
                    'Mood': 4,
                    'Exercise': 'Rest day',
                    'Notes': 'Busy workday, managed stress well'
                }
            ],
            user: userId
        },
        // Expense Tracker Collection
        {
            name: 'Expense Tracker',
            fields: [
                { name: 'Date', type: 'date' },
                { name: 'Description', type: 'text' },
                { name: 'Category', type: 'text' },
                { name: 'Amount', type: 'number' },
                { name: 'Payment Method', type: 'text' },
                { name: 'Is Tax Deductible', type: 'text' }, // Yes/No
                { name: 'Receipt Photo', type: 'text' }, // Would contain URL in real app
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Date': new Date(2023, 11, 10),
                    'Description': 'Grocery shopping',
                    'Category': 'Food',
                    'Amount': 78.92,
                    'Payment Method': 'Credit Card',
                    'Is Tax Deductible': 'No',
                    'Receipt Photo': 'receipt_20231210.jpg',
                    'Notes': 'Weekly groceries from Whole Foods'
                },
                {
                    'Date': new Date(2023, 11, 12),
                    'Description': 'Gas station fill-up',
                    'Category': 'Transportation',
                    'Amount': 45.67,
                    'Payment Method': 'Debit Card',
                    'Is Tax Deductible': 'No',
                    'Receipt Photo': 'gas_receipt_121223.jpg',
                    'Notes': 'Full tank for commuting'
                },
                {
                    'Date': new Date(2023, 11, 14),
                    'Description': 'Business lunch with client',
                    'Category': 'Business',
                    'Amount': 64.25,
                    'Payment Method': 'Credit Card',
                    'Is Tax Deductible': 'Yes',
                    'Receipt Photo': 'lunch_receipt_121423.jpg',
                    'Notes': 'Meeting with Johnson Corp about new contract'
                },
                {
                    'Date': new Date(2023, 11, 15),
                    'Description': 'Monthly subscription - Netflix',
                    'Category': 'Entertainment',
                    'Amount': 15.99,
                    'Payment Method': 'Credit Card',
                    'Is Tax Deductible': 'No',
                    'Receipt Photo': 'netflix_dec2023.pdf',
                    'Notes': 'Automatically charged'
                }
            ],
            user: userId
        },
        // Project Management Collection
        {
            name: 'Project Tasks',
            fields: [
                { name: 'Title', type: 'text' },
                { name: 'Description', type: 'text' },
                { name: 'Status', type: 'text' },
                { name: 'Priority', type: 'rating' },
                { name: 'Assigned To', type: 'text' },
                { name: 'Start Date', type: 'date' },
                { name: 'Due Date', type: 'date' },
                { name: 'Completion %', type: 'number' },
                { name: 'Category', type: 'text' },
                { name: 'Attachments', type: 'text' } // Would contain URLs in real app
            ],
            entries: [
                {
                    'Title': 'Create wireframes for new dashboard',
                    'Description': 'Design initial wireframes for client dashboard showing key metrics and reports',
                    'Status': 'In Progress',
                    'Priority': 4,
                    'Assigned To': 'Sarah Johnson',
                    'Start Date': new Date(2023, 11, 5),
                    'Due Date': new Date(2023, 11, 15),
                    'Completion %': 75,
                    'Category': 'UI/UX Design',
                    'Attachments': 'initial_sketch.pdf, requirements.docx'
                },
                {
                    'Title': 'Database migration planning',
                    'Description': 'Document the strategy for migrating legacy database to new cloud infrastructure',
                    'Status': 'Not Started',
                    'Priority': 5,
                    'Assigned To': 'Michael Chen',
                    'Start Date': new Date(2023, 11, 18),
                    'Due Date': new Date(2023, 11, 30),
                    'Completion %': 0,
                    'Category': 'Backend Development',
                    'Attachments': 'current_schema.pdf'
                },
                {
                    'Title': 'Client presentation for phase 1',
                    'Description': 'Prepare and deliver presentation on phase 1 deliverables to client stakeholders',
                    'Status': 'Completed',
                    'Priority': 5,
                    'Assigned To': 'Jessica Martinez',
                    'Start Date': new Date(2023, 11, 1),
                    'Due Date': new Date(2023, 11, 10),
                    'Completion %': 100,
                    'Category': 'Client Communication',
                    'Attachments': 'presentation_slides.pptx, demo_video.mp4'
                },
                {
                    'Title': 'Fix login page responsiveness',
                    'Description': 'Resolve issues with login page layout on mobile devices',
                    'Status': 'In Progress',
                    'Priority': 3,
                    'Assigned To': 'David Wilson',
                    'Start Date': new Date(2023, 11, 12),
                    'Due Date': new Date(2023, 11, 17),
                    'Completion %': 50,
                    'Category': 'Frontend Development',
                    'Attachments': 'bug_report.pdf'
                }
            ],
            user: userId
        },
        // Recipe Collection
        {
            name: 'Recipe Collection',
            fields: [
                { name: 'Recipe Name', type: 'text' },
                { name: 'Category', type: 'text' },
                { name: 'Cuisine', type: 'text' },
                { name: 'Ingredients', type: 'text' },
                { name: 'Instructions', type: 'text' },
                { name: 'Prep Time (mins)', type: 'number' },
                { name: 'Cook Time (mins)', type: 'number' },
                { name: 'Servings', type: 'number' },
                { name: 'Calories per Serving', type: 'number' },
                { name: 'Difficulty', type: 'rating' },
                { name: 'Rating', type: 'rating' },
                { name: 'Tags', type: 'text' },
                { name: 'Image', type: 'text' }, // Would contain URL in real app
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Recipe Name': 'Classic Spaghetti Carbonara',
                    'Category': 'Main Course',
                    'Cuisine': 'Italian',
                    'Ingredients': '1 lb spaghetti, 8 oz pancetta or bacon, 4 large eggs, 1 cup grated Pecorino Romano, 1 tsp black pepper, salt to taste',
                    'Instructions': '1. Cook pasta al dente\n2. Fry pancetta until crisp\n3. Beat eggs with cheese\n4. Toss hot pasta with egg mixture and pancetta\n5. Season and serve immediately',
                    'Prep Time (mins)': 15,
                    'Cook Time (mins)': 20,
                    'Servings': 4,
                    'Calories per Serving': 650,
                    'Difficulty': 3,
                    'Rating': 5,
                    'Tags': 'pasta, italian, dinner, quick',
                    'Image': 'carbonara.jpg',
                    'Notes': 'Work quickly when mixing the eggs to avoid scrambling them. Can substitute Parmesan for Pecorino.'
                },
                {
                    'Recipe Name': 'Avocado Chicken Salad',
                    'Category': 'Salad',
                    'Cuisine': 'American',
                    'Ingredients': '2 grilled chicken breasts, 2 avocados, 1 cup cherry tomatoes, 1/4 red onion, 1 cucumber, 1/4 cup olive oil, 2 tbsp lemon juice, salt and pepper to taste',
                    'Instructions': '1. Dice chicken, avocados, tomatoes, onion, and cucumber\n2. Mix in a large bowl\n3. Whisk olive oil and lemon juice for dressing\n4. Toss with dressing and season',
                    'Prep Time (mins)': 20,
                    'Cook Time (mins)': 15,
                    'Servings': 2,
                    'Calories per Serving': 420,
                    'Difficulty': 2,
                    'Rating': 4,
                    'Tags': 'healthy, lunch, salad, protein',
                    'Image': 'avocado_chicken.jpg',
                    'Notes': 'Can add feta cheese for extra flavor. Prepare the chicken ahead of time for a quicker meal.'
                },
                {
                    'Recipe Name': 'Chocolate Chip Cookies',
                    'Category': 'Dessert',
                    'Cuisine': 'American',
                    'Ingredients': '2.25 cups all-purpose flour, 1 tsp baking soda, 1 tsp salt, 1 cup butter, 0.75 cup white sugar, 0.75 cup brown sugar, 2 eggs, 2 tsp vanilla extract, 2 cups chocolate chips',
                    'Instructions': '1. Combine dry ingredients\n2. Cream butter and sugars\n3. Add eggs and vanilla\n4. Mix in dry ingredients\n5. Fold in chocolate chips\n6. Bake at 375°F for 10-12 minutes',
                    'Prep Time (mins)': 20,
                    'Cook Time (mins)': 12,
                    'Servings': 24,
                    'Calories per Serving': 180,
                    'Difficulty': 2,
                    'Rating': 5,
                    'Tags': 'dessert, baking, cookies, kids',
                    'Image': 'choc_chip_cookies.jpg',
                    'Notes': 'Refrigerate dough for 24 hours for best flavor. Add walnuts for texture.'
                }
            ],
            user: userId
        },
        // Book Collection
        {
            name: 'Book Collection',
            fields: [
                { name: 'Title', type: 'text' },
                { name: 'Author', type: 'text' },
                { name: 'Genre', type: 'text' },
                { name: 'ISBN', type: 'text' },
                { name: 'Publisher', type: 'text' },
                { name: 'Publication Date', type: 'date' },
                { name: 'Pages', type: 'number' },
                { name: 'Format', type: 'text' }, // Hardcover, Paperback, eBook, etc.
                { name: 'Date Acquired', type: 'date' },
                { name: 'Read Status', type: 'text' }, // Not Started, In Progress, Completed
                { name: 'Date Finished', type: 'date' },
                { name: 'Rating', type: 'rating' },
                { name: 'Review', type: 'text' },
                { name: 'Cover Image', type: 'text' } // Would contain URL in real app
            ],
            entries: [
                {
                    'Title': 'The Great Gatsby',
                    'Author': 'F. Scott Fitzgerald',
                    'Genre': 'Classic Fiction',
                    'ISBN': '9780743273565',
                    'Publisher': 'Scribner',
                    'Publication Date': new Date(2004, 8, 30),
                    'Pages': 180,
                    'Format': 'Paperback',
                    'Date Acquired': new Date(2022, 3, 15),
                    'Read Status': 'Completed',
                    'Date Finished': new Date(2022, 4, 2),
                    'Rating': 5,
                    'Review': 'A masterpiece of American literature that captures the essence of the Jazz Age. The symbolism and character development are exceptional.',
                    'Cover Image': 'gatsby_cover.jpg'
                },
                {
                    'Title': 'Sapiens: A Brief History of Humankind',
                    'Author': 'Yuval Noah Harari',
                    'Genre': 'Non-fiction, History',
                    'ISBN': '9780062316097',
                    'Publisher': 'Harper',
                    'Publication Date': new Date(2015, 1, 10),
                    'Pages': 464,
                    'Format': 'Hardcover',
                    'Date Acquired': new Date(2022, 5, 20),
                    'Read Status': 'In Progress',
                    'Date Finished': null,
                    'Rating': 4,
                    'Review': 'Currently on chapter 7. Fascinating perspective on human development and society formation.',
                    'Cover Image': 'sapiens_cover.jpg'
                },
                {
                    'Title': 'Project Hail Mary',
                    'Author': 'Andy Weir',
                    'Genre': 'Science Fiction',
                    'ISBN': '9780593135204',
                    'Publisher': 'Ballantine Books',
                    'Publication Date': new Date(2021, 4, 4),
                    'Pages': 496,
                    'Format': 'eBook',
                    'Date Acquired': new Date(2023, 0, 10),
                    'Read Status': 'Completed',
                    'Date Finished': new Date(2023, 0, 25),
                    'Rating': 5,
                    'Review': 'Brilliant sci-fi with a perfect blend of humor and hard science. The alien characterization is one of the best I\'ve encountered.',
                    'Cover Image': 'hail_mary_cover.jpg'
                },
                {
                    'Title': 'Atomic Habits',
                    'Author': 'James Clear',
                    'Genre': 'Self-help, Psychology',
                    'ISBN': '9780735211292',
                    'Publisher': 'Avery',
                    'Publication Date': new Date(2018, 9, 16),
                    'Pages': 320,
                    'Format': 'Paperback',
                    'Date Acquired': new Date(2022, 11, 5),
                    'Read Status': 'Not Started',
                    'Date Finished': null,
                    'Rating': 0,
                    'Review': '',
                    'Cover Image': 'atomic_habits_cover.jpg'
                }
            ],
            user: userId
        },
        // Home Inventory Collection
        {
            name: 'Home Inventory',
            fields: [
                { name: 'Item Name', type: 'text' },
                { name: 'Category', type: 'text' },
                { name: 'Location', type: 'text' },
                { name: 'Purchase Date', type: 'date' },
                { name: 'Purchase Price', type: 'number' },
                { name: 'Current Value', type: 'number' },
                { name: 'Serial Number', type: 'text' },
                { name: 'Model Number', type: 'text' },
                { name: 'Manufacturer', type: 'text' },
                { name: 'Warranty End Date', type: 'date' },
                { name: 'Condition', type: 'text' },
                { name: 'Insurance Coverage', type: 'text' }, // Yes/No/Partial
                { name: 'Photos', type: 'text' }, // Would contain URLs in real app
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Item Name': 'LG OLED TV',
                    'Category': 'Electronics',
                    'Location': 'Living Room',
                    'Purchase Date': new Date(2022, 10, 15),
                    'Purchase Price': 1299.99,
                    'Current Value': 900,
                    'Serial Number': 'SN48759321',
                    'Model Number': 'OLED65C2PUA',
                    'Manufacturer': 'LG',
                    'Warranty End Date': new Date(2024, 10, 15),
                    'Condition': 'Excellent',
                    'Insurance Coverage': 'Yes',
                    'Photos': 'lg_tv_front.jpg, lg_tv_receipt.pdf',
                    'Notes': 'Extended warranty purchased through Best Buy'
                },
                {
                    'Item Name': 'Sectional Sofa',
                    'Category': 'Furniture',
                    'Location': 'Living Room',
                    'Purchase Date': new Date(2021, 5, 20),
                    'Purchase Price': 1800,
                    'Current Value': 1200,
                    'Serial Number': 'N/A',
                    'Model Number': 'KIVIK-GRAY',
                    'Manufacturer': 'IKEA',
                    'Warranty End Date': new Date(2031, 5, 20),
                    'Condition': 'Good',
                    'Insurance Coverage': 'Yes',
                    'Photos': 'gray_sofa.jpg, sofa_receipt.pdf',
                    'Notes': 'Stain protection applied, 10-year warranty'
                },
                {
                    'Item Name': 'MacBook Pro',
                    'Category': 'Electronics',
                    'Location': 'Home Office',
                    'Purchase Date': new Date(2023, 2, 10),
                    'Purchase Price': 1999.99,
                    'Current Value': 1800,
                    'Serial Number': 'C02G5KYTQ6L2',
                    'Model Number': 'A2338',
                    'Manufacturer': 'Apple',
                    'Warranty End Date': new Date(2024, 2, 10),
                    'Condition': 'Excellent',
                    'Insurance Coverage': 'Yes',
                    'Photos': 'macbook_pro.jpg, apple_receipt.pdf',
                    'Notes': 'AppleCare+ included'
                },
                {
                    'Item Name': 'Vitamix Blender',
                    'Category': 'Kitchen Appliance',
                    'Location': 'Kitchen',
                    'Purchase Date': new Date(2022, 7, 5),
                    'Purchase Price': 499.95,
                    'Current Value': 400,
                    'Serial Number': 'VM012345678',
                    'Model Number': 'A3500',
                    'Manufacturer': 'Vitamix',
                    'Warranty End Date': new Date(2032, 7, 5),
                    'Condition': 'Excellent',
                    'Insurance Coverage': 'No',
                    'Photos': 'vitamix.jpg',
                    'Notes': '10-year full warranty'
                }
            ],
            user: userId
        },
        // Workout Log Collection
        {
            name: 'Workout Log',
            fields: [
                { name: 'Date', type: 'date' },
                { name: 'Time', type: 'time' },
                { name: 'Workout Type', type: 'text' },
                { name: 'Duration (mins)', type: 'number' },
                { name: 'Calories Burned', type: 'number' },
                { name: 'Average Heart Rate', type: 'number' },
                { name: 'Max Heart Rate', type: 'number' },
                { name: 'Perceived Effort', type: 'rating' },
                { name: 'Exercises', type: 'text' },
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Date': new Date(2023, 11, 12),
                    'Time': '06:30',
                    'Workout Type': 'Strength Training',
                    'Duration (mins)': 45,
                    'Calories Burned': 320,
                    'Average Heart Rate': 135,
                    'Max Heart Rate': 165,
                    'Perceived Effort': 4,
                    'Exercises': 'Bench Press: 3x8@185lbs\nSquats: 3x10@225lbs\nDeadlifts: 3x5@275lbs\nPull-ups: 3x8\nPlanks: 3x60s',
                    'Notes': 'Felt strong today, increased weight on bench press'
                },
                {
                    'Date': new Date(2023, 11, 14),
                    'Time': '07:00',
                    'Workout Type': 'Cardio',
                    'Duration (mins)': 30,
                    'Calories Burned': 350,
                    'Average Heart Rate': 155,
                    'Max Heart Rate': 175,
                    'Perceived Effort': 5,
                    'Exercises': 'Running: 5K\nSprints: 4x100m',
                    'Notes': 'Challenging run, hit a new personal best for 5K (22:15)'
                },
                {
                    'Date': new Date(2023, 11, 16),
                    'Time': '18:30',
                    'Workout Type': 'HIIT',
                    'Duration (mins)': 25,
                    'Calories Burned': 280,
                    'Average Heart Rate': 145,
                    'Max Heart Rate': 185,
                    'Perceived Effort': 5,
                    'Exercises': 'Circuit:\nJumping Jacks: 45s\nBurpees: 45s\nMountain Climbers: 45s\nPush-ups: 45s\nRest: 15s\n(4 rounds)',
                    'Notes': 'Intense session, had to take extra break on last round'
                },
                {
                    'Date': new Date(2023, 11, 17),
                    'Time': '09:15',
                    'Workout Type': 'Yoga',
                    'Duration (mins)': 60,
                    'Calories Burned': 220,
                    'Average Heart Rate': 110,
                    'Max Heart Rate': 125,
                    'Perceived Effort': 3,
                    'Exercises': 'Vinyasa flow sequence with focus on hip openers',
                    'Notes': 'Needed this recovery session, felt much more flexible'
                }
            ],
            user: userId
        },
        // Job Application Tracker
        {
            name: 'Job Application Tracker',
            fields: [
                { name: 'Company', type: 'text' },
                { name: 'Position', type: 'text' },
                { name: 'Location', type: 'text' },
                { name: 'Job Description URL', type: 'text' },
                { name: 'Salary Range', type: 'text' },
                { name: 'Application Date', type: 'date' },
                { name: 'Application Status', type: 'text' }, // Applied, Phone Screen, Interview, Offer, Rejected
                { name: 'Last Contact Date', type: 'date' },
                { name: 'Contact Person', type: 'text' },
                { name: 'Contact Email', type: 'text' },
                { name: 'Interest Level', type: 'rating' },
                { name: 'Resume Version', type: 'text' },
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Company': 'Acme Tech',
                    'Position': 'Senior Software Engineer',
                    'Location': 'San Francisco, CA (Remote)',
                    'Job Description URL': 'https://acmetech.com/careers/1234',
                    'Salary Range': '$140K - $180K',
                    'Application Date': new Date(2023, 11, 5),
                    'Application Status': 'Phone Screen',
                    'Last Contact Date': new Date(2023, 11, 10),
                    'Contact Person': 'Jane Smith',
                    'Contact Email': 'jane.smith@acmetech.com',
                    'Interest Level': 5,
                    'Resume Version': 'tech_focused_v2.pdf',
                    'Notes': 'Phone screen scheduled for 12/15. Research their new AI platform before the call.'
                },
                {
                    'Company': 'Global Solutions Inc',
                    'Position': 'Full Stack Developer',
                    'Location': 'Austin, TX (Hybrid)',
                    'Job Description URL': 'https://globalsolutions.com/jobs/dev456',
                    'Salary Range': '$120K - $150K',
                    'Application Date': new Date(2023, 11, 1),
                    'Application Status': 'Interview',
                    'Last Contact Date': new Date(2023, 11, 12),
                    'Contact Person': 'Robert Johnson',
                    'Contact Email': 'r.johnson@globalsolutions.com',
                    'Interest Level': 4,
                    'Resume Version': 'full_stack_v1.pdf',
                    'Notes': 'Technical interview on 12/18. Review their tech stack: React, Node.js, MongoDB.'
                },
                {
                    'Company': 'Startup Innovations',
                    'Position': 'Lead Developer',
                    'Location': 'Remote',
                    'Job Description URL': 'https://startupinnovations.io/career/lead-dev',
                    'Salary Range': 'Not specified',
                    'Application Date': new Date(2023, 10, 28),
                    'Application Status': 'Rejected',
                    'Last Contact Date': new Date(2023, 11, 7),
                    'Contact Person': 'Michael Thompson',
                    'Contact Email': 'm.thompson@startupinnovations.io',
                    'Interest Level': 3,
                    'Resume Version': 'leadership_v2.pdf',
                    'Notes': 'Received rejection email. They went with someone with more startup experience.'
                },
                {
                    'Company': 'Digital Enterprises',
                    'Position': 'Backend Engineer',
                    'Location': 'Chicago, IL (Onsite)',
                    'Job Description URL': 'https://digitalenterprises.com/openings/backend',
                    'Salary Range': '$110K - $135K',
                    'Application Date': new Date(2023, 11, 8),
                    'Application Status': 'Applied',
                    'Last Contact Date': null,
                    'Contact Person': '',
                    'Contact Email': 'hr@digitalenterprises.com',
                    'Interest Level': 3,
                    'Resume Version': 'backend_focus_v1.pdf',
                    'Notes': 'Application submitted through their portal. Should follow up if no response by 12/22.'
                }
            ],
            user: userId
        },
        // Travel Planning Collection
        {
            name: 'Travel Planning',
            fields: [
                { name: 'Destination', type: 'text' },
                { name: 'Trip Type', type: 'text' }, // Business, Vacation, Weekend Getaway
                { name: 'Start Date', type: 'date' },
                { name: 'End Date', type: 'date' },
                { name: 'Budget', type: 'number' },
                { name: 'Accommodation', type: 'text' },
                { name: 'Accommodation Booking #', type: 'text' },
                { name: 'Transportation', type: 'text' },
                { name: 'Transportation Booking #', type: 'text' },
                { name: 'Key Attractions', type: 'text' },
                { name: 'Restaurants to Try', type: 'text' },
                { name: 'Packing List', type: 'text' },
                { name: 'Notes', type: 'text' }
            ],
            entries: [
                {
                    'Destination': 'Tokyo, Japan',
                    'Trip Type': 'Vacation',
                    'Start Date': new Date(2024, 3, 5),
                    'End Date': new Date(2024, 3, 15),
                    'Budget': 3500,
                    'Accommodation': 'Park Hyatt Tokyo',
                    'Accommodation Booking #': 'HY12345678',
                    'Transportation': 'ANA Flight NH176, Depart JFK 11:05 AM',
                    'Transportation Booking #': 'ANH5432178',
                    'Key Attractions': 'Shinjuku Gyoen, Tokyo Skytree, Meiji Shrine, Tsukiji Fish Market, Akihabara',
                    'Restaurants to Try': 'Sukiyabashi Jiro, Ichiran Ramen, Gonpachi Nishiazabu',
                    'Packing List': 'Passport, JR Pass, Power adapter, Comfortable walking shoes, Light rain jacket',
                    'Notes': 'Need to exchange currency before trip. Research Tokyo subway pass options.'
                },
                {
                    'Destination': 'Paris, France',
                    'Trip Type': 'Anniversary Trip',
                    'Start Date': new Date(2024, 5, 12),
                    'End Date': new Date(2024, 5, 20),
                    'Budget': 4000,
                    'Accommodation': 'Hotel des Grand Boulevards',
                    'Accommodation Booking #': 'HGB789456',
                    'Transportation': 'Air France AF23, Depart JFK 7:30 PM',
                    'Transportation Booking #': 'AF78901234',
                    'Key Attractions': 'Eiffel Tower, Louvre Museum, Notre Dame, Montmartre, Seine River Cruise',
                    'Restaurants to Try': 'Le Jules Verne, Bistrot Paul Bert, L\'As du Fallafel',
                    'Packing List': 'Passport, Euros, Camera, Nice outfit for anniversary dinner, Walking shoes',
                    'Notes': 'Make reservation for anniversary dinner at Le Jules Verne 3 months in advance'
                },
                {
                    'Destination': 'Barcelona, Spain',
                    'Trip Type': 'Business Conference',
                    'Start Date': new Date(2024, 1, 15),
                    'End Date': new Date(2024, 1, 20),
                    'Budget': 2000,
                    'Accommodation': 'Hotel Arts Barcelona',
                    'Accommodation Booking #': 'HAB654321',
                    'Transportation': 'Iberia IB6252, Depart JFK 5:50 PM',
                    'Transportation Booking #': 'IB45678901',
                    'Key Attractions': 'Sagrada Familia, Park Güell, Casa Batlló',
                    'Restaurants to Try': 'Tickets, El Nacional, La Boqueria Market',
                    'Packing List': 'Business attire, Laptop, Presentation materials, Business cards, Adapters',
                    'Notes': 'Conference at Barcelona Convention Center, Feb 16-18. Extend stay for sightseeing.'
                }
            ],
            user: userId
        }
    ];
    return specializedCollections;
};
// Modify populateCollections to include specialized collections
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
        // Create specialized collections
        const specializedCollections = generateSpecializedCollections(user._id);
        // Generate entries for specialized collections
        for (const collection of specializedCollections) {
            const entryCount = Math.floor(Math.random() * 11) + 10; // 10-20 entries
            collection.entries = generateEntries(collection.fields, entryCount);
        }
        // Insert specialized collections
        await collection_1.Collection.insertMany(specializedCollections);
        console.log(`Inserted ${specializedCollections.length} specialized collections`);
        // Create general collections
        const generalCollections = [];
        const remainingCount = count - specializedCollections.length;
        for (let i = 0; i < remainingCount; i++) {
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
            generalCollections.push({
                name,
                fields,
                entries,
                user: user._id
            });
        }
        // Insert collections in batches
        const batchSize = 10;
        for (let i = 0; i < generalCollections.length; i += batchSize) {
            const batch = generalCollections.slice(i, i + batchSize);
            await collection_1.Collection.insertMany(batch);
            console.log(`Inserted general collections ${i + 1} to ${Math.min(i + batchSize, generalCollections.length)}`);
        }
        console.log(`Successfully created ${count} total collections for ${email}`);
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
