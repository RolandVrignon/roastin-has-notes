import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const payloadReferenceSchema = z.string().uuid();
const payloadTtlMs = 24 * 60 * 60 * 1_000;

const encryptedEnvelopeSchema = z.object({
  version: z.literal(1),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  key: z.object({ ciphertext: z.string(), iv: z.string(), tag: z.string() }),
  payload: z.object({ ciphertext: z.string(), iv: z.string(), tag: z.string() }),
});

export const generationPayloadSchema = z.object({
  chatName: z.string().min(1).max(80),
  chatType: z.enum(["partner", "friends", "best-friend", "family", "work", "other"]),
  context: z.string().max(500).optional(),
  conversation: z.object({
    messages: z.array(z.object({ author: z.string(), body: z.string(), date: z.string().datetime().nullable() })),
    participants: z.array(z.object({ name: z.string(), messageCount: z.number().int().nonnegative(), share: z.number().nonnegative() })),
    firstDate: z.string().datetime().nullable(),
    lastDate: z.string().datetime().nullable(),
  }),
});

export type GenerationPayload = z.infer<typeof generationPayloadSchema>;

function payloadDirectory() {
  return process.env.TEMPORAL_PAYLOAD_DIR ?? path.join(process.cwd(), ".data", "temporal-payloads");
}

function masterKey() {
  const encoded = process.env.TEMPORAL_PAYLOAD_MASTER_KEY ?? process.env.DATA_ENCRYPTION_KEY;
  if (!encoded) throw new Error("TEMPORAL_PAYLOAD_MASTER_KEY is not configured");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("TEMPORAL_PAYLOAD_MASTER_KEY must decode to 32 bytes");
  return key;
}

function encrypt(value: Buffer, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
}

function decrypt(value: { ciphertext: string; iv: string; tag: string }, key: Buffer) {
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(value.iv, "base64"));
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(value.ciphertext, "base64")), decipher.final()]);
}

function payloadPath(reference: string) {
  return path.join(payloadDirectory(), `${payloadReferenceSchema.parse(reference)}.json`);
}

export async function createEphemeralPayload(payload: GenerationPayload) {
  const parsed = generationPayloadSchema.parse(payload);
  const reference = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + payloadTtlMs);
  const dataKey = randomBytes(32);
  const envelope = {
    version: 1 as const,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    key: encrypt(dataKey, masterKey()),
    payload: encrypt(Buffer.from(JSON.stringify(parsed), "utf8"), dataKey),
  };

  const directory = payloadDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const finalPath = payloadPath(reference);
  const temporaryPath = path.join(directory, `.${reference}.${randomUUID()}.tmp`);
  await writeFile(temporaryPath, JSON.stringify(envelope), { encoding: "utf8", mode: 0o600, flag: "wx" });
  await rename(temporaryPath, finalPath);
  return { reference, expiresAt };
}

export async function readEphemeralPayload(reference: string) {
  const file = await readFile(payloadPath(reference), "utf8");
  const envelope = encryptedEnvelopeSchema.parse(JSON.parse(file));
  if (new Date(envelope.expiresAt).getTime() <= Date.now()) {
    await deleteEphemeralPayload(reference);
    throw new Error("GENERATION_PAYLOAD_EXPIRED");
  }
  const dataKey = decrypt(envelope.key, masterKey());
  try {
    return generationPayloadSchema.parse(JSON.parse(decrypt(envelope.payload, dataKey).toString("utf8")));
  } finally {
    dataKey.fill(0);
  }
}

export async function ephemeralPayloadExists(reference: string) {
  try {
    const file = await readFile(payloadPath(reference), "utf8");
    const envelope = encryptedEnvelopeSchema.parse(JSON.parse(file));
    if (new Date(envelope.expiresAt).getTime() <= Date.now()) {
      await deleteEphemeralPayload(reference);
      return false;
    }
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}

export async function deleteEphemeralPayload(reference: string) {
  await rm(payloadPath(reference), { force: true });
}
