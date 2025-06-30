import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Helper function to parse OpenAI response and convert to our campsite format
async function parseAIResponse(aiResponse: string, location: string, criteria: any) {
  try {
    // Try to extract JSON from the AI response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in AI response');
    }
    
    const aiCampsites = JSON.parse(jsonMatch[0]);
    
    // Convert AI response to our campsite format
    return aiCampsites.map((aiCampsite: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      name: aiCampsite.name || `AI Recommended Campsite ${index + 1}`,
      location: {
        address: aiCampsite.address || aiCampsite.location || `${location} Area`,
        city: aiCampsite.city || extractCityFromLocation(location),
        state: aiCampsite.state || extractStateFromLocation(location),
        coordinates: {
          lat: aiCampsite.coordinates?.lat || aiCampsite.lat || 40.7128 + (Math.random() - 0.5) * 2,
          lng: aiCampsite.coordinates?.lng || aiCampsite.lng || -74.0060 + (Math.random() - 0.5) * 2
        }
      },
      description: aiCampsite.description || `A beautiful campsite in ${location}`,
      images: [
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
        'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800',
        'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'
      ],
      amenities: aiCampsite.amenities || ['Restrooms', 'Fire Pits', 'Picnic Tables'],
      accessibility: {
        mobilityAccessible: criteria.wheelchairAccessible || false,
        visuallyAccessible: false,
        hearingAccessible: false,
        cognitiveAccessible: false,
        accessibilityRating: criteria.wheelchairAccessible ? 4 : 2,
        accessibilityFeatures: criteria.wheelchairAccessible ? ['Accessible paths', 'Reserved parking'] : []
      },
      availability: {
        '2024-07-01': { tent: 8, rv: 5, cabin: 2 },
        '2024-07-02': { tent: 6, rv: 3, cabin: 1 }
      },
      pricing: {
        tent: aiCampsite.pricing?.tent || aiCampsite.tentPrice || 25,
        rv: aiCampsite.pricing?.rv || aiCampsite.rvPrice || 45,
        cabin: aiCampsite.pricing?.cabin || aiCampsite.cabinPrice || 85
      },
      rating: aiCampsite.rating || 4.2 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 300) + 50,
      activities: aiCampsite.activities || ['Hiking', 'Swimming', 'Fishing'],
      rules: ['Quiet hours 10pm-7am', 'Keep campsite clean', 'Pets on leash'],
      aiRecommendation: {
        score: 0.85 + Math.random() * 0.1,
        reason: `Perfect match for ${location} with your search criteria!`,
        tags: ['ai-generated', 'recommended', location.toLowerCase().replace(/\s+/g, '-')]
      }
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

function extractCityFromLocation(location: string): string {
  // Simple extraction - you could make this more sophisticated
  const parts = location.split(',');
  return parts[0]?.trim() || location;
}

function extractStateFromLocation(location: string): string {
  // Simple extraction - you could make this more sophisticated  
  const parts = location.split(',');
  return parts[1]?.trim() || 'CA';
}

function generateIntelligentMockData(location: string, criteria: any) {
  const locationLower = location.toLowerCase();
  
  // Generate location-specific campsite names and descriptions
  const getLocationSpecificData = () => {
    if (locationLower.includes('yosemite') || locationLower.includes('california')) {
      return {
        names: ['Yosemite Valley View', 'Sierra Mountain Retreat', 'Merced River Camp'],
        activities: ['Rock Climbing', 'Waterfall Viewing', 'Wildlife Photography', 'Hiking'],
        descriptions: [
          'Experience breathtaking views of Half Dome and El Capitan from this pristine campsite.',
          'Nestled among giant sequoias with easy access to world-class hiking trails.',
          'Riverside camping with crystal-clear mountain streams and granite formations.'
        ]
      };
    } else if (locationLower.includes('yellowstone') || locationLower.includes('wyoming')) {
      return {
        names: ['Geyser Basin Camp', 'Bison Prairie Grounds', 'Thermal Springs Retreat'],
        activities: ['Geyser Watching', 'Wildlife Viewing', 'Hot Springs', 'Photography'],
        descriptions: [
          'Wake up to the sight of geysers and thermal features in this unique volcanic landscape.',
          'Prime location for viewing bison, elk, and other Yellowstone wildlife.',
          'Relax in natural hot springs after a day of exploring the park.'
        ]
      };
    } else if (locationLower.includes('beach') || locationLower.includes('coast') || locationLower.includes('ocean')) {
      return {
        names: ['Ocean Breeze Campground', 'Sunset Dunes Camp', 'Tidal Pool Paradise'],
        activities: ['Beach Combing', 'Surfing', 'Tide Pooling', 'Sunset Viewing'],
        descriptions: [
          'Fall asleep to the sound of waves at this beachfront camping paradise.',
          'Watch spectacular sunsets over the Pacific from your campsite.',
          'Explore tide pools and marine life just steps from your tent.'
        ]
      };
    } else {
      return {
        names: [`${location} Adventure Base`, `${location} Nature Camp`, `${location} Outdoor Retreat`],
        activities: ['Hiking', 'Stargazing', 'Nature Photography', 'Campfire Stories'],
        descriptions: [
          `A beautiful campsite in the heart of ${location} with stunning natural surroundings.`,
          `Perfect base camp for exploring all that ${location} has to offer.`,
          `Immerse yourself in the natural beauty of ${location} at this peaceful retreat.`
        ]
      };
    }
  };

  const locationData = getLocationSpecificData();
  
  return locationData.names.map((name, index) => ({
    id: `mock-${Date.now()}-${index}`,
    name,
    location: {
      address: `${index + 1}00 ${location} Trail`,
      city: extractCityFromLocation(location),
      state: extractStateFromLocation(location),
      coordinates: {
        lat: 40.7128 + (Math.random() - 0.5) * 10,
        lng: -74.0060 + (Math.random() - 0.5) * 20
      }
    },
    description: locationData.descriptions[index] + (criteria.petFriendly ? ' Pet-friendly with designated dog areas.' : '') + (criteria.wheelchairAccessible ? ' Fully accessible with paved paths and facilities.' : ''),
    images: [
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
      'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'
    ],
    amenities: [
      'Restrooms', 'Fire Pits', 'Picnic Tables',
      ...(criteria.petFriendly ? ['Dog Park', 'Pet Waste Stations'] : []),
      ...(criteria.wheelchairAccessible ? ['Accessible Restrooms', 'Paved Paths'] : []),
      'Potable Water', 'Trash Collection'
    ],
    accessibility: {
      mobilityAccessible: criteria.wheelchairAccessible || false,
      visuallyAccessible: false,
      hearingAccessible: false,
      cognitiveAccessible: false,
      accessibilityRating: criteria.wheelchairAccessible ? 4 : 2,
      accessibilityFeatures: criteria.wheelchairAccessible ? ['Accessible paths', 'Reserved parking', 'Accessible restrooms'] : []
    },
    availability: {
      '2024-07-01': { tent: 8, rv: 5, cabin: 2 },
      '2024-07-02': { tent: 6, rv: 3, cabin: 1 }
    },
    pricing: {
      tent: 25 + Math.floor(Math.random() * 20),
      rv: 45 + Math.floor(Math.random() * 30),
      cabin: 85 + Math.floor(Math.random() * 50)
    },
    rating: 4.0 + Math.random() * 0.8,
    reviews: Math.floor(Math.random() * 200) + 50,
    activities: locationData.activities,
    rules: ['Quiet hours 10pm-7am', 'Keep campsite clean', 'Pets on leash', 'No glass containers'],
    aiRecommendation: {
      score: 0.75 + Math.random() * 0.15,
      reason: `Great match for ${location} based on your search criteria!`,
      tags: ['intelligent-mock', 'location-specific', location.toLowerCase().replace(/\s+/g, '-')]
    }
  }));
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
    console.log('=== CAMPSITE SEARCH START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request query:', req.query);
    
    // Extract search parameters
    const { 
      location = '',
      petFriendly,
      wheelchairAccessible,
      equipmentType,
      numberOfGuests,
      checkInDate,
      checkOutDate,
      minPrice,
      maxPrice
    } = req.query;

    // Initialize OpenAI if API key is available
    let openai: OpenAI | null = null;
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Generate AI-powered campsite recommendations based on the search query
    let aiGeneratedCampsites = [];
    
    if (openai && location) {
      console.log('Using OpenAI to generate campsite recommendations for:', location);
      
      const prompt = `You are a camping expert. Generate 3-5 realistic campsite recommendations for the location: "${location}".

Search criteria:
- Location: ${location}
- Pet Friendly: ${petFriendly || 'not specified'}
- Wheelchair Accessible: ${wheelchairAccessible || 'not specified'}
- Equipment Type: ${equipmentType || 'not specified'}
- Number of Guests: ${numberOfGuests || 'not specified'}
- Check-in: ${checkInDate || 'not specified'}
- Check-out: ${checkOutDate || 'not specified'}
- Price Range: $${minPrice || '0'} - $${maxPrice || '200'} per night

For each campsite, provide:
1. A realistic name that fits the location
2. Specific address/area within the location
3. Detailed description highlighting features that match the search criteria
4. Appropriate pricing for tent/RV/cabin
5. Relevant amenities and activities for the area
6. Real coordinates near the specified location

Return the response as a JSON array of campsite objects. Make the descriptions engaging and specific to the location and search criteria.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful camping assistant that generates realistic campsite recommendations based on user queries. Always return valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        console.log('OpenAI response received:', aiResponse?.substring(0, 200) + '...');

        if (aiResponse) {
          // Parse the AI response and convert to our campsite format
          const aiCampsites = await parseAIResponse(aiResponse, location as string, {
            petFriendly: petFriendly === 'true',
            wheelchairAccessible: wheelchairAccessible === 'true',
            equipmentType: equipmentType as string,
            numberOfGuests: numberOfGuests ? parseInt(numberOfGuests as string) : undefined,
            minPrice: minPrice ? parseInt(minPrice as string) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined
          });
          
          aiGeneratedCampsites = aiCampsites;
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall back to mock data if OpenAI fails
      }
    }

    // Use AI-generated campsites if available, otherwise fall back to intelligent mock data
    const finalCampsites = aiGeneratedCampsites.length > 0 ? aiGeneratedCampsites : generateIntelligentMockData(location as string, {
      petFriendly: petFriendly === 'true',
      wheelchairAccessible: wheelchairAccessible === 'true',
      equipmentType: equipmentType as string,
      numberOfGuests: numberOfGuests ? parseInt(numberOfGuests as string) : undefined
    });

    console.log('Returning campsites:', finalCampsites.length, aiGeneratedCampsites.length > 0 ? '(AI-generated)' : '(intelligent mock)');

    res.json({
      campsites: finalCampsites,
      total: finalCampsites.length,
      message: aiGeneratedCampsites.length > 0 
        ? `AI-powered recommendations for "${location}"` 
        : `Intelligent recommendations for "${location}" (OpenAI fallback)`,
      queryReceived: req.query,
      aiPowered: aiGeneratedCampsites.length > 0
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