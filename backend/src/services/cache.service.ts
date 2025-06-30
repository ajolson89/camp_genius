import { config } from '../config/env';

interface CacheClient {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  flushall(): Promise<void>;
}

class UpstashRedisClient implements CacheClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  async get(key: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${key}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Redis GET failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.result === null) {
        return null;
      }

      // Try to parse JSON, fall back to raw value
      try {
        return JSON.parse(data.result);
      } catch {
        return data.result;
      }
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      let url = `${this.baseUrl}/set/${key}`;
      if (ttl) {
        url += `/EX/${ttl}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serializedValue)
      });

      if (!response.ok) {
        throw new Error(`Redis SET failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/del/${key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Redis DEL failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/exists/${key}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/keys/${pattern}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }

  async flushall(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/flushall`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Redis FLUSHALL failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
    }
  }
}

class MemoryClient implements CacheClient {
  private cache = new Map<string, { value: any; expiry?: number }>();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + (ttl * 1000) : undefined;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async flushall(): Promise<void> {
    this.cache.clear();
  }
}

export class CacheService {
  private client: CacheClient;
  private keyPrefix: string;

  constructor() {
    this.keyPrefix = config.isDevelopment ? 'dev:' : 'prod:';
    
    // Use Upstash Redis if available, otherwise fall back to memory cache
    if (config.redis.url && config.redis.token) {
      this.client = new UpstashRedisClient(config.redis.url, config.redis.token);
    } else {
      console.warn('Redis not configured, using memory cache');
      this.client = new MemoryClient();
    }
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.client.get(this.getKey(key));
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await this.client.set(this.getKey(key), value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.getKey(key));
  }

  async exists(key: string): Promise<boolean> {
    return this.client.exists(this.getKey(key));
  }

  async keys(pattern: string): Promise<string[]> {
    const keys = await this.client.keys(this.getKey(pattern));
    return keys.map(key => key.replace(this.keyPrefix, ''));
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    await Promise.all(keys.map(key => this.del(key)));
  }

  async increment(key: string, by: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + by;
    await this.set(key, newValue);
    return newValue;
  }

  async decrement(key: string, by: number = 1): Promise<number> {
    return this.increment(key, -by);
  }

  async setIfNotExists(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const exists = await this.exists(key);
    
    if (exists) {
      return false;
    }

    await this.set(key, value, ttlSeconds);
    return true;
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  async mset(keyValuePairs: { key: string; value: any; ttl?: number }[]): Promise<void> {
    await Promise.all(
      keyValuePairs.map(({ key, value, ttl }) => this.set(key, value, ttl))
    );
  }

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }

  // Specialized cache methods for common use cases
  
  async cacheApiResponse(
    endpoint: string,
    params: any,
    fetcher: () => Promise<any>,
    ttlSeconds: number = 3600
  ): Promise<any> {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.getOrSet(key, fetcher, ttlSeconds);
  }

  async cacheUserData(userId: string, data: any, ttlSeconds: number = 1800): Promise<void> {
    await this.set(`user:${userId}`, data, ttlSeconds);
  }

  async getUserData<T>(userId: string): Promise<T | null> {
    return this.get<T>(`user:${userId}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}*`);
  }

  async cacheSearchResults(
    query: string,
    filters: any,
    results: any,
    ttlSeconds: number = 600
  ): Promise<void> {
    const key = `search:${JSON.stringify({ query, filters })}`;
    await this.set(key, results, ttlSeconds);
  }

  async getSearchResults<T>(query: string, filters: any): Promise<T | null> {
    const key = `search:${JSON.stringify({ query, filters })}`;
    return this.get<T>(key);
  }

  async cacheWeatherData(
    coordinates: { lat: number; lng: number },
    data: any,
    ttlSeconds: number = 1800
  ): Promise<void> {
    const key = `weather:${coordinates.lat}:${coordinates.lng}`;
    await this.set(key, data, ttlSeconds);
  }

  async getWeatherData<T>(coordinates: { lat: number; lng: number }): Promise<T | null> {
    const key = `weather:${coordinates.lat}:${coordinates.lng}`;
    return this.get<T>(key);
  }

  // Rate limiting support
  
  async checkRateLimit(
    identifier: string,
    windowSeconds: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    // Get current count (simplified version)
    const current = await this.get<number>(key) || 0;
    
    if (current >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + (windowSeconds * 1000)
      };
    }

    await this.increment(key);
    
    return {
      allowed: true,
      remaining: maxRequests - current - 1,
      resetTime: now + (windowSeconds * 1000)
    };
  }

  // Health check
  
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    try {
      const start = Date.now();
      await this.set('health_check', 'test', 10);
      await this.get('health_check');
      await this.del('health_check');
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      console.error('Cache health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}