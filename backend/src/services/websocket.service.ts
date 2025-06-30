import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { supabaseAdmin } from '../config/database';
import { CacheService } from './cache.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

interface Socket {
  id: string;
  handshake: {
    query: { [key: string]: string };
    headers: { [key: string]: string };
  };
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  disconnect: () => void;
}

export class WebSocketService {
  private io: SocketIOServer;
  private cacheService: CacheService;
  private connectedUsers: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(server: HTTPServer) {
    this.cacheService = new CacheService();
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.frontend.url,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.query.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.auth.jwtSecret) as {
          sub: string;
          email: string;
        };

        // Verify user exists
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .eq('id', decoded.sub)
          .single();

        if (error || !user) {
          return next(new Error('Invalid token'));
        }

        socket.userId = user.id;
        socket.userEmail = user.email;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected: ${socket.id}`);
      
      // Track connected user
      this.addUserSocket(socket.userId!, socket.id);
      
      // Join user-specific room
      socket.join(`user:${socket.userId}`);
      
      // Handle real-time search
      socket.on('search:start', async (data) => {
        await this.handleSearchStart(socket, data);
      });
      
      // Handle AI chat
      socket.on('chat:message', async (data) => {
        await this.handleChatMessage(socket, data);
      });
      
      // Handle booking updates
      socket.on('booking:subscribe', (bookingId) => {
        socket.join(`booking:${bookingId}`);
      });
      
      // Handle trip updates
      socket.on('trip:subscribe', (tripId) => {
        socket.join(`trip:${tripId}`);
      });
      
      // Handle campsite availability watching
      socket.on('availability:watch', (campsiteId) => {
        socket.join(`availability:${campsiteId}`);
      });
      
      // Handle weather updates
      socket.on('weather:subscribe', (coordinates) => {
        const roomName = `weather:${coordinates.lat}:${coordinates.lng}`;
        socket.join(roomName);
      });
      
      // Handle route planning
      socket.on('route:plan', async (data) => {
        await this.handleRoutePlanning(socket, data);
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected: ${socket.id}`);
        this.removeUserSocket(socket.userId!, socket.id);
      });
    });
  }

  private addUserSocket(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId)!.push(socketId);
  }

  private removeUserSocket(userId: string, socketId: string) {
    const sockets = this.connectedUsers.get(userId);
    if (sockets) {
      const index = sockets.indexOf(socketId);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  private async handleSearchStart(socket: AuthenticatedSocket, data: any) {
    try {
      // Emit search progress updates
      socket.emit('search:progress', {
        stage: 'parsing',
        message: 'Analyzing your search query...'
      });

      // Simulate search progress
      setTimeout(() => {
        socket.emit('search:progress', {
          stage: 'vector_search',
          message: 'Finding matching campsites...'
        });
      }, 1000);

      setTimeout(() => {
        socket.emit('search:progress', {
          stage: 'recommendations',
          message: 'Generating personalized recommendations...'
        });
      }, 2000);

      setTimeout(() => {
        socket.emit('search:complete', {
          searchId: data.searchId,
          message: 'Search completed successfully!'
        });
      }, 3000);
    } catch (error) {
      socket.emit('search:error', {
        searchId: data.searchId,
        error: 'Search failed'
      });
    }
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: any) {
    try {
      // Emit typing indicator
      socket.emit('chat:typing', { typing: true });

      // Simulate AI processing time
      setTimeout(() => {
        socket.emit('chat:typing', { typing: false });
        socket.emit('chat:response', {
          messageId: data.messageId,
          response: 'AI response here...',
          timestamp: new Date().toISOString()
        });
      }, 2000);
    } catch (error) {
      socket.emit('chat:error', {
        messageId: data.messageId,
        error: 'Chat service unavailable'
      });
    }
  }

  private async handleRoutePlanning(socket: AuthenticatedSocket, data: any) {
    try {
      socket.emit('route:progress', {
        stage: 'optimization',
        message: 'Optimizing route...'
      });

      setTimeout(() => {
        socket.emit('route:progress', {
          stage: 'weather',
          message: 'Checking weather conditions...'
        });
      }, 1500);

      setTimeout(() => {
        socket.emit('route:complete', {
          routeId: data.routeId,
          message: 'Route planned successfully!'
        });
      }, 3000);
    } catch (error) {
      socket.emit('route:error', {
        routeId: data.routeId,
        error: 'Route planning failed'
      });
    }
  }

  // Public methods for broadcasting updates

  public broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public broadcastBookingUpdate(bookingId: string, data: any) {
    this.io.to(`booking:${bookingId}`).emit('booking:updated', data);
  }

  public broadcastTripUpdate(tripId: string, data: any) {
    this.io.to(`trip:${tripId}`).emit('trip:updated', data);
  }

  public broadcastAvailabilityUpdate(campsiteId: string, data: any) {
    this.io.to(`availability:${campsiteId}`).emit('availability:updated', data);
  }

  public broadcastWeatherUpdate(coordinates: { lat: number; lng: number }, data: any) {
    const roomName = `weather:${coordinates.lat}:${coordinates.lng}`;
    this.io.to(roomName).emit('weather:updated', data);
  }

  public broadcastPriceAlert(userId: string, data: any) {
    this.broadcastToUser(userId, 'price:alert', data);
  }

  public broadcastSystemNotification(data: any) {
    this.io.emit('system:notification', data);
  }

  // Analytics and monitoring

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getSocketsCount(): number {
    return this.io.sockets.sockets.size;
  }

  public getUserSockets(userId: string): string[] {
    return this.connectedUsers.get(userId) || [];
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Rate limiting for real-time events
  private async checkEventRateLimit(userId: string, event: string): Promise<boolean> {
    const key = `ws_rate_limit:${userId}:${event}`;
    const count = await this.cacheService.increment(key);
    
    if (count === 1) {
      // Set expiry for first increment
      await this.cacheService.set(key, count, 60); // 1 minute window
    }
    
    return count <= 30; // Max 30 events per minute per user per event type
  }

  // Cleanup disconnected sockets
  public async cleanup() {
    setInterval(() => {
      this.connectedUsers.forEach((sockets, userId) => {
        const validSockets = sockets.filter(socketId => 
          this.io.sockets.sockets.has(socketId)
        );
        
        if (validSockets.length === 0) {
          this.connectedUsers.delete(userId);
        } else if (validSockets.length !== sockets.length) {
          this.connectedUsers.set(userId, validSockets);
        }
      });
    }, 30000); // Clean up every 30 seconds
  }
}