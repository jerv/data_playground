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
const corsOptions = {
  origin: '*', // Allow requests from any origin in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data_playground';

// Only connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      // Don't exit process in serverless environment
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    });
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