import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createOtp: vi.fn(() => "012345"),
  createUserSession: vi.fn(),
  getPrisma: vi.fn(),
  hashOtp: vi.fn(() => "hashed-code"),
  readOwnerHash: vi.fn(),
  sendOtpEmail: vi.fn(async () => ({})),
}));

vi.mock("@/lib/db", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@/lib/otp", () => ({ createOtp: mocks.createOtp, hashOtp: mocks.hashOtp, sendOtpEmail: mocks.sendOtpEmail }));
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

    const response = await requestCode(jsonRequest("/api/auth/request-code", { email: "MAYA@EXAMPLE.COM" }));

    expect(response.status).toBe(200);
    expect(db.otpCode.count).toHaveBeenCalledWith({
      where: { email: "maya@example.com", createdAt: { gt: new Date("2026-08-06T11:50:00.000Z") } },
    });
    expect(db.otpCode.create).toHaveBeenCalledWith({
      data: { email: "maya@example.com", codeHash: "hashed-code", expiresAt: new Date("2026-08-06T12:10:00.000Z") },
    });
    expect(mocks.sendOtpEmail).toHaveBeenCalledWith("maya@example.com", "012345");
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

    const response = await requestCode(jsonRequest("/api/auth/request-code", { email: "maya@example.com" }));

    expect(response.status).toBe(429);
    expect(mocks.createOtp).not.toHaveBeenCalled();
    expect(db.otpCode.create).not.toHaveBeenCalled();
    expect(mocks.sendOtpEmail).not.toHaveBeenCalled();
  });

  it("treats a code expiring exactly now as expired", async () => {
    const db = {
      otpCode: { findFirst: vi.fn(async () => null) },
      $transaction: vi.fn(),
    };
    mocks.getPrisma.mockReturnValue(db);

    const response = await verifyCode(jsonRequest("/api/auth/verify-code", { email: "MAYA@EXAMPLE.COM", code: "012345" }));

    expect(response.status).toBe(401);
    expect(db.otpCode.findFirst).toHaveBeenCalledWith({
      where: {
        email: "maya@example.com",
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

    const response = await verifyCode(jsonRequest("/api/auth/verify-code", { email: "maya@example.com", code: "012345" }));

    expect(response.status).toBe(401);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { attempts: { increment: 1 }, lockedAt: now },
    }));
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});
