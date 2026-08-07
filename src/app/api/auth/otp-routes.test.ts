import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createOtp: vi.fn(() => "012345"),
  createUserSession: vi.fn(),
  getPrisma: vi.fn(),
  hashOtp: vi.fn(() => "hashed-code"),
  readOwnerHash: vi.fn(),
  sendOtpWhatsapp: vi.fn(async () => ({})),
}));

vi.mock("@/lib/data-encryption", () => ({
  blindIndex: vi.fn(() => "phone-hash"),
  encryptSensitive: vi.fn(() => ({ ciphertext: "ciphertext", iv: "iv", tag: "tag" })),
}));
vi.mock("@/lib/db", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@/lib/otp", () => ({ createOtp: mocks.createOtp, hashOtp: mocks.hashOtp, sendOtpWhatsapp: mocks.sendOtpWhatsapp }));
vi.mock("@/lib/owner-session", () => ({ readOwnerHash: mocks.readOwnerHash }));
vi.mock("@/lib/user-session", () => ({ createUserSession: mocks.createUserSession }));

import { POST as requestCode } from "@/app/api/auth/request-code/route";
import { POST as verifyCode } from "@/app/api/auth/verify-code/route";

const now = new Date("2026-08-06T12:00:00.000Z");

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("OTP route boundaries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the third request in the rolling window and sets an exact ten-minute expiry", async () => {
    const otpCode = { id: "otp-123" };
    const db = {
      otpCode: {
        count: vi.fn(async () => 2),
        create: vi.fn(async () => otpCode),
        delete: vi.fn(),
      },
    };
    mocks.getPrisma.mockReturnValue(db);

    const response = await requestCode(jsonRequest("/api/auth/request-code", { phone: "+33 6 12 34 56 78", consent: true }));

    expect(response.status).toBe(200);
    expect(db.otpCode.count).toHaveBeenCalledWith({
      where: { phoneHash: "phone-hash", createdAt: { gt: new Date("2026-08-06T11:50:00.000Z") } },
    });
    expect(db.otpCode.create).toHaveBeenCalledWith({
      data: { phoneHash: "phone-hash", codeHash: "hashed-code", expiresAt: new Date("2026-08-06T12:10:00.000Z") },
    });
    expect(mocks.hashOtp).toHaveBeenCalledWith("phone-hash", "012345");
    expect(mocks.sendOtpWhatsapp).toHaveBeenCalledWith("+33612345678", "012345");
  });

  it("rate-limits the fourth request without generating or storing another code", async () => {
    const db = {
      otpCode: {
        count: vi.fn(async () => 3),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };
    mocks.getPrisma.mockReturnValue(db);

    const response = await requestCode(jsonRequest("/api/auth/request-code", { phone: "+33612345678", consent: true }));

    expect(response.status).toBe(429);
    expect(mocks.createOtp).not.toHaveBeenCalled();
    expect(db.otpCode.create).not.toHaveBeenCalled();
    expect(mocks.sendOtpWhatsapp).not.toHaveBeenCalled();
  });

  it("treats a code expiring exactly now as expired", async () => {
    const db = {
      otpCode: { findFirst: vi.fn(async () => null) },
      $transaction: vi.fn(),
    };
    mocks.getPrisma.mockReturnValue(db);

    const response = await verifyCode(jsonRequest("/api/auth/verify-code", { phone: "+33612345678", code: "012345", consent: true }));

    expect(response.status).toBe(401);
    expect(db.otpCode.findFirst).toHaveBeenCalledWith({
      where: {
        phoneHash: "phone-hash",
        usedAt: null,
        lockedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(mocks.createUserSession).not.toHaveBeenCalled();
  });

  it("locks the latest code after five failed verification attempts", async () => {
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const db = {
      otpCode: {
        findFirst: vi.fn(async () => ({ id: "otp-123", codeHash: "different", attempts: 4 })),
        updateMany,
      },
      $transaction: vi.fn(),
    };
    mocks.getPrisma.mockReturnValue(db);

    const response = await verifyCode(jsonRequest("/api/auth/verify-code", { phone: "+33612345678", code: "012345", consent: true }));

    expect(response.status).toBe(401);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { attempts: { increment: 1 }, lockedAt: now },
    }));
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("creates a phone-only user and attaches browser-owned reports after verification", async () => {
    const tx = {
      otpCode: { updateMany: vi.fn(async () => ({ count: 1 })) },
      user: { upsert: vi.fn(async () => ({ id: "user-123" })) },
      report: { updateMany: vi.fn(async () => ({ count: 1 })) },
    };
    const db = {
      otpCode: { findFirst: vi.fn(async () => ({ id: "otp-123", codeHash: "hashed-code", attempts: 0 })) },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    mocks.getPrisma.mockReturnValue(db);
    mocks.readOwnerHash.mockResolvedValue("owner-hash");
    mocks.createUserSession.mockResolvedValue({ name: "roastin_session", value: "session-token", path: "/", httpOnly: true });

    const response = await verifyCode(jsonRequest("/api/auth/verify-code", { phone: "+33612345678", code: "012345", consent: true }));

    expect(response.status).toBe(200);
    expect(tx.user.upsert).toHaveBeenCalledWith({
      where: { phoneHash: "phone-hash" },
      create: {
        phoneHash: "phone-hash",
        phoneCiphertext: "ciphertext",
        phoneIv: "iv",
        phoneTag: "tag",
        whatsappConsentVersion: "whatsapp-account-v1",
        whatsappConsentAt: now,
      },
      update: {
        phoneCiphertext: "ciphertext",
        phoneIv: "iv",
        phoneTag: "tag",
        whatsappConsentVersion: "whatsapp-account-v1",
        whatsappConsentAt: now,
      },
    });
    expect(tx.report.updateMany).toHaveBeenCalledWith({ where: { ownerTokenHash: "owner-hash", userId: null }, data: { userId: "user-123" } });
    expect(mocks.createUserSession).toHaveBeenCalledWith("user-123");
  });
});
