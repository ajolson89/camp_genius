import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import NavigationTabs from './components/NavigationTabs';
import CampsiteCard from './components/CampsiteCard';
import MapView from './components/MapView';
import WeatherWidget from './components/WeatherWidget';
import AccessibilityPanel from './components/AccessibilityPanel';
import RoutePanel from './components/RoutePanel';
import BookingModal from './components/BookingModal';
import AIAssistant from './components/AIAssistant';
import Dashboard from './pages/Dashboard';
import MapViewPage from './pages/MapViewPage';
import CampsiteDetail from './pages/CampsiteDetail';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import RoutePlanner from './pages/RoutePlanner';
import { mockCampsites, mockWeatherData } from './data/mockData';
import { SearchFilters, Campsite, BookingData } from './types';
import { campsiteAPI, aiAPI, authAPI } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeView, setActiveView] = useState('search');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    checkIn: '',
    checkOut: '',
    partySize: 2,
    equipmentType: 'all',
    priceRange: [0, 200],
    amenities: [],
    accessibility: {
      mobilityAccessible: false,
      visuallyAccessible: false,
      hearingAccessible: false,
      cognitiveAccessible: false
    }
  });
  const [filteredCampsites, setFilteredCampsites] = useState(mockCampsites);
  const [selectedCampsite, setSelectedCampsite] = useState<Campsite | null>(null);
  const [bookingCampsite, setBookingCampsite] = useState<Campsite | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleAISearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // First, try to use AI search if user is authenticated
      if (authAPI.isAuthenticated()) {
        try {
          const aiResults = await aiAPI.search(query, searchFilters);
          setFilteredCampsites(aiResults.campsites || []);
          setCurrentPage('search-results');
          return;
        } catch (aiError) {
          console.log('AI search failed, falling back to regular search:', aiError);
        }
      }
      
      // Fall back to regular search
      const queryLower = query.toLowerCase();
      const searchParams: any = {
        location: searchFilters.location || query,
      };
      
      // Parse natural language for search parameters
      if (queryLower.includes('pet') || queryLower.includes('dog')) {
        searchParams.petFriendly = true;
      }
      
      if (queryLower.includes('accessible') || queryLower.includes('wheelchair')) {
        searchParams.wheelchairAccessible = true;
      }
      
      if (queryLower.includes('rv') || queryLower.includes('motorhome')) {
        searchParams.equipmentType = 'rv';
      } else if (queryLower.includes('tent')) {
        searchParams.equipmentType = 'tent';
      } else if (queryLower.includes('cabin')) {
        searchParams.equipmentType = 'cabin';
      } else if (queryLower.includes('glamping')) {
        searchParams.equipmentType = 'glamping';
      }
      
      // Add filter parameters
      if (searchFilters.checkIn) searchParams.checkInDate = searchFilters.checkIn;
      if (searchFilters.checkOut) searchParams.checkOutDate = searchFilters.checkOut;
      if (searchFilters.partySize) searchParams.numberOfGuests = searchFilters.partySize;
      if (searchFilters.priceRange) {
        searchParams.minPrice = searchFilters.priceRange[0];
        searchParams.maxPrice = searchFilters.priceRange[1];
      }
      if (searchFilters.amenities?.length) searchParams.amenities = searchFilters.amenities;
      
      const results = await campsiteAPI.search(searchParams);
      setFilteredCampsites(results.campsites || results || []);
      setCurrentPage('search-results');
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Using sample data instead.');
      
      // Fall back to mock data on error
      let filtered = mockCampsites;
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('pet') || queryLower.includes('dog')) {
        filtered = filtered.filter(campsite => 
          campsite.amenities.some(amenity => amenity.toLowerCase().includes('pet')) ||
          campsite.name.toLowerCase().includes('pet')
        );
      }
      
      if (queryLower.includes('rv') || queryLower.includes('motorhome')) {
        filtered = filtered.filter(campsite => campsite.pricing.rv > 0);
      }
      
      if (queryLower.includes('accessible') || queryLower.includes('wheelchair')) {
        filtered = filtered.filter(campsite => campsite.accessibility.mobilityAccessible);
      }
      
      setFilteredCampsites(filtered);
      setCurrentPage('search-results');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookingComplete = (booking: BookingData) => {
    alert(`🏕️ Adventure Booked! 🎉\n\n${booking.campsite.name}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nTotal: $${calculateBookingTotal(booking)}\n\nGet ready for an amazing outdoor experience!`);
    setBookingCampsite(null);
  };

  const calculateBookingTotal = (booking: BookingData) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * booking.campsite.pricing[booking.equipmentType];
  };

  const handleCampsiteSelect = (campsite: Campsite) => {
    setSelectedCampsite(campsite);
    setCurrentPage('campsite-detail');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50">
            <HeroSection 
              onAISearch={handleAISearch}
              onOpenAI={() => setAiAssistantOpen(true)}
            />
          </div>
        );

      case 'dashboard':
        return (
          <Dashboard
            onCampsiteSelect={handleCampsiteSelect}
            onBookCampsite={setBookingCampsite}
          />
        );

      case 'map':
        return (
          <MapViewPage
            onCampsiteSelect={handleCampsiteSelect}
            onBookCampsite={setBookingCampsite}
          />
        );

      case 'profile':
        return <Profile />;

      case 'route-planner':
        return (
          <RoutePlanner
            onCampsiteSelect={handleCampsiteSelect}
          />
        );

      case 'campsite-detail':
        return selectedCampsite ? (
          <CampsiteDetail
            campsite={selectedCampsite}
            onBack={() => setCurrentPage('search-results')}
            onBook={setBookingCampsite}
          />
        ) : null;

      case 'search-results':
        return (
          <SearchResults
            searchQuery={searchQuery}
            onBack={() => setCurrentPage('home')}
            onCampsiteSelect={handleCampsiteSelect}
            onBookCampsite={setBookingCampsite}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50">
            <HeroSection 
              onAISearch={handleAISearch}
              onOpenAI={() => setAiAssistantOpen(true)}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        campsites={mockCampsites}
        onCampsiteSelect={handleCampsiteSelect}
        onBookCampsite={setBookingCampsite}
      />

      {/* Booking Modal */}
      <BookingModal
        campsite={bookingCampsite}
        onClose={() => setBookingCampsite(null)}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}

export default App;