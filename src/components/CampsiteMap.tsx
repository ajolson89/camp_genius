import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import { Campsite } from '../types';

interface CampsiteMapProps {
  campsites: Campsite[];
  selectedCampsite?: Campsite | null;
  onCampsiteSelect?: (campsite: Campsite) => void;
  className?: string;
  height?: string;
  showFullscreenToggle?: boolean;
}

const CampsiteMap: React.FC<CampsiteMapProps> = ({
  campsites,
  selectedCampsite,
  onCampsiteSelect,
  className = '',
  height = '400px',
  showFullscreenToggle = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US
  const [zoom, setZoom] = useState(4);

  // Calculate the center point of all campsites
  useEffect(() => {
    if (campsites.length > 0) {
      const validCampsites = campsites.filter(c => 
        c.location.coordinates.lat !== 0 && c.location.coordinates.lng !== 0
      );
      
      if (validCampsites.length > 0) {
        const avgLat = validCampsites.reduce((sum, c) => sum + c.location.coordinates.lat, 0) / validCampsites.length;
        const avgLng = validCampsites.reduce((sum, c) => sum + c.location.coordinates.lng, 0) / validCampsites.length;
        
        setMapCenter({ lat: avgLat, lng: avgLng });
        setZoom(validCampsites.length === 1 ? 10 : 6);
      }
    }
  }, [campsites]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Simple map implementation using Google Maps embed
  const generateMapUrl = () => {
    const center = `${mapCenter.lat},${mapCenter.lng}`;
    let url = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo'}&q=${center}&zoom=${zoom}`;
    
    // Add markers for campsites
    if (campsites.length > 0) {
      const validCampsites = campsites.filter(c => 
        c.location.coordinates.lat !== 0 && c.location.coordinates.lng !== 0
      );
      
      if (validCampsites.length > 0) {
        const markers = validCampsites.map(c => 
          `${c.location.coordinates.lat},${c.location.coordinates.lng}`
        ).join('|');
        url = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo'}&q=${center}&zoom=${zoom}&markers=${markers}`;
      }
    }
    
    return url;
  };

  // Fallback: Custom map with OpenStreetMap tiles (since we don't have Google Maps API key)
  const StaticMap = () => {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234ade80' fill-opacity='0.2'%3E%3Cpath d='m0 40v-40h40v40z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Campsite markers */}
        <div className="absolute inset-0">
          {campsites.map((campsite, index) => {
            if (campsite.location.coordinates.lat === 0 && campsite.location.coordinates.lng === 0) {
              return null;
            }

            // Simple positioning based on relative coordinates
            const x = Math.min(Math.max((campsite.location.coordinates.lng + 125) / 60 * 100, 5), 95);
            const y = Math.min(Math.max((50 - campsite.location.coordinates.lat) / 25 * 100, 5), 95);

            const isSelected = selectedCampsite?.id === campsite.id;

            return (
              <motion.div
                key={campsite.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10`}
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                onClick={() => onCampsiteSelect?.(campsite)}
              >
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg
                  ${isSelected 
                    ? 'bg-orange-500 border-orange-600 text-white' 
                    : 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                  }
                `}>
                  <MapPin className="h-4 w-4" />
                </div>
                
                {/* Campsite info popup */}
                <motion.div
                  className={`
                    absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                    bg-white rounded-lg shadow-xl p-3 min-w-[200px] border border-gray-200
                    ${isSelected ? 'block' : 'hidden hover:block'}
                  `}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 10 }}
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900 mb-1">{campsite.name}</div>
                    <div className="text-gray-600 text-xs">{campsite.location.city}, {campsite.location.state}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-green-600 font-medium">
                        ⭐ {campsite.rating}
                      </div>
                      <div className="text-xs text-gray-500">
                        From ${campsite.pricing.tent}/night
                      </div>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
            title="Zoom in"
          >
            <span className="text-lg font-bold text-gray-700">+</span>
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 1, 1))}
            className="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
            title="Zoom out"
          >
            <span className="text-lg font-bold text-gray-700">−</span>
          </button>
        </div>

        {/* Map info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-700">
            <div className="font-medium">{campsites.length} Campsites Found</div>
            <div className="text-xs text-gray-500 mt-1">Click markers for details</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className={`
        bg-white rounded-2xl shadow-lg overflow-hidden
        ${isFullscreen ? 'fixed inset-4 z-50' : 'relative'}
        ${className}
      `}
      style={{ height: isFullscreen ? 'auto' : height }}
      layout
    >
      {/* Map header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Navigation className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedCampsite ? selectedCampsite.name : 'Campsite Locations'}
          </h3>
        </div>
        
        {showFullscreenToggle && (
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-600" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Map content */}
      <div className="relative flex-1" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : 'calc(100% - 73px)' }}>
        <StaticMap />
      </div>

      {/* Campsite list overlay for fullscreen */}
      {isFullscreen && (
        <div className="absolute left-4 top-20 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-3">Campsites ({campsites.length})</h4>
          <div className="space-y-2">
            {campsites.map((campsite) => (
              <motion.div
                key={campsite.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedCampsite?.id === campsite.id
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
                onClick={() => onCampsiteSelect?.(campsite)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="font-medium text-sm text-gray-900">{campsite.name}</div>
                <div className="text-xs text-gray-600">{campsite.location.city}, {campsite.location.state}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-green-600">⭐ {campsite.rating}</span>
                  <span className="text-xs text-gray-500">${campsite.pricing.tent}/night</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CampsiteMap;