import axios from 'axios';
import { config } from '../config/env';
import { Campsite, Coordinates, EquipmentType, Availability } from '../types';
import { AppError } from '../middleware/errorHandler';
import { CacheService } from './cache.service';

export class RecreationGovService {
  private cacheService: CacheService;
  private baseUrl = 'https://ridb.recreation.gov/api/v1';

  constructor() {
    this.cacheService = new CacheService();
  }

  async searchCampsites(params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    state?: string;
    activity?: string;
    limit?: number;
  }) {
    const cacheKey = `recreation-gov:search:${JSON.stringify(params)}`;
    
    // Check cache first (cache for 1 hour)
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Search for campgrounds
      const campgroundsResponse = await axios.get(`${this.baseUrl}/facilities`, {
        headers: {
          'apikey': config.external.recreationGovApiKey
        },
        params: {
          activity: '9', // Camping activity ID
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius || 25,
          state: params.state,
          limit: params.limit || 50
        }
      });

      const campsites = await Promise.all(
        campgroundsResponse.data.RECDATA.map(async (facility: any) => {
          return this.transformToCampsite(facility);
        })
      );

      // Cache results for 1 hour
      await this.cacheService.set(cacheKey, campsites, 3600);

      return campsites;
    } catch (error) {
      console.error('Recreation.gov API error:', error);
      throw new AppError(503, 'Recreation.gov service unavailable');
    }
  }

  async getCampsiteDetails(facilityId: string): Promise<Campsite | null> {
    const cacheKey = `recreation-gov:facility:${facilityId}`;
    
    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get facility details
      const facilityResponse = await axios.get(`${this.baseUrl}/facilities/${facilityId}`, {
        headers: {
          'apikey': config.external.recreationGovApiKey
        }
      });

      // Get campsites within facility
      const campsitesResponse = await axios.get(`${this.baseUrl}/facilities/${facilityId}/campsites`, {
        headers: {
          'apikey': config.external.recreationGovApiKey
        }
      });

      // Get activities
      const activitiesResponse = await axios.get(`${this.baseUrl}/facilities/${facilityId}/activities`, {
        headers: {
          'apikey': config.external.recreationGovApiKey
        }
      });

      const campsite = this.transformDetailedToCampsite(
        facilityResponse.data,
        campsitesResponse.data.RECDATA || [],
        activitiesResponse.data.RECDATA || []
      );

      // Cache for 2 hours
      await this.cacheService.set(cacheKey, campsite, 7200);

      return campsite;
    } catch (error) {
      console.error('Recreation.gov facility details error:', error);
      return null;
    }
  }

  async getAvailability(facilityId: string, startDate: string, endDate: string): Promise<Availability[]> {
    const cacheKey = `recreation-gov:availability:${facilityId}:${startDate}:${endDate}`;
    
    // Check cache first (cache for 15 minutes due to frequent updates)
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Recreation.gov uses a different availability API
      const availabilityResponse = await axios.get(`https://www.recreation.gov/api/camps/availability/campground/${facilityId}/month`, {
        params: {
          start_date: startDate
        }
      });

      const availability = this.transformAvailability(
        availabilityResponse.data.campsites,
        startDate,
        endDate
      );

      // Cache for 15 minutes
      await this.cacheService.set(cacheKey, availability, 900);

      return availability;
    } catch (error) {
      console.error('Recreation.gov availability error:', error);
      return [];
    }
  }

  private transformToCampsite(facility: any): Campsite {
    return {
      id: facility.FacilityID,
      name: facility.FacilityName,
      description: facility.FacilityDescription || '',
      location: {
        address: facility.FacilityStreetAddress1 || '',
        city: facility.FacilityCity || '',
        state: facility.FacilityStateCode || '',
        zipCode: facility.FacilityZipCode || '',
        country: 'USA'
      },
      coordinates: {
        latitude: parseFloat(facility.FacilityLatitude),
        longitude: parseFloat(facility.FacilityLongitude)
      },
      images: facility.MEDIA?.map((media: any) => media.URL) || [],
      pricing: this.extractPricing(facility),
      availability: [],
      amenities: this.extractAmenities(facility),
      accessibility: this.extractAccessibility(facility),
      policies: this.extractPolicies(facility),
      rating: 0,
      reviewCount: 0,
      source: 'recreation_gov',
      externalId: facility.FacilityID,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private transformDetailedToCampsite(
    facility: any,
    campsites: any[],
    activities: any[]
  ): Campsite {
    const baseCampsite = this.transformToCampsite(facility);
    
    // Enhanced with detailed information
    return {
      ...baseCampsite,
      description: facility.FacilityDescription || baseCampsite.description,
      amenities: [
        ...baseCampsite.amenities,
        ...activities.map((activity: any) => activity.ActivityName)
      ],
      policies: {
        ...baseCampsite.policies,
        ...this.extractDetailedPolicies(facility, campsites)
      }
    };
  }

  private extractPricing(facility: any) {
    // Recreation.gov pricing is complex - this is a simplified extraction
    const basePrice = 25; // Default price
    
    return {
      tent: basePrice,
      rv: basePrice + 10,
      cabin: facility.FacilityTypeDescription?.includes('Cabin') ? basePrice + 50 : undefined,
      glamping: undefined
    };
  }

  private extractAmenities(facility: any): string[] {
    const amenities: string[] = [];
    
    if (facility.FacilityPhone) amenities.push('Phone service');
    if (facility.FACILITYADDRESS?.[0]?.AddressStateCode) amenities.push('State park');
    
    // Extract from description
    const description = (facility.FacilityDescription || '').toLowerCase();
    
    if (description.includes('shower')) amenities.push('Showers');
    if (description.includes('restroom') || description.includes('bathroom')) amenities.push('Restrooms');
    if (description.includes('water')) amenities.push('Water hookups');
    if (description.includes('electric')) amenities.push('Electric hookups');
    if (description.includes('fire')) amenities.push('Fire rings');
    if (description.includes('picnic')) amenities.push('Picnic tables');
    if (description.includes('boat') || description.includes('lake')) amenities.push('Boating');
    if (description.includes('hiking') || description.includes('trail')) amenities.push('Hiking trails');
    if (description.includes('swimming')) amenities.push('Swimming');
    if (description.includes('fishing')) amenities.push('Fishing');

    return amenities;
  }

  private extractAccessibility(facility: any) {
    const description = (facility.FacilityDescription || '').toLowerCase();
    
    return {
      wheelchairAccessible: description.includes('accessible') || description.includes('ada'),
      accessibleParking: description.includes('accessible') || description.includes('ada'),
      accessibleToilets: description.includes('accessible restroom') || description.includes('ada'),
      pavementPaths: description.includes('paved'),
      assistanceAnimalsAllowed: true, // Generally allowed in federal facilities
      audioGuides: false,
      brailleSignage: false,
      largeTextAvailable: false,
      quietAreas: true,
      sensoryFriendly: false,
      features: []
    };
  }

  private extractPolicies(facility: any) {
    const description = (facility.FacilityDescription || '').toLowerCase();
    
    return {
      petFriendly: !description.includes('no pets') && !description.includes('pets not allowed'),
      maxPets: 2, // Typical federal limit
      petRestrictions: ['Must be leashed', 'Must be attended'],
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellationPolicy: 'Cancellations accepted up to 4 days before arrival',
      quietHours: {
        start: '10:00 PM',
        end: '6:00 AM'
      }
    };
  }

  private extractDetailedPolicies(facility: any, campsites: any[]) {
    // Extract more detailed policies from campsite data
    const policies: any = {};
    
    // Check if any campsites allow pets
    const petFriendlyCampsites = campsites.filter(site => 
      !site.CampsiteAccessible || site.CampsiteAccessible !== 'N'
    );
    
    if (petFriendlyCampsites.length > 0) {
      policies.petFriendly = true;
    }

    return policies;
  }

  private transformAvailability(campsites: any, startDate: string, endDate: string): Availability[] {
    const availability: Availability[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate date range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if any campsites are available on this date
      let tentAvailable = false;
      let rvAvailable = false;
      let cabinAvailable = false;
      
      Object.values(campsites).forEach((campsite: any) => {
        const dateAvailability = campsite.availabilities[dateStr];
        if (dateAvailability === 'Available') {
          // Determine type based on campsite attributes
          if (campsite.campsite_type?.includes('RV')) {
            rvAvailable = true;
          } else if (campsite.campsite_type?.includes('Cabin')) {
            cabinAvailable = true;
          } else {
            tentAvailable = true;
          }
        }
      });
      
      availability.push({
        date: dateStr,
        tent: tentAvailable,
        rv: rvAvailable,
        cabin: cabinAvailable,
        glamping: false
      });
    }
    
    return availability;
  }

  async syncRecreationGovData(): Promise<void> {
    try {
      console.log('Starting Recreation.gov data sync...');
      
      // Get all states
      const states = ['CA', 'NY', 'FL', 'TX', 'CO', 'WA', 'OR', 'UT', 'AZ', 'MT'];
      
      for (const state of states) {
        console.log(`Syncing data for ${state}...`);
        
        const campsites = await this.searchCampsites({
          state,
          limit: 100
        });
        
        // Store in database
        // Note: This would be implemented to store in Supabase
        // await this.storeCampsitesInDatabase(campsites);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Recreation.gov data sync completed');
    } catch (error) {
      console.error('Recreation.gov sync error:', error);
    }
  }
}