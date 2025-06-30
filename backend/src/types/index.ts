// Core Types for CampExplorer Backend

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  savedCampsites: string[];
  pets: Pet[];
  accessibilityNeeds: AccessibilityNeeds;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  equipmentType: EquipmentType;
  campingStyle: string[];
  favoriteActivities: string[];
  dietaryRestrictions: string[];
  budgetRange: {
    min: number;
    max: number;
  };
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed?: string;
  size: 'small' | 'medium' | 'large';
  specialNeeds?: string;
}

export interface AccessibilityNeeds {
  mobility: boolean;
  visual: boolean;
  hearing: boolean;
  cognitive: boolean;
  other?: string[];
}

export enum EquipmentType {
  TENT = 'tent',
  RV = 'rv',
  CABIN = 'cabin',
  GLAMPING = 'glamping'
}

export interface Campsite {
  id: string;
  name: string;
  description: string;
  location: Location;
  coordinates: Coordinates;
  images: string[];
  pricing: Pricing;
  availability: Availability[];
  amenities: string[];
  accessibility: Accessibility;
  policies: Policies;
  rating: number;
  reviewCount: number;
  aiRecommendation?: AIRecommendation;
  source: 'recreation_gov' | 'private' | 'unique_stay';
  externalId?: string;
  vectorEmbedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Pricing {
  tent: number;
  rv: number;
  cabin?: number;
  glamping?: number;
}

export interface Availability {
  date: string;
  tent: boolean;
  rv: boolean;
  cabin?: boolean;
  glamping?: boolean;
}

export interface Accessibility {
  wheelchairAccessible: boolean;
  accessibleParking: boolean;
  accessibleToilets: boolean;
  pavementPaths: boolean;
  assistanceAnimalsAllowed: boolean;
  audioGuides: boolean;
  brailleSignage: boolean;
  largeTextAvailable: boolean;
  quietAreas: boolean;
  sensoryFriendly: boolean;
  features: AccessibilityFeature[];
}

export interface AccessibilityFeature {
  category: 'mobility' | 'visual' | 'hearing' | 'cognitive';
  name: string;
  available: boolean;
  description?: string;
}

export interface Policies {
  petFriendly: boolean;
  maxPets: number;
  petRestrictions?: string[];
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  quietHours: {
    start: string;
    end: string;
  };
}

export interface AIRecommendation {
  score: number;
  reasons: string[];
  matchPercentage: number;
  suggestedActivities: string[];
}

export interface Booking {
  id: string;
  userId: string;
  campsiteId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  equipmentType: EquipmentType;
  totalPrice: number;
  status: BookingStatus;
  contactInfo: ContactInfo;
  specialRequests?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  campsites: string[];
  status: TripStatus;
  totalDistance?: number;
  estimatedDrivingTime?: number;
  routePolyline?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TripStatus {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface SearchFilters {
  location?: string;
  coordinates?: Coordinates;
  radius?: number;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  equipmentType?: EquipmentType;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  accessibilityNeeds?: AccessibilityNeeds;
  petFriendly?: boolean;
  source?: ('recreation_gov' | 'private' | 'unique_stay')[];
}

export interface AISearchQuery {
  naturalLanguageQuery: string;
  userId: string;
  filters?: SearchFilters;
  includeRecommendations?: boolean;
  maxResults?: number;
}

export interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    uvIndex: number;
  };
  forecast: WeatherForecast[];
  alerts?: WeatherAlert[];
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitationChance: number;
}

export interface WeatherAlert {
  type: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
  type: 'search' | 'booking' | 'route' | 'weather' | 'recommendation';
  label: string;
  data: any;
}