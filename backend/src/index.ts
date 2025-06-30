import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { WebSocketService } from './services/websocket.service';
import { NotificationService } from './services/notification.service';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import campsiteRoutes from './routes/campsite.routes';
import bookingRoutes from './routes/booking.routes';
import tripRoutes from './routes/trip.routes';
import aiRoutes from './routes/ai.routes';
import webhookRoutes from './routes/webhook.routes';
import externalRoutes from './routes/external.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();
const server = createServer(app);

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
app.use('/api', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.isDevelopment ? 'development' : 'production'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campsites', campsiteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/webhooks', webhookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize WebSocket service
const websocketService = new WebSocketService(server);
const notificationService = new NotificationService(websocketService);

// Setup scheduled tasks
setInterval(() => {
  notificationService.processPriceAlerts();
}, 5 * 60 * 1000); // Every 5 minutes

setInterval(() => {
  notificationService.processAvailabilityAlerts();
}, 10 * 60 * 1000); // Every 10 minutes

setInterval(() => {
  notificationService.processTripReminders();
}, 60 * 60 * 1000); // Every hour

setInterval(() => {
  notificationService.cleanupExpiredNotifications();
}, 24 * 60 * 60 * 1000); // Daily

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.isDevelopment ? 'development' : 'production'}`);
  console.log(`WebSocket server initialized`);
  
  // Start WebSocket cleanup
  websocketService.cleanup();
});