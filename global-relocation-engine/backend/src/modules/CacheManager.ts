export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL_MS = 60 * 60 * 1000; // 60 minutes

  // Expose these for logging elsewhere or implement a local logger injection
  public set(key: string, data: any): void {
    const timestamp = Date.now();
    this.cache.set(key, { data, timestamp });
  }

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry.timestamp, now)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public isExpired(timestamp: number, now: number): boolean {
    return now - timestamp > this.TTL_MS;
  }

  public clear(key: string): void {
    this.cache.delete(key);
  }
}
