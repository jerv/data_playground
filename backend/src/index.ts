import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import collectionsRoutes from './routes/collections';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS for cross-domain requests
const allowedOrigins = [
  'http://localhost:3000',
  'https://data-playground-nine.vercel.app',
  'https://data-playground.vercel.app',
  'https://data-playground-nine.vercel.app',
  'https://data-playground-jerv.vercel.app'
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    console.log('Request origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      // Still allow the request to proceed, but log it
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
};

console.log('CORS configuration:', JSON.stringify(corsOptions, null, 2));
console.log('Allowed origins:', allowedOrigins);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body));
  }
  
  // Add CORS headers directly to ensure they're set
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is accessible',
    env: {
      nodeEnv: process.env.NODE_ENV || 'Not set',
      registrationCode: process.env.REGISTRATION_CODE ? 'Set (value: ' + process.env.REGISTRATION_CODE + ')' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set',
      mongoUri: process.env.MONGODB_URI ? 'Set (masked: ' + (process.env.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://****:****@')) + ')' : 'Not set',
      port: process.env.PORT || 'Not set (will use default)'
    },
    mongoConnection: {
      readyState: mongoose.connection.readyState,
      status: getMongoConnectionStatus(mongoose.connection.readyState),
      host: mongoose.connection.host || 'Not connected',
      name: mongoose.connection.name || 'Not connected'
    },
    timestamp: new Date().toISOString()
  });
});

// Helper function to get MongoDB connection status
function getMongoConnectionStatus(readyState: number): string {
  switch (readyState) {
    case 0: return 'Disconnected';
    case 1: return 'Connected';
    case 2: return 'Connecting';
    case 3: return 'Disconnecting';
    default: return 'Unknown';
  }
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data_playground';
console.log('MongoDB connection string (masked):', MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://****:****@'));

// Only connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  console.log('Attempting to connect to MongoDB...');
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB successfully');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      // Don't exit process in serverless environment
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    });
} else {
  console.log('Already connected to MongoDB, connection state:', mongoose.connection.readyState);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server if not in production (Vercel will handle this in production)
if (process.env.NODE_ENV !== 'production') {
  const PORT = parseInt(process.env.PORT || '5000', 10);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // In production (Render.com), always listen on the PORT env variable
  const PORT = parseInt(process.env.PORT || '8080', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in production on port ${PORT}`);
  });
}

// Export the app for serverless functions
export default app; 