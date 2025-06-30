import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Calendar, Users, Tent, Truck, Home, Heart, Share, Accessibility, Cloud, Thermometer, Wind, Droplets } from 'lucide-react';
import { Campsite } from '../types';

interface CampsiteDetailProps {
  campsite: Campsite;
  onBack: () => void;
  onBook: (campsite: Campsite) => void;
}

const CampsiteDetail: React.FC<CampsiteDetailProps> = ({ campsite, onBack, onBook }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('2025-01-15');
  const [isSaved, setIsSaved] = useState(false);

  const mockWeather = {
    current: { temp: 72, condition: 'Sunny', icon: '☀️' },
    forecast: [
      { day: 'Today', high: 75, low: 52, condition: 'Sunny', icon: '☀️' },
      { day: 'Tomorrow', high: 73, low: 48, condition: 'Partly Cloudy', icon: '⛅' },
      { day: 'Friday', high: 68, low: 45, condition: 'Cloudy', icon: '☁️' }
    ]
  };

  const reviews = [
    {
      id: 1,
      author: 'Sarah M.',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Absolutely stunning location! The accessibility features made it perfect for our family. Highly recommend!',
      helpful: 12
    },
    {
      id: 2,
      author: 'Mike R.',
      rating: 4,
      date: '1 month ago',
      comment: 'Great campsite with amazing mountain views. The hiking trails are fantastic. Will definitely return!',
      helpful: 8
    }
  ];

  const similarCampsites = [
    { id: '2', name: 'Lakeside Retreat', image: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.6, price: 35 },
    { id: '3', name: 'Desert Oasis', image: 'https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.9, price: 20 }
  ];

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tent': return <Tent className="h-5 w-5" />;
      case 'rv': return <Truck className="h-5 w-5" />;
      case 'cabin': return <Home className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={onBack}
              className="flex items-center space-x-2 text-teal-600 hover:text-orange-600 font-medium"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Search</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="relative">
            <motion.div
              className="relative h-96 rounded-3xl overflow-hidden shadow-xl"
              layoutId={`campsite-image-${campsite.id}`}
            >
              <img
                src={campsite.images[currentImageIndex]}
                alt={campsite.name}
                className="w-full h-full object-cover"
              />
              
              {/* AI Badge */}
              {campsite.aiRecommendation && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-1 shadow-lg">
                  <span>🤖</span>
                  <span>AI PICK</span>
                </div>
              )}

              {/* Image Navigation */}
              {campsite.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {campsite.images.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Campsite Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-charcoal mb-2">{campsite.name}</h1>
                <div className="flex items-center text-teal-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">{campsite.location.address}, {campsite.location.city}, {campsite.location.state}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold">{campsite.rating}</span>
                  <span className="text-gray-500">({campsite.reviews} reviews)</span>
                </div>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${
                  campsite.accessibility.accessibilityRating >= 4 
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                }`}>
                  <Accessibility className="h-4 w-4" />
                  <span>Accessibility: {campsite.accessibility.accessibilityRating}/5</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">{campsite.description}</p>

            {/* AI Recommendation */}
            {campsite.aiRecommendation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🤖</span>
                  <span className="font-bold text-purple-700">AI Ranger Recommendation</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                    {campsite.aiRecommendation.score}/100
                  </span>
                </div>
                <p className="text-charcoal font-medium mb-2">"{campsite.aiRecommendation.reason}"</p>
                <div className="flex flex-wrap gap-2">
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

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {campsite.pricing.tent > 0 && (
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex justify-center mb-2">
                    <Tent className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">${campsite.pricing.tent}</div>
                  <div className="text-sm text-green-600">per night</div>
                </div>
              )}
              {campsite.pricing.rv > 0 && (
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex justify-center mb-2">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">${campsite.pricing.rv}</div>
                  <div className="text-sm text-blue-600">per night</div>
                </div>
              )}
              {campsite.pricing.cabin > 0 && (
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex justify-center mb-2">
                    <Home className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700">${campsite.pricing.cabin}</div>
                  <div className="text-sm text-orange-600">per night</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Amenities & Activities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
                <h3 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏕️</span>
                  Camp Amenities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {campsite.amenities.map((amenity, index) => {
                    const amenityIcons: { [key: string]: string } = {
                      'Restrooms': '🚻',
                      'Showers': '🚿',
                      'Fire Pits': '🔥',
                      'Picnic Tables': '🪑',
                      'Water Hookups': '💧',
                      'Electrical Hookups': '⚡',
                      'Beach Access': '🏖️',
                      'Pet Area': '🐕',
                      'Playground': '🛝'
                    };
                    
                    return (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-teal-50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-lg">{amenityIcons[amenity] || '🏕️'}</span>
                        <span className="text-sm font-medium text-teal-700">{amenity}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
                <h3 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Adventure Activities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {campsite.activities.map((activity, index) => {
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
                    
                    return (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-lg">{activityIcons[activity] || '🏕️'}</span>
                        <span className="text-sm font-medium text-orange-700">{activity}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
              <h3 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Accessibility className="h-6 w-6 mr-2 text-green-600" />
                Accessibility Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available Features:</h4>
                  <div className="space-y-2">
                    {campsite.accessibility.accessibilityFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accessibility Types:</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'mobilityAccessible', label: 'Mobility Accessible', icon: '♿' },
                      { key: 'visuallyAccessible', label: 'Visual Accessibility', icon: '👁️' },
                      { key: 'hearingAccessible', label: 'Hearing Accessibility', icon: '👂' },
                      { key: 'cognitiveAccessible', label: 'Cognitive Accessibility', icon: '🧠' }
                    ].map((type) => (
                      <div key={type.key} className="flex items-center space-x-2">
                        <span className={campsite.accessibility[type.key as keyof typeof campsite.accessibility] ? 'text-green-600' : 'text-gray-400'}>
                          {campsite.accessibility[type.key as keyof typeof campsite.accessibility] ? '✓' : '✗'}
                        </span>
                        <span className="text-lg mr-1">{type.icon}</span>
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
              <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
                <Star className="h-6 w-6 mr-2 text-yellow-500" />
                Camper Reviews
              </h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-charcoal">{review.author}</span>
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>👍 {review.helpful} found this helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Campsites */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
              <h3 className="text-xl font-bold text-charcoal mb-6">Similar Adventures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarCampsites.map((similar) => (
                  <motion.div
                    key={similar.id}
                    className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={similar.image}
                        alt={similar.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal">{similar.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{similar.rating}</span>
                          <span className="text-sm text-gray-500">• From ${similar.price}/night</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Cloud className="h-6 w-6 mr-2 text-blue-600" />
                Weather Forecast
              </h3>
              
              <div className="mb-4 p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{mockWeather.current.icon}</span>
                    <div>
                      <div className="text-2xl font-bold text-charcoal">{mockWeather.current.temp}°F</div>
                      <div className="text-sm text-gray-600">{mockWeather.current.condition}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {mockWeather.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{day.icon}</span>
                      <span className="text-sm font-medium">{day.day}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{day.high}°</span>
                      <span className="text-gray-500 ml-1">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Calendar */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100 sticky top-24">
              <h3 className="text-xl font-bold text-charcoal mb-4">Book Your Adventure</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Availability for {selectedDate}:</div>
                <div className="space-y-2">
                  {campsite.availability[selectedDate] && Object.entries(campsite.availability[selectedDate]).map(([type, count]) => (
                    count > 0 && (
                      <div key={type} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getEquipmentIcon(type)}
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">{count} available</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => onBook(campsite)}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">🏕️</span>
                <span>Book This Adventure</span>
              </motion.button>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 text-green-700">
                  <span>✓</span>
                  <span className="text-sm font-medium">Weather Guarantee: Free rebooking if severe weather</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampsiteDetail;