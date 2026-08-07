import { describe, expect, it } from "vitest";
import { buildPortraitBlocks } from "./portrait-layout";

describe("buildPortraitBlocks", () => {
  it("replaces inline source quotes with WhatsApp evidence blocks", () => {
    const blocks = buildPortraitBlocks(
      "Henri annonce « Content de mettre une fessée ». Puis il transforme une intox « Stracciatella à -40% » en projet. Cerise : « Je viens de candidater pour être pompier volontaire » en pleine canicule.",
      [
        "«Content de mettre une fessée»",
        "«Stracciatella à -40%»",
        "«Je viens de candidater pour être pompier volontaire»",
      ],
    );

    expect(blocks.map((block) => block.type)).toEqual(["text", "evidence", "text", "evidence", "text", "evidence", "text"]);
    expect(blocks.filter((block) => block.type === "text").map((block) => block.text).join(" ")).not.toContain("Stracciatella à -40%");
    expect(blocks[2]).toEqual({ type: "text", text: "Puis il transforme une intox" });
  });

  it("uses the quote position rather than the evidence array order", () => {
    const blocks = buildPortraitBlocks("Avant « premier ». Ensuite « second ». Fin.", ["«second»", "«premier»"]);
    expect(blocks.filter((block) => block.type === "evidence").map((block) => block.evidence)).toEqual(["«premier»", "«second»"]);
  });

  it("spreads legacy unanchored evidence between narrative sentences", () => {
    const blocks = buildPortraitBlocks("Première anecdote. Deuxième anecdote. Dernière chute.", ["«Message absent du portrait»"]);
    expect(blocks.map((block) => block.type)).toEqual(["text", "evidence", "text", "text"]);
  });

  it("keeps a portrait intact when quotes are hidden", () => {
    expect(buildPortraitBlocks("Un portrait complet.", [])).toEqual([{ type: "text", text: "Un portrait complet." }]);
  });
});
