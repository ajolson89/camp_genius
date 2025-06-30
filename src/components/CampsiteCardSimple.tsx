import React, { useState } from 'react';
import { Star, MapPin, Accessibility, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Campsite } from '../types';
import AvailabilityCalendar from './AvailabilityCalendar';

interface CampsiteCardProps {
  campsite: Campsite;
  onSelect: (campsite: Campsite) => void;
  onBook: (campsite: Campsite) => void;
}

const CampsiteCardSimple: React.FC<CampsiteCardProps> = ({ campsite, onSelect, onBook }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const handleDateSelect = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Format description to handle markdown-like formatting
  const formatDescription = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={campsite.images[0] || 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800'}
          alt={campsite.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        
        {/* Rating Badge - Simple and Clean */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 shadow-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{campsite.rating}</span>
        </div>

        {/* Accessibility Indicator - Only if accessible */}
        {campsite.accessibility.mobilityAccessible && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white rounded-full p-1.5 shadow-sm">
            <Accessibility className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 
            className="font-semibold text-lg text-gray-900 mb-1 cursor-pointer hover:text-orange-600 transition-colors"
            onClick={() => onSelect(campsite)}
          >
            {campsite.name}
          </h3>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{campsite.location.city}, {campsite.location.state}</span>
          </div>
        </div>

        {/* AI Ranger Insight - Now uses real description */}
        {campsite.aiRecommendation && (
          <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="text-sm">🤖</span>
                <span className="text-xs font-medium text-purple-700 ml-1">AI Ranger</span>
              </div>
              <div className="text-xs font-bold text-purple-600">
                {campsite.aiRecommendation.score}/100
              </div>
            </div>
            <div 
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatDescription(campsite.aiRecommendation.reason) }}
            />
          </div>
        )}

        {/* Simple Amenities - Max 3 key ones */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {campsite.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index} 
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {campsite.amenities.length > 3 && (
              <span className="text-xs text-gray-400">
                +{campsite.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing - Simple */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-3 text-sm text-gray-600">
            <span>⛺ ${campsite.pricing.tent}</span>
            <span>🚐 ${campsite.pricing.rv}</span>
            {campsite.pricing.cabin > 0 && <span>🏠 ${campsite.pricing.cabin}</span>}
          </div>
        </div>

        {/* Calendar Toggle Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Check Availability</span>
            {showCalendar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Action Buttons - Clean */}
        <div className="flex space-x-2">
          <button
            onClick={() => onSelect(campsite)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onBook(campsite)}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Availability Calendar */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 p-4"
          >
            <AvailabilityCalendar
              availability={campsite.availability || {}}
              onDateSelect={handleDateSelect}
              selectedDates={selectedDates}
            />
            {selectedDates.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-1">
                  Selected Dates: {selectedDates.length} night{selectedDates.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-green-600">
                  {selectedDates.sort().join(', ')}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};}

export default CampsiteCardSimple;