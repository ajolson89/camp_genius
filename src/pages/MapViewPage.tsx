import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Star, DollarSign, Tent, Truck, Home } from 'lucide-react';
import { mockCampsites } from '../data/mockData';
import { Campsite } from '../types';

interface MapViewPageProps {
  onCampsiteSelect: (campsite: Campsite) => void;
  onBookCampsite: (campsite: Campsite) => void;
}

const MapViewPage: React.FC<MapViewPageProps> = ({ onCampsiteSelect, onBookCampsite }) => {
  const [selectedCampsite, setSelectedCampsite] = useState<Campsite | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    equipmentType: 'all',
    accessibility: false,
    amenities: [] as string[]
  });

  const getAvailabilityColor = (campsite: Campsite) => {
    const availability = Object.values(campsite.availability)[0];
    const totalSites = availability.tent + availability.rv + availability.cabin;
    
    if (totalSites > 10) return 'bg-green-500';
    if (totalSites > 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tent': return <Tent className="h-4 w-4" />;
      case 'rv': return <Truck className="h-4 w-4" />;
      case 'cabin': return <Home className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50 pt-20">
      {/* Header */}
      <div className="relative z-20 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-charcoal flex items-center">
              <span className="text-3xl mr-3">🗺️</span>
              Explore Campsites
            </h1>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find campsites near..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Button */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-white shadow-xl border-r border-gray-200 overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-charcoal mb-6">Filter Adventures</h2>
                
                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range (per night)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Equipment Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Equipment Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', 'tent', 'rv', 'cabin'].map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => setFilters({ ...filters, equipmentType: type })}
                        className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                          filters.equipmentType === type
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {type !== 'all' && getEquipmentIcon(type)}
                        <span className="text-sm capitalize">{type}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.accessibility}
                      onChange={(e) => setFilters({ ...filters, accessibility: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">♿ Accessibility Features</span>
                  </label>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {['Restrooms', 'Showers', 'Fire Pits', 'Water Hookups', 'Pet Area'].map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, amenities: [...filters.amenities, amenity] });
                            } else {
                              setFilters({ ...filters, amenities: filters.amenities.filter(a => a !== amenity) });
                            }
                          }}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Simulated Map */}
          <div className="h-full bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
            {/* Background terrain pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 800 600">
                <defs>
                  <pattern id="terrain" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="#22c55e" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#terrain)" />
              </svg>
            </div>

            {/* Rivers/roads */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 0 300 Q 200 280 400 300 T 800 290"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 100 0 Q 150 150 200 300 Q 250 450 300 600"
                stroke="#6b7280"
                strokeWidth="3"
                fill="none"
                opacity="0.4"
              />
            </svg>

            {/* Campsite markers */}
            {mockCampsites.map((campsite, index) => {
              const x = 100 + (index * 180) + (Math.sin(index) * 60);
              const y = 150 + (index * 100) + (Math.cos(index) * 80);
              const isSelected = selectedCampsite?.id === campsite.id;
              
              return (
                <motion.div
                  key={campsite.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                  }`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  onClick={() => setSelectedCampsite(campsite)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Marker */}
                  <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white ${
                      isSelected 
                        ? 'bg-orange-600 text-white' 
                        : `${getAvailabilityColor(campsite)} text-white hover:bg-orange-500`
                    }`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    
                    {/* Popup on select */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl p-4 min-w-64 z-40 border border-orange-200"
                      >
                        <div className="text-sm font-bold text-charcoal mb-1">
                          {campsite.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-3 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {campsite.location.city}, {campsite.location.state}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{campsite.rating}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs">
                            {campsite.pricing.tent > 0 && (
                              <div className="flex items-center space-x-1">
                                <Tent className="h-3 w-3" />
                                <span>${campsite.pricing.tent}</span>
                              </div>
                            )}
                            {campsite.pricing.rv > 0 && (
                              <div className="flex items-center space-x-1">
                                <Truck className="h-3 w-3" />
                                <span>${campsite.pricing.rv}</span>
                              </div>
                            )}
                            {campsite.pricing.cabin > 0 && (
                              <div className="flex items-center space-x-1">
                                <Home className="h-3 w-3" />
                                <span>${campsite.pricing.cabin}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCampsiteSelect(campsite);
                            }}
                            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded-lg text-xs font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            View Details
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookCampsite(campsite);
                            }}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-2 px-3 rounded-lg text-xs font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Book Now
                          </motion.button>
                        </div>
                        
                        {/* Arrow pointing to marker */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-sm font-bold text-charcoal mb-3">🗺️ Map Legend</div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>High Availability (10+ sites)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>Limited Availability (5-10 sites)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Low Availability (1-5 sites)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-4 h-1 bg-blue-500"></div>
                  <span>Rivers & Lakes</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-4 h-1 bg-gray-500"></div>
                  <span>Trails & Roads</span>
                </div>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg">
              <div className="flex flex-col space-y-1">
                <motion.button 
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  +
                </motion.button>
                <motion.button 
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  −
                </motion.button>
              </div>
            </div>

            {/* AI Suggestions Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <span className="font-medium">AI suggests these sites based on your preferences</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;