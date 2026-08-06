import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

function encryptionKey() {
  const encoded = process.env.DATA_ENCRYPTION_KEY;
  if (!encoded) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("DATA_ENCRYPTION_KEY must decode to 32 bytes");
  return key;
}

export function encryptSensitive(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
}

export function decryptSensitive(input: { ciphertext: string; iv: string; tag: string }) {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function blindIndex(value: string) {
  const secret = process.env.PHONE_HASH_SECRET;
  if (!secret) throw new Error("PHONE_HASH_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}
