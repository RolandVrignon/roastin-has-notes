export const classicOfferCodes = ["classic_usd", "classic_eur", "classic_brl"] as const;
export const quizOfferCodes = ["quiz_usd", "quiz_eur", "quiz_brl"] as const;

export type ClassicOfferCode = typeof classicOfferCodes[number];
export type QuizOfferCode = typeof quizOfferCodes[number];
export type OfferCode = ClassicOfferCode | QuizOfferCode;
export type OfferKind = "classic" | "quiz";

export function offerKindForCode(code: string): OfferKind | null {
  if ((classicOfferCodes as readonly string[]).includes(code)) return "classic";
  if ((quizOfferCodes as readonly string[]).includes(code)) return "quiz";
  return null;
}

export function entitlementCodesFor(kind: OfferKind) {
  return kind === "classic" ? classicOfferCodes : quizOfferCodes;
}

export function hasEntitlement(entitlements: Array<{ offerCode: string }>, kind: OfferKind) {
  const codes = entitlementCodesFor(kind) as readonly string[];
  return entitlements.some(({ offerCode }) => codes.includes(offerCode));
}
