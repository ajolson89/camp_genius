import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('=== CAMPSITE SEARCH START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request query:', req.query);
    console.log('Environment check:', {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasRecGov: !!process.env.RECREATION_GOV_API_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    
    // For now, return mock data that matches the frontend format
    // Later we'll integrate with OpenAI and Recreation.gov
    const mockCampsites = [
      {
        id: 'individual-api-1',
        name: 'Individual Function Test Campsite',
        location: {
          address: '789 Individual Function Road',
          city: 'Vercel City',
          state: 'CA',
          coordinates: {
            lat: 37.7749,
            lng: -122.4194
          }
        },
        description: 'This campsite is served by individual Vercel functions! No Express routing issues.',
        images: [
          'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
          'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800'
        ],
        amenities: ['Individual Function Amenity', 'Restrooms', 'Fire Pits', 'WiFi', 'Shower Houses'],
        accessibility: {
          mobilityAccessible: true,
          visuallyAccessible: true,
          hearingAccessible: true,
          cognitiveAccessible: false,
          accessibilityRating: 5,
          accessibilityFeatures: ['Accessible paths', 'Reserved parking', 'Audio assistance', 'Braille signage']
        },
        availability: {
          '2024-07-01': { tent: 12, rv: 8, cabin: 3 },
          '2024-07-02': { tent: 10, rv: 6, cabin: 2 }
        },
        pricing: {
          tent: 35,
          rv: 55,
          cabin: 150
        },
        rating: 4.8,
        reviews: 342,
        activities: ['Individual Function Activity', 'Hiking', 'Swimming', 'Stargazing', 'Rock Climbing'],
        rules: ['Quiet hours 10pm-7am', 'Keep campsite clean', 'No glass containers', 'Pets on leash'],
        aiRecommendation: {
          score: 0.98,
          reason: 'Perfect match from individual Vercel function!',
          tags: ['individual-function', 'vercel', 'no-express-routing']
        }
      }
    ];

    console.log('Returning mock campsites:', mockCampsites.length);

    res.json({
      campsites: mockCampsites,
      total: mockCampsites.length,
      message: 'Data from individual Vercel function - no Express routing issues!',
      queryReceived: req.query
    });

  } catch (error) {
    console.error('Campsite search error:', error);
    res.status(500).json({
      error: 'Failed to search campsites',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}