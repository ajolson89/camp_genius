import axios from 'axios';
import { config } from '../config/env';
import { WeatherData, WeatherForecast, WeatherAlert, Coordinates } from '../types';
import { AppError } from '../middleware/errorHandler';
import { CacheService } from './cache.service';

export class WeatherService {
  private cacheService: CacheService;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.cacheService = new CacheService();
  }

  async getWeatherForLocation(coordinates: Coordinates): Promise<WeatherData> {
    const cacheKey = `weather:${coordinates.latitude}:${coordinates.longitude}`;
    
    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get current weather
      const currentWeatherPromise = this.getCurrentWeather(coordinates);
      
      // Get forecast
      const forecastPromise = this.getForecast(coordinates);
      
      // Get alerts
      const alertsPromise = this.getAlerts(coordinates);

      const [current, forecast, alerts] = await Promise.all([
        currentWeatherPromise,
        forecastPromise,
        alertsPromise
      ]);

      const weatherData: WeatherData = {
        current,
        forecast,
        alerts
      };

      // Cache for 30 minutes
      await this.cacheService.set(cacheKey, weatherData, 1800);

      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      throw new AppError(503, 'Weather service unavailable');
    }
  }

  private async getCurrentWeather(coordinates: Coordinates) {
    const response = await axios.get(`${this.baseUrl}/weather`, {
      params: {
        lat: coordinates.latitude,
        lon: coordinates.longitude,
        appid: config.external.weatherApiKey,
        units: 'imperial'
      }
    });

    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      windDirection: this.degreeToCompass(data.wind.deg),
      uvIndex: data.uvi || 0
    };
  }

  private async getForecast(coordinates: Coordinates): Promise<WeatherForecast[]> {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: {
        lat: coordinates.latitude,
        lon: coordinates.longitude,
        appid: config.external.weatherApiKey,
        units: 'imperial',
        cnt: 40 // 5 days worth
      }
    });

    // Group by day and get daily summary
    const dailyForecasts = new Map<string, any[]>();
    
    response.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });

    const forecasts: WeatherForecast[] = [];
    
    dailyForecasts.forEach((dayData, date) => {
      const temps = dayData.map(d => d.main.temp);
      const conditions = dayData.map(d => d.weather[0].main);
      const precipProbs = dayData.map(d => (d.pop || 0) * 100);
      
      forecasts.push({
        date,
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        condition: this.getMostFrequent(conditions),
        precipitationChance: Math.max(...precipProbs)
      });
    });

    return forecasts.slice(0, 5); // Return 5 days
  }

  private async getAlerts(coordinates: Coordinates): Promise<WeatherAlert[]> {
    try {
      // OpenWeatherMap One Call API for alerts (requires subscription)
      const response = await axios.get(`${this.baseUrl}/onecall`, {
        params: {
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          appid: config.external.weatherApiKey,
          exclude: 'current,minutely,hourly,daily'
        }
      });

      if (!response.data.alerts) {
        return [];
      }

      return response.data.alerts.map((alert: any) => ({
        type: alert.event,
        severity: this.mapAlertSeverity(alert.tags),
        description: alert.description,
        startTime: new Date(alert.start * 1000),
        endTime: new Date(alert.end * 1000)
      }));
    } catch (error) {
      // Alerts might not be available in all plans
      return [];
    }
  }

  private degreeToCompass(degree: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degree / 22.5) % 16;
    return directions[index];
  }

  private getMostFrequent(arr: string[]): string {
    const frequency: { [key: string]: number } = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  private mapAlertSeverity(tags: string[]): 'minor' | 'moderate' | 'severe' | 'extreme' {
    if (tags.includes('Extreme')) return 'extreme';
    if (tags.includes('Severe')) return 'severe';
    if (tags.includes('Moderate')) return 'moderate';
    return 'minor';
  }

  async getWeatherAlongRoute(waypoints: Coordinates[]): Promise<WeatherData[]> {
    const weatherPromises = waypoints.map(point => 
      this.getWeatherForLocation(point)
    );
    
    return Promise.all(weatherPromises);
  }

  async assessCampingConditions(weather: WeatherData): Promise<{
    suitable: boolean;
    warnings: string[];
    recommendations: string[];
  }> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let suitable = true;

    // Check temperature
    if (weather.current.temperature < 32) {
      warnings.push('Freezing temperatures expected');
      recommendations.push('Bring cold weather gear and rated sleeping bags');
      suitable = weather.current.temperature > 20; // Below 20°F is dangerous
    } else if (weather.current.temperature > 95) {
      warnings.push('Extreme heat warning');
      recommendations.push('Ensure adequate hydration and shade');
      suitable = weather.current.temperature < 105;
    }

    // Check wind
    if (weather.current.windSpeed > 25) {
      warnings.push('High winds expected');
      recommendations.push('Secure all gear and consider wind-resistant tent setup');
      suitable = weather.current.windSpeed < 40;
    }

    // Check precipitation
    const rainyDays = weather.forecast.filter(f => 
      f.precipitationChance > 50
    ).length;
    
    if (rainyDays > 2) {
      warnings.push('Extended rain expected');
      recommendations.push('Bring waterproof gear and tarps');
    }

    // Check for severe weather
    if (weather.alerts && weather.alerts.length > 0) {
      weather.alerts.forEach(alert => {
        if (alert.severity === 'severe' || alert.severity === 'extreme') {
          warnings.push(`Weather alert: ${alert.type}`);
          suitable = false;
        }
      });
    }

    // UV Index
    if (weather.current.uvIndex > 8) {
      warnings.push('Very high UV index');
      recommendations.push('Use sunscreen and protective clothing');
    }

    return { suitable, warnings, recommendations };
  }
}