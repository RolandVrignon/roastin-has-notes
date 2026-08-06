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

  it("parses Brazilian day-first dash exports with two-digit years and seconds", () => {
    const result = parseWhatsApp(`31/12/26, 23:59:58 - Lívia: Feliz ano novo\n01/01/27, 00:00:01 - João: Chegou!`);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toMatchObject({ author: "Lívia", body: "Feliz ano novo" });
    expect(result.messages[0].date).toEqual(new Date(2026, 11, 31, 23, 59));
    expect(result.messages[1].date).toEqual(new Date(2027, 0, 1, 0, 0));
  });

  it("parses US bracket exports and handles 12 AM and 12 PM correctly", () => {
    const result = parseWhatsApp(`[5/14/26, 12:03:21 AM] Maya: Midnight\n[5/14/26, 12:04:22 PM] Jules: Noon`);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].date?.getHours()).toBe(0);
    expect(result.messages[1].date?.getHours()).toBe(12);
  });

  it("normalizes directional marks around international author names", () => {
    const result = parseWhatsApp(`[14/05/2026, 18:03] \u200eMaya\u200f: Hello`);

    expect(result.messages[0].author).toBe("Maya");
    expect(result.participants).toEqual([{ name: "Maya", messageCount: 1, share: 100 }]);
  });

  it("infers date order from the whole export, including an initially ambiguous date", () => {
    const result = parseWhatsApp(`05/06/2026, 6:03 PM - Maya: Ambiguous\n05/14/2026, 9:04 AM - Jules: Decisive`);

    expect(result.messages[0].date?.getMonth()).toBe(4);
    expect(result.messages[0].date?.getDate()).toBe(6);
  });
});
