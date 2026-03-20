import { redis } from "@/lib/redis/redis";

interface OtpRecord {
  code: string;
  attempts: number;
  expiresAt: string;
  lastSentAt: string;
}

const getOtpKey = (phone: string) => `otp:${phone}`;

export async function getOtpRecord(phone: string): Promise<OtpRecord | null> {
  const record = await redis.get(getOtpKey(phone));
  if (!record) return null;

  try {
    return JSON.parse(record) as OtpRecord;
  } catch {
    await redis.del(getOtpKey(phone));
    return null;
  }
}

export async function saveOtpRecord(phone: string, data: OtpRecord) {
  const ttlInSeconds = Math.max(
    1,
    Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
  );

  await redis.set(getOtpKey(phone), JSON.stringify(data), "EX", ttlInSeconds);
}

export async function clearOtpRecord(phone: string) {
  await redis.del(getOtpKey(phone));
}
