import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { supabaseAdmin } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError(401, 'No authentication token provided');
    }
    
    const decoded = jwt.verify(token, config.auth.jwtSecret) as {
      sub: string;
      email: string;
    };
    
    // Verify user exists in database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', decoded.sub)
      .single();
    
    if (error || !user) {
      throw new AppError(401, 'Invalid authentication token');
    }
    
    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid authentication token'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as {
      sub: string;
      email: string;
    };
    
    req.user = {
      id: decoded.sub,
      email: decoded.email
    };
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }
  
  next();
};