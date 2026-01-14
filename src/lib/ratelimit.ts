import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash credentials are configured
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only create rate limiters if Upstash is configured
let subscribeRatelimit: Ratelimit | null = null;
let waitlistRatelimit: Ratelimit | null = null;
let messageRatelimit: Ratelimit | null = null;

if (upstashUrl && upstashToken) {
  const redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });

  // Create rate limiter instances
  subscribeRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 requests per hour
    analytics: true,
  });

  waitlistRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
    analytics: true,
  });

  messageRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 messages per minute
    analytics: true,
  });
}

export { subscribeRatelimit, waitlistRatelimit, messageRatelimit };


