import { describe, expect, it } from "vitest";
import { maskPhone, normalizePhone } from "@/lib/phone";

describe("phone identity", () => {
  it("normalizes common international formatting to E.164", () => {
    expect(normalizePhone("+33 (6) 12-34-56-78")).toBe("+33612345678");
  });

  it.each(["0612345678", "+012345678", "+33abc612345678"])("rejects non-E.164 input %s", (phone) => {
    expect(() => normalizePhone(phone)).toThrow();
  });

  it("masks all but the country prefix and last four digits", () => {
    expect(maskPhone("+33612345678")).toBe("+33•••••5678");
  });
});
