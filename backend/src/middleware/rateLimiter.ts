import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const identifier = req.ip || 'unknown';
  const now = Date.now();
  
  if (!store[identifier] || store[identifier].resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + config.rateLimit.windowMs
    };
  } else {
    store[identifier].count++;
  }
  
  if (store[identifier].count > config.rateLimit.maxRequests) {
    return res.status(429).json({
      error: {
        message: 'Too many requests, please try again later',
        status: 429
      }
    });
  }
  
  res.setHeader('X-RateLimit-Limit', config.rateLimit.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', 
    (config.rateLimit.maxRequests - store[identifier].count).toString()
  );
  
  next();
};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);