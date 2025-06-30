import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { config } from '../src/config/env';
import { errorHandler } from '../src/middleware/errorHandler';
import { requestLogger } from '../src/middleware/requestLogger';
import { rateLimiter } from '../src/middleware/rateLimiter';

// Import routes
import authRoutes from '../src/routes/auth.routes';
import userRoutes from '../src/routes/user.routes';
import campsiteRoutes from '../src/routes/campsite.routes';
import bookingRoutes from '../src/routes/booking.routes';
import tripRoutes from '../src/routes/trip.routes';
import aiRoutes from '../src/routes/ai.routes';
import externalRoutes from '../src/routes/external.routes';

const app = express();

// CORS configuration
app.use(cors({
  origin: config.frontend.url,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/campsites', campsiteRoutes);
app.use('/bookings', bookingRoutes);
app.use('/trips', tripRoutes);
app.use('/ai', aiRoutes);
app.use('/external', externalRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};