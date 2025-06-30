import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

const app = express();

// Enable CORS for all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'serverless-main',
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasRecreationGov: !!process.env.RECREATION_GOV_API_KEY
  });
});

// Simple campsite search endpoint for testing
app.get('/campsites', async (req, res) => {
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
        id: 'main-api-1',
        name: 'Main API Test Campsite',
        location: {
          address: '456 Main API Road',
          city: 'AI City',
          state: 'CA',
          coordinates: {
            lat: 34.0522,
            lng: -118.2437
          }
        },
        description: 'This campsite is served by the main Express API! Ready for OpenAI integration.',
        images: [
          'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
          'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800'
        ],
        amenities: ['Main API Amenity', 'Restrooms', 'Fire Pits', 'WiFi'],
        accessibility: {
          mobilityAccessible: true,
          visuallyAccessible: true,
          hearingAccessible: false,
          cognitiveAccessible: false,
          accessibilityRating: 4,
          accessibilityFeatures: ['Accessible paths', 'Reserved parking', 'Audio assistance']
        },
        availability: {
          '2024-07-01': { tent: 8, rv: 5, cabin: 2 },
          '2024-07-02': { tent: 6, rv: 3, cabin: 1 }
        },
        pricing: {
          tent: 30,
          rv: 50,
          cabin: 120
        },
        rating: 4.7,
        reviews: 234,
        activities: ['Main API Activity', 'Hiking', 'Swimming', 'Stargazing'],
        rules: ['Quiet hours 10pm-7am', 'Keep campsite clean', 'No glass containers'],
        aiRecommendation: {
          score: 0.95,
          reason: 'Excellent match from main Express API!',
          tags: ['main-api', 'express', 'ready-for-ai']
        }
      }
    ];

    res.json({
      campsites: mockCampsites,
      total: mockCampsites.length,
      message: 'Data from main Express API - ready for OpenAI integration!'
    });

  } catch (error) {
    console.error('Campsite search error:', error);
    res.status(500).json({
      error: 'Failed to search campsites',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI search endpoint (will integrate OpenAI later)
app.post('/ai/search', async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    console.log('AI search request:', { query, filters });
    
    // For now, return a response indicating we received the AI search request
    res.json({
      message: 'AI search endpoint reached!',
      query: query,
      filters: filters,
      note: 'This will be integrated with OpenAI to process natural language queries and return real campsite data from Recreation.gov'
    });

  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({
      error: 'AI search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Default route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/campsites', '/ai/search'],
    requestedUrl: req.originalUrl
  });
});

export default (req: VercelRequest, res: VercelResponse) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};