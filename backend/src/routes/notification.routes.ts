import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get notifications
const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().default('1'),
    limit: z.string().default('20'),
    unreadOnly: z.string().optional(),
    type: z.string().optional()
  })
});

router.get('/', authenticate, validateRequest(getNotificationsSchema), async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, unreadOnly, type } = req.query as {
      page: string;
      limit: string;
      unreadOnly?: string;
      type?: string;
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (unreadOnly === 'true') {
      query = query.eq('read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    query = query.range(offset, offset + limitNum - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      throw new AppError(500, 'Failed to fetch notifications');
    }

    res.json({
      notifications: notifications || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user!.id)
      .eq('read', false);

    if (error) {
      throw new AppError(500, 'Failed to get unread count');
    }

    res.json({ count: count || 0 });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError(500, 'Failed to mark notification as read');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user!.id)
      .eq('read', false);

    if (error) {
      throw new AppError(500, 'Failed to mark all notifications as read');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError(500, 'Failed to delete notification');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Create price alert
const priceAlertSchema = z.object({
  body: z.object({
    campsiteId: z.string().uuid(),
    targetPrice: z.number().min(0),
    equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping'])
  })
});

router.post('/price-alerts', authenticate, validateRequest(priceAlertSchema), async (req: AuthRequest, res, next) => {
  try {
    const { campsiteId, targetPrice, equipmentType } = req.body;

    // Check if alert already exists
    const { data: existingAlert } = await supabaseAdmin
      .from('price_alerts')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('campsite_id', campsiteId)
      .eq('equipment_type', equipmentType)
      .eq('active', true)
      .single();

    if (existingAlert) {
      throw new AppError(409, 'Price alert already exists for this campsite and equipment type');
    }

    const { data: alert, error } = await supabaseAdmin
      .from('price_alerts')
      .insert({
        user_id: req.user!.id,
        campsite_id: campsiteId,
        target_price: targetPrice,
        equipment_type: equipmentType,
        active: true
      })
      .select()
      .single();

    if (error || !alert) {
      throw new AppError(500, 'Failed to create price alert');
    }

    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

// Create availability alert
const availabilityAlertSchema = z.object({
  body: z.object({
    campsiteId: z.string().uuid(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping'])
  })
});

router.post('/availability-alerts', authenticate, validateRequest(availabilityAlertSchema), async (req: AuthRequest, res, next) => {
  try {
    const { campsiteId, checkInDate, checkOutDate, equipmentType } = req.body;

    // Check if alert already exists
    const { data: existingAlert } = await supabaseAdmin
      .from('availability_alerts')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('campsite_id', campsiteId)
      .eq('check_in_date', checkInDate)
      .eq('check_out_date', checkOutDate)
      .eq('equipment_type', equipmentType)
      .eq('active', true)
      .single();

    if (existingAlert) {
      throw new AppError(409, 'Availability alert already exists for these dates');
    }

    const { data: alert, error } = await supabaseAdmin
      .from('availability_alerts')
      .insert({
        user_id: req.user!.id,
        campsite_id: campsiteId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        equipment_type: equipmentType,
        active: true
      })
      .select()
      .single();

    if (error || !alert) {
      throw new AppError(500, 'Failed to create availability alert');
    }

    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

// Get user's alerts
router.get('/alerts', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { data: priceAlerts } = await supabaseAdmin
      .from('price_alerts')
      .select('*, campsites(name)')
      .eq('user_id', req.user!.id)
      .eq('active', true);

    const { data: availabilityAlerts } = await supabaseAdmin
      .from('availability_alerts')
      .select('*, campsites(name)')
      .eq('user_id', req.user!.id)
      .eq('active', true);

    res.json({
      priceAlerts: priceAlerts || [],
      availabilityAlerts: availabilityAlerts || []
    });
  } catch (error) {
    next(error);
  }
});

// Delete price alert
router.delete('/price-alerts/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('price_alerts')
      .update({ active: false })
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError(500, 'Failed to delete price alert');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Delete availability alert
router.delete('/availability-alerts/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('availability_alerts')
      .update({ active: false })
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError(500, 'Failed to delete availability alert');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;