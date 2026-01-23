interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }


  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }


  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }


  async getOrCompute<T>(
    key: string,
    ttlSeconds: number,
    compute: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await compute();
    this.set(key, value, ttlSeconds);
    return value;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const cache = new InMemoryCache();

export const CacheKeys = {
  DASHBOARD_STATS: 'dashboard:stats',
  ATTENDANCE_STATS: 'attendance:stats',
};

export const CacheTTL = {
  DASHBOARD_STATS: 30,
  ATTENDANCE_STATS: 15,
};
