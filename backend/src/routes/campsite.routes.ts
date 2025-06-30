import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/database';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { AppError } from '../middleware/errorHandler';
import { SearchFilters } from '../types';

const router = Router();

// Search campsites
const searchSchema = z.object({
  query: z.object({
    location: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    numberOfGuests: z.string().optional(),
    equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    amenities: z.string().optional(),
    petFriendly: z.string().optional(),
    wheelchairAccessible: z.string().optional(),
    source: z.string().optional(),
    page: z.string().default('1'),
    limit: z.string().default('20')
  })
});

router.get('/', optionalAuth, validateRequest(searchSchema), async (req: AuthRequest, res, next) => {
  try {
    const {
      location,
      lat,
      lng,
      radius = '50',
      checkInDate,
      checkOutDate,
      numberOfGuests,
      equipmentType,
      minPrice,
      maxPrice,
      amenities,
      petFriendly,
      wheelchairAccessible,
      source,
      page,
      limit
    } = req.query as any;
    
    let query = supabaseAdmin.from('campsites').select('*', { count: 'exact' });
    
    // Location-based search
    if (lat && lng) {
      const radiusInMeters = parseFloat(radius) * 1609.34; // Convert miles to meters
      query = query.rpc('nearby_campsites', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_meters: radiusInMeters
      });
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      if (minPrice) {
        query = query.gte(`pricing->>${equipmentType || 'tent'}`, parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte(`pricing->>${equipmentType || 'tent'}`, parseFloat(maxPrice));
      }
    }
    
    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(',');
      query = query.contains('amenities', amenityList);
    }
    
    // Pet friendly filter
    if (petFriendly === 'true') {
      query = query.eq('policies->>petFriendly', true);
    }
    
    // Wheelchair accessible filter
    if (wheelchairAccessible === 'true') {
      query = query.eq('accessibility->>wheelchairAccessible', true);
    }
    
    // Source filter
    if (source) {
      const sources = source.split(',');
      query = query.in('source', sources);
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    query = query.range(offset, offset + limitNum - 1);
    
    const { data: campsites, error, count } = await query;
    
    if (error) {
      throw new AppError(500, 'Failed to search campsites');
    }
    
    // If user is authenticated, fetch their saved campsites
    let savedCampsiteIds: string[] = [];
    if (req.user) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('saved_campsites')
        .eq('id', req.user.id)
        .single();
      
      savedCampsiteIds = user?.saved_campsites || [];
    }
    
    // Add saved status to each campsite
    const campsitesWithSavedStatus = (campsites || []).map(campsite => ({
      ...campsite,
      isSaved: savedCampsiteIds.includes(campsite.id)
    }));
    
    res.json({
      campsites: campsitesWithSavedStatus,
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

// Get campsite by ID
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const { data: campsite, error } = await supabaseAdmin
      .from('campsites')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !campsite) {
      throw new AppError(404, 'Campsite not found');
    }
    
    // Check if saved by user
    let isSaved = false;
    if (req.user) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('saved_campsites')
        .eq('id', req.user.id)
        .single();
      
      isSaved = user?.saved_campsites?.includes(id) || false;
    }
    
    // Fetch reviews
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('*, users(name, avatar)')
      .eq('campsite_id', id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    res.json({
      ...campsite,
      isSaved,
      reviews: reviews || []
    });
  } catch (error) {
    next(error);
  }
});

// Get campsite availability
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError(400, 'Start date and end date are required');
    }
    
    const { data: availability, error } = await supabaseAdmin
      .from('availability')
      .select('*')
      .eq('campsite_id', id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error) {
      throw new AppError(500, 'Failed to fetch availability');
    }
    
    res.json(availability || []);
  } catch (error) {
    next(error);
  }
});

// Create function for nearby campsites search
const createNearbySearchFunction = `
CREATE OR REPLACE FUNCTION nearby_campsites(
  lat FLOAT,
  lng FLOAT,
  radius_meters FLOAT
)
RETURNS SETOF campsites AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM campsites
  WHERE ST_DWithin(
    coordinates::geometry,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geometry,
    radius_meters
  );
END;
$$ LANGUAGE plpgsql;
`;

export default router;