"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, LoaderCircle, LogOut, Trash2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";

type Account = { email: string; reportCount: number; paymentCount: number; purchases: Array<{ id: string; amount: number; currency: string; status: string; createdAt: string; report: { id: string; chatName: string; deletedAt: string | null } }> };

export function AccountSettings() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account").then(async (response) => {
      if (response.status === 401) { router.push("/login"); return; }
      setAccount(await response.json());
    }).catch(() => setError("Account data is unavailable."));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function deleteAccount() {
    setError("");
    const response = await fetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }) });
    if (response.ok) router.push("/");
    else setError(((await response.json()) as { error?: string }).error ?? "Account deletion failed");
  }

  if (!account) return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#e84b20]" size={34} /></main>;

  return <main className="min-h-screen bg-[#f8efd9]"><header className="border-b border-[#112b4d]/10"><div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5"><Logo /><Link className="btn btn-ghost text-sm" href="/reports"><ArrowLeft size={17} /> Reports</Link></div></header><div className="mx-auto max-w-4xl px-5 py-14"><span className="eyebrow">Your data</span><h1 className="display mt-4 text-6xl font-black tracking-[-.05em]">Account</h1><div className="card mt-10 p-7"><span className="text-xs font-black uppercase tracking-[.12em] text-[#3b4d5f]">Signed in as</span><p className="mt-2 text-xl font-black">{account.email}</p><p className="mt-5 text-sm text-[#3b4d5f]">{account.reportCount} active report{account.reportCount === 1 ? "" : "s"} · {account.paymentCount} payment record{account.paymentCount === 1 ? "" : "s"}</p><div className="mt-6 flex flex-wrap gap-3"><a className="btn btn-cream min-h-11 text-sm" download href="/api/account/export"><Download size={17} /> Export my data</a><button className="btn btn-ghost min-h-11 text-sm" onClick={logout} type="button"><LogOut size={17} /> Sign out</button></div></div>{account.purchases.length > 0 && <section className="card mt-6 p-7"><h2 className="display text-3xl font-black">Purchase history</h2><div className="mt-5 divide-y divide-[#112b4d]/15">{account.purchases.map((purchase) => <div className="flex flex-wrap items-center justify-between gap-3 py-4" key={purchase.id}><div><strong className="block">{purchase.report.chatName}</strong><span className="text-xs text-[#3b4d5f]">{new Date(purchase.createdAt).toLocaleDateString()} · {purchase.status.toLowerCase()}</span></div><div className="flex items-center gap-3"><strong>{new Intl.NumberFormat(undefined, { style: "currency", currency: purchase.currency.toUpperCase() }).format(purchase.amount / 100)}</strong>{!purchase.report.deletedAt && <Link className="text-sm font-black text-[#e84b20]" href={`/r/${purchase.report.id}`}>Open</Link>}</div></div>)}</div></section>}<section className="mt-6 rounded-3xl border-2 border-red-200 bg-red-50 p-7"><h2 className="display text-3xl font-black text-red-900">Delete account and reports</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-red-800">This removes your report content, revokes every access link and deletes encrypted delivery destinations. Minimal payment records may be retained where required.</p><label className="mt-6 block text-xs font-black uppercase tracking-[.12em] text-red-900">Type DELETE<input className="mt-2 block w-full max-w-sm rounded-xl border-2 border-red-200 bg-white px-4 py-3 normal-case outline-none focus:border-red-700" onChange={(event) => setConfirmation(event.target.value)} value={confirmation} /></label>{error && <p className="mt-3 text-sm font-bold text-red-800">{error}</p>}<button className="btn mt-5 min-h-11 border-red-800 bg-red-700 text-sm text-white shadow-[4px_5px_0_#7f1d1d] disabled:opacity-40" disabled={confirmation !== "DELETE"} onClick={deleteAccount} type="button"><Trash2 size={17} /> Permanently delete my account</button></section></div></main>;
}
