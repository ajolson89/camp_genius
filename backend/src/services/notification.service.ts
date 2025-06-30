import { supabaseAdmin } from '../config/database';
import { CacheService } from './cache.service';
import { WebSocketService } from './websocket.service';

interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
}

enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_FAILED = 'payment_failed',
  PRICE_DROP = 'price_drop',
  AVAILABILITY_ALERT = 'availability_alert',
  WEATHER_WARNING = 'weather_warning',
  TRIP_REMINDER = 'trip_reminder',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  AI_RECOMMENDATION = 'ai_recommendation'
}

interface PriceAlert {
  userId: string;
  campsiteId: string;
  targetPrice: number;
  currentPrice: number;
  equipmentType: string;
}

interface AvailabilityAlert {
  userId: string;
  campsiteId: string;
  checkInDate: string;
  checkOutDate: string;
  equipmentType: string;
}

export class NotificationService {
  private cacheService: CacheService;
  private websocketService?: WebSocketService;

  constructor(websocketService?: WebSocketService) {
    this.cacheService = new CacheService();
    this.websocketService = websocketService;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      createdAt: new Date()
    };

    // Store in database
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(newNotification)
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    // Send real-time notification
    if (this.websocketService) {
      this.websocketService.broadcastToUser(
        notification.userId,
        'notification:new',
        data
      );
    }

    // Cache unread count
    await this.updateUnreadCount(notification.userId);

    return data;
  }

  async getNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ) {
    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.unreadOnly) {
      query = query.eq('read', false);
    }

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], total: 0 };
    }

    return {
      notifications: data || [],
      total: count || 0
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    // Update cached unread count
    await this.updateUnreadCount(userId);

    return true;
  }

  async markAllAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }

    // Update cached unread count
    await this.updateUnreadCount(userId);

    return true;
  }

  async deleteNotification(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }

    await this.updateUnreadCount(userId);
    return true;
  }

  async getUnreadCount(userId: string): Promise<number> {
    // Check cache first
    const cached = await this.cacheService.get(`unread_count:${userId}`);
    if (cached !== null) {
      return cached;
    }

    // Query database
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }

    const unreadCount = count || 0;
    
    // Cache for 5 minutes
    await this.cacheService.set(`unread_count:${userId}`, unreadCount, 300);
    
    return unreadCount;
  }

  private async updateUnreadCount(userId: string) {
    const unreadCount = await this.getUnreadCount(userId);
    
    // Broadcast updated count
    if (this.websocketService) {
      this.websocketService.broadcastToUser(
        userId,
        'notification:unread_count',
        { count: unreadCount }
      );
    }
  }

  // Specific notification creators

  async notifyBookingConfirmed(userId: string, bookingId: string, campsiteName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking Confirmed!',
      message: `Your reservation at ${campsiteName} has been confirmed.`,
      data: { bookingId },
      read: false,
      priority: 'high'
    });
  }

  async notifyBookingCancelled(userId: string, bookingId: string, campsiteName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.BOOKING_CANCELLED,
      title: 'Booking Cancelled',
      message: `Your reservation at ${campsiteName} has been cancelled.`,
      data: { bookingId },
      read: false,
      priority: 'medium'
    });
  }

  async notifyPaymentFailed(userId: string, bookingId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please update your payment method.',
      data: { bookingId },
      read: false,
      priority: 'urgent'
    });
  }

  async notifyPriceDrop(alert: PriceAlert) {
    const { data: campsite } = await supabaseAdmin
      .from('campsites')
      .select('name')
      .eq('id', alert.campsiteId)
      .single();

    const savings = alert.targetPrice - alert.currentPrice;
    
    return this.createNotification({
      userId: alert.userId,
      type: NotificationType.PRICE_DROP,
      title: 'Price Drop Alert!',
      message: `${campsite?.name || 'Your watched campsite'} is now $${alert.currentPrice}/night. Save $${savings}!`,
      data: { 
        campsiteId: alert.campsiteId,
        oldPrice: alert.targetPrice,
        newPrice: alert.currentPrice,
        savings
      },
      read: false,
      priority: 'high'
    });
  }

  async notifyAvailabilityAlert(alert: AvailabilityAlert) {
    const { data: campsite } = await supabaseAdmin
      .from('campsites')
      .select('name')
      .eq('id', alert.campsiteId)
      .single();

    return this.createNotification({
      userId: alert.userId,
      type: NotificationType.AVAILABILITY_ALERT,
      title: 'Campsite Available!',
      message: `${campsite?.name || 'Your watched campsite'} is now available for your dates.`,
      data: {
        campsiteId: alert.campsiteId,
        checkInDate: alert.checkInDate,
        checkOutDate: alert.checkOutDate,
        equipmentType: alert.equipmentType
      },
      read: false,
      priority: 'high'
    });
  }

  async notifyWeatherWarning(userId: string, location: string, warning: string) {
    return this.createNotification({
      userId,
      type: NotificationType.WEATHER_WARNING,
      title: 'Weather Alert',
      message: `Weather warning for ${location}: ${warning}`,
      data: { location, warning },
      read: false,
      priority: 'medium'
    });
  }

  async notifyTripReminder(userId: string, tripId: string, tripName: string, daysUntil: number) {
    return this.createNotification({
      userId,
      type: NotificationType.TRIP_REMINDER,
      title: 'Trip Reminder',
      message: `Your trip "${tripName}" starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!`,
      data: { tripId },
      read: false,
      priority: 'medium'
    });
  }

  async notifyAIRecommendation(userId: string, campsiteId: string, reason: string) {
    const { data: campsite } = await supabaseAdmin
      .from('campsites')
      .select('name')
      .eq('id', campsiteId)
      .single();

    return this.createNotification({
      userId,
      type: NotificationType.AI_RECOMMENDATION,
      title: 'New Recommendation',
      message: `We found a perfect match: ${campsite?.name || 'A great campsite'}. ${reason}`,
      data: { campsiteId, reason },
      read: false,
      priority: 'low'
    });
  }

  // Scheduled notification processors

  async processPriceAlerts() {
    try {
      // Get all active price alerts
      const { data: alerts } = await supabaseAdmin
        .from('price_alerts')
        .select('*')
        .eq('active', true);

      if (!alerts) return;

      for (const alert of alerts) {
        // Check current price
        const { data: campsite } = await supabaseAdmin
          .from('campsites')
          .select('pricing')
          .eq('id', alert.campsite_id)
          .single();

        if (!campsite) continue;

        const currentPrice = campsite.pricing[alert.equipment_type];
        
        if (currentPrice && currentPrice <= alert.target_price) {
          await this.notifyPriceDrop({
            userId: alert.user_id,
            campsiteId: alert.campsite_id,
            targetPrice: alert.target_price,
            currentPrice,
            equipmentType: alert.equipment_type
          });

          // Deactivate the alert
          await supabaseAdmin
            .from('price_alerts')
            .update({ active: false })
            .eq('id', alert.id);
        }
      }
    } catch (error) {
      console.error('Failed to process price alerts:', error);
    }
  }

  async processAvailabilityAlerts() {
    try {
      // Get all active availability alerts
      const { data: alerts } = await supabaseAdmin
        .from('availability_alerts')
        .select('*')
        .eq('active', true);

      if (!alerts) return;

      for (const alert of alerts) {
        // Check availability
        const { data: availability } = await supabaseAdmin
          .from('availability')
          .select('*')
          .eq('campsite_id', alert.campsite_id)
          .gte('date', alert.check_in_date)
          .lte('date', alert.check_out_date);

        if (!availability) continue;

        // Check if all dates are available for the equipment type
        const allAvailable = availability.every(day => 
          day[alert.equipment_type] === true
        );

        if (allAvailable) {
          await this.notifyAvailabilityAlert({
            userId: alert.user_id,
            campsiteId: alert.campsite_id,
            checkInDate: alert.check_in_date,
            checkOutDate: alert.check_out_date,
            equipmentType: alert.equipment_type
          });

          // Deactivate the alert
          await supabaseAdmin
            .from('availability_alerts')
            .update({ active: false })
            .eq('id', alert.id);
        }
      }
    } catch (error) {
      console.error('Failed to process availability alerts:', error);
    }
  }

  async processTripReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

      // Get trips starting tomorrow or in 3 days
      const { data: trips } = await supabaseAdmin
        .from('trips')
        .select('*')
        .eq('status', 'upcoming')
        .in('start_date', [tomorrowStr, threeDaysStr]);

      if (!trips) return;

      for (const trip of trips) {
        const daysUntil = trip.start_date === tomorrowStr ? 1 : 3;
        
        await this.notifyTripReminder(
          trip.user_id,
          trip.id,
          trip.name,
          daysUntil
        );
      }
    } catch (error) {
      console.error('Failed to process trip reminders:', error);
    }
  }

  async cleanupExpiredNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabaseAdmin
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('read', true);

      console.log('Cleaned up old notifications');
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
  }
}