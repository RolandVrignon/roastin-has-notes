export type Offer = {
  code: "classic_usd" | "classic_eur" | "classic_brl";
  currency: "usd" | "eur" | "brl";
  amount: number;
  stripePriceId?: string;
};

const classicUsd: Offer = {
  code: "classic_usd",
  currency: "usd",
  amount: 1299,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_USD,
};

const classicEur: Offer = {
  code: "classic_eur",
  currency: "eur",
  amount: 1199,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_EUR,
};

const classicBrl: Offer = {
  code: "classic_brl",
  currency: "brl",
  amount: 4990,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_BRL,
};

const offers = [classicUsd, classicEur, classicBrl];

export function offerForLocale(locale = "en"): Offer {
  if (locale === "pt-br" && classicBrl.stripePriceId) return classicBrl;
  if (["fr", "es", "it", "de", "pt", "nl"].includes(locale) && classicEur.stripePriceId) return classicEur;
  return classicUsd;
}

export function offerByCode(code: string) {
  return offers.find((offer) => offer.code === code) ?? null;
}

export function publicOfferForLocale(locale = "en") {
  const offer = offerForLocale(locale);
  return {
    code: offer.code,
    amount: offer.amount,
    currency: offer.currency,
    formattedPrice: new Intl.NumberFormat(locale, { style: "currency", currency: offer.currency.toUpperCase() }).format(offer.amount / 100),
  };
}
