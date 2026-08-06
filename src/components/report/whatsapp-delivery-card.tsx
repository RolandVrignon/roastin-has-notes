"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, MessageCircleMore, Send, Trash2 } from "lucide-react";

type Delivery = { id: string; status: "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "REVOKED"; lastStatusAt?: string | null };

const copy = {
  en: ["Send my roast to WhatsApp", "We send one transactional message to your own number with a private seven-day link. Never to the source group.", "Your WhatsApp number", "I agree to receive this one transactional WhatsApp message. I can remove my number and revoke the link at any time.", "Send private link", "Delivery", "Status updates arrive securely from WhatsApp.", "Remove my number and revoke the link", "Delivery could not be requested"],
  fr: ["Recevoir mon roast sur WhatsApp", "Nous envoyons un seul message transactionnel à ton propre numéro avec un lien privé valable sept jours. Jamais au groupe source.", "Ton numéro WhatsApp", "J’accepte de recevoir ce message transactionnel unique sur WhatsApp. Je peux supprimer mon numéro et révoquer le lien à tout moment.", "Envoyer le lien privé", "Livraison", "Les statuts sont mis à jour de façon sécurisée par WhatsApp.", "Supprimer mon numéro et révoquer le lien", "La livraison n’a pas pu être demandée"],
  es: ["Recibir mi roast por WhatsApp", "Enviamos un único mensaje transaccional a tu propio número con un enlace privado de siete días. Nunca al grupo original.", "Tu número de WhatsApp", "Acepto recibir este único mensaje transaccional por WhatsApp. Puedo borrar mi número y revocar el enlace cuando quiera.", "Enviar enlace privado", "Entrega", "Los estados llegan de forma segura desde WhatsApp.", "Borrar mi número y revocar el enlace", "No se pudo solicitar la entrega"],
  it: ["Ricevi il mio roast su WhatsApp", "Invieremo un solo messaggio transazionale al tuo numero con un link privato valido sette giorni. Mai al gruppo originale.", "Il tuo numero WhatsApp", "Accetto di ricevere questo singolo messaggio transazionale su WhatsApp. Posso eliminare il numero e revocare il link in ogni momento.", "Invia link privato", "Consegna", "Gli aggiornamenti arrivano in modo sicuro da WhatsApp.", "Elimina il numero e revoca il link", "Non è stato possibile richiedere la consegna"],
  de: ["Meinen Roast per WhatsApp erhalten", "Wir senden genau eine Transaktionsnachricht an deine eigene Nummer mit einem privaten Link für sieben Tage. Nie an die Quellgruppe.", "Deine WhatsApp-Nummer", "Ich stimme dieser einmaligen Transaktionsnachricht per WhatsApp zu. Ich kann meine Nummer löschen und den Link jederzeit widerrufen.", "Privaten Link senden", "Zustellung", "Statusaktualisierungen kommen sicher von WhatsApp.", "Nummer löschen und Link widerrufen", "Die Zustellung konnte nicht angefordert werden"],
  "pt-br": ["Receber meu roast no WhatsApp", "Enviamos uma única mensagem transacional ao seu próprio número com um link privado válido por sete dias. Nunca ao grupo original.", "Seu número do WhatsApp", "Concordo em receber esta única mensagem transacional no WhatsApp. Posso excluir meu número e revogar o link a qualquer momento.", "Enviar link privado", "Entrega", "As atualizações chegam com segurança pelo WhatsApp.", "Excluir meu número e revogar o link", "Não foi possível solicitar a entrega"],
  pt: ["Receber o meu roast no WhatsApp", "Enviamos uma única mensagem transacional para o teu número com uma ligação privada válida por sete dias. Nunca para o grupo original.", "O teu número de WhatsApp", "Aceito receber esta única mensagem transacional no WhatsApp. Posso eliminar o número e revogar a ligação a qualquer momento.", "Enviar ligação privada", "Entrega", "As atualizações chegam de forma segura pelo WhatsApp.", "Eliminar o número e revogar a ligação", "Não foi possível pedir a entrega"],
  nl: ["Mijn roast via WhatsApp ontvangen", "We sturen één transactioneel bericht naar je eigen nummer met een privélink voor zeven dagen. Nooit naar de oorspronkelijke groep.", "Je WhatsApp-nummer", "Ik stem in met dit ene transactionele WhatsApp-bericht. Ik kan mijn nummer wissen en de link op elk moment intrekken.", "Privélink sturen", "Bezorging", "Statusupdates komen veilig van WhatsApp.", "Mijn nummer wissen en de link intrekken", "De bezorging kon niet worden aangevraagd"],
} as const;

export function WhatsappDeliveryCard({ reportId, locale = "en" }: { reportId: string; locale?: string }) {
  const labels = copy[locale as keyof typeof copy] ?? copy.en;
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
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
    const response = await fetch(`/api/reports/${reportId}/whatsapp-delivery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, consent }) });
    const payload = await response.json() as { delivery?: Delivery; error?: string };
    if (!response.ok || !payload.delivery) { setError(payload.error ?? labels[8]); setLoading(false); return; }
    setDelivery(payload.delivery);
    setPhone("");
    setLoading(false);
  }

  async function remove() {
    const response = await fetch(`/api/reports/${reportId}/whatsapp-delivery`, { method: "DELETE" });
    if (response.ok) { setDelivery({ ...(delivery as Delivery), status: "REVOKED" }); setConsent(false); }
  }

  return <section className="border-t border-[#112b4d]/15 bg-[#f8efd9] px-5 py-20"><div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[32px] border-2 border-[#112b4d] bg-[#fffaf0] p-7 shadow-[8px_9px_0_#112b4d] md:grid-cols-[.8fr_1.2fr] md:p-10"><div><span className="grid size-14 place-items-center rounded-2xl bg-[#25d366] text-white"><MessageCircleMore size={27} /></span><h2 className="display mt-6 text-4xl font-black tracking-[-.04em]">{labels[0]}</h2><p className="mt-4 leading-7 text-[#3b4d5f]">{labels[1]}</p></div><div>{delivery && delivery.status !== "FAILED" && delivery.status !== "REVOKED" ? <div className="rounded-2xl bg-[#e5f6e8] p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#25d366] text-white"><Check size={21} strokeWidth={3} /></span><div><strong className="block">{labels[5]} {delivery.status.toLowerCase()}</strong><span className="text-sm text-[#3b4d5f]">{labels[6]}</span></div></div><button className="mt-5 flex items-center gap-2 text-sm font-black text-[#bd3214]" onClick={remove} type="button"><Trash2 size={15} /> {labels[7]}</button></div> : <><label className="text-xs font-black uppercase tracking-[.12em] text-[#3b4d5f]">{labels[2]}<input className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-lg outline-none focus:border-[#25d366]" onChange={(event) => setPhone(event.target.value.replace(/[^+\d]/g, ""))} placeholder="+33612345678" type="tel" value={phone} /></label><label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#3b4d5f]"><input checked={consent} className="mt-1 size-4 accent-[#25d366]" onChange={(event) => setConsent(event.target.checked)} type="checkbox" /><span>{labels[3]}</span></label>{error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}<button className="btn mt-5 w-full border-[#112b4d] bg-[#25d366] text-[#112b4d] shadow-[4px_5px_0_#112b4d] disabled:opacity-40" disabled={!consent || !/^\+[1-9]\d{7,14}$/.test(phone) || loading} onClick={send} type="button">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />} {labels[4]}</button></>}</div></div></section>;
}
