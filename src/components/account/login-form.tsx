"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function LoginForm({ recovery = false }: { recovery?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [oldLink, setOldLink] = useState("");

  async function requestCode() {
    setLoading(true); setError("");
    const response = await fetch("/api/auth/request-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const payload = await response.json() as { error?: string; devCode?: string };
    setLoading(false);
    if (!response.ok) { setError(payload.error ?? "Code could not be sent"); return; }
    setDevCode(payload.devCode ?? ""); setSent(true);
  }

  async function verify() {
    setLoading(true); setError("");
    const response = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const payload = await response.json() as { error?: string };
    setLoading(false);
    if (!response.ok) { setError(payload.error ?? "Code could not be verified"); return; }
    router.push("/reports");
  }

  return <main className="min-h-screen bg-[#f8efd9]"><header className="border-b border-[#112b4d]/10"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5"><Logo /><Link className="text-sm font-black" href="/">Back home</Link></div></header><div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-5xl place-items-center px-5 py-16"><section className="card w-full max-w-lg border-2 border-[#112b4d] bg-[#fffaf0] p-7 shadow-[8px_9px_0_#112b4d] md:p-10"><span className="grid size-13 place-items-center rounded-2xl bg-[#e84b20] text-white"><Mail size={24} /></span><h1 className="display mt-6 text-5xl font-black tracking-[-.045em]">{sent ? "Check your inbox." : recovery ? "Find your report again." : "Your reports, minus the password."}</h1><p className="mt-4 leading-7 text-[#3b4d5f]">{sent ? `We sent a six-digit code to ${email}.` : recovery ? "Use the email entered at Stripe Checkout. After verification, every report linked to that purchase appears in your dashboard." : "Enter your email and we’ll send a one-time code. Reports created in this browser will be added to your account."}</p>{recovery && !sent && <div className="mt-6 rounded-2xl border border-[#112b4d]/15 bg-white p-4"><label className="block text-xs font-black uppercase tracking-[.12em]">Or paste your old private link<input className="mt-2 block w-full rounded-xl border border-[#112b4d]/20 px-4 py-3 text-sm normal-case outline-none focus:border-[#e84b20]" onChange={(event) => setOldLink(event.target.value)} placeholder="https://…/r/…" type="url" value={oldLink} /></label><button className="btn btn-cream mt-3 min-h-10 w-full text-sm" onClick={() => { try { const url = new URL(oldLink); if (/^\/r\/[0-9a-f-]{36}$/i.test(url.pathname)) router.push(url.pathname); else setError("Paste a valid private report link"); } catch { setError("Paste a valid private report link"); } }} type="button">Open this private link</button></div>}{!sent ? <label className="mt-7 block text-xs font-black uppercase tracking-[.12em]">Email<input autoComplete="email" className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-lg normal-case outline-none focus:border-[#e84b20]" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} /></label> : <label className="mt-7 block text-xs font-black uppercase tracking-[.12em]">Six-digit code<input autoComplete="one-time-code" className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-center text-2xl font-black tracking-[.35em] outline-none focus:border-[#e84b20]" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" value={code} /></label>}{devCode && <p className="mt-3 rounded-xl bg-[#f6a913]/20 p-3 text-sm font-bold">Local development code: {devCode}</p>}{error && <p className="mt-4 text-sm font-bold text-red-700">{error}</p>}<button className="btn btn-primary mt-6 w-full disabled:opacity-40" disabled={loading || (!sent && !email.includes("@")) || (sent && code.length !== 6)} onClick={sent ? verify : requestCode} type="button">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>{sent ? "Verify and open reports" : "Email me a code"}<ArrowRight size={18} /></>}</button>{sent && <button className="mx-auto mt-5 block text-sm font-black underline" onClick={() => { setSent(false); setCode(""); setDevCode(""); }} type="button">Use a different email</button>}</section></div></main>;
}
