
import { createClient } from "redis";

const globalForRedis = globalThis as typeof globalThis & {
  redisClient?: ReturnType<typeof createClient>;
};

export async function getRedis() {
  if (!globalForRedis.redisClient) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL is not defined");
    }

    const url = new URL(redisUrl);
    const useTls = url.protocol === "rediss:";

    globalForRedis.redisClient = createClient({
      url: redisUrl,
      socket: useTls
        ? {
            tls: true,
            servername: url.hostname,
          }
        : {
            host: url.hostname,
            port: Number(url.port) || 6379,
          },
    });

    globalForRedis.redisClient.on("error", (error) => {
      console.error("Redis Error:", error);
    });
  }

  if (!globalForRedis.redisClient.isOpen) {
    await globalForRedis.redisClient.connect();
  }

  return globalForRedis.redisClient;
}