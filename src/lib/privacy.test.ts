import { describe, expect, it } from "vitest";
import type { ParsedConversation } from "@/domain/report";
import { hasMinorSignal, sanitizeConversation } from "@/lib/privacy";

function conversation(body: string, author = "Maya"): ParsedConversation {
  return { messages: [{ author, body, date: null }], participants: [{ name: author, messageCount: 1, share: 100 }], firstDate: null, lastDate: null };
}

describe("conversation privacy", () => {
  it("redacts email addresses and phone numbers before generation", () => {
    const result = sanitizeConversation(conversation("Email me at maya@example.com or +33 6 12 34 56 78"));
    expect(result.messages[0].body).toContain("[email redacted]");
    expect(result.messages[0].body).toContain("[phone redacted]");
    expect(result.messages[0].body).not.toContain("example.com");
  });

  it("masks an author represented by a phone number", () => {
    const result = sanitizeConversation(conversation("hello", "+14155552671"));
    expect(result.messages[0].author).toBe("Participant");
  });

  it.each([
    "+44 20 7946 0958",
    "0049 30 12345678",
    "+33.6.12.34.56.78",
  ])("redacts an international phone number formatted as %s", (phone) => {
    const result = sanitizeConversation(conversation(`Call me on ${phone} tonight`));

    expect(result.messages[0].body).toBe("Call me on [phone redacted] tonight");
    expect(result.messages[0].body).not.toContain(phone);
  });

  it("redacts complete vCards without leaking their fields", () => {
    const result = sanitizeConversation(conversation([
      "Here is Alex:",
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:Alex Example",
      "EMAIL:alex@example.com",
      "TEL:+33612345678",
      "END:VCARD",
    ].join("\n")));

    expect(result.messages[0].body).toBe("Here is Alex:\n[contact card redacted]");
    expect(result.messages[0].body).not.toContain("Alex Example");
    expect(result.messages[0].body).not.toContain("alex@example.com");
  });

  it("masks PII in authors and recomputes participant statistics from sanitized names", () => {
    const result = sanitizeConversation({
      messages: [
        { author: "maya@example.com", body: "one", date: null },
        { author: "+33612345678", body: "two", date: null },
      ],
      participants: [
        { name: "maya@example.com", messageCount: 1, share: 50 },
        { name: "+33612345678", messageCount: 1, share: 50 },
      ],
      firstDate: null,
      lastDate: null,
    });

    expect(result.messages.map(({ author }) => author)).toEqual(["Participant", "Participant"]);
    expect(result.participants).toEqual([{ name: "Participant", messageCount: 2, share: 100 }]);
  });

  it("redacts international phone numbers containing parenthesized area codes", () => {
    const result = sanitizeConversation(conversation("Call me on +1 (415) 555-2671 tomorrow"));
    expect(result.messages[0].body).toBe("Call me on [phone redacted] tomorrow");
  });

  it("detects an explicit minor signal", () => {
    expect(hasMinorSignal(conversation("I'm 16 years old"))).toBe(true);
    expect(hasMinorSignal(conversation("J’ai 16 ans"))).toBe(true);
    expect(hasMinorSignal(conversation("Tengo 16 años"))).toBe(true);
    expect(hasMinorSignal(conversation("I'm 26 years old"))).toBe(false);
  });

  it("does not treat an ordinary first-person quantity as an age", () => {
    expect(hasMinorSignal(conversation("J’ai 2 chambres disponibles"))).toBe(false);
    expect(hasMinorSignal(conversation("I am 4 minutes away"))).toBe(false);
    expect(hasMinorSignal(conversation("Tengo 3 entradas"))).toBe(false);
  });
});
