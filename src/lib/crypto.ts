import crypto from "crypto";

const algorithm = "aes-256-gcm";
const secretKey = process.env.CRYPTO_SECRET_KEY!; // 32 chars

const ivLength = 16; // 16 bytes for GCM

// Encrypt function
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "base64"), iv);

  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Return iv + authTag + encrypted text
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// Decrypt function
export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "base64"), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}
