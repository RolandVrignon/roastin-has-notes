import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-07-29.dahlia" as const;

export function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(apiKey, { apiVersion: STRIPE_API_VERSION });
}

export function checkoutIntegrationIdentifier() {
  return "roastin_checkout";
}
