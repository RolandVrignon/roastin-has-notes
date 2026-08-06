import { createHmac, randomInt } from "node:crypto";

export function createOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(email: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(`${email.toLowerCase()}:${code}`).digest("hex");
}

export async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.DEPLOYMENT_ENV === "local" && process.env.ALLOW_DEV_OTP === "true") return { devCode: code };
    throw new Error("Email delivery is not configured");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject: `${code} is your Roastin code`, html: `<div style="font-family:Arial,sans-serif;color:#112b4d"><h1>Roastin has your code.</h1><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>` }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Email provider rejected the message");
  return {};
}
