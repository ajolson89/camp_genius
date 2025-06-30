import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Tent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters } from '../types';

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ filters, onFiltersChange, onSearch }) => {
  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const equipmentOptions = [
    { value: 'all', label: 'All Types', icon: '🏕️' },
    { value: 'tent', label: 'Tent', icon: '⛺' },
    { value: 'rv', label: 'RV', icon: '🚐' },
    { value: 'cabin', label: 'Cabin', icon: '🏠' }
  ];

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Where to?"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
            />
          </div>
        </motion.div>

        {/* Check-in */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
            />
          </div>
        </motion.div>

        {/* Check-out */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
            />
          </div>
        </motion.div>

        {/* Party Size */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Party Size
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              value={filters.partySize}
              onChange={(e) => handleInputChange('partySize', parseInt(e.target.value))}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all duration-300 hover:border-gray-400"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Equipment Type */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipment
          </label>
          <div className="relative">
            <Tent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              value={filters.equipmentType}
              onChange={(e) => handleInputChange('equipmentType', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all duration-300 hover:border-gray-400"
            >
              {equipmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      {/* Advanced Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range (per night)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handleInputChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                placeholder="Min"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
              <span className="text-gray-500 font-medium">to</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handleInputChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                placeholder="Max"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Accessibility Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Accessibility Features
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'mobilityAccessible', label: 'Mobility', icon: '♿' },
                { key: 'visuallyAccessible', label: 'Visual', icon: '👁️' },
                { key: 'hearingAccessible', label: 'Hearing', icon: '👂' },
                { key: 'cognitiveAccessible', label: 'Cognitive', icon: '🧠' }
              ].map(option => (
                <motion.label 
                  key={option.key} 
                  className="flex items-center space-x-2 p-3 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    checked={filters.accessibility[option.key as keyof typeof filters.accessibility]}
                    onChange={(e) => handleInputChange('accessibility', {
                      ...filters.accessibility,
                      [option.key]: e.target.checked
                    })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                </motion.label>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center mt-6">
          <motion.button
            onClick={onSearch}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="h-5 w-5" />
            <span>Search Campsites</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;