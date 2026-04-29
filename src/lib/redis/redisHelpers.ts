import { getRedis } from "./redis";

type GetParams = {
  key: string;
};

export async function getCache<T>({ key }: GetParams): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err) {
    console.error(`[Redis] GET error for key "${key}":`, err);
    return null;
  }
}

type SetParams<T> = {
  key: string;
  value: T;
  ttlSeconds?: number;
};

export async function setCache<T>({ key, value, ttlSeconds = 3600 }: SetParams<T>): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error(`[Redis] SET error for key "${key}":`, err);
  }
}

type DeleteParams = { key: string };

export async function deleteCache({ key }: DeleteParams): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (err) {
    console.error(`[Redis] DEL error for key "${key}":`, err);
  }
}