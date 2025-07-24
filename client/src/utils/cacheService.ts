// Enhanced caching service with multiple storage strategies
class CacheService {
  private static instance: CacheService;
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly STORAGE_KEY = 'mypup_cache';

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Memory cache operations
  setMemory(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getMemory(key: string): any | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data;
  }

  // LocalStorage cache operations
  setLocal(key: string, data: any, ttl: number = 3600000): void { // 1 hour default
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`${this.STORAGE_KEY}_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error);
    }
  }

  getLocal(key: string): any | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${key}`);
      if (!stored) return null;

      const item = JSON.parse(stored);
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error);
      return null;
    }
  }

  // Smart cache - tries memory first, then localStorage
  async get(key: string): Promise<any | null> {
    // Try memory cache first
    const memoryResult = this.getMemory(key);
    if (memoryResult !== null) return memoryResult;

    // Try localStorage
    const localResult = this.getLocal(key);
    if (localResult !== null) {
      // Populate memory cache for faster access
      this.setMemory(key, localResult);
      return localResult;
    }

    return null;
  }

  async set(key: string, data: any, options: {
    memoryTTL?: number;
    localTTL?: number;
    useLocal?: boolean;
  } = {}): Promise<void> {
    const { memoryTTL = 300000, localTTL = 3600000, useLocal = true } = options;

    // Always set in memory cache
    this.setMemory(key, data, memoryTTL);

    // Optionally set in localStorage
    if (useLocal) {
      this.setLocal(key, data, localTTL);
    }
  }

  // Cache invalidation
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
    } catch (error) {
      console.warn('Failed to remove localStorage item:', error);
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage cache
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEY)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const item = JSON.parse(stored);
              if (now - item.timestamp > item.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  }

  // Get cache statistics
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    memoryKeys: string[];
  } {
    const localKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.STORAGE_KEY)
    );

    return {
      memorySize: this.memoryCache.size,
      localStorageSize: localKeys.length,
      memoryKeys: Array.from(this.memoryCache.keys())
    };
  }
}

// Cache keys for different data types
export const CACHE_KEYS = {
  BREEDS: 'dog_breeds',
  LEGAL_CONTENT: 'legal_content',
  EDUCATION_ARTICLES: 'education_articles',
  USER_PROFILE: (id: string) => `user_profile_${id}`,
  LISTINGS: (filters: string) => `listings_${btoa(filters)}`,
  MARKETPLACE_PAGE: (page: number, filters: string) => `marketplace_${page}_${btoa(filters)}`,
  EXPLORE_FEED: (filters: string) => `explore_${btoa(filters)}`,
  CONVERSATIONS: (userId: string) => `conversations_${userId}`,
  HELP_CENTER: 'help_center_articles',
  SERVICES: 'services_content'
};

export const cacheService = CacheService.getInstance();

// Auto cleanup every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 600000);