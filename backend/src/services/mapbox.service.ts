import axios from 'axios';
import { config } from '../config/env';
import { Coordinates } from '../types';
import { AppError } from '../middleware/errorHandler';
import { CacheService } from './cache.service';

interface RouteOptions {
  profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
  alternatives?: boolean;
  geometries?: 'geojson' | 'polyline';
  overview?: 'full' | 'simplified' | 'false';
  steps?: boolean;
  voiceInstructions?: boolean;
  bannerInstructions?: boolean;
  roundaboutExits?: boolean;
  exclude?: string[];
  approaches?: string[];
  waypoints?: number[];
  waypointNames?: string[];
}

interface RVRestrictions {
  maxHeight?: number; // in meters
  maxWidth?: number; // in meters
  maxLength?: number; // in meters
  maxWeight?: number; // in kg
  hazmat?: boolean;
}

export class MapboxService {
  private cacheService: CacheService;
  private baseUrl = 'https://api.mapbox.com';

  constructor() {
    this.cacheService = new CacheService();
  }

  async getRoute(
    waypoints: Coordinates[],
    options: RouteOptions = { profile: 'driving' },
    rvRestrictions?: RVRestrictions
  ) {
    const cacheKey = `mapbox:route:${JSON.stringify({ waypoints, options, rvRestrictions })}`;
    
    // Check cache first (cache for 1 hour)
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Build coordinates string
      const coordinatesStr = waypoints
        .map(wp => `${wp.longitude},${wp.latitude}`)
        .join(';');

      // Build URL
      let url = `${this.baseUrl}/directions/v5/mapbox/${options.profile}/${coordinatesStr}`;

      // Add RV profile if restrictions are provided
      if (rvRestrictions) {
        // Switch to truck profile for RV routing
        url = url.replace(options.profile, 'driving-traffic');
      }

      const params: any = {
        access_token: config.external.mapboxApiKey,
        alternatives: options.alternatives || false,
        geometries: options.geometries || 'geojson',
        overview: options.overview || 'full',
        steps: options.steps || true,
        voice_instructions: options.voiceInstructions || false,
        banner_instructions: options.bannerInstructions || false,
        roundabout_exits: options.roundaboutExits || true
      };

      // Add RV restrictions as annotations
      if (rvRestrictions) {
        const annotations = [];
        if (rvRestrictions.maxHeight) annotations.push(`max_height:${rvRestrictions.maxHeight}`);
        if (rvRestrictions.maxWidth) annotations.push(`max_width:${rvRestrictions.maxWidth}`);
        if (rvRestrictions.maxLength) annotations.push(`max_length:${rvRestrictions.maxLength}`);
        if (rvRestrictions.maxWeight) annotations.push(`max_weight:${rvRestrictions.maxWeight}`);
        
        if (annotations.length > 0) {
          params.annotations = annotations.join(',');
        }
      }

      if (options.exclude && options.exclude.length > 0) {
        params.exclude = options.exclude.join(',');
      }

      const response = await axios.get(url, { params });

      const routeData = this.transformRouteResponse(response.data, waypoints);

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, routeData, 3600);

      return routeData;
    } catch (error) {
      console.error('Mapbox routing error:', error);
      throw new AppError(503, 'Routing service unavailable');
    }
  }

  async getOptimizedRoute(waypoints: Coordinates[], options: RouteOptions = { profile: 'driving' }) {
    const cacheKey = `mapbox:optimized:${JSON.stringify({ waypoints, options })}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // For optimization, we need at least 3 waypoints
      if (waypoints.length < 3) {
        return this.getRoute(waypoints, options);
      }

      // Use Mapbox Optimization API
      const coordinatesStr = waypoints
        .map(wp => `${wp.longitude},${wp.latitude}`)
        .join(';');

      const response = await axios.get(
        `${this.baseUrl}/optimized-trips/v1/mapbox/${options.profile}/${coordinatesStr}`,
        {
          params: {
            access_token: config.external.mapboxApiKey,
            source: 'first',
            destination: 'last',
            roundtrip: false,
            geometries: 'geojson',
            overview: 'full',
            steps: true
          }
        }
      );

      const optimizedData = this.transformOptimizedRouteResponse(response.data, waypoints);

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, optimizedData, 3600);

      return optimizedData;
    } catch (error) {
      console.error('Mapbox optimization error:', error);
      // Fallback to regular routing
      return this.getRoute(waypoints, options);
    }
  }

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    const cacheKey = `mapbox:geocode:${address}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
        {
          params: {
            access_token: config.external.mapboxApiKey,
            limit: 1,
            types: 'place,locality,neighborhood,address'
          }
        }
      );

      if (response.data.features.length === 0) {
        return null;
      }

      const feature = response.data.features[0];
      const coordinates = {
        longitude: feature.center[0],
        latitude: feature.center[1]
      };

      // Cache for 24 hours
      await this.cacheService.set(cacheKey, coordinates, 86400);

      return coordinates;
    } catch (error) {
      console.error('Mapbox geocoding error:', error);
      return null;
    }
  }

  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    const cacheKey = `mapbox:reverse:${coordinates.latitude}:${coordinates.longitude}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json`,
        {
          params: {
            access_token: config.external.mapboxApiKey,
            types: 'place,locality,neighborhood,address'
          }
        }
      );

      if (response.data.features.length === 0) {
        return null;
      }

      const placeName = response.data.features[0].place_name;

      // Cache for 24 hours
      await this.cacheService.set(cacheKey, placeName, 86400);

      return placeName;
    } catch (error) {
      console.error('Mapbox reverse geocoding error:', error);
      return null;
    }
  }

  async findNearbyPOIs(
    coordinates: Coordinates,
    category: string,
    radius: number = 1000
  ) {
    const cacheKey = `mapbox:pois:${coordinates.latitude}:${coordinates.longitude}:${category}:${radius}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${category}.json`,
        {
          params: {
            access_token: config.external.mapboxApiKey,
            proximity: `${coordinates.longitude},${coordinates.latitude}`,
            bbox: this.createBoundingBox(coordinates, radius),
            limit: 20
          }
        }
      );

      const pois = response.data.features.map((feature: any) => ({
        name: feature.text,
        address: feature.place_name,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1]
        },
        category: feature.properties.category,
        distance: this.calculateDistance(coordinates, {
          longitude: feature.center[0],
          latitude: feature.center[1]
        })
      }));

      // Cache for 2 hours
      await this.cacheService.set(cacheKey, pois, 7200);

      return pois;
    } catch (error) {
      console.error('Mapbox POI search error:', error);
      return [];
    }
  }

  private transformRouteResponse(data: any, originalWaypoints: Coordinates[]) {
    if (!data.routes || data.routes.length === 0) {
      throw new AppError(404, 'No route found');
    }

    const route = data.routes[0];
    
    return {
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      geometry: route.geometry,
      legs: route.legs?.map((leg: any, index: number) => ({
        distance: leg.distance,
        duration: leg.duration,
        steps: leg.steps?.map((step: any) => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.maneuver.instruction,
          name: step.name,
          coordinates: {
            latitude: step.maneuver.location[1],
            longitude: step.maneuver.location[0]
          }
        })) || [],
        startPoint: originalWaypoints[index],
        endPoint: originalWaypoints[index + 1]
      })) || [],
      waypoints: data.waypoints?.map((wp: any) => ({
        latitude: wp.location[1],
        longitude: wp.location[0],
        name: wp.name
      })) || originalWaypoints
    };
  }

  private transformOptimizedRouteResponse(data: any, originalWaypoints: Coordinates[]) {
    if (!data.trips || data.trips.length === 0) {
      throw new AppError(404, 'No optimized route found');
    }

    const trip = data.trips[0];
    
    return {
      distance: trip.distance,
      duration: trip.duration,
      geometry: trip.geometry,
      optimizedOrder: data.waypoints?.map((wp: any) => wp.waypoint_index) || [],
      legs: trip.legs?.map((leg: any, index: number) => ({
        distance: leg.distance,
        duration: leg.duration,
        steps: leg.steps?.map((step: any) => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.maneuver.instruction,
          name: step.name,
          coordinates: {
            latitude: step.maneuver.location[1],
            longitude: step.maneuver.location[0]
          }
        })) || []
      })) || [],
      waypoints: data.waypoints?.map((wp: any) => ({
        latitude: wp.location[1],
        longitude: wp.location[0],
        waypointIndex: wp.waypoint_index
      })) || originalWaypoints
    };
  }

  private createBoundingBox(center: Coordinates, radiusMeters: number): string {
    // Convert radius from meters to degrees (approximate)
    const radiusDegrees = radiusMeters / 111320;
    
    const minLng = center.longitude - radiusDegrees;
    const minLat = center.latitude - radiusDegrees;
    const maxLng = center.longitude + radiusDegrees;
    const maxLat = center.latitude + radiusDegrees;
    
    return `${minLng},${minLat},${maxLng},${maxLat}`;
  }

  private calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  async getElevationProfile(coordinates: Coordinates[]): Promise<number[]> {
    try {
      const coordinatesStr = coordinates
        .map(coord => `${coord.longitude},${coord.latitude}`)
        .join(';');

      const response = await axios.get(
        `${this.baseUrl}/v4/mapbox.mapbox-terrain-v2/tilequery/${coordinatesStr}.json`,
        {
          params: {
            access_token: config.external.mapboxApiKey
          }
        }
      );

      // Extract elevation data from response
      // Note: This is a simplified implementation
      // The actual Mapbox Tilequery API has a different structure
      return coordinates.map(() => 0); // Placeholder
    } catch (error) {
      console.error('Elevation profile error:', error);
      return coordinates.map(() => 0);
    }
  }

  async getTrafficIncidents(boundingBox: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/traffic/v1/incidents`,
        {
          params: {
            access_token: config.external.mapboxApiKey,
            bbox: boundingBox
          }
        }
      );

      return response.data.incidents?.map((incident: any) => ({
        id: incident.id,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        coordinates: {
          latitude: incident.geometry.coordinates[1],
          longitude: incident.geometry.coordinates[0]
        },
        startTime: incident.start_time,
        endTime: incident.end_time
      })) || [];
    } catch (error) {
      console.error('Traffic incidents error:', error);
      return [];
    }
  }
}