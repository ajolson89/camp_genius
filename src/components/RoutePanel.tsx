import React, { useState } from 'react';
import { Route, Plus, X, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Campsite, RouteStop } from '../types';

interface RoutePanelProps {
  campsites: Campsite[];
  onCampsiteSelect: (campsite: Campsite) => void;
}

const RoutePanel: React.FC<RoutePanelProps> = ({ campsites, onCampsiteSelect }) => {
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [showAddStop, setShowAddStop] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Route Planner Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Route className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Route Planner</h3>
          </div>
          <button
            onClick={() => setShowAddStop(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stop</span>
          </button>
        </div>
        
        <p className="text-gray-600">
          Plan your multi-destination camping trip with optimized routes and budget tracking.
        </p>
      </div>

      {/* Trip Summary */}
      {routeStops.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Trip Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{routeStops.length}</div>
              <div className="text-sm text-blue-800">Destinations</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{calculateTotalNights()}</div>
              <div className="text-sm text-green-800">Total Nights</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">${calculateTotalCost()}</div>
              <div className="text-sm text-yellow-800">Estimated Cost</div>
            </div>
          </div>
        </div>
      )}

      {/* Route Stops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Your Route</h4>
        
        {routeStops.length === 0 ? (
          <div className="text-center py-8">
            <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No stops added yet. Start planning your route!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routeStops.map((stop, index) => (
              <div key={stop.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{stop.campsite.name}</h5>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {stop.campsite.location.city}, {stop.campsite.location.state}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      value={stop.arrivalDate}
                      onChange={(e) => updateStop(stop.id, 'arrivalDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={stop.departureDate}
                      onChange={(e) => updateStop(stop.id, 'departureDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nights
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stop.nights}
                      onChange={(e) => updateStop(stop.id, 'nights', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
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
                  <button
                    onClick={() => onCampsiteSelect(stop.campsite)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddStop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-semibold text-gray-900">Add Campsite to Route</h5>
              <button
                onClick={() => setShowAddStop(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {campsites.map((campsite) => (
                <div
                  key={campsite.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addStop(campsite)}
                >
                  <div>
                    <h6 className="font-medium text-gray-900">{campsite.name}</h6>
                    <p className="text-sm text-gray-600">{campsite.location.city}, {campsite.location.state}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    From ${campsite.pricing.tent}/night
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePanel;