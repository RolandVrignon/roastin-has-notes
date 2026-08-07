import { createHmac, randomInt } from "node:crypto";
import { sendWhatsappTemplate } from "@/lib/whatsapp-cloud";

export function createOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(phoneHash: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(`${phoneHash}:${code}`).digest("hex");
}

export async function sendOtpWhatsapp(phone: string, code: string) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    if (process.env.DEPLOYMENT_ENV === "local" && process.env.ALLOW_DEV_OTP === "true") return { devCode: code };
    throw new Error("WhatsApp delivery is not configured");
  }
  await sendWhatsappTemplate({
    phone,
    templateName: process.env.WHATSAPP_AUTH_TEMPLATE_NAME ?? "roastin_login_code",
    languageCode: process.env.WHATSAPP_AUTH_TEMPLATE_LANGUAGE ?? "en_US",
    components: [
      { type: "body", parameters: [{ type: "text", text: code }] },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
    ],
  });
  return {};
}
