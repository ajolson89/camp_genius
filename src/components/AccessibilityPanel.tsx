import React from 'react';
import { Accessibility, Eye, Ear, Brain, Armchair as Wheelchair } from 'lucide-react';
import { Campsite } from '../types';

interface AccessibilityPanelProps {
  campsites: Campsite[];
  onCampsiteSelect: (campsite: Campsite) => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ campsites, onCampsiteSelect }) => {
  const getAccessibilityIcon = (type: string) => {
    switch (type) {
      case 'mobility': return <Wheelchair className="h-5 w-5" />;
      case 'visual': return <Eye className="h-5 w-5" />;
      case 'hearing': return <Ear className="h-5 w-5" />;
      case 'cognitive': return <Brain className="h-5 w-5" />;
      default: return <Accessibility className="h-5 w-5" />;
    }
  };

  const getAccessibilityColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const accessibilityTypes = [
    { key: 'mobilityAccessible', label: 'Mobility Accessible', icon: 'mobility' },
    { key: 'visuallyAccessible', label: 'Visual Accessibility', icon: 'visual' },
    { key: 'hearingAccessible', label: 'Hearing Accessibility', icon: 'hearing' },
    { key: 'cognitiveAccessible', label: 'Cognitive Accessibility', icon: 'cognitive' }
  ];

  return (
    <div className="space-y-6">
      {/* Accessibility Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Accessibility className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Accessibility Features</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          We're committed to making camping accessible for everyone. Use our accessibility filters to find campsites that meet your specific needs.
        </p>

        {/* Accessibility Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessibilityTypes.map((type) => (
            <div key={type.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {getAccessibilityIcon(type.icon)}
              <span className="text-sm font-medium text-gray-900">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Ratings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Campsite Accessibility Ratings</h4>
        
        <div className="space-y-4">
          {campsites.map((campsite) => (
            <div
              key={campsite.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onCampsiteSelect(campsite)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">{campsite.name}</h5>
                  <p className="text-sm text-gray-600">{campsite.location.city}, {campsite.location.state}</p>
                </div>
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getAccessibilityColor(campsite.accessibility.accessibilityRating)}`}>
                  {campsite.accessibility.accessibilityRating}/5
                </div>
              </div>

              {/* Accessibility Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {accessibilityTypes.map((type) => {
                  const isAccessible = campsite.accessibility[type.key as keyof typeof campsite.accessibility];
                  return (
                    <div
                      key={type.key}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                        isAccessible 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {getAccessibilityIcon(type.icon)}
                      <span className="text-xs">{type.label.split(' ')[0]}</span>
                      {isAccessible && <span className="text-xs">✓</span>}
                    </div>
                  );
                })}
              </div>

              {/* Accessibility Features List */}
              {campsite.accessibility.accessibilityFeatures.length > 0 && (
                <div>
                  <h6 className="text-sm font-medium text-gray-900 mb-2">Available Features:</h6>
                  <div className="flex flex-wrap gap-2">
                    {campsite.accessibility.accessibilityFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Accessibility Resources</h4>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Planning Your Trip</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Contact campsites directly to discuss specific accessibility needs</li>
              <li>• Review accessibility features before booking</li>
              <li>• Consider bringing adaptive equipment if needed</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">Feedback & Suggestions</h5>
            <p className="text-sm text-green-800">
              Help us improve accessibility information by providing feedback on your camping experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;