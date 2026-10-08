import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

const globalForRedis = globalThis as {
  redisClient?: ReturnType<typeof createClient>;
};

export async function getRedis() {
  if (!globalForRedis.redisClient) {
    const url = new URL(redisUrl);

    globalForRedis.redisClient = createClient({
      socket: {
        host: url.hostname,
        port: Number(url.port) || 6379,
        tls: url.protocol === "rediss:",
        servername: url.hostname,
      },
      username: url.username || undefined,
      password: url.password || undefined,
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