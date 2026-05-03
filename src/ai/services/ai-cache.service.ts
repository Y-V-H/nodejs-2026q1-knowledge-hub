import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AiCacheServiceSet {
  key: string;
  value: unknown;
}

@Injectable()
export class AiCacheService {
  private readonly cache = new Map<
    string,
    { value: unknown; expiresAt: number }
  >();
  constructor(private readonly configService: ConfigService) {}
  get(key: string): unknown | undefined {
    const data = this.cache.get(key);
    if (!data) return undefined;
    if (data.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return data.value;
  }

  set({ key, value }: AiCacheServiceSet): void {
    const ttlSec = Number(this.configService.get('AI_CACHE_TTL_SEC')) || 300;
    const expiresAt = Date.now() + ttlSec * 1000;
    this.cache.set(key, { value, expiresAt });
  }
}
