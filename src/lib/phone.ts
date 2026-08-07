import { z } from "zod";

export const phoneSchema = z.string().trim().transform((value) => value.replace(/[\s().-]/g, "")).pipe(
  z.string().regex(/^\+[1-9]\d{7,14}$/),
);

export function normalizePhone(value: string) {
  return phoneSchema.parse(value);
}

export function maskPhone(value: string) {
  const visible = value.slice(-4);
  return `${value.slice(0, Math.min(3, value.length - 4))}${"•".repeat(Math.max(4, value.length - visible.length - 3))}${visible}`;
}
