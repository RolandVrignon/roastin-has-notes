import { afterEach, describe, expect, it, vi } from "vitest";
import { sendWhatsappTemplate, whatsappLanguage } from "@/lib/whatsapp-cloud";

describe("WhatsApp Cloud API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps product locales to approved Meta language codes", () => {
    expect(whatsappLanguage("en")).toBe("en_US");
    expect(whatsappLanguage("pt-br")).toBe("pt_BR");
    expect(whatsappLanguage("pt")).toBe("pt_PT");
    expect(whatsappLanguage("unknown")).toBe("en_US");
  });

  it("sends a template without leaking the plus sign into the provider destination", async () => {
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "test-token");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "123456789");
    vi.stubEnv("WHATSAPP_GRAPH_VERSION", "v26.0");
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      void input;
      void init;
      return new Response(JSON.stringify({ messages: [{ id: "wamid.123" }] }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendWhatsappTemplate({
      phone: "+33612345678",
      templateName: "roastin_login_code",
      languageCode: "en_US",
      components: [{ type: "body", parameters: [{ type: "text", text: "012345" }] }],
    })).resolves.toEqual({ providerMessageId: "wamid.123" });

    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://graph.facebook.com/v26.0/123456789/messages");
    expect(JSON.parse(String(request?.body))).toMatchObject({
      to: "33612345678",
      type: "template",
      template: { name: "roastin_login_code", language: { code: "en_US" } },
    });
  });
});
