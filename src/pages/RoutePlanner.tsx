import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Plus, X, MapPin, Calendar, DollarSign, Download, Share, Fuel, Navigation } from 'lucide-react';
import { mockCampsites } from '../data/mockData';
import { Campsite, RouteStop } from '../types';

interface RoutePlannerProps {
  onCampsiteSelect: (campsite: Campsite) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onCampsiteSelect }) => {
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [showAddStop, setShowAddStop] = useState(false);
  const [tripDetails, setTripDetails] = useState({
    name: '',
    startDate: '',
    endDate: '',
    rvSpecs: {
      length: '',
      height: '',
      weight: ''
    }
  });

  const addStop = (campsite: Campsite) => {
    const newStop: RouteStop = {
      id: Date.now().toString(),
      campsite,
      arrivalDate: '',
      departureDate: '',
      nights: 1
    };
    setRouteStops([...routeStops, newStop]);
    setShowAddStop(false);
  };

  const removeStop = (stopId: string) => {
    setRouteStops(routeStops.filter(stop => stop.id !== stopId));
  };

  const updateStop = (stopId: string, field: keyof RouteStop, value: any) => {
    setRouteStops(routeStops.map(stop => 
      stop.id === stopId ? { ...stop, [field]: value } : stop
    ));
  };

  const calculateTotalCost = () => {
    return routeStops.reduce((total, stop) => {
      return total + (stop.campsite.pricing.tent * stop.nights);
    }, 0);
  };

  const calculateTotalNights = () => {
    return routeStops.reduce((total, stop) => total + stop.nights, 0);
  };

  const calculateTotalDistance = () => {
    // Mock calculation - in real app would use mapping service
    return routeStops.length * 150; // Assume 150 miles between stops
  };

  const aiSuggestions = [
    {
      type: 'Fuel Stop',
      name: 'Pilot Travel Center',
      location: 'Mile 45 on I-70',
      reason: 'RV-friendly with diesel and dump station'
    },
    {
      type: 'Harvest Host',
      name: 'Mountain View Winery',
      location: 'Near Pine Valley',
      reason: 'Free overnight parking for RV guests'
    },
    {
      type: 'Scenic Route',
      name: 'Highway 12 Scenic Byway',
      location: 'Alternative to I-15',
      reason: 'More scenic but adds 30 minutes'
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
          🗺️
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 left-10 text-5xl opacity-10"
        >
          🚐
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center">
                  <Route className="h-10 w-10 mr-4" />
                  Route Planner
                </h1>
                <p className="text-xl opacity-90">
                  Plan your multi-destination camping adventure with AI-powered route optimization
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl opacity-80"
              >
                🧭
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Details & Controls */}
          <div className="space-y-6">
            {/* Trip Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Trip Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                  <input
                    type="text"
                    value={tripDetails.name}
                    onChange={(e) => setTripDetails({ ...tripDetails, name: e.target.value })}
                    placeholder="Epic Mountain Adventure"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={tripDetails.startDate}
                      onChange={(e) => setTripDetails({ ...tripDetails, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={tripDetails.endDate}
                      onChange={(e) => setTripDetails({ ...tripDetails, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RV Specifications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <span className="text-2xl mr-2">🚐</span>
                RV Specifications
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length (feet)</label>
                  <input
                    type="number"
                    value={tripDetails.rvSpecs.length}
                    onChange={(e) => setTripDetails({
                      ...tripDetails,
                      rvSpecs: { ...tripDetails.rvSpecs, length: e.target.value }
                    })}
                    placeholder="32"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (feet)</label>
                  <input
                    type="number"
                    value={tripDetails.rvSpecs.height}
                    onChange={(e) => setTripDetails({
                      ...tripDetails,
                      rvSpecs: { ...tripDetails.rvSpecs, height: e.target.value }
                    })}
                    placeholder="11.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={tripDetails.rvSpecs.weight}
                    onChange={(e) => setTripDetails({
                      ...tripDetails,
                      rvSpecs: { ...tripDetails.rvSpecs, weight: e.target.value }
                    })}
                    placeholder="15000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Trip Summary */}
            {routeStops.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl shadow-xl p-6 border border-green-200"
              >
                <h2 className="text-xl font-bold text-charcoal mb-4">Trip Summary</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-teal-600">{routeStops.length}</div>
                    <div className="text-sm text-teal-700">Destinations</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{calculateTotalNights()}</div>
                    <div className="text-sm text-green-700">Total Nights</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{calculateTotalDistance()}</div>
                    <div className="text-sm text-blue-700">Miles</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">${calculateTotalCost()}</div>
                    <div className="text-sm text-orange-700">Est. Cost</div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <motion.button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Column - Route Stops */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">Your Route</h2>
              <motion.button
                onClick={() => setShowAddStop(true)}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Stop</span>
              </motion.button>
            </div>

            {routeStops.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-3xl shadow-xl border border-orange-100"
              >
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-charcoal mb-2">Start Planning Your Route</h3>
                <p className="text-gray-600 mb-6">Add campsites to create your perfect road trip adventure</p>
                <motion.button
                  onClick={() => setShowAddStop(true)}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Your First Stop
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {routeStops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-charcoal">{stop.campsite.name}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {stop.campsite.location.city}, {stop.campsite.location.state}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => removeStop(stop.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                        <input
                          type="date"
                          value={stop.arrivalDate}
                          onChange={(e) => updateStop(stop.id, 'arrivalDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                        <input
                          type="date"
                          value={stop.departureDate}
                          onChange={(e) => updateStop(stop.id, 'departureDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nights</label>
                        <input
                          type="number"
                          min="1"
                          value={stop.nights}
                          onChange={(e) => updateStop(stop.id, 'nights', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${stop.campsite.pricing.tent}/night</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Total: ${stop.campsite.pricing.tent * stop.nights}</span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => onCampsiteSelect(stop.campsite)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - AI Suggestions & Map */}
          <div className="space-y-6">
            {/* AI Route Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 border border-purple-200"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                AI Route Suggestions
              </h2>

              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-purple-100"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        {suggestion.type === 'Fuel Stop' && <Fuel className="h-4 w-4 text-purple-600" />}
                        {suggestion.type === 'Harvest Host' && <span className="text-purple-600">🍇</span>}
                        {suggestion.type === 'Scenic Route' && <Navigation className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            {suggestion.type}
                          </span>
                        </div>
                        <h3 className="font-medium text-charcoal text-sm">{suggestion.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{suggestion.location}</p>
                        <p className="text-xs text-purple-700">{suggestion.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Route Map Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <h2 className="text-xl font-bold text-charcoal mb-4">Route Preview</h2>
              
              <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl relative overflow-hidden">
                {/* Simulated route line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 20 200 Q 100 150 180 180 Q 260 210 340 160"
                    stroke="#f97316"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                </svg>

                {/* Route markers */}
                {routeStops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="absolute w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                    style={{
                      left: `${20 + index * 80}px`,
                      top: `${180 + Math.sin(index) * 30}px`
                    }}
                  >
                    {index + 1}
                  </div>
                ))}

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
                  <div className="font-medium text-charcoal">Route Overview</div>
                  <div className="text-gray-600">
                    {calculateTotalDistance()} miles • {calculateTotalNights()} nights
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Add Stop Modal */}
        <AnimatePresence>
          {showAddStop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-charcoal">Add Campsite to Route</h3>
                  <motion.button
                    onClick={() => setShowAddStop(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  {mockCampsites.map((campsite) => (
                    <motion.div
                      key={campsite.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => addStop(campsite)}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={campsite.images[0]}
                          alt={campsite.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-charcoal">{campsite.name}</h4>
                          <p className="text-sm text-gray-600">{campsite.location.city}, {campsite.location.state}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-yellow-500 text-sm">⭐</span>
                            <span className="text-sm">{campsite.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          From ${Math.min(campsite.pricing.tent, campsite.pricing.rv, campsite.pricing.cabin)}/night
                        </div>
                        <motion.button
                          className="mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add to Route
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoutePlanner;