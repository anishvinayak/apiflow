import { getRedis } from "@/lib/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

export async function checkRateLimit(apiKeyId: string) {
  const redis = await getRedis();

  const key = `rate-limit:${apiKeyId}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(MAX_REQUESTS - count, 0),
    limit: MAX_REQUESTS,
    resetIn: WINDOW_SECONDS,
  };
}