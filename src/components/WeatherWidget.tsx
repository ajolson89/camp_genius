import React from 'react';
import { Cloud, Sun, CloudRain, AlertTriangle } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  weatherData: WeatherData;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherData }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'partly cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-600" />;
      case 'light rain':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
        <span className="text-sm text-gray-600">{weatherData.location}</span>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div className="mb-4">
          {weatherData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">{alert.type}</div>
                <div className="text-sm">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weatherData.current.condition)}
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {weatherData.current.temperature}°F
              </div>
              <div className="text-sm text-gray-600">
                {weatherData.current.condition}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Humidity: {weatherData.current.humidity}%
            </div>
            <div className="text-sm text-gray-600">
              Wind: {weatherData.current.windSpeed} mph
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">7-Day Forecast</h4>
        <div className="space-y-2">
          {weatherData.forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                {getWeatherIcon(day.condition)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-600">{day.condition}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {day.precipitation}%
                </div>
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{day.high}°</span>
                  <span className="text-gray-500 ml-1">{day.low}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather-based Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Camping Tips</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Expect clear skies perfect for stargazing</li>
          <li>• Pack layers for temperature changes</li>
          <li>• Light rain possible Wednesday - consider waterproof gear</li>
        </ul>
      </div>
    </div>
  );
};

export default WeatherWidget;