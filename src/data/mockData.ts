import { Campsite, WeatherData, Trip, UserProfile } from '../types';

export const mockCampsites: Campsite[] = [
  {
    id: '1',
    name: 'Pine Valley Campground',
    location: {
      address: '123 Forest Road',
      city: 'Boulder',
      state: 'Colorado',
      coordinates: { lat: 40.0150, lng: -105.2705 }
    },
    description: 'Nestled in the heart of the Colorado Rockies, Pine Valley offers pristine mountain views and access to hiking trails.',
    images: [
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Restrooms', 'Showers', 'Fire Pits', 'Picnic Tables', 'Water Hookups', 'Electrical Hookups'],
    accessibility: {
      mobilityAccessible: true,
      visuallyAccessible: true,
      hearingAccessible: false,
      cognitiveAccessible: true,
      accessibilityRating: 4,
      accessibilityFeatures: ['Wheelchair accessible bathrooms', 'Paved pathways', 'Accessible parking', 'Braille signage']
    },
    availability: {
      '2025-01-15': { tent: 5, rv: 3, cabin: 2 },
      '2025-01-16': { tent: 4, rv: 2, cabin: 1 },
      '2025-01-17': { tent: 6, rv: 4, cabin: 2 }
    },
    pricing: { tent: 25, rv: 40, cabin: 85 },
    rating: 4.8,
    reviews: 127,
    activities: ['Hiking', 'Fishing', 'Wildlife Watching', 'Photography'],
    rules: ['Quiet hours 10 PM - 6 AM', 'No pets on trails', 'Pack out all trash'],
    aiRecommendation: {
      score: 95,
      reason: 'Perfect for mountain lovers with excellent accessibility features',
      tags: ['Mountain Views', 'Accessible', 'Family Friendly']
    }
  },
  {
    id: '2',
    name: 'Lakeside Retreat',
    location: {
      address: '456 Lake Shore Drive',
      city: 'Tahoe City',
      state: 'California',
      coordinates: { lat: 39.1638, lng: -120.1594 }
    },
    description: 'Beautiful lakefront camping with crystal clear waters and sandy beaches perfect for swimming and water sports.',
    images: [
      'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Beach Access', 'Boat Launch', 'Restrooms', 'Showers', 'Store', 'Laundry'],
    accessibility: {
      mobilityAccessible: true,
      visuallyAccessible: false,
      hearingAccessible: true,
      cognitiveAccessible: true,
      accessibilityRating: 3,
      accessibilityFeatures: ['Accessible beach access', 'Audio navigation system', 'Large print materials']
    },
    availability: {
      '2025-01-15': { tent: 8, rv: 6, cabin: 4 },
      '2025-01-16': { tent: 7, rv: 5, cabin: 3 },
      '2025-01-17': { tent: 9, rv: 7, cabin: 4 }
    },
    pricing: { tent: 35, rv: 55, cabin: 120 },
    rating: 4.6,
    reviews: 89,
    activities: ['Swimming', 'Boating', 'Kayaking', 'Fishing', 'Beach Volleyball'],
    rules: ['Swimming at own risk', 'Boat speed limit 5 mph near shore', 'No glass containers on beach'],
    aiRecommendation: {
      score: 88,
      reason: 'Ideal for water enthusiasts and summer camping',
      tags: ['Lakefront', 'Water Sports', 'Summer Fun']
    }
  },
  {
    id: '3',
    name: 'Desert Oasis',
    location: {
      address: '789 Desert Trail',
      city: 'Moab',
      state: 'Utah',
      coordinates: { lat: 38.5733, lng: -109.5498 }
    },
    description: 'Experience the stunning red rock formations and incredible night skies in this desert paradise.',
    images: [
      'https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Stargazing Area', 'Visitor Center', 'Restrooms', 'Water Station', 'Fire Rings'],
    accessibility: {
      mobilityAccessible: false,
      visuallyAccessible: true,
      hearingAccessible: true,
      cognitiveAccessible: false,
      accessibilityRating: 2,
      accessibilityFeatures: ['Tactile trail markers', 'Audio guides available']
    },
    availability: {
      '2025-01-15': { tent: 10, rv: 4, cabin: 0 },
      '2025-01-16': { tent: 8, rv: 3, cabin: 0 },
      '2025-01-17': { tent: 12, rv: 5, cabin: 0 }
    },
    pricing: { tent: 20, rv: 30, cabin: 0 },
    rating: 4.9,
    reviews: 156,
    activities: ['Rock Climbing', 'Stargazing', 'Photography', 'Hiking', 'Mountain Biking'],
    rules: ['No generators after 8 PM', 'Stay on designated trails', 'No open fires during fire season'],
    aiRecommendation: {
      score: 92,
      reason: 'Unmatched stargazing and adventure opportunities',
      tags: ['Stargazing', 'Adventure', 'Photography']
    }
  },
  {
    id: '4',
    name: 'Whispering Pines',
    location: {
      address: '321 Pine Ridge Road',
      city: 'Flagstaff',
      state: 'Arizona',
      coordinates: { lat: 35.1983, lng: -111.6513 }
    },
    description: 'Peaceful forest setting with towering pines and abundant wildlife. Perfect for families and first-time campers.',
    images: [
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Playground', 'Restrooms', 'Showers', 'Fire Pits', 'Picnic Tables', 'Pet Area'],
    accessibility: {
      mobilityAccessible: true,
      visuallyAccessible: true,
      hearingAccessible: true,
      cognitiveAccessible: true,
      accessibilityRating: 5,
      accessibilityFeatures: ['Universal design bathrooms', 'Accessible trails', 'Audio descriptions', 'Clear signage']
    },
    availability: {
      '2025-01-15': { tent: 12, rv: 8, cabin: 3 },
      '2025-01-16': { tent: 10, rv: 6, cabin: 2 },
      '2025-01-17': { tent: 14, rv: 9, cabin: 3 }
    },
    pricing: { tent: 30, rv: 45, cabin: 95 },
    rating: 4.7,
    reviews: 203,
    activities: ['Nature Walks', 'Bird Watching', 'Playground', 'Educational Programs'],
    rules: ['Pets must be leashed', 'Quiet hours 9 PM - 7 AM', 'No loud music'],
    aiRecommendation: {
      score: 96,
      reason: 'Perfect for families and first-time RVers with excellent accessibility',
      tags: ['Family Friendly', 'First-Timer Friendly', 'Pet Friendly']
    }
  }
];

export const mockWeatherData: WeatherData = {
  location: 'Boulder, CO',
  current: {
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 8
  },
  forecast: [
    { date: '2025-01-15', high: 75, low: 52, condition: 'Sunny', precipitation: 0 },
    { date: '2025-01-16', high: 73, low: 48, condition: 'Partly Cloudy', precipitation: 10 },
    { date: '2025-01-17', high: 68, low: 45, condition: 'Cloudy', precipitation: 30 },
    { date: '2025-01-18', high: 65, low: 42, condition: 'Light Rain', precipitation: 60 },
    { date: '2025-01-19', high: 70, low: 47, condition: 'Partly Cloudy', precipitation: 20 },
    { date: '2025-01-20', high: 74, low: 50, condition: 'Sunny', precipitation: 5 },
    { date: '2025-01-21', high: 76, low: 53, condition: 'Sunny', precipitation: 0 }
  ],
  alerts: [
    {
      type: 'Wind Advisory',
      message: 'Strong winds expected tomorrow afternoon',
      severity: 'medium'
    }
  ]
};

export const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Mountain Adventure Weekend',
    campsite: mockCampsites[0],
    checkIn: '2025-01-20',
    checkOut: '2025-01-22',
    status: 'upcoming',
    totalCost: 100,
    equipmentType: 'tent',
    partySize: 2
  },
  {
    id: '2',
    name: 'Lake Family Vacation',
    campsite: mockCampsites[1],
    checkIn: '2025-02-15',
    checkOut: '2025-02-18',
    status: 'upcoming',
    totalCost: 360,
    equipmentType: 'cabin',
    partySize: 4
  },
  {
    id: '3',
    name: 'Desert Stargazing Trip',
    campsite: mockCampsites[2],
    checkIn: '2024-12-10',
    checkOut: '2024-12-12',
    status: 'completed',
    totalCost: 60,
    equipmentType: 'tent',
    partySize: 2
  }
];

export const mockUserProfile: UserProfile = {
  id: '1',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@email.com',
  phone: '(555) 123-4567',
  preferences: {
    campingStyle: ['Mountain Camping', 'RV Travel', 'Family Camping'],
    equipmentOwned: ['Tent', 'Sleeping Bags', 'Camping Chairs', 'Portable Grill'],
    accessibilityNeeds: {
      mobilityAccessible: false,
      visuallyAccessible: false,
      hearingAccessible: false,
      cognitiveAccessible: false
    },
    notifications: {
      weather: true,
      bookingReminders: true,
      deals: true
    }
  },
  savedCampsites: ['1', '4'],
  pets: [
    { name: 'Buddy', type: 'Dog', breed: 'Golden Retriever' },
    { name: 'Whiskers', type: 'Cat', breed: 'Maine Coon' }
  ]
};

export const availableAmenities = [
  'Restrooms', 'Showers', 'Fire Pits', 'Picnic Tables', 'Water Hookups', 
  'Electrical Hookups', 'Beach Access', 'Boat Launch', 'Store', 'Laundry',
  'Stargazing Area', 'Visitor Center', 'Water Station', 'Fire Rings', 'Playground', 'Pet Area'
];

export const aiSearchSuggestions = [
  "🏔️ Mountain sites with great views",
  "🏖️ Lakefront camping this weekend",
  "♿ Fully accessible RV sites",
  "🐕 Pet-friendly family campgrounds",
  "⭐ Hidden gems locals love",
  "🚐 Perfect for first-time RVers"
];

export const quickFilters = [
  { label: "Pet Friendly", emoji: "🐕", filter: "petFriendly" },
  { label: "RV Sites", emoji: "🚐", filter: "rv" },
  { label: "Accessible", emoji: "♿", filter: "accessible" },
  { label: "Lakefront", emoji: "🏖️", filter: "lakefront" },
  { label: "Mountain Views", emoji: "🏔️", filter: "mountain" },
  { label: "Family Fun", emoji: "👨‍👩‍👧‍👦", filter: "family" }
];