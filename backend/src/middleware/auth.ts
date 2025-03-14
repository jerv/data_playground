import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/user';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

// JWT payload interface
interface JwtPayload {
  id: string;
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware triggered for path:', req.method, req.path);
    
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('No auth header found');
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied',
      });
    }
    
    // Check if token format is valid
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format, missing Bearer prefix');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Token found in request header');
    
    // Get JWT secret based on environment
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const environment = process.env.NODE_ENV || 'development';
    
    console.log(`Using JWT secret for ${environment} environment (first 3 chars): ${jwtSecret.substring(0, 3)}`);
    console.log('JWT secret length:', jwtSecret.length);
    
    try {
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log('User not found with id from token:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      
      // Set user in request
      req.user = user;
      console.log('User authenticated successfully:', user.username);
      next();
    } catch (error) {
      console.log('Authentication middleware error:', error);
      
      // Provide more helpful error message
      let errorMessage = 'Invalid token';
      if (error instanceof Error) {
        if (error.name === 'JsonWebTokenError' && error.message === 'invalid signature') {
          errorMessage = 'Token signature verification failed. This may happen if you are using a token generated in a different environment.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return res.status(401).json({
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: environment,
      });
    }
  } catch (error) {
    console.error('Server error in auth middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}; 