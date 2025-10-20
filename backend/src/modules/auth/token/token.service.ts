import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class TokenService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({ host: "localhost", port: 6379 }); // adjust if needed
  }

  async blacklistToken(jti: string, ttlSeconds: number) {
    await this.redis.set(`blacklist:${jti}`, "true", "EX", ttlSeconds);
  }

  async isBlacklisted(jti: string) {
    const exists = await this.redis.get(`blacklist:${jti}`);
    return !!exists;
  }
}
