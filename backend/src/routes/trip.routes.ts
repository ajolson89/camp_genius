import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Create trip schema
const createTripSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    campsites: z.array(z.string().uuid()).min(1)
  })
});

// Get user's trips
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    
    let query = supabaseAdmin
      .from('trips')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('start_date', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    query = query.range(offset, offset + limitNum - 1);
    
    const { data: trips, error, count } = await query;
    
    if (error) {
      throw new AppError(500, 'Failed to fetch trips');
    }
    
    // Fetch campsite details for each trip
    const tripsWithCampsites = await Promise.all(
      (trips || []).map(async (trip) => {
        if (trip.campsites && trip.campsites.length > 0) {
          const { data: campsites } = await supabaseAdmin
            .from('campsites')
            .select('id, name, location, coordinates, images')
            .in('id', trip.campsites);
          
          return {
            ...trip,
            campsiteDetails: campsites || []
          };
        }
        return { ...trip, campsiteDetails: [] };
      })
    );
    
    res.json({
      trips: tripsWithCampsites,
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

// Get single trip
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();
    
    if (error || !trip) {
      throw new AppError(404, 'Trip not found');
    }
    
    // Fetch campsite details
    let campsiteDetails = [];
    if (trip.campsites && trip.campsites.length > 0) {
      const { data: campsites } = await supabaseAdmin
        .from('campsites')
        .select('*')
        .in('id', trip.campsites);
      
      campsiteDetails = campsites || [];
    }
    
    // Fetch bookings for this trip
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('user_id', req.user!.id)
      .in('campsite_id', trip.campsites)
      .gte('check_in_date', trip.start_date)
      .lte('check_out_date', trip.end_date);
    
    res.json({
      ...trip,
      campsiteDetails,
      bookings: bookings || []
    });
  } catch (error) {
    next(error);
  }
});

// Create trip
router.post('/', authenticate, validateRequest(createTripSchema), async (req: AuthRequest, res, next) => {
  try {
    const { name, startDate, endDate, campsites } = req.body;
    
    // Verify all campsites exist
    const { data: existingCampsites, error: campsiteError } = await supabaseAdmin
      .from('campsites')
      .select('id')
      .in('id', campsites);
    
    if (campsiteError || !existingCampsites || existingCampsites.length !== campsites.length) {
      throw new AppError(400, 'One or more campsites not found');
    }
    
    // Create trip
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: req.user!.id,
        name,
        start_date: startDate,
        end_date: endDate,
        campsites,
        status: 'upcoming'
      })
      .select()
      .single();
    
    if (error || !trip) {
      throw new AppError(500, 'Failed to create trip');
    }
    
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

// Update trip
const updateTripSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    campsites: z.array(z.string().uuid()).min(1).optional(),
    status: z.enum(['upcoming', 'completed', 'cancelled']).optional()
  })
});

router.patch('/:id', authenticate, validateRequest(updateTripSchema), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Verify trip belongs to user
    const { data: existingTrip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();
    
    if (fetchError || !existingTrip) {
      throw new AppError(404, 'Trip not found');
    }
    
    // If updating campsites, verify they exist
    if (req.body.campsites) {
      const { data: existingCampsites, error: campsiteError } = await supabaseAdmin
        .from('campsites')
        .select('id')
        .in('id', req.body.campsites);
      
      if (campsiteError || !existingCampsites || existingCampsites.length !== req.body.campsites.length) {
        throw new AppError(400, 'One or more campsites not found');
      }
    }
    
    // Update trip
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.startDate) updateData.start_date = req.body.startDate;
    if (req.body.endDate) updateData.end_date = req.body.endDate;
    if (req.body.campsites) updateData.campsites = req.body.campsites;
    if (req.body.status) updateData.status = req.body.status;
    
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !trip) {
      throw new AppError(500, 'Failed to update trip');
    }
    
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Delete trip
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);
    
    if (error) {
      throw new AppError(500, 'Failed to delete trip');
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;