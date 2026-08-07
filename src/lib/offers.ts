import type { OfferCode, OfferKind } from "@/lib/entitlements";

export type Offer = {
  code: OfferCode;
  kind: OfferKind;
  currency: "usd" | "eur" | "brl";
  amount: number;
  stripePriceId?: string;
};

const classicUsd: Offer = {
  code: "classic_usd",
  kind: "classic",
  currency: "usd",
  amount: 1299,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_USD,
};

const classicEur: Offer = {
  code: "classic_eur",
  kind: "classic",
  currency: "eur",
  amount: 1199,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_EUR,
};

const classicBrl: Offer = {
  code: "classic_brl",
  kind: "classic",
  currency: "brl",
  amount: 4990,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_BRL,
};

const quizUsd: Offer = {
  code: "quiz_usd",
  kind: "quiz",
  currency: "usd",
  amount: 499,
  stripePriceId: process.env.STRIPE_PRICE_QUIZ_USD,
};

const quizEur: Offer = {
  code: "quiz_eur",
  kind: "quiz",
  currency: "eur",
  amount: 499,
  stripePriceId: process.env.STRIPE_PRICE_QUIZ_EUR,
};

const quizBrl: Offer = {
  code: "quiz_brl",
  kind: "quiz",
  currency: "brl",
  amount: 1990,
  stripePriceId: process.env.STRIPE_PRICE_QUIZ_BRL,
};

const offers = [classicUsd, classicEur, classicBrl, quizUsd, quizEur, quizBrl];

export function offerForLocale(locale = "en", kind: OfferKind = "classic"): Offer {
  const [usd, eur, brl] = kind === "classic" ? [classicUsd, classicEur, classicBrl] : [quizUsd, quizEur, quizBrl];
  if (locale === "pt-br" && brl.stripePriceId) return brl;
  if (["fr", "es", "it", "de", "pt", "nl"].includes(locale) && eur.stripePriceId) return eur;
  return usd;
}

export function offerByCode(code: string) {
  return offers.find((offer) => offer.code === code) ?? null;
}

export function publicOfferForLocale(locale = "en", kind: OfferKind = "classic") {
  const offer = offerForLocale(locale, kind);
  return {
    code: offer.code,
    kind: offer.kind,
    amount: offer.amount,
    currency: offer.currency,
    formattedPrice: new Intl.NumberFormat(locale, { style: "currency", currency: offer.currency.toUpperCase() }).format(offer.amount / 100),
  };
}
