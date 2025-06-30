import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Heart, Cloud, Sparkles, Clock, DollarSign } from 'lucide-react';
import { mockTrips, mockUserProfile, mockCampsites, mockWeatherData } from '../data/mockData';
import { Campsite } from '../types';

interface DashboardProps {
  onCampsiteSelect: (campsite: Campsite) => void;
  onBookCampsite: (campsite: Campsite) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCampsiteSelect, onBookCampsite }) => {
  const upcomingTrips = mockTrips.filter(trip => trip.status === 'upcoming');
  const pastTrips = mockTrips.filter(trip => trip.status === 'completed');
  const savedCampsites = mockCampsites.filter(campsite => 
    mockUserProfile.savedCampsites.includes(campsite.id)
  );

  const aiSuggestions = [
    {
      title: "Perfect Weekend Getaway",
      campsite: mockCampsites[2],
      reason: "Based on your love for stargazing and desert landscapes"
    },
    {
      title: "Family Adventure",
      campsite: mockCampsites[3],
      reason: "Great for your upcoming family trip with accessible features"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50 pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-32 right-10 text-6xl opacity-10"
        >
          🏔️
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 left-10 text-5xl opacity-10"
        >
          🏕️
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {mockUserProfile.firstName}! 🏕️
                </h1>
                <p className="text-xl opacity-90">
                  Ready for your next outdoor adventure?
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl opacity-80"
              >
                🎒
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Trips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-charcoal flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-orange-500" />
                  Upcoming Adventures
                </h2>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  {upcomingTrips.length} trips
                </span>
              </div>

              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onCampsiteSelect(trip.campsite)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={trip.campsite.images[0]}
                          alt={trip.campsite.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-charcoal">{trip.name}</h3>
                          <p className="text-teal-600 font-medium">{trip.campsite.name}</p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {trip.campsite.location.city}, {trip.campsite.location.state}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {new Date(trip.checkIn).toLocaleDateString()} - {new Date(trip.checkOut).toLocaleDateString()}
                        </div>
                        <div className="text-lg font-bold text-orange-600">${trip.totalCost}</div>
                        <div className="text-xs text-gray-500">{trip.partySize} guests • {trip.equipmentType}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Trip History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <h2 className="text-2xl font-bold text-charcoal mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-3 text-teal-600" />
                Adventure History
              </h2>

              <div className="space-y-4">
                {pastTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    className="border border-gray-200 rounded-2xl p-4 opacity-75 hover:opacity-100 transition-all duration-300"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={trip.campsite.images[0]}
                          alt={trip.campsite.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-charcoal">{trip.name}</h3>
                          <p className="text-sm text-gray-600">{trip.campsite.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {new Date(trip.checkIn).toLocaleDateString()}
                        </div>
                        <div className="text-green-600 font-medium">✓ Completed</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 border border-purple-200"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                Your AI Guide Suggests
              </h2>

              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-2xl p-4 border border-purple-100 cursor-pointer hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onCampsiteSelect(suggestion.campsite)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={suggestion.campsite.images[0]}
                        alt={suggestion.campsite.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-charcoal text-sm">{suggestion.title}</h3>
                        <p className="text-xs text-purple-600">{suggestion.campsite.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{suggestion.reason}</p>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookCampsite(suggestion.campsite);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Book This Adventure
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Saved Campsites */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Saved Adventures
              </h2>

              <div className="space-y-3">
                {savedCampsites.map((campsite) => (
                  <motion.div
                    key={campsite.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onCampsiteSelect(campsite)}
                  >
                    <img
                      src={campsite.images[0]}
                      alt={campsite.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-charcoal text-sm">{campsite.name}</h3>
                      <p className="text-xs text-gray-600">{campsite.location.city}, {campsite.location.state}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500 text-xs">⭐</span>
                        <span className="text-xs text-gray-600 ml-1">{campsite.rating}</span>
                      </div>
                    </div>
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Weather Alert */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-xl p-6 border border-blue-200"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                Weather Updates
              </h2>

              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-charcoal">Pine Valley Trip</span>
                    <span className="text-2xl">☀️</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Perfect weather this weekend!</p>
                  <div className="text-xs text-blue-600">High: 75°F • Low: 52°F</div>
                </div>

                {mockWeatherData.alerts.map((alert, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-yellow-600">⚠️</span>
                      <span className="font-medium text-yellow-800 text-sm">{alert.type}</span>
                    </div>
                    <p className="text-xs text-yellow-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;