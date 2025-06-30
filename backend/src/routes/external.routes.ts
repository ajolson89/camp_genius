import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { WeatherService } from '../services/weather.service';
import { MapboxService } from '../services/mapbox.service';
import { RecreationGovService } from '../services/recreation-gov.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const weatherService = new WeatherService();
const mapboxService = new MapboxService();
const recreationGovService = new RecreationGovService();

// Weather endpoints

const weatherSchema = z.object({
  query: z.object({
    lat: z.string(),
    lng: z.string()
  })
});

router.get('/weather', validateRequest(weatherSchema), async (req, res, next) => {
  try {
    const { lat, lng } = req.query as { lat: string; lng: string };
    
    const coordinates = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };
    
    const weatherData = await weatherService.getWeatherForLocation(coordinates);
    
    res.json(weatherData);
  } catch (error) {
    next(error);
  }
});

const weatherAssessmentSchema = z.object({
  body: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

router.post('/weather/assessment', validateRequest(weatherAssessmentSchema), async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    
    const coordinates = { latitude: lat, longitude: lng };
    const weatherData = await weatherService.getWeatherForLocation(coordinates);
    const assessment = await weatherService.assessCampingConditions(weatherData);
    
    res.json({
      weather: weatherData,
      assessment
    });
  } catch (error) {
    next(error);
  }
});

// Mapbox routing endpoints

const routeSchema = z.object({
  body: z.object({
    waypoints: z.array(z.object({
      latitude: z.number(),
      longitude: z.number()
    })).min(2),
    profile: z.enum(['driving', 'driving-traffic', 'walking', 'cycling']).default('driving'),
    alternatives: z.boolean().default(false),
    rvRestrictions: z.object({
      maxHeight: z.number().optional(),
      maxWidth: z.number().optional(),
      maxLength: z.number().optional(),
      maxWeight: z.number().optional(),
      hazmat: z.boolean().optional()
    }).optional()
  })
});

router.post('/routing/route', validateRequest(routeSchema), async (req, res, next) => {
  try {
    const { waypoints, profile, alternatives, rvRestrictions } = req.body;
    
    const route = await mapboxService.getRoute(
      waypoints,
      { profile, alternatives },
      rvRestrictions
    );
    
    res.json(route);
  } catch (error) {
    next(error);
  }
});

const optimizedRouteSchema = z.object({
  body: z.object({
    waypoints: z.array(z.object({
      latitude: z.number(),
      longitude: z.number()
    })).min(3),
    profile: z.enum(['driving', 'driving-traffic']).default('driving')
  })
});

router.post('/routing/optimize', validateRequest(optimizedRouteSchema), async (req, res, next) => {
  try {
    const { waypoints, profile } = req.body;
    
    const optimizedRoute = await mapboxService.getOptimizedRoute(waypoints, { profile });
    
    res.json(optimizedRoute);
  } catch (error) {
    next(error);
  }
});

const geocodeSchema = z.object({
  query: z.object({
    address: z.string().min(3)
  })
});

router.get('/geocoding/forward', validateRequest(geocodeSchema), async (req, res, next) => {
  try {
    const { address } = req.query as { address: string };
    
    const coordinates = await mapboxService.geocodeAddress(address);
    
    if (!coordinates) {
      throw new AppError(404, 'Address not found');
    }
    
    res.json(coordinates);
  } catch (error) {
    next(error);
  }
});

const reverseGeocodeSchema = z.object({
  query: z.object({
    lat: z.string(),
    lng: z.string()
  })
});

router.get('/geocoding/reverse', validateRequest(reverseGeocodeSchema), async (req, res, next) => {
  try {
    const { lat, lng } = req.query as { lat: string; lng: string };
    
    const coordinates = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };
    
    const address = await mapboxService.reverseGeocode(coordinates);
    
    if (!address) {
      throw new AppError(404, 'Address not found');
    }
    
    res.json({ address });
  } catch (error) {
    next(error);
  }
});

const poisSchema = z.object({
  query: z.object({
    lat: z.string(),
    lng: z.string(),
    category: z.string(),
    radius: z.string().default('1000')
  })
});

router.get('/pois', validateRequest(poisSchema), async (req, res, next) => {
  try {
    const { lat, lng, category, radius } = req.query as {
      lat: string;
      lng: string;
      category: string;
      radius: string;
    };
    
    const coordinates = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };
    
    const pois = await mapboxService.findNearbyPOIs(
      coordinates,
      category,
      parseInt(radius)
    );
    
    res.json(pois);
  } catch (error) {
    next(error);
  }
});

// Recreation.gov endpoints

const recreationSearchSchema = z.object({
  query: z.object({
    lat: z.string().optional(),
    lng: z.string().optional(),
    state: z.string().optional(),
    radius: z.string().default('25'),
    limit: z.string().default('20')
  })
});

router.get('/recreation-gov/search', validateRequest(recreationSearchSchema), async (req, res, next) => {
  try {
    const { lat, lng, state, radius, limit } = req.query as {
      lat?: string;
      lng?: string;
      state?: string;
      radius: string;
      limit: string;
    };
    
    const searchParams: any = {
      radius: parseFloat(radius),
      limit: parseInt(limit)
    };
    
    if (lat && lng) {
      searchParams.latitude = parseFloat(lat);
      searchParams.longitude = parseFloat(lng);
    }
    
    if (state) {
      searchParams.state = state;
    }
    
    const campsites = await recreationGovService.searchCampsites(searchParams);
    
    res.json(campsites);
  } catch (error) {
    next(error);
  }
});

router.get('/recreation-gov/facility/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const campsite = await recreationGovService.getCampsiteDetails(id);
    
    if (!campsite) {
      throw new AppError(404, 'Facility not found');
    }
    
    res.json(campsite);
  } catch (error) {
    next(error);
  }
});

const availabilitySchema = z.object({
  query: z.object({
    startDate: z.string(),
    endDate: z.string()
  })
});

router.get('/recreation-gov/facility/:id/availability', validateRequest(availabilitySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    
    const availability = await recreationGovService.getAvailability(id, startDate, endDate);
    
    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Trip planning helper endpoint
const tripPlanningSchema = z.object({
  body: z.object({
    startLocation: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    campsites: z.array(z.object({
      id: z.string(),
      latitude: z.number(),
      longitude: z.number()
    })).min(1),
    endLocation: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional(),
    rvRestrictions: z.object({
      maxHeight: z.number().optional(),
      maxWidth: z.number().optional(),
      maxLength: z.number().optional(),
      maxWeight: z.number().optional()
    }).optional()
  })
});

router.post('/trip-planning', validateRequest(tripPlanningSchema), async (req, res, next) => {
  try {
    const { startLocation, campsites, endLocation, rvRestrictions } = req.body;
    
    // Build waypoints array
    const waypoints = [
      startLocation,
      ...campsites.map(c => ({ latitude: c.latitude, longitude: c.longitude }))
    ];
    
    if (endLocation) {
      waypoints.push(endLocation);
    }
    
    // Get optimized route
    const route = waypoints.length > 2 
      ? await mapboxService.getOptimizedRoute(waypoints, { profile: 'driving' })
      : await mapboxService.getRoute(waypoints, { profile: 'driving' }, rvRestrictions);
    
    // Get weather for each campsite
    const weatherPromises = campsites.map(campsite =>
      weatherService.getWeatherForLocation({
        latitude: campsite.latitude,
        longitude: campsite.longitude
      })
    );
    
    const weatherData = await Promise.all(weatherPromises);
    
    // Assess camping conditions for each location
    const assessmentPromises = weatherData.map(weather =>
      weatherService.assessCampingConditions(weather)
    );
    
    const assessments = await Promise.all(assessmentPromises);
    
    res.json({
      route,
      weather: weatherData.map((weather, index) => ({
        campsiteId: campsites[index].id,
        weather,
        assessment: assessments[index]
      })),
      summary: {
        totalDistance: route.distance,
        totalDuration: route.duration,
        numberOfStops: campsites.length,
        weatherWarnings: assessments.reduce((total, assessment) => 
          total + assessment.warnings.length, 0
        )
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;