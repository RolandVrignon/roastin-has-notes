type TemplateComponent = {
  type: "body" | "button";
  sub_type?: "url";
  index?: string;
  parameters: Array<{ type: "text"; text: string }>;
};

type SendTemplateInput = {
  phone: string;
  templateName: string;
  languageCode: string;
  components: TemplateComponent[];
};

export function whatsappLanguage(locale: string) {
  const languages: Record<string, string> = {
    de: "de",
    en: "en_US",
    es: "es",
    fr: "fr",
    it: "it",
    nl: "nl",
    pt: "pt_PT",
    "pt-br": "pt_BR",
  };
  return languages[locale.toLowerCase()] ?? "en_US";
}

export async function sendWhatsappTemplate(input: SendTemplateInput) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION ?? "v26.0";
  if (!accessToken || !phoneNumberId) throw new Error("WHATSAPP_NOT_CONFIGURED");

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.phone.slice(1),
      type: "template",
      template: {
        name: input.templateName,
        language: { code: input.languageCode },
        components: input.components,
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json() as { messages?: Array<{ id?: string }>; error?: { code?: number; message?: string } };
  const providerMessageId = payload.messages?.[0]?.id;
  if (!response.ok || !providerMessageId) {
    const error = new Error("WHATSAPP_PROVIDER_REJECTED") as Error & { providerCode?: string };
    error.providerCode = String(payload.error?.code ?? response.status);
    throw error;
  }
  return { providerMessageId };
}
