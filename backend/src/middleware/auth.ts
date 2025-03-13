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
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`Auth middleware triggered for path: ${req.method} ${req.path}`);
    
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token found in request header');

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;
    
    console.log(`Token decoded successfully, user id: ${decoded.id}`);

    // Find user by id
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log(`User not found for id: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'User not found or token is invalid.',
      });
    }

    console.log(`User found: ${user.username} (${user._id})`);
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token.',
    });
  }
}; 