// Cache manager for optimizing data fetching and storage
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set cache with TTL (time to live) in milliseconds
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get cache if not expired
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    });
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Cache keys for common data
export const CACHE_KEYS = {
  BREEDS: 'dog_breeds',
  USER_PROFILE: (id: string) => `user_profile_${id}`,
  LISTINGS: (filters: string) => `listings_${filters}`,
  CONVERSATIONS: (userId: string) => `conversations_${userId}`,
  NOTIFICATIONS: (userId: string) => `notifications_${userId}`,
  MARKETPLACE: (page: number) => `marketplace_page_${page}`,
  EXPLORE_FEED: (filters: string) => `explore_${filters}`
};

// Auto cleanup every 10 minutes
setInterval(() => {
  CacheManager.getInstance().cleanup();
}, 10 * 60 * 1000);