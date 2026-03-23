import crypto from "crypto";
import { redis } from "@/lib/redis/redis";

const TOKEN_TTL_MINUTES = Number(process.env.TEMP_TOKEN_TTL_MINUTES ?? 10);
const getSetupTokenKey = (tokenHash: string) => `setup:access-token:${tokenHash}`;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function generateTempAccessToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
  const ttlInSeconds = Math.max(
    1,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000)
  );

  await redis.set(getSetupTokenKey(tokenHash), userId, "EX", ttlInSeconds);

  return {
    token: rawToken,
    expiresAt,
    ttlMinutes: TOKEN_TTL_MINUTES,
  };
}

export async function findUserIdByTempAccessToken(rawToken: string) {
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const userId = await redis.get(getSetupTokenKey(tokenHash));
  if (!userId) return null;
  return userId;
}
