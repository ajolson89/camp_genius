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

  const handleAISearch = (query: string) => {
    setSearchQuery(query);
    // Simulate AI search processing
    let filtered = mockCampsites;
    
    const queryLower = query.toLowerCase();
    
    // AI-powered search logic
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
    
    if (queryLower.includes('lake') || queryLower.includes('water')) {
      filtered = filtered.filter(campsite => 
        campsite.amenities.some(amenity => amenity.toLowerCase().includes('beach')) ||
        campsite.name.toLowerCase().includes('lake')
      );
    }
    
    if (queryLower.includes('mountain') || queryLower.includes('view')) {
      filtered = filtered.filter(campsite => 
        campsite.description.toLowerCase().includes('mountain') ||
        campsite.activities.some(activity => activity.toLowerCase().includes('hiking'))
      );
    }

    // Sort by AI recommendation score
    filtered.sort((a, b) => (b.aiRecommendation?.score || 0) - (a.aiRecommendation?.score || 0));
    
    setFilteredCampsites(filtered);
    setCurrentPage('search-results');
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