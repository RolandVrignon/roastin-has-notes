"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, MessageCircleMore, Send, Trash2 } from "lucide-react";

type Delivery = { id: string; status: "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "REVOKED"; lastStatusAt?: string | null };

export function WhatsappDeliveryCard({ reportId }: { reportId: string }) {
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
    if (!response.ok || !payload.delivery) { setError(payload.error ?? "Delivery could not be requested"); setLoading(false); return; }
    setDelivery(payload.delivery);
    setPhone("");
    setLoading(false);
  }

  async function remove() {
    const response = await fetch(`/api/reports/${reportId}/whatsapp-delivery`, { method: "DELETE" });
    if (response.ok) { setDelivery({ ...(delivery as Delivery), status: "REVOKED" }); setConsent(false); }
  }

  return <section className="border-t border-[#112b4d]/15 bg-[#f8efd9] px-5 py-20"><div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[32px] border-2 border-[#112b4d] bg-[#fffaf0] p-7 shadow-[8px_9px_0_#112b4d] md:grid-cols-[.8fr_1.2fr] md:p-10"><div><span className="grid size-14 place-items-center rounded-2xl bg-[#25d366] text-white"><MessageCircleMore size={27} /></span><h2 className="display mt-6 text-4xl font-black tracking-[-.04em]">Send my roast to WhatsApp</h2><p className="mt-4 leading-7 text-[#3b4d5f]">We send one transactional message to your own number with a private seven-day link. Never to the source group.</p></div><div>{delivery && delivery.status !== "FAILED" && delivery.status !== "REVOKED" ? <div className="rounded-2xl bg-[#e5f6e8] p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#25d366] text-white"><Check size={21} strokeWidth={3} /></span><div><strong className="block">Delivery {delivery.status.toLowerCase()}</strong><span className="text-sm text-[#3b4d5f]">Status updates arrive securely from WhatsApp.</span></div></div><button className="mt-5 flex items-center gap-2 text-sm font-black text-[#bd3214]" onClick={remove} type="button"><Trash2 size={15} /> Remove my number and revoke the link</button></div> : <><label className="text-xs font-black uppercase tracking-[.12em] text-[#3b4d5f]">Your WhatsApp number<input className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-lg outline-none focus:border-[#25d366]" onChange={(event) => setPhone(event.target.value.replace(/[^+\d]/g, ""))} placeholder="+33612345678" type="tel" value={phone} /></label><label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#3b4d5f]"><input checked={consent} className="mt-1 size-4 accent-[#25d366]" onChange={(event) => setConsent(event.target.checked)} type="checkbox" /><span>I agree to receive this one transactional WhatsApp message. I can remove my number and revoke the link at any time.</span></label>{error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}<button className="btn mt-5 w-full border-[#112b4d] bg-[#25d366] text-[#112b4d] shadow-[4px_5px_0_#112b4d] disabled:opacity-40" disabled={!consent || !/^\+[1-9]\d{7,14}$/.test(phone) || loading} onClick={send} type="button">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />} Send private link</button></>}</div></div></section>;
}
