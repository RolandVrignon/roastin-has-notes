import { describe, expect, it } from "vitest";
import { ParticipantAliasError, applyParticipantAliases } from "./participant-aliases";

const conversation = {
  messages: [
    { author: "Henri Grabe", body: "Dinner?", date: null },
    { author: "Quentin Incarnato", body: "Yes", date: null },
  ],
  participants: [
    { name: "Henri Grabe", messageCount: 1, share: 50 },
    { name: "Quentin Incarnato", messageCount: 1, share: 50 },
  ],
  firstDate: null,
  lastDate: null,
};

describe("participant aliases", () => {
  it("replaces source authors and participant display names", () => {
    const result = applyParticipantAliases(conversation, [
      { sourceName: "Henri Grabe", displayName: "Henri" },
      { sourceName: "Quentin Incarnato", displayName: "Quentin" },
    ]);

    expect(result.messages.map(({ author }) => author)).toEqual(["Henri", "Quentin"]);
    expect(result.participants.map(({ name }) => name)).toEqual(["Henri", "Quentin"]);
  });

  it("rejects duplicate display names and unknown source participants", () => {
    expect(() => applyParticipantAliases(conversation, [
      { sourceName: "Henri Grabe", displayName: "Henri" },
      { sourceName: "Quentin Incarnato", displayName: "henri" },
    ])).toThrow(ParticipantAliasError);
    expect(() => applyParticipantAliases(conversation, [
      { sourceName: "Unknown", displayName: "Someone" },
    ])).toThrow(ParticipantAliasError);
  });
});
