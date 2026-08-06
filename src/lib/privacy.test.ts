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

  it("detects an explicit minor signal", () => {
    expect(hasMinorSignal(conversation("I'm 16 years old"))).toBe(true);
    expect(hasMinorSignal(conversation("I'm 26 years old"))).toBe(false);
  });
});
