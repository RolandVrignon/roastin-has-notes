"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircleMore } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function LoginForm({ recovery = false, nextPath = "/reports" }: { recovery?: boolean; nextPath?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [oldLink, setOldLink] = useState("");

  async function requestCode() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, consent }),
    });
    const payload = await response.json() as { error?: string; devCode?: string };
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Code could not be sent");
      return;
    }
    setDevCode(payload.devCode ?? "");
    setSent(true);
  }

  async function verify() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, consent }),
    });
    const payload = await response.json() as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Code could not be verified");
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  const validPhone = /^\+[1-9]\d{7,14}$/.test(phone);

  return <main className="min-h-screen bg-[#f8efd9]"><header className="border-b border-[#112b4d]/10"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5"><Logo /><Link className="text-sm font-black" href="/">Back home</Link></div></header><div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-5xl place-items-center px-5 py-16"><section className="card w-full max-w-lg border-2 border-[#112b4d] bg-[#fffaf0] p-7 shadow-[8px_9px_0_#112b4d] md:p-10"><span className="grid size-13 place-items-center rounded-2xl bg-[#25d366] text-[#112b4d]"><MessageCircleMore size={24} /></span><h1 className="display mt-6 text-5xl font-black tracking-[-.045em]">{sent ? "Check WhatsApp." : recovery ? "Find your report again." : "Your number is your account."}</h1><p className="mt-4 leading-7 text-[#3b4d5f]">{sent ? `We sent a six-digit verification code to ${phone}.` : recovery ? "Use the WhatsApp number you verified when creating the report." : "Verify your WhatsApp number once. We use it to identify your reports and send the private link after payment."}</p>{recovery && !sent && <div className="mt-6 rounded-2xl border border-[#112b4d]/15 bg-white p-4"><label className="block text-xs font-black uppercase tracking-[.12em]">Or paste your old private link<input className="mt-2 block w-full rounded-xl border border-[#112b4d]/20 px-4 py-3 text-sm normal-case outline-none focus:border-[#e84b20]" onChange={(event) => setOldLink(event.target.value)} placeholder="https://…/r/…" type="url" value={oldLink} /></label><button className="btn btn-cream mt-3 min-h-10 w-full text-sm" onClick={() => { try { const url = new URL(oldLink); if (/^\/r\/[0-9a-f-]{36}$/i.test(url.pathname)) router.push(url.pathname); else setError("Paste a valid private report link"); } catch { setError("Paste a valid private report link"); } }} type="button">Open this private link</button></div>}{!sent ? <><label className="mt-7 block text-xs font-black uppercase tracking-[.12em]">WhatsApp number<input autoComplete="tel" className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-lg normal-case outline-none focus:border-[#25d366]" inputMode="tel" onChange={(event) => setPhone(event.target.value.replace(/[^+\d]/g, ""))} placeholder="+33612345678" type="tel" value={phone} /></label><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#112b4d]/15 bg-white p-4 text-sm leading-6 text-[#3b4d5f]"><input checked={consent} className="mt-1 size-4 accent-[#25d366]" onChange={(event) => setConsent(event.target.checked)} type="checkbox" /><span>I agree to receive the verification code and transactional report links on WhatsApp. No marketing messages.</span></label></> : <label className="mt-7 block text-xs font-black uppercase tracking-[.12em]">Six-digit code<input autoComplete="one-time-code" className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-center text-2xl font-black tracking-[.35em] outline-none focus:border-[#25d366]" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" value={code} /></label>}{devCode && <p className="mt-3 rounded-xl bg-[#f6a913]/20 p-3 text-sm font-bold">Local development code: {devCode}</p>}{error && <p className="mt-4 text-sm font-bold text-red-700">{error}</p>}<button className="btn mt-6 w-full border-[#112b4d] bg-[#25d366] text-[#112b4d] shadow-[4px_5px_0_#112b4d] disabled:opacity-40" disabled={loading || (!sent && (!validPhone || !consent)) || (sent && code.length !== 6)} onClick={sent ? verify : requestCode} type="button">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>{sent ? "Verify and continue" : "Send code on WhatsApp"}<ArrowRight size={18} /></>}</button>{sent && <button className="mx-auto mt-5 block text-sm font-black underline" onClick={() => { setSent(false); setCode(""); setDevCode(""); }} type="button">Use a different number</button>}</section></div></main>;
}
