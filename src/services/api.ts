// API configuration and base functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Campsite API
export const campsiteAPI = {
  // Search campsites without authentication
  search: async (params: {
    location?: string;
    checkInDate?: string;
    checkOutDate?: string;
    numberOfGuests?: number;
    equipmentType?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    petFriendly?: boolean;
    wheelchairAccessible?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.location) queryParams.append('location', params.location);
    if (params.checkInDate) queryParams.append('checkInDate', params.checkInDate);
    if (params.checkOutDate) queryParams.append('checkOutDate', params.checkOutDate);
    if (params.numberOfGuests) queryParams.append('numberOfGuests', params.numberOfGuests.toString());
    if (params.equipmentType) queryParams.append('equipmentType', params.equipmentType);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.amenities?.length) queryParams.append('amenities', params.amenities.join(','));
    if (params.petFriendly !== undefined) queryParams.append('petFriendly', params.petFriendly.toString());
    if (params.wheelchairAccessible !== undefined) queryParams.append('wheelchairAccessible', params.wheelchairAccessible.toString());

    return apiCall(`/api/campsites?${queryParams}`);
  },

  // Get campsite by ID
  getById: async (id: string) => {
    return apiCall(`/api/campsites/${id}`);
  },

  // Get nearby campsites
  getNearby: async (params: { lat: number; lng: number; radius?: number }) => {
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      radius: (params.radius || 50).toString(),
    });

    return apiCall(`/api/campsites/nearby?${queryParams}`);
  },
};

// AI API
export const aiAPI = {
  // AI-powered search (requires authentication)
  search: async (query: string, filters?: any) => {
    return apiCall('/api/ai/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        filters,
        maxResults: 20,
      }),
    });
  },

  // Chat with AI assistant
  chat: async (message: string, context?: any) => {
    return apiCall('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
      }),
    });
  },
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (email: string, password: string) => {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// Booking API
export const bookingAPI = {
  // Create booking (requires authentication)
  create: async (data: {
    campsiteId: string;
    siteNumber: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    equipmentType: string;
    totalPrice: number;
  }) => {
    return apiCall('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user's bookings
  getUserBookings: async () => {
    return apiCall('/api/bookings');
  },

  // Cancel booking
  cancel: async (bookingId: string) => {
    return apiCall(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  },
};

// Trip API
export const tripAPI = {
  // Create trip (requires authentication)
  create: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    participants: number;
    campsites: string[];
  }) => {
    return apiCall('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user's trips
  getUserTrips: async () => {
    return apiCall('/api/trips');
  },

  // Update trip
  update: async (tripId: string, data: any) => {
    return apiCall(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// External API integrations
export const externalAPI = {
  // Get weather for location
  getWeather: async (lat: number, lng: number) => {
    return apiCall(`/api/external/weather?lat=${lat}&lng=${lng}`);
  },

  // Get directions
  getDirections: async (params: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    waypoints?: Array<{ lat: number; lng: number }>;
  }) => {
    const queryParams = new URLSearchParams({
      start: `${params.start.lat},${params.start.lng}`,
      end: `${params.end.lat},${params.end.lng}`,
    });

    if (params.waypoints?.length) {
      queryParams.append(
        'waypoints',
        params.waypoints.map(w => `${w.lat},${w.lng}`).join('|')
      );
    }

    return apiCall(`/api/external/directions?${queryParams}`);
  },
};