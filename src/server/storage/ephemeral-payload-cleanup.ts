import { readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const payloadTtlMs = 24 * 60 * 60 * 1_000;
const envelopeExpirySchema = z.object({ expiresAt: z.string().datetime() });

function payloadDirectory() {
  return process.env.TEMPORAL_PAYLOAD_DIR ?? path.join(process.cwd(), ".data", "temporal-payloads");
}

export async function purgeExpiredEphemeralPayloads(now = new Date()) {
  const directory = payloadDirectory();
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return 0;
    throw error;
  }
  let deleted = 0;
  for (const entry of entries) {
    if (!/^[0-9a-f-]{36}\.json$/i.test(entry)) continue;
    const filePath = path.join(directory, entry);
    try {
      const [raw, details] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
      const parsed = envelopeExpirySchema.safeParse(JSON.parse(raw));
      const expired = parsed.success
        ? new Date(parsed.data.expiresAt).getTime() <= now.getTime()
        : details.mtimeMs <= now.getTime() - payloadTtlMs;
      if (expired) {
        await rm(filePath, { force: true });
        deleted += 1;
      }
    } catch {
      // A concurrent workflow may have removed the payload between directory read and inspection.
    }
  }
  return deleted;
}
