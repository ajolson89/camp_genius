import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping']).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

// Generate JWT token
const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { sub: userId, email },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
};

// Sign up
router.post('/signup', validateRequest(signupSchema), async (req, res, next) => {
  try {
    const { email, password, name, equipmentType } = req.body;
    
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        preferences: {
          equipmentType: equipmentType || 'tent',
          campingStyle: [],
          favoriteActivities: [],
          dietaryRestrictions: [],
          budgetRange: { min: 0, max: 500 }
        },
        accessibilityNeeds: {
          mobility: false,
          visual: false,
          hearing: false,
          cognitive: false
        }
      })
      .select()
      .single();
    
    if (error || !newUser) {
      throw new AppError(500, 'Failed to create user');
    }
    
    // Generate token
    const token = generateToken(newUser.id, newUser.email);
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Get user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new AppError(401, 'Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user.id, user.email);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        accessibilityNeeds: user.accessibilityNeeds
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError(401, 'No token provided');
    }
    
    const decoded = jwt.verify(token, config.auth.jwtSecret) as {
      sub: string;
      email: string;
    };
    
    // Generate new token
    const newToken = generateToken(decoded.sub, decoded.email);
    
    res.json({ token: newToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
});

export default router;