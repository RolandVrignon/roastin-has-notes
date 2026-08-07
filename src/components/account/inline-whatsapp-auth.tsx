"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircleMore } from "lucide-react";

export type InlineWhatsappAuthCopy = {
  eyebrow: string;
  title: string;
  text: string;
  phoneLabel: string;
  consent: string;
  sendCode: string;
  codeTitle: string;
  codeText: string;
  codeLabel: string;
  verifyAndLaunch: string;
  differentNumber: string;
};

export function InlineWhatsappAuth({ copy, launchReady, onVerified }: { copy: InlineWhatsappAuthCopy; launchReady: boolean; onVerified: () => Promise<void> }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const validPhone = /^\+[1-9]\d{7,14}$/.test(phone);

  async function requestCode() {
    setLoading(true); setError("");
    const response = await fetch("/api/auth/request-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, consent }) });
    const payload = await response.json() as { error?: string; devCode?: string };
    setLoading(false);
    if (!response.ok) return setError(payload.error ?? "Code could not be sent");
    setDevCode(payload.devCode ?? "");
    setSent(true);
  }

  async function verifyAndLaunch() {
    setLoading(true); setError("");
    const response = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code, consent }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setLoading(false); return setError(payload.error ?? "Code could not be verified"); }
    await onVerified();
    setLoading(false);
  }

  return <section className="mx-auto mt-8 max-w-xl rounded-3xl border-2 border-[#112b4d] bg-white p-6 text-left shadow-[6px_7px_0_#112b4d]">
    <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#25d366] text-[#112b4d]"><MessageCircleMore aria-hidden="true" size={23} /></span><div><span className="text-xs font-black uppercase tracking-[.13em] text-[#3b4d5f]">{copy.eyebrow}</span><h2 className="display mt-1 text-3xl font-black tracking-[-.035em]">{sent ? copy.codeTitle : copy.title}</h2><p className="mt-2 text-sm leading-6 text-[#3b4d5f]">{sent ? copy.codeText.replace("{phone}", phone) : copy.text}</p></div></div>
    {!sent ? <><label className="mt-6 block text-xs font-black uppercase tracking-[.12em] text-[#3b4d5f]">{copy.phoneLabel}<input autoComplete="tel" className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-[#fffaf0] px-5 py-4 text-lg normal-case outline-none focus:border-[#25d366]" inputMode="tel" onChange={(event) => setPhone(event.target.value.replace(/[^+\d]/g, ""))} placeholder="+33612345678" type="tel" value={phone} /></label><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#112b4d]/15 bg-[#fffaf0] p-4 text-sm leading-6 text-[#3b4d5f]"><input checked={consent} className="mt-1 size-4 accent-[#25d366]" onChange={(event) => setConsent(event.target.checked)} type="checkbox" /><span>{copy.consent}</span></label></> : <label className="mt-6 block text-xs font-black uppercase tracking-[.12em] text-[#3b4d5f]">{copy.codeLabel}<input autoComplete="one-time-code" className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-[#fffaf0] px-5 py-4 text-center text-2xl font-black tracking-[.35em] outline-none focus:border-[#25d366]" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" value={code} /></label>}
    {devCode && <p className="mt-3 rounded-xl bg-[#f6a913]/20 p-3 text-sm font-bold">Local development code: {devCode}</p>}
    {error && <p className="mt-4 text-sm font-bold text-red-700">{error}</p>}
    <button className="btn mt-6 w-full border-[#112b4d] bg-[#25d366] text-[#112b4d] shadow-[4px_5px_0_#112b4d] disabled:opacity-40" disabled={loading || (!sent && (!validPhone || !consent)) || (sent && (code.length !== 6 || !launchReady))} onClick={sent ? verifyAndLaunch : requestCode} type="button">{loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={18} /> : <>{sent ? copy.verifyAndLaunch : copy.sendCode}<ArrowRight aria-hidden="true" size={18} /></>}</button>
    {sent && <button className="mx-auto mt-5 block text-sm font-black underline" onClick={() => { setSent(false); setCode(""); setDevCode(""); setError(""); }} type="button">{copy.differentNumber}</button>}
  </section>;
}
