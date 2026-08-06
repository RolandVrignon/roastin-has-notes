import { describe, expect, it } from "vitest";
import { parseWhatsApp } from "@/lib/whatsapp";

describe("parseWhatsApp", () => {
  it("parses European exports and multiline messages", () => {
    const result = parseWhatsApp(`[14/05/2026, 18:03] Maya: First line\nsecond line\n[15/05/2026, 09:04] Jules: Hello\n[15/05/2026, 09:05] Maya: <Media omitted>`);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].body).toBe("First line\nsecond line");
    expect(result.messages[0].date?.getMonth()).toBe(4);
    expect(result.participants[0]).toMatchObject({ name: "Maya", messageCount: 1 });
  });

  it("infers month-first American exports", () => {
    const result = parseWhatsApp(`05/14/2026, 6:03 PM - Maya: Hello\n05/15/2026, 9:04 AM - Jules: Hi`);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].date?.getMonth()).toBe(4);
    expect(result.messages[0].date?.getDate()).toBe(14);
    expect(result.messages[0].date?.getHours()).toBe(18);
  });

  it("does not silently normalize invalid dates", () => {
    const result = parseWhatsApp(`[31/13/2026, 18:03] Maya: Impossible\n[01/01/2027, 09:04] Jules: Valid`);
    expect(result.messages[0].date).toBeNull();
    expect(result.messages[1].date).not.toBeNull();
  });
});
