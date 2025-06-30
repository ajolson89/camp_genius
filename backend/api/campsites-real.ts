import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Recreation.gov API interfaces
interface RecreationGovFacility {
  FacilityID: string;
  FacilityName: string;
  FacilityDescription: string;
  FacilityLatitude: number;
  FacilityLongitude: number;
  FacilityPhone: string;
  FacilityEmail: string;
  FacilityReservationURL: string;
  FacilityMapURL: string;
  FacilityAdaAccess: string;
  GEOJSON: any;
  FACILITYADDRESS: Array<{
    FacilityAddressID: string;
    FacilityStreetAddress1: string;
    City: string;
    StateCode: string;
    PostalCode: string;
    CountryCode: string;
  }>;
  ACTIVITY: Array<{
    ActivityID: string;
    ActivityName: string;
  }>;
  MEDIA: Array<{
    MediaID: string;
    MediaType: string;
    Title: string;
    Subtitle: string;
    Description: string;
    URL: string;
  }>;
}

interface RecreationGovCampsite {
  CampsiteID: string;
  FacilityID: string;
  CampsiteName: string;
  CampsiteType: string;
  TypeOfUse: string;
  Loop: string;
  CampsiteAccessible: boolean;
  CampsiteLatitude: number;
  CampsiteLongitude: number;
  ATTRIBUTES: Array<{
    AttributeID: string;
    AttributeName: string;
    AttributeValue: string;
  }>;
}

interface AvailabilityResponse {
  campsites: {
    [campsiteId: string]: {
      [date: string]: string; // "Available", "Reserved", etc.
    };
  };
}

// Helper function to extract location from complex queries
function extractLocationFromQuery(query: string): string {
  // Common patterns to remove
  const removePatterns = [
    /family getaway near /i,
    /camping near /i,
    /campsite near /i,
    /campsites near /i,
    /camping /i,
    /campground /i,
    /near /i,
    /in /i,
    /at /i,
    /around /i,
    /close to /i,
    /this weekend/i,
    /next weekend/i,
    /tomorrow/i,
    /tonight/i,
    /for \d+ nights?/i,
    /\d+ people/i,
    /\d+ guests?/i,
    /anywhere in the /i,
    /anywhere /i,
    /somewhere in /i,
  ];
  
  let cleanedQuery = query;
  removePatterns.forEach(pattern => {
    cleanedQuery = cleanedQuery.replace(pattern, ' ');
  });
  
  // Clean up extra spaces
  cleanedQuery = cleanedQuery.replace(/\s+/g, ' ').trim();
  
  // If we end up with generic terms, return a default
  if (!cleanedQuery || cleanedQuery.toLowerCase() === 'us' || cleanedQuery.toLowerCase() === 'usa') {
    return 'Colorado'; // Default to Colorado for generic US queries
  }
  
  return cleanedQuery;
}

// Helper function to generate realistic coordinates based on location
function getLocationCoordinates(location: string): { lat: number; lng: number; state: string } {
  const locationMap: { [key: string]: { lat: number; lng: number; state: string } } = {
    'california': { lat: 36.7783, lng: -119.4179, state: 'CA' },
    'ca': { lat: 36.7783, lng: -119.4179, state: 'CA' },
    'colorado': { lat: 39.5501, lng: -105.7821, state: 'CO' },
    'co': { lat: 39.5501, lng: -105.7821, state: 'CO' },
    'utah': { lat: 39.3210, lng: -111.0937, state: 'UT' },
    'ut': { lat: 39.3210, lng: -111.0937, state: 'UT' },
    'arizona': { lat: 34.0489, lng: -111.0937, state: 'AZ' },
    'az': { lat: 34.0489, lng: -111.0937, state: 'AZ' },
    'nevada': { lat: 38.8026, lng: -116.4194, state: 'NV' },
    'nv': { lat: 38.8026, lng: -116.4194, state: 'NV' },
    'oregon': { lat: 43.8041, lng: -120.5542, state: 'OR' },
    'or': { lat: 43.8041, lng: -120.5542, state: 'OR' },
    'washington': { lat: 47.7511, lng: -120.7401, state: 'WA' },
    'wa': { lat: 47.7511, lng: -120.7401, state: 'WA' },
    'texas': { lat: 31.9686, lng: -99.9018, state: 'TX' },
    'tx': { lat: 31.9686, lng: -99.9018, state: 'TX' },
    'florida': { lat: 27.7663, lng: -81.6868, state: 'FL' },
    'fl': { lat: 27.7663, lng: -81.6868, state: 'FL' },
    'wyoming': { lat: 44.2619, lng: -107.3024, state: 'WY' },
    'wy': { lat: 44.2619, lng: -107.3024, state: 'WY' },
    'yosemite': { lat: 37.8651, lng: -119.5383, state: 'CA' },
    'yellowstone': { lat: 44.4280, lng: -110.5885, state: 'WY' },
    'grand canyon': { lat: 36.1069, lng: -112.1129, state: 'AZ' },
    'zion': { lat: 37.2982, lng: -113.0263, state: 'UT' },
    'denver': { lat: 39.7392, lng: -104.9903, state: 'CO' },
    'seattle': { lat: 47.6062, lng: -122.3321, state: 'WA' },
    'portland': { lat: 45.5152, lng: -122.6784, state: 'OR' },
    'san francisco': { lat: 37.7749, lng: -122.4194, state: 'CA' },
    'los angeles': { lat: 34.0522, lng: -118.2437, state: 'CA' },
    'phoenix': { lat: 33.4484, lng: -112.0740, state: 'AZ' },
    'austin': { lat: 30.2672, lng: -97.7431, state: 'TX' },
    'miami': { lat: 25.7617, lng: -80.1918, state: 'FL' },
  };

  // Clean the location query first
  const cleanedLocation = extractLocationFromQuery(location);
  const key = cleanedLocation.toLowerCase();
  
  // Try to find exact match first
  if (locationMap[key]) {
    return locationMap[key];
  }
  
  // Try to find partial match
  for (const [mapKey, coords] of Object.entries(locationMap)) {
    if (key.includes(mapKey) || mapKey.includes(key)) {
      return coords;
    }
  }
  
  // Default to Colorado if no match
  return { lat: 39.5501, lng: -105.7821, state: 'CO' };
}

// Helper function to check if query mentions weekend
function isWeekendQuery(query: string): boolean {
  const weekendPatterns = [
    /this weekend/i,
    /next weekend/i,
    /weekend/i,
    /saturday/i,
    /sunday/i
  ];
  return weekendPatterns.some(pattern => pattern.test(query));
}

// Helper function to generate availability for next 14 days
function generateAvailability(hasTent: boolean, hasRV: boolean, hasCabin: boolean, query?: string): { [date: string]: { tent: number; rv: number; cabin: number } } {
  const availability: { [date: string]: { tent: number; rv: number; cabin: number } } = {};
  const isWeekend = query ? isWeekendQuery(query) : false;
  
  console.log(`Generating availability - hasTent: ${hasTent}, hasRV: ${hasRV}, hasCabin: ${hasCabin}, isWeekendQuery: ${isWeekend}`);
  
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
    
    // For weekend queries, increase availability on weekends
    const weekendMultiplier = isWeekend && isWeekendDay ? 2 : 1;
    
    availability[dateStr] = {
      tent: hasTent ? Math.floor((Math.random() * 15 + 3) * weekendMultiplier) : 0, // 3-17 tent sites
      rv: hasRV ? Math.floor((Math.random() * 10 + 2) * weekendMultiplier) : 0,     // 2-11 RV sites  
      cabin: hasCabin ? Math.floor((Math.random() * 4 + 1) * weekendMultiplier) : 0 // 1-4 cabins
    };
    
    if (i < 3) { // Log first few days for debugging
      console.log(`Date ${dateStr} (${isWeekendDay ? 'weekend' : 'weekday'}): tent=${availability[dateStr].tent}, rv=${availability[dateStr].rv}, cabin=${availability[dateStr].cabin}`);
    }
  }
  
  return availability;
}

// Helper function to generate mock campsite data when APIs are not available
function generateMockCampsites(location: string, maxPrice: number = 999): any[] {
  const coords = getLocationCoordinates(location);
  const cleanedLocation = extractLocationFromQuery(location);
  const cityName = cleanedLocation.split(' ')[0] || 'Denver';
  
  const mockCampsites = [
    {
      id: 'mock-1',
      name: `${cityName} State Park Campground`,
      location: {
        address: '123 Park Road',
        city: cityName,
        state: coords.state,
        coordinates: { 
          lat: coords.lat + (Math.random() - 0.5) * 0.1, // Add some variation
          lng: coords.lng + (Math.random() - 0.5) * 0.1 
        }
      },
      description: `Beautiful state park campground in ${location} with stunning views and excellent facilities. Features tent and RV sites with full hookups. Perfect for families and outdoor enthusiasts seeking a classic camping experience.`,
      images: ['https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800'],
      amenities: ['Restrooms', 'Showers', 'Fire Pits', 'Picnic Tables', 'Water Hookups', 'Electrical Hookups'],
      accessibility: {
        mobilityAccessible: true,
        visuallyAccessible: false,
        hearingAccessible: false,
        cognitiveAccessible: false,
        accessibilityRating: 4,
        accessibilityFeatures: ['ADA Accessible']
      },
      availability: generateAvailability(true, true, false, location), // Tent and RV, no cabins
      pricing: { tent: 25, rv: 40, cabin: 0 }, // No cabin pricing since no cabins
      rating: 4.2,
      reviews: 156,
      activities: ['Hiking', 'Fishing', 'Swimming'],
      rules: ['Quiet hours 10 PM - 7 AM', 'Maximum 8 people per site'],
      aiRecommendation: {
        score: 85,
        reason: `Great option for ${location} with excellent facilities and beautiful natural setting. Features both tent and RV sites with full amenities.`,
        tags: ['family-friendly', 'scenic', 'full-hookups']
      }
    },
    {
      id: 'mock-2',
      name: `Lakeside ${cityName} Resort`,
      location: {
        address: '456 Lake Drive',
        city: cityName,
        state: coords.state,
        coordinates: { 
          lat: coords.lat + (Math.random() - 0.5) * 0.15, 
          lng: coords.lng + (Math.random() - 0.5) * 0.15 
        }
      },
      description: `Waterfront camping resort near ${location}. Features luxury cabins and premium RV sites with lake access. Perfect for water sports and relaxation with upscale amenities and stunning lake views.`,
      images: ['https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?w=800'],
      amenities: ['Beach Access', 'Boat Launch', 'Fire Pits', 'Restrooms', 'Showers', 'Marina', 'Kayak Rentals'],
      accessibility: {
        mobilityAccessible: false,
        visuallyAccessible: false,
        hearingAccessible: false,
        cognitiveAccessible: false,
        accessibilityRating: 2,
        accessibilityFeatures: []
      },
      availability: generateAvailability(false, true, true, location), // RV and cabins, no tents
      pricing: { tent: 0, rv: 65, cabin: 150 }, // No tent sites at this upscale resort
      rating: 4.6,
      reviews: 243,
      activities: ['Boating', 'Swimming', 'Fishing', 'Kayaking', 'Water Skiing'],
      rules: ['No pets allowed', 'Quiet hours 9 PM - 8 AM', 'Minimum 2-night stay for cabins'],
      aiRecommendation: {
        score: 92,
        reason: `Perfect lakeside resort near ${location} with excellent water activities and luxury accommodations. Features premium RV sites and beautiful cabins.`,
        tags: ['waterfront', 'luxury', 'water-sports', 'cabins']
      }
    },
    {
      id: 'mock-3',
      name: `Mountain View ${cityName} Wilderness`,
      location: {
        address: '789 Mountain Trail',
        city: cityName,
        state: coords.state,
        coordinates: { 
          lat: coords.lat + (Math.random() - 0.5) * 0.12, 
          lng: coords.lng + (Math.random() - 0.5) * 0.12 
        }
      },
      description: `Primitive wilderness camping near ${location} with breathtaking mountain vistas and hiking trails. Tent-only sites for the authentic outdoor experience. Perfect for backpackers and nature enthusiasts seeking solitude.`,
      images: ['https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=800'],
      amenities: ['Hiking Trails', 'Fire Pits', 'Pit Toilets', 'Picnic Tables', 'Bear Boxes'],
      accessibility: {
        mobilityAccessible: false,
        visuallyAccessible: false,
        hearingAccessible: false,
        cognitiveAccessible: false,
        accessibilityRating: 1,
        accessibilityFeatures: []
      },
      availability: generateAvailability(true, false, false, location), // Tent only
      pricing: { tent: 15, rv: 0, cabin: 0 }, // Tent-only primitive camping
      rating: 4.4,
      reviews: 189,
      activities: ['Hiking', 'Mountain Biking', 'Rock Climbing', 'Stargazing', 'Wildlife Watching'],
      rules: ['Bear safe food storage required', 'Quiet hours 10 PM - 6 AM', 'Pack out all trash', 'Tent camping only'],
      aiRecommendation: {
        score: 88,
        reason: `Excellent primitive camping near ${location} with great hiking opportunities and stunning mountain views. Perfect for those seeking a true wilderness experience.`,
        tags: ['wilderness', 'hiking', 'primitive', 'mountain-views']
      }
    }
  ];

  return mockCampsites;
}

// Helper function to clean HTML tags and format description
function cleanAndFormatDescription(htmlDescription: string): string {
  if (!htmlDescription) return 'Beautiful camping facility from Recreation.gov';
  
  // Replace HTML tags with appropriate formatting
  let cleaned = htmlDescription
    .replace(/<h2[^>]*>/g, '\n\n**')
    .replace(/<\/h2>/g, '**\n')
    .replace(/<h3[^>]*>/g, '\n\n*')
    .replace(/<\/h3>/g, '*\n')
    .replace(/<p[^>]*>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim();
  
  return cleaned || 'Beautiful camping facility from Recreation.gov';
}

// Helper function to use OpenAI to parse user query into search parameters
async function parseUserQuery(query: string, openai: OpenAI) {
  try {
    const prompt = `Parse this camping search query into structured search parameters for Recreation.gov API.

User Query: "${query}"

Extract and return a JSON object with these fields:
{
  "location": "state or general area mentioned",
  "stateCode": "2-letter state code if identifiable", 
  "keywords": ["camping", "keywords", "from", "query"],
  "activityPreferences": ["hiking", "fishing", "etc"],
  "accessibilityNeeds": true/false,
  "petFriendly": true/false,
  "equipmentType": "tent" | "rv" | "cabin" | null,
  "searchRadius": 50,
  "priority": "what matters most to this user",
  "startDate": "YYYY-MM-DD format if dates mentioned, null if none",
  "endDate": "YYYY-MM-DD format if dates mentioned, null if none",
  "nights": "number of nights if mentioned, 1 if not specified"
}

Examples:
"Pet friendly camping near Yosemite" → {"location": "Yosemite", "stateCode": "CA", "keywords": ["pet", "friendly", "yosemite"], "petFriendly": true}
"RV camping in Colorado mountains" → {"location": "Colorado", "stateCode": "CO", "keywords": ["rv", "mountains"], "equipmentType": "rv"}
"Accessible camping near beaches" → {"location": "coastal", "keywords": ["beach", "accessible"], "accessibilityNeeds": true}
"Camping this weekend in Utah" → {"location": "Utah", "stateCode": "UT", "startDate": "2025-07-05", "endDate": "2025-07-06", "nights": 2}
"Need a tent site for tonight" → {"equipmentType": "tent", "startDate": "2025-06-30", "nights": 1}

Return only the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a camping search assistant. Parse user queries into structured search parameters. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing user query:', error);
    return null;
  }
}

// Helper function to search Recreation.gov facilities
async function searchRecreationGovFacilities(searchParams: any) {
  const apiKey = process.env.RECREATION_GOV_API_KEY;
  if (!apiKey) {
    throw new Error('Recreation.gov API key not configured');
  }

  try {
    // Search facilities by state and keywords
    let url = `https://ridb.recreation.gov/api/v1/facilities?`;
    
    const params = new URLSearchParams({
      apikey: apiKey,
      limit: '50',
      offset: '0',
      activity: 'CAMPING', // Filter for camping facilities
      lastupdated: '01-01-2020' // Get recently updated facilities
    });

    if (searchParams.stateCode) {
      params.append('state', searchParams.stateCode);
    }

    if (searchParams.keywords?.length > 0) {
      params.append('query', searchParams.keywords.join(' '));
    }

    url += params.toString();
    console.log('Recreation.gov API URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CampGenius/1.0',
      }
    });

    if (!response.ok) {
      throw new Error(`Recreation.gov API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Found ${data.RECDATA?.length || 0} facilities from Recreation.gov`);
    
    return data.RECDATA || [];
  } catch (error) {
    console.error('Error fetching from Recreation.gov:', error);
    throw error;
  }
}

// Helper function to get campsites for a facility
async function getFacilityCampsites(facilityId: string) {
  const apiKey = process.env.RECREATION_GOV_API_KEY;
  
  try {
    const url = `https://ridb.recreation.gov/api/v1/facilities/${facilityId}/campsites?apikey=${apiKey}&limit=50`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CampGenius/1.0',
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.RECDATA || [];
  } catch (error) {
    console.error(`Error fetching campsites for facility ${facilityId}:`, error);
    return [];
  }
}

// Helper function to get real pricing data from campsite attributes
function extractPricingFromCampsites(campsites: RecreationGovCampsite[]): { tent: number; rv: number; cabin: number } {
  let tentPrice = 25; // Default fallback
  let rvPrice = 40;
  let cabinPrice = 80;
  
  campsites.forEach(campsite => {
    if (campsite.ATTRIBUTES) {
      campsite.ATTRIBUTES.forEach(attr => {
        if (attr.AttributeName?.toLowerCase().includes('fee') || 
            attr.AttributeName?.toLowerCase().includes('price') ||
            attr.AttributeName?.toLowerCase().includes('cost')) {
          const price = parseInt(attr.AttributeValue?.replace(/[^0-9]/g, '') || '0');
          if (price > 0 && price < 200) { // Reasonable camping fee range
            if (campsite.CampsiteType?.toLowerCase().includes('tent')) {
              tentPrice = Math.max(price, tentPrice);
            } else if (campsite.CampsiteType?.toLowerCase().includes('rv')) {
              rvPrice = Math.max(price, rvPrice);
            } else if (campsite.CampsiteType?.toLowerCase().includes('cabin')) {
              cabinPrice = Math.max(price, cabinPrice);
            }
          }
        }
      });
    }
  });
  
  return { tent: tentPrice, rv: rvPrice, cabin: cabinPrice };
}

// Helper function to get availability for specified date range
async function getAvailability(facilityId: string, searchParams?: any) {
  const apiKey = process.env.RECREATION_GOV_API_KEY;
  
  try {
    let startDate = new Date();
    let endDate = new Date();
    
    // Use dates from search params if provided, otherwise default to next 14 days
    if (searchParams?.startDate) {
      startDate = new Date(searchParams.startDate);
    }
    
    if (searchParams?.endDate) {
      endDate = new Date(searchParams.endDate);
    } else if (searchParams?.nights) {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(searchParams.nights));
    } else {
      // Default to 14 days from start date
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 14);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const url = `https://ridb.recreation.gov/api/v1/facilities/${facilityId}/campsites/availability?apikey=${apiKey}&start_date=${startStr}&end_date=${endStr}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CampGenius/1.0',
      }
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data.availability || {};
  } catch (error) {
    console.error(`Error fetching availability for facility ${facilityId}:`, error);
    return {};
  }
}

// Convert Recreation.gov data to our campsite format
function convertToOurFormat(facility: RecreationGovFacility, campsites: RecreationGovCampsite[], availability: any): any {
  const address = facility.FACILITYADDRESS?.[0];
  const images = facility.MEDIA?.filter(m => m.MediaType === 'Image').map(m => m.URL) || [];
  const activities = facility.ACTIVITY?.map(a => a.ActivityName) || [];
  const realPricing = extractPricingFromCampsites(campsites);

  // Calculate availability summary
  const availabilitySummary: any = {};
  const next14Days = Array.from({length: 14}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  next14Days.forEach(date => {
    let availableTent = 0;
    let availableRV = 0;
    let availableCabin = 0;

    campsites.forEach(campsite => {
      const campsiteAvailability = availability.campsites?.[campsite.CampsiteID]?.[date];
      if (campsiteAvailability === 'Available') {
        if (campsite.CampsiteType?.toLowerCase().includes('tent')) {
          availableTent++;
        } else if (campsite.CampsiteType?.toLowerCase().includes('rv')) {
          availableRV++;
        } else if (campsite.CampsiteType?.toLowerCase().includes('cabin')) {
          availableCabin++;
        } else {
          availableTent++; // Default to tent if type unclear
        }
      }
    });

    availabilitySummary[date] = {
      tent: availableTent,
      rv: availableRV,
      cabin: availableCabin
    };
  });

  return {
    id: facility.FacilityID,
    name: facility.FacilityName,
    location: {
      address: address?.FacilityStreetAddress1 || '',
      city: address?.City || '',
      state: address?.StateCode || '',
      coordinates: {
        lat: facility.FacilityLatitude || 0,
        lng: facility.FacilityLongitude || 0
      }
    },
    description: cleanAndFormatDescription(facility.FacilityDescription),
    images: images.slice(0, 5), // Limit to 5 images
    amenities: activities.slice(0, 10), // Use activities as amenities
    accessibility: {
      mobilityAccessible: facility.FacilityAdaAccess === 'Y' || campsites.some(c => c.CampsiteAccessible),
      visuallyAccessible: false,
      hearingAccessible: false,
      cognitiveAccessible: false,
      accessibilityRating: facility.FacilityAdaAccess === 'Y' ? 4 : 1,
      accessibilityFeatures: facility.FacilityAdaAccess === 'Y' ? ['ADA Accessible'] : []
    },
    availability: availabilitySummary,
    pricing: realPricing,
    rating: Math.round((4.0 + Math.random() * 0.8) * 10) / 10, // 4.0-4.8 with 1 decimal
    reviews: Math.floor(Math.random() * 200) + 50,
    activities: activities,
    rules: ['Follow Recreation.gov reservation policies', 'Respect nature and wildlife'],
    aiRecommendation: {
      score: Math.round((75 + Math.random() * 20)), // 75-95 out of 100
      reason: cleanAndFormatDescription(facility.FacilityDescription).substring(0, 150) + '...' || 'Quality campsite from Recreation.gov database',
      tags: ['recreation.gov', 'verified']
    },
    reservationUrl: facility.FacilityReservationURL,
    phone: facility.FacilityPhone,
    email: facility.FacilityEmail
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('=== REAL CAMPSITE SEARCH START ===');
    console.log('Request method:', req.method);
    console.log('Request query:', req.query);
    console.log('Request body:', req.body);
    console.log('Request url:', req.url);
    console.log('Query keys:', Object.keys(req.query || {}));
    console.log('Location value:', req.query?.location);
    
    const { location = '', maxPrice = '', numberOfGuests = '' } = req.query;
    
    console.log('Extracted values:', { location, maxPrice, numberOfGuests });
    
    if (!location) {
      return res.status(400).json({
        error: 'Location parameter is required',
        message: 'Please provide a location to search for campsites',
        receivedQuery: req.query,
        queryKeys: Object.keys(req.query || {})
      });
    }
    
    const maxPriceNum = maxPrice ? parseInt(maxPrice as string) : 999;
    const guestsNum = numberOfGuests ? parseInt(numberOfGuests as string) : 2;

    // Check if APIs are configured, fallback to mock data if not
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasRecreationGov = !!process.env.RECREATION_GOV_API_KEY;
    
    if (!hasOpenAI || !hasRecreationGov) {
      console.log('Missing API keys, returning mock data:', { 
        hasOpenAI, 
        hasRecreationGov,
        originalLocation: location,
        cleanedLocation: extractLocationFromQuery(location as string),
        coordinates: getLocationCoordinates(location as string)
      });
      console.log('Generating mock campsites...');
      let mockCampsites;
      try {
        mockCampsites = generateMockCampsites(location as string, maxPriceNum);
        console.log('Generated mock campsites:', mockCampsites.length);
        console.log('Campsite names:', mockCampsites.map(c => c.name));
      } catch (error) {
        console.error('Error generating mock campsites:', error);
        mockCampsites = []; // Fallback to empty array
      }
      
      // Filter by price if specified (but be lenient for testing)
      const filteredCampsites = mockCampsites.filter(campsite => {
        try {
          // Only consider prices > 0 for the minimum calculation
          const prices = [];
          if (campsite.pricing.tent > 0) prices.push(campsite.pricing.tent);
          if (campsite.pricing.rv > 0) prices.push(campsite.pricing.rv);
          if (campsite.pricing.cabin > 0) prices.push(campsite.pricing.cabin);
          
          const lowestPrice = prices.length > 0 ? Math.min(...prices) : 999;
          console.log(`Campsite ${campsite.name} - prices: ${JSON.stringify(campsite.pricing)}, lowest: ${lowestPrice}, max allowed: ${maxPriceNum}`);
          
          // For debugging, always include campsites under $500 to see if filtering is the issue
          const passesFilter = lowestPrice <= Math.max(maxPriceNum, 500);
          console.log(`Campsite ${campsite.name} passes filter: ${passesFilter}`);
          return passesFilter;
        } catch (error) {
          console.error(`Error filtering campsite ${campsite.name}:`, error);
          return true; // Include campsite if filtering fails
        }
      });
      
      console.log('Filtered campsites:', filteredCampsites.length);
      console.log('Filtered campsite names:', filteredCampsites.map(c => c.name));
      
      const response = {
        campsites: filteredCampsites,
        total: filteredCampsites.length,
        message: `Mock results for "${location}" (API keys not configured)`,
        source: 'mock-data',
        filters: { maxPrice: maxPriceNum, guests: guestsNum }
      };
      
      console.log('Sending response:', response);
      return res.json(response);
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Step 1: Parse user query with OpenAI
    console.log('Parsing user query with OpenAI...');
    const searchParams = await parseUserQuery(location as string, openai);
    console.log('Parsed search parameters:', searchParams);

    if (!searchParams) {
      return res.status(400).json({
        error: 'Could not parse search query',
        message: 'Please try a more specific search query'
      });
    }

    // Step 2: Search Recreation.gov for real facilities
    console.log('Searching Recreation.gov for facilities...');
    const facilities = await searchRecreationGovFacilities(searchParams);
    
    if (facilities.length === 0) {
      return res.json({
        campsites: [],
        total: 0,
        message: `No Recreation.gov facilities found for "${location}". Try a different location or state.`,
        searchParams
      });
    }

    // Step 3: Get detailed data for top facilities (limit to avoid timeouts)
    console.log(`Processing top ${Math.min(5, facilities.length)} facilities...`);
    const processedCampsites = [];
    
    for (let i = 0; i < Math.min(5, facilities.length); i++) {
      const facility = facilities[i];
      console.log(`Processing facility: ${facility.FacilityName}`);
      
      try {
        // Get campsites and availability in parallel
        const [campsites, availability] = await Promise.all([
          getFacilityCampsites(facility.FacilityID),
          getAvailability(facility.FacilityID, searchParams)
        ]);

        if (campsites.length > 0) {
          const converted = convertToOurFormat(facility, campsites, availability);
          processedCampsites.push(converted);
        }
      } catch (facilityError) {
        console.error(`Error processing facility ${facility.FacilityName}:`, facilityError);
        // Continue with other facilities
      }
    }

    console.log(`Returning ${processedCampsites.length} real campsites from Recreation.gov`);

    res.json({
      campsites: processedCampsites,
      total: processedCampsites.length,
      message: `Found ${processedCampsites.length} real campsites from Recreation.gov for "${location}"`,
      searchParams,
      source: 'recreation.gov'
    });

  } catch (error) {
    console.error('Real campsite search error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Return mock data even on error
    try {
      const location = req.query?.location || 'Denver';
      const mockCampsites = generateMockCampsites(location as string, 200);
      return res.json({
        campsites: mockCampsites,
        total: mockCampsites.length,
        message: `Fallback mock results for "${location}" due to error`,
        source: 'mock-data-fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (fallbackError) {
      return res.status(500).json({
        error: 'Failed to search campsites and generate fallback',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'
      });
    }
  }
}