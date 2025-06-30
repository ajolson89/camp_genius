export interface Campsite {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  images: string[];
  amenities: string[];
  accessibility: {
    mobilityAccessible: boolean;
    visuallyAccessible: boolean;
    hearingAccessible: boolean;
    cognitiveAccessible: boolean;
    accessibilityRating: number;
    accessibilityFeatures: string[];
  };
  availability: {
    [date: string]: {
      tent: number;
      rv: number;
      cabin: number;
    };
  };
  pricing: {
    tent: number;
    rv: number;
    cabin: number;
  };
  rating: number;
  reviews: number;
  activities: string[];
  rules: string[];
  aiRecommendation?: {
    score: number;
    reason: string;
    tags: string[];
  };
}

export interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  partySize: number;
  equipmentType: 'tent' | 'rv' | 'cabin' | 'all';
  priceRange: [number, number];
  amenities: string[];
  accessibility: {
    mobilityAccessible: boolean;
    visuallyAccessible: boolean;
    hearingAccessible: boolean;
    cognitiveAccessible: boolean;
  };
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface RouteStop {
  id: string;
  campsite: Campsite;
  arrivalDate: string;
  departureDate: string;
  nights: number;
}

export interface BookingData {
  campsite: Campsite;
  checkIn: string;
  checkOut: string;
  partySize: number;
  equipmentType: 'tent' | 'rv' | 'cabin';
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  specialRequests: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export interface AIAssistantState {
  isOpen: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
}

export interface Trip {
  id: string;
  name: string;
  campsite: Campsite;
  checkIn: string;
  checkOut: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  totalCost: number;
  equipmentType: 'tent' | 'rv' | 'cabin';
  partySize: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: {
    campingStyle: string[];
    equipmentOwned: string[];
    accessibilityNeeds: {
      mobilityAccessible: boolean;
      visuallyAccessible: boolean;
      hearingAccessible: boolean;
      cognitiveAccessible: boolean;
    };
    notifications: {
      weather: boolean;
      bookingReminders: boolean;
      deals: boolean;
    };
  };
  savedCampsites: string[];
  pets: Array<{
    name: string;
    type: string;
    breed?: string;
  }>;
}