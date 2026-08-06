import { createHash } from "node:crypto";
import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-07-29.dahlia" as const;

export function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(apiKey, { apiVersion: STRIPE_API_VERSION });
}

export function checkoutIntegrationIdentifier(seed: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const suffix = Array.from(createHash("sha256").update(seed).digest().subarray(0, 8), (byte) => alphabet[byte % alphabet.length]).join("");
  return `roastin_checkout_${suffix}`;
}
