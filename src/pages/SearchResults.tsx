import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, ArrowLeft } from 'lucide-react';
import CampsiteCard from '../components/CampsiteCard';
import { mockCampsites } from '../data/mockData';
import { Campsite } from '../types';

interface SearchResultsProps {
  searchQuery: string;
  onBack: () => void;
  onCampsiteSelect: (campsite: Campsite) => void;
  onBookCampsite: (campsite: Campsite) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchQuery, 
  onBack, 
  onCampsiteSelect, 
  onBookCampsite 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    equipmentType: 'all',
    accessibility: false,
    amenities: [] as string[]
  });

  // Filter and sort results based on search query
  const filteredResults = mockCampsites.filter(campsite => {
    const queryLower = searchQuery.toLowerCase();
    return (
      campsite.name.toLowerCase().includes(queryLower) ||
      campsite.location.city.toLowerCase().includes(queryLower) ||
      campsite.location.state.toLowerCase().includes(queryLower) ||
      campsite.description.toLowerCase().includes(queryLower) ||
      campsite.amenities.some(amenity => amenity.toLowerCase().includes(queryLower)) ||
      campsite.activities.some(activity => activity.toLowerCase().includes(queryLower))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50 pt-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 text-teal-600 hover:text-orange-600 font-medium"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>New Search</span>
              </motion.button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-charcoal">
                  Results for "{searchQuery}"
                </h1>
                <p className="text-teal-600 font-medium">
                  {filteredResults.length} amazing adventures found
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="recommended">AI Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-xl p-1 shadow-lg border border-orange-200">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md' 
                      : 'text-teal-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Grid className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md' 
                      : 'text-teal-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <List className="h-4 w-4" />
                </motion.button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 bg-white rounded-3xl shadow-xl p-6 h-fit sticky top-32 border border-orange-100"
              >
                <h2 className="text-xl font-bold text-charcoal mb-6">Refine Your Adventure</h2>
                
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
                  <div className="space-y-2">
                    {['all', 'tent', 'rv', 'cabin'].map((type) => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="equipmentType"
                          value={type}
                          checked={filters.equipmentType === type}
                          onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type === 'all' ? 'All Types' : type}</span>
                      </label>
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
                    <span className="text-sm font-medium text-gray-700">♿ Accessibility Features Required</span>
                  </label>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Must-Have Amenities
                  </label>
                  <div className="space-y-2">
                    {['Restrooms', 'Showers', 'Fire Pits', 'Water Hookups', 'Pet Area', 'Beach Access'].map((amenity) => (
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1">
            {/* AI Suggestions Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-3xl shadow-xl"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-lg">AI Ranger Insights</h3>
                  <p className="opacity-90">
                    Based on your search for "{searchQuery}", I've prioritized campsites with the best matches for your adventure style.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Results Grid/List */}
            <motion.div
              layout
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                : 'space-y-6'
              }
            >
              {filteredResults.map((campsite, index) => (
                <motion.div
                  key={campsite.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  layout
                >
                  <CampsiteCard
                    campsite={campsite}
                    onSelect={onCampsiteSelect}
                    onBook={onBookCampsite}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* No Results */}
            {filteredResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🏕️</div>
                <h3 className="text-2xl font-bold text-charcoal mb-2">No adventures found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to discover more amazing campsites.
                </p>
                <motion.button
                  onClick={onBack}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start New Search
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;