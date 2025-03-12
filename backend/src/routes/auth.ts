import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import sanitize from 'mongo-sanitize';
import { User, IUser } from '../models/user';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Registration code for protecting new account creation
const REGISTRATION_CODE = 'welcome123';

// Validation schemas using Zod
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  registrationCode: z.string().min(1, 'Registration code is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
});

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check registration code
    if (validatedData.registrationCode !== REGISTRATION_CODE) {
      return res.status(403).json({
        success: false,
        message: 'Invalid registration code',
      });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      username: sanitize(validatedData.username),
      email: sanitize(validatedData.email),
      password: validatedData.password, // Don't sanitize password as it will be hashed
    };

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: sanitizedData.email },
        { username: sanitizedData.username },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create new user
    const user = await User.create(sanitizedData);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Sanitize inputs
    const sanitizedEmail = sanitize(validatedData.email);

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user?._id,
        username: user?.username,
        email: user?.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = profileUpdateSchema.parse(req.body);
    
    // Sanitize inputs
    const updateData: Partial<IUser> = {};
    
    if (validatedData.username) {
      updateData.username = sanitize(validatedData.username);
    }
    
    if (validatedData.email) {
      updateData.email = sanitize(validatedData.email);
    }

    // Check if email or username already exists (if being updated)
    if (updateData.email || updateData.username) {
      const query: any = { _id: { $ne: req.user?._id } };
      
      if (updateData.email) {
        query.email = updateData.email;
      }
      
      if (updateData.username) {
        query.username = updateData.username;
      }
      
      const existingUser = await User.findOne(query);
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or username already in use',
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser?._id,
        username: updatedUser?.username,
        email: updatedUser?.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
});

export default router; 