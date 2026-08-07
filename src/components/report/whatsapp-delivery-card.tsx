"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, MessageCircleMore, RefreshCcw, Trash2 } from "lucide-react";

type Delivery = { id: string; status: "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "REVOKED"; lastStatusAt?: string | null };

const copy = {
  en: ["Your report on WhatsApp", "After payment, we automatically send the private seven-day link to the number you verified. Never to the source group.", "Delivery", "Status updates arrive securely from WhatsApp.", "Send again", "Revoke delivery link", "Delivery could not be requested", "No report link has been sent yet."],
  fr: ["Ton rapport sur WhatsApp", "Après le paiement, nous envoyons automatiquement le lien privé valable sept jours au numéro que tu as vérifié. Jamais au groupe source.", "Livraison", "Les statuts sont mis à jour de façon sécurisée par WhatsApp.", "Renvoyer", "Révoquer le lien de livraison", "La livraison n’a pas pu être demandée", "Aucun lien de rapport n’a encore été envoyé."],
  es: ["Tu informe en WhatsApp", "Después del pago, enviamos automáticamente el enlace privado de siete días al número que verificaste. Nunca al grupo original.", "Entrega", "Los estados llegan de forma segura desde WhatsApp.", "Enviar de nuevo", "Revocar enlace de entrega", "No se pudo solicitar la entrega", "Todavía no se ha enviado ningún enlace."],
  it: ["Il tuo report su WhatsApp", "Dopo il pagamento inviamo automaticamente il link privato di sette giorni al numero verificato. Mai al gruppo originale.", "Consegna", "Gli aggiornamenti arrivano in modo sicuro da WhatsApp.", "Invia di nuovo", "Revoca il link", "Non è stato possibile richiedere la consegna", "Non è stato ancora inviato alcun link."],
  de: ["Dein Bericht auf WhatsApp", "Nach der Zahlung senden wir den privaten Link für sieben Tage automatisch an deine verifizierte Nummer. Nie an die Quellgruppe.", "Zustellung", "Statusaktualisierungen kommen sicher von WhatsApp.", "Erneut senden", "Zustelllink widerrufen", "Die Zustellung konnte nicht angefordert werden", "Noch wurde kein Link gesendet."],
  "pt-br": ["Seu relatório no WhatsApp", "Após o pagamento, enviamos automaticamente o link privado de sete dias ao número verificado. Nunca ao grupo original.", "Entrega", "As atualizações chegam com segurança pelo WhatsApp.", "Enviar novamente", "Revogar link", "Não foi possível solicitar a entrega", "Nenhum link foi enviado ainda."],
  pt: ["O teu relatório no WhatsApp", "Após o pagamento, enviamos automaticamente a ligação privada de sete dias para o número verificado. Nunca para o grupo original.", "Entrega", "As atualizações chegam de forma segura pelo WhatsApp.", "Enviar novamente", "Revogar ligação", "Não foi possível pedir a entrega", "Ainda não foi enviada nenhuma ligação."],
  nl: ["Je rapport op WhatsApp", "Na betaling sturen we de privélink van zeven dagen automatisch naar je geverifieerde nummer. Nooit naar de oorspronkelijke groep.", "Bezorging", "Statusupdates komen veilig van WhatsApp.", "Opnieuw sturen", "Bezorglink intrekken", "De bezorging kon niet worden aangevraagd", "Er is nog geen rapportlink verzonden."],
} as const;

export function WhatsappDeliveryCard({ reportId, locale = "en" }: { reportId: string; locale?: string }) {
  const labels = copy[locale as keyof typeof copy] ?? copy.en;
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reports/${reportId}/whatsapp-delivery`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => payload?.delivery && setDelivery(payload.delivery))
      .catch(() => undefined);
    return () => controller.abort();
  }, [reportId]);

  async function send() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/reports/${reportId}/whatsapp-delivery`, { method: "POST" });
    const payload = await response.json() as { delivery?: Delivery; error?: string };
    if (!response.ok || !payload.delivery) {
      setError(payload.error ?? labels[6]);
      setLoading(false);
      return;
    }
    setDelivery(payload.delivery);
    setLoading(false);
  }

  async function remove() {
    const response = await fetch(`/api/reports/${reportId}/whatsapp-delivery`, { method: "DELETE" });
    if (response.ok && delivery) setDelivery({ ...delivery, status: "REVOKED" });
  }

  const active = delivery && !["FAILED", "REVOKED"].includes(delivery.status);
  return <section className="border-t border-[#112b4d]/15 bg-[#f8efd9] px-5 py-20"><div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[32px] border-2 border-[#112b4d] bg-[#fffaf0] p-7 shadow-[8px_9px_0_#112b4d] md:grid-cols-[.8fr_1.2fr] md:p-10"><div><span className="grid size-14 place-items-center rounded-2xl bg-[#25d366] text-white"><MessageCircleMore size={27} /></span><h2 className="display mt-6 text-4xl font-black tracking-[-.04em]">{labels[0]}</h2><p className="mt-4 leading-7 text-[#3b4d5f]">{labels[1]}</p></div><div>{active ? <div className="rounded-2xl bg-[#e5f6e8] p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#25d366] text-white"><Check size={21} strokeWidth={3} /></span><div><strong className="block">{labels[2]} {delivery.status.toLowerCase()}</strong><span className="text-sm text-[#3b4d5f]">{labels[3]}</span></div></div><button className="mt-5 flex items-center gap-2 text-sm font-black text-[#bd3214]" onClick={remove} type="button"><Trash2 size={15} /> {labels[5]}</button></div> : <div className="rounded-2xl border border-[#112b4d]/15 bg-white p-6"><p className="text-sm leading-6 text-[#3b4d5f]">{labels[7]}</p>{error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}<button className="btn mt-5 w-full border-[#112b4d] bg-[#25d366] text-[#112b4d] shadow-[4px_5px_0_#112b4d] disabled:opacity-40" disabled={loading} onClick={send} type="button">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <RefreshCcw size={18} />} {labels[4]}</button></div>}</div></div></section>;
}
