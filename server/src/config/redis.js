import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../core/logger/logger.js';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      logger.warn('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  // Upstash requires TLS — this handles the rediss:// protocol
  tls: env.redisUrl.startsWith('rediss://') ? {} : undefined,
  // Upstash connections are serverless — they close after inactivity
  // This keeps the connection alive
  keepAlive: 30000,
  // Upstash doesn't support WAIT command — disable it
  enableAutoPipelining: false,
  // Don't use lazyConnect with Upstash — connect immediately
  lazyConnect: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('ready', () => logger.info('Redis ready'));
redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
redis.on('reconnecting', () => logger.warn('Redis reconnecting...'));

// With lazyConnect: false, no need to manually call connect
// Redis connects automatically when the instance is created
// Keep this function for compatibility but it's a no-op now
export async function connectRedis() {
  if (redis.status === 'ready') {
    logger.info('Redis already connected');
    return;
  }

  // Wait for ready event with a timeout
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Redis connection timeout after 10s'));
    }, 10000);

    redis.once('ready', () => {
      clearTimeout(timeout);
      resolve();
    });

    redis.once('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}