import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple health check
  if (req.url === '/health' || req.url === '/') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'serverless',
      url: req.url,
      method: req.method
    });
  }

  // Simple campsite mock data for testing
  if (req.url?.startsWith('/campsites')) {
    return res.status(200).json({
      campsites: [
        {
          id: '1',
          name: 'Backend Test Campsite',
          location: {
            address: '123 Test Road',
            city: 'Test City',
            state: 'Test State',
            coordinates: {
              lat: 40.7128,
              lng: -74.0060
            }
          },
          description: 'This is a test campsite from the backend API - you should see this instead of mock data!',
          images: [
            'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
            'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800'
          ],
          amenities: ['Backend Test Amenity', 'Restrooms', 'Fire Pits'],
          accessibility: {
            mobilityAccessible: true,
            visuallyAccessible: false,
            hearingAccessible: false,
            cognitiveAccessible: false,
            accessibilityRating: 3,
            accessibilityFeatures: ['Accessible paths', 'Reserved parking']
          },
          availability: {
            '2024-07-01': { tent: 5, rv: 3, cabin: 1 },
            '2024-07-02': { tent: 3, rv: 2, cabin: 0 }
          },
          pricing: {
            tent: 25,
            rv: 40,
            cabin: 80
          },
          rating: 4.5,
          reviews: 127,
          activities: ['Backend Test Activity', 'Hiking', 'Swimming'],
          rules: ['No loud music after 10pm', 'Keep campsite clean'],
          aiRecommendation: {
            score: 0.9,
            reason: 'Perfect match from backend API!',
            tags: ['backend', 'test', 'working']
          }
        }
      ],
      message: 'Data from backend API!'
    });
  }

  // Default response
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/campsites'],
    requestedUrl: req.url
  });
}