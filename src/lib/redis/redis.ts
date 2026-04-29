import Redis from "ioredis";

declare global {
  var _redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("❌ REDIS_URL is not defined");
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
    tls: url.startsWith("rediss://") ? {} : undefined,

    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      console.warn(`🔁 Redis reconnect attempt ${times}, delay ${delay}ms`);
      return delay;
    },

    reconnectOnError(err) {
      if (err.message.includes("READONLY")) return 2;

      if (
        err.message.includes("ECONNRESET") ||
        err.message.includes("ETIMEDOUT")
      ) {
        return true;
      }

      return false;
    },
  });

  client.on("connect", () => {
    console.log("✅ Redis connected");
  });

  // client.on("ready", () => {
  //   console.log("🚀 Redis ready");
  // });

  client.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  return client;
}

// ✅ LAZY getter (THIS IS THE FIX)
export function getRedis(): Redis {
  if (global._redis) return global._redis;

  const url = process.env.REDIS_URL;

  // 👇 IMPORTANT: don't crash build
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("❌ REDIS_URL is not defined");
    }

    console.warn("⚠️ REDIS_URL missing (build/dev), skipping Redis");
    return null as any;
  }

  const client = createRedisClient();

  if (process.env.NODE_ENV !== "production") {
    global._redis = client;
  }

  return client;
}

// optional helper
export async function connectRedis() {
  const redis = getRedis();

  if (!redis) return;

  const shouldConnect = ["wait", "end", "close"];

  if (shouldConnect.includes(redis.status)) {
    await redis.connect();
  }
}

// ✅ graceful shutdown (safe)
if (process.env.NODE_ENV === "production") {
  process.on("SIGINT", async () => {
    if (global._redis) await global._redis.quit();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    if (global._redis) await global._redis.quit();
    process.exit(0);
  });
}