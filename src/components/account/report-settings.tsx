"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Download, Link2, LoaderCircle, MessageCircleMore, ShieldOff, Trash2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";

type ShareLink = { id: string; createdAt: string; expiresAt: string; anonymizeNames: boolean; hideQuotes: boolean };

export function ReportSettings({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [chatName, setChatName] = useState("Report");
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [createdUrl, setCreatedUrl] = useState("");
  const [anonymizeNames, setAnonymizeNames] = useState(false);
  const [hideQuotes, setHideQuotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const [reportResponse, linksResponse] = await Promise.all([fetch(`/api/reports/${reportId}`), fetch(`/api/reports/${reportId}/share`)]);
    if (reportResponse.ok) setChatName(((await reportResponse.json()) as { report: { chatName: string } }).report.chatName);
    if (linksResponse.ok) setLinks(((await linksResponse.json()) as { links: ShareLink[] }).links);
    setLoading(false);
  }

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`/api/reports/${reportId}`, { signal: controller.signal }),
      fetch(`/api/reports/${reportId}/share`, { signal: controller.signal }),
    ]).then(async ([reportResponse, linksResponse]) => {
      if (reportResponse.ok) setChatName(((await reportResponse.json()) as { report: { chatName: string } }).report.chatName);
      if (linksResponse.ok) setLinks(((await linksResponse.json()) as { links: ShareLink[] }).links);
      setLoading(false);
    }).catch((error) => {
      if (error instanceof Error && error.name !== "AbortError") setLoading(false);
    });
    return () => controller.abort();
  }, [reportId]);

  async function createLink() {
    setMessage("");
    const response = await fetch(`/api/reports/${reportId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymizeNames, hideQuotes }),
    });
    const payload = await response.json() as { shareUrl?: string; error?: string };
    if (!response.ok || !payload.shareUrl) { setMessage(payload.error ?? "Link could not be created"); return; }
    setCreatedUrl(payload.shareUrl);
    await navigator.clipboard.writeText(payload.shareUrl);
    setMessage("Private link copied. It expires in seven days.");
    await refresh();
  }

  async function revokeLinks() {
    const response = await fetch(`/api/reports/${reportId}/share`, { method: "DELETE" });
    if (response.ok) { setLinks([]); setCreatedUrl(""); setMessage("All share links were revoked."); }
  }

  async function removeWhatsapp() {
    const response = await fetch(`/api/reports/${reportId}/whatsapp-delivery`, { method: "DELETE" });
    setMessage(response.ok ? "WhatsApp data removed and delivery links revoked." : "WhatsApp data could not be removed.");
  }

  async function deleteReport() {
    if (!deleting) { setDeleting(true); return; }
    const response = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
    if (response.ok) router.push("/reports");
    else { setDeleting(false); setMessage("The report could not be deleted."); }
  }

  if (loading) return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#e84b20]" size={34} /></main>;

  return <main className="min-h-screen bg-[#f8efd9]"><header className="border-b border-[#112b4d]/10"><div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5"><Logo /><Link className="btn btn-ghost text-sm" href={`/r/${reportId}`}><ArrowLeft size={17} /> Back to report</Link></div></header><div className="mx-auto max-w-4xl px-5 py-14"><span className="eyebrow">Private controls</span><h1 className="display mt-4 text-5xl font-black tracking-[-.045em] md:text-7xl">Settings for {chatName}</h1><p className="mt-5 max-w-2xl text-[#3b4d5f]">Manage access without exposing the original conversation, which is no longer stored.</p>{message && <p className="mt-7 flex items-center gap-2 rounded-2xl bg-[#fffaf0] p-4 text-sm font-bold"><Check className="text-[#e84b20]" size={18} />{message}</p>}<div className="mt-10 space-y-5"><section className="card p-7"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f6a913]"><Link2 size={21} /></span><div className="flex-1"><h2 className="display text-2xl font-black">Sharing links</h2><p className="mt-2 text-sm leading-6 text-[#3b4d5f]">Each link is separate from your owner URL, expires automatically and can be revoked.</p><div className="mt-4 grid gap-3 text-sm font-bold sm:grid-cols-2"><label className="flex items-center gap-3 rounded-xl border border-[#112b4d]/15 bg-[#fffaf0] p-3"><input checked={anonymizeNames} onChange={(event) => setAnonymizeNames(event.target.checked)} type="checkbox" /> Anonymize names</label><label className="flex items-center gap-3 rounded-xl border border-[#112b4d]/15 bg-[#fffaf0] p-3"><input checked={hideQuotes} onChange={(event) => setHideQuotes(event.target.checked)} type="checkbox" /> Hide quotes</label></div>{createdUrl && <button className="mt-3 flex items-center gap-2 text-sm font-black text-[#e84b20]" onClick={() => navigator.clipboard.writeText(createdUrl)} type="button"><Copy size={15} /> Copy newest link again</button>}<div className="mt-5 flex flex-wrap gap-3"><button className="btn btn-primary min-h-11 text-sm" onClick={createLink} type="button">Create a link</button><button className="btn btn-cream min-h-11 text-sm disabled:opacity-40" disabled={!links.length} onClick={revokeLinks} type="button"><ShieldOff size={17} /> Revoke all ({links.length})</button></div></div></div></section><section className="card p-7"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#25d366]"><MessageCircleMore size={21} /></span><div><h2 className="display text-2xl font-black">WhatsApp delivery</h2><p className="mt-2 text-sm leading-6 text-[#3b4d5f]">Remove the encrypted destination number and revoke every delivery link.</p><button className="btn btn-cream mt-5 min-h-11 text-sm" onClick={removeWhatsapp} type="button"><Trash2 size={16} /> Remove WhatsApp data</button></div></div></section><section className="card p-7"><h2 className="display text-2xl font-black">Payment receipt</h2><p className="mt-2 text-sm leading-6 text-[#3b4d5f]">For Stripe purchases, open the receipt hosted securely by Stripe. Local demo purchases do not have one.</p><a className="btn btn-cream mt-5 min-h-11 text-sm" href={`/api/reports/${reportId}/receipt`} rel="noreferrer" target="_blank"><Download size={16} /> Open Stripe receipt</a></section><section className="rounded-3xl border-2 border-red-200 bg-red-50 p-7"><h2 className="display text-2xl font-black text-red-900">Delete this report</h2><p className="mt-2 text-sm leading-6 text-red-800">The report content, preview, access links and delivery data will become unavailable. Payment audit records may be retained where legally required.</p><button className="btn mt-5 min-h-11 border-red-800 bg-red-700 text-sm text-white shadow-[4px_5px_0_#7f1d1d]" onClick={deleteReport} type="button"><Trash2 size={16} /> {deleting ? "Click again to permanently delete" : "Delete report"}</button></section></div></div></main>;
}
