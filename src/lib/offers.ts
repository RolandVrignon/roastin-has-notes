export type Offer = {
  code: "classic_usd";
  currency: "usd";
  amount: 1299;
  stripePriceId?: string;
};

const classicUsd: Offer = {
  code: "classic_usd",
  currency: "usd",
  amount: 1299,
  stripePriceId: process.env.STRIPE_PRICE_CLASSIC_USD,
};

export function offerForLocale(): Offer {
  return classicUsd;
}

export function offerByCode(code: string) {
  return code === classicUsd.code ? classicUsd : null;
}
