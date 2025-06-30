import React from 'react';
import { MapPin, Tent, Truck, Home } from 'lucide-react';
import { Campsite } from '../types';

interface MapViewProps {
  campsites: Campsite[];
  selectedCampsite: Campsite | null;
  onCampsiteSelect: (campsite: Campsite) => void;
}

const MapView: React.FC<MapViewProps> = ({ campsites, selectedCampsite, onCampsiteSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Map View</h3>
        <p className="text-sm text-gray-600">Interactive map showing campsite locations</p>
      </div>
      
      {/* Simulated Map */}
      <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
        {/* Background pattern to simulate terrain */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 400 400">
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
            d="M 0 200 Q 100 180 200 200 T 400 190"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 50 0 Q 80 100 100 200 Q 120 300 150 400"
            stroke="#6b7280"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* Campsite markers */}
        {campsites.map((campsite, index) => {
          const x = 50 + (index * 120) + (Math.sin(index) * 40);
          const y = 100 + (index * 80) + (Math.cos(index) * 60);
          const isSelected = selectedCampsite?.id === campsite.id;
          
          return (
            <div
              key={campsite.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onCampsiteSelect(campsite)}
            >
              {/* Marker */}
              <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isSelected 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-green-600 hover:bg-green-50'
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                
                {/* Popup on hover/select */}
                {isSelected && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48 z-30">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {campsite.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {campsite.location.city}, {campsite.location.state}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
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
                    {/* Arrow pointing to marker */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-900 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Available Campsites</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>Rivers</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-0.5 bg-gray-500"></div>
              <span>Trails</span>
            </div>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-1">
          <div className="flex flex-col space-y-1">
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              +
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;