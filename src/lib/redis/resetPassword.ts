import crypto from "crypto";
import { redis } from "@/lib/redis/redis";

interface ResetPasswordRecord {
  tokenHash: string;
  expiresAt: string;
  lastSentAt: string;
}

const getResetPasswordKey = (email: string) => `reset-password:${email.toLowerCase()}`;

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getResetPasswordRecord(email: string): Promise<ResetPasswordRecord | null> {
  const record = await redis.get(getResetPasswordKey(email));
  if (!record) return null;

  try {
    return JSON.parse(record) as ResetPasswordRecord;
  } catch {
    await redis.del(getResetPasswordKey(email));
    return null;
  }
}

export async function saveResetPasswordRecord(email: string, data: ResetPasswordRecord) {
  const ttlInSeconds = Math.max(
    1,
    Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
  );

  await redis.set(getResetPasswordKey(email), JSON.stringify(data), "EX", ttlInSeconds);
}

export async function clearResetPasswordRecord(email: string) {
  await redis.del(getResetPasswordKey(email));
}

