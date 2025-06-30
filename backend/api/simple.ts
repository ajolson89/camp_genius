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
          name: 'Test Campsite',
          location: { city: 'Test City', state: 'Test State' },
          description: 'This is a test campsite from the backend API',
          pricing: { tent: 25, rv: 40 },
          amenities: ['Test Amenity'],
          activities: ['Test Activity'],
          accessibility: { mobilityAccessible: false }
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