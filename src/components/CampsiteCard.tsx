import React from 'react';
import { Star, MapPin, Accessibility, Tent, Truck, Home, Sparkles, Zap, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';
import { Campsite } from '../types';

interface CampsiteCardProps {
  campsite: Campsite;
  onSelect: (campsite: Campsite) => void;
  onBook: (campsite: Campsite) => void;
}

const CampsiteCard: React.FC<CampsiteCardProps> = ({ campsite, onSelect, onBook }) => {
  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tent': return <span className="text-lg">⛺</span>;
      case 'rv': return <span className="text-lg">🚐</span>;
      case 'cabin': return <span className="text-lg">🏠</span>;
      default: return null;
    }
  };

  const getAccessibilityColor = (rating: number) => {
    if (rating >= 4) return 'text-teal-600 bg-teal-50 border-teal-200';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getWeatherIcon = (condition: string) => {
    const icons = {
      'sunny': '☀️',
      'partly cloudy': '⛅',
      'cloudy': '☁️',
      'light rain': '🌦️'
    };
    return icons[condition.toLowerCase() as keyof typeof icons] || '☀️';
  };

  // Mock weather data for the card
  const mockWeather = {
    condition: 'Sunny',
    high: 75,
    low: 52
  };

  const getCampingActivityIcons = () => {
    const activityIcons: { [key: string]: string } = {
      'Hiking': '🥾',
      'Fishing': '🎣',
      'Swimming': '🏊‍♂️',
      'Boating': '⛵',
      'Rock Climbing': '🧗‍♂️',
      'Stargazing': '⭐',
      'Photography': '📸',
      'Wildlife Watching': '🦌',
      'Nature Walks': '🚶‍♂️',
      'Bird Watching': '🦅'
    };
    
    return campsite.activities.slice(0, 3).map(activity => 
      activityIcons[activity] || '🏕️'
    );
  };

  return (
    <motion.div 
      className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-orange-100 relative group"
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Adventure Postcard Style Header */}
      <div className="relative h-56 overflow-hidden">
        <motion.img
          src={campsite.images[0]}
          alt={campsite.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Postcard Stamp Style AI Badge */}
        {campsite.aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-lg transform rotate-12 border-2 border-white"
            style={{ fontFamily: 'serif' }}
          >
            <Sparkles className="h-3 w-3" />
            <span>AI PICK</span>
          </motion.div>
        )}

        {/* Adventure Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
          <Star className="h-3 w-3 fill-current" />
          <span>{campsite.rating}</span>
          <span className="opacity-80">({campsite.reviews})</span>
        </div>

        {/* Hot Spot Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-orange-600 to-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg"
        >
          <span className="text-base">🔥</span>
          <span>Hot Spot - Booking Fast!</span>
        </motion.div>

        {/* Adventure Activity Icons Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {getCampingActivityIcons().map((icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg"
            >
              {icon}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <motion.h3 
            className="text-xl font-bold text-charcoal hover:text-orange-600 cursor-pointer transition-colors line-clamp-1"
            onClick={() => onSelect(campsite)}
            whileHover={{ x: 4 }}
          >
            {campsite.name}
          </motion.h3>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getAccessibilityColor(campsite.accessibility.accessibilityRating)}`}>
            <span className="text-base">♿</span>
            <span>{campsite.accessibility.accessibilityRating}/5</span>
          </div>
        </div>

        <div className="flex items-center text-teal-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{campsite.location.city}, {campsite.location.state}</span>
        </div>

        {/* AI Recommendation */}
        {campsite.aiRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-bold text-purple-700">AI Ranger Says:</span>
            </div>
            <p className="text-sm text-charcoal font-medium mb-2">
              "{campsite.aiRecommendation.reason}"
            </p>
            <div className="flex flex-wrap gap-1">
              {campsite.aiRecommendation.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weather & Adventure Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getWeatherIcon(mockWeather.condition)}</span>
                <span className="text-xs font-medium text-teal-700">Perfect Weather</span>
              </div>
              <div className="text-xs text-teal-600 font-bold">
                {mockWeather.high}°/{mockWeather.low}°
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏕️</span>
              <span className="text-xs font-medium text-orange-700">Adventure Ready</span>
            </div>
          </div>
        </div>

        {/* Camping Amenities with Fun Icons */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {campsite.amenities.slice(0, 3).map((amenity, index) => {
              const amenityIcons: { [key: string]: string } = {
                'Restrooms': '🚻',
                'Showers': '🚿',
                'Fire Pits': '🔥',
                'Picnic Tables': '🪑',
                'Water Hookups': '💧',
                'Electrical Hookups': '⚡',
                'Beach Access': '🏖️',
                'Boat Launch': '⛵',
                'Pet Area': '🐕',
                'Playground': '🛝'
              };
              
              return (
                <motion.span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>{amenityIcons[amenity] || '🏕️'}</span>
                  <span>{amenity}</span>
                </motion.span>
              );
            })}
            {campsite.amenities.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                +{campsite.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing with Adventure Equipment */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            {campsite.pricing.tent > 0 && (
              <motion.div 
                className="flex items-center space-x-2 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                whileHover={{ scale: 1.05 }}
              >
                {getEquipmentIcon('tent')}
                <span className="font-bold text-teal-700">${campsite.pricing.tent}</span>
              </motion.div>
            )}
            {campsite.pricing.rv > 0 && (
              <motion.div 
                className="flex items-center space-x-2 text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                whileHover={{ scale: 1.05 }}
              >
                {getEquipmentIcon('rv')}
                <span className="font-bold text-teal-700">${campsite.pricing.rv}</span>
              </motion.div>
            )}
            {campsite.pricing.cabin > 0 && (
              <motion.div 
                className="flex items-center space-x-2 text-sm bg-orange-50 px-3 py-2 rounded-lg border border-orange-200"
                whileHover={{ scale: 1.05 }}
              >
                {getEquipmentIcon('cabin')}
                <span className="font-bold text-teal-700">${campsite.pricing.cabin}</span>
              </motion.div>
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium">per night</span>
        </div>

        {/* Adventure Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            onClick={() => onSelect(campsite)}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🗺️</span>
            <span>Explore</span>
          </motion.button>
          <motion.button
            onClick={() => onBook(campsite)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🏕️</span>
            <span>Book Adventure</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CampsiteCard;