import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEphemeralPayload, deleteEphemeralPayload, ephemeralPayloadExists, readEphemeralPayload, type GenerationPayload } from "./ephemeral-payload";

describe("encrypted ephemeral generation payloads", () => {
  let directory: string;
  const previousDirectory = process.env.TEMPORAL_PAYLOAD_DIR;
  const previousKey = process.env.TEMPORAL_PAYLOAD_MASTER_KEY;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "roastin-payload-"));
    process.env.TEMPORAL_PAYLOAD_DIR = directory;
    process.env.TEMPORAL_PAYLOAD_MASTER_KEY = randomBytes(32).toString("base64");
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
    if (previousDirectory === undefined) delete process.env.TEMPORAL_PAYLOAD_DIR;
    else process.env.TEMPORAL_PAYLOAD_DIR = previousDirectory;
    if (previousKey === undefined) delete process.env.TEMPORAL_PAYLOAD_MASTER_KEY;
    else process.env.TEMPORAL_PAYLOAD_MASTER_KEY = previousKey;
  });

  it("never writes conversation text or the data key in plaintext", async () => {
    const payload: GenerationPayload = {
      chatName: "Secret planning club",
      chatType: "friends",
      context: "secret phrase from context",
      conversation: {
        messages: [{ author: "Maya", body: "secret phrase from the conversation", date: null }],
        participants: [{ name: "Maya", messageCount: 1, share: 100 }],
        firstDate: null,
        lastDate: null,
      },
    };

    const stored = await createEphemeralPayload(payload);
    const file = await readFile(path.join(directory, `${stored.reference}.json`), "utf8");
    expect(file).not.toContain("Secret planning club");
    expect(file).not.toContain("secret phrase");
    expect(file).not.toContain(process.env.TEMPORAL_PAYLOAD_MASTER_KEY);
    await expect(readEphemeralPayload(stored.reference)).resolves.toEqual(payload);
    await expect(ephemeralPayloadExists(stored.reference)).resolves.toBe(true);

    await deleteEphemeralPayload(stored.reference);
    await expect(ephemeralPayloadExists(stored.reference)).resolves.toBe(false);
  });
});
