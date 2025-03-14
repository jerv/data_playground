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
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied',
      });
    }
    
    // Check if token format is valid
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Get JWT secret based on environment
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    
    try {
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      
      // Set user in request
      req.user = user;
      next();
    } catch (error) {
      // Provide helpful error message
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