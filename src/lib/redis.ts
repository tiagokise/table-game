// src/lib/redis.ts
import Redis from 'ioredis';

// The Vercel KV addon automatically sets the KV_URL environment variable.
// The ioredis client will automatically use this if it's set.
const redis = new Redis(process.env.KV_URL!);

export default redis;
