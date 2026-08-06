"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, LoaderCircle, LockKeyhole, MessageCircleMore, Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";

type DashboardReport = { id: string; chatName: string; status: string; createdAt: string; messageCount: number; participantCount: number; unlocked: boolean; deliveryStatus: string | null };

export function ReportsDashboard() {
  const [reports, setReports] = useState<DashboardReport[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reports", { signal: controller.signal }).then((response) => response.json()).then((payload) => setReports(payload.reports ?? [])).catch(() => setReports([]));
    return () => controller.abort();
  }, []);

  return <main className="min-h-screen bg-[#f8efd9]"><header className="border-b border-[#112b4d]/10"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5"><Logo /><Link className="btn btn-primary min-h-10 px-4 text-sm" href="/create"><Plus size={17} /> New report</Link></div></header><div className="mx-auto max-w-5xl px-5 py-14"><span className="eyebrow">Private archive</span><h1 className="display mt-4 text-6xl font-black tracking-[-.05em]">My reports</h1><p className="mt-4 text-[#3b4d5f]">Your original conversations are gone. These are the private reports that remain.</p>{reports === null ? <LoaderCircle className="mt-16 animate-spin text-[#e84b20]" size={32} /> : reports.length === 0 ? <section className="card mt-12 p-10 text-center"><FileText className="mx-auto text-[#e84b20]" size={40} /><h2 className="display mt-5 text-3xl font-black">No reports here yet.</h2><p className="mt-3 text-[#3b4d5f]">Create one in this browser, or sign in with the email connected to an existing report.</p><Link className="btn btn-primary mt-7" href="/create">Roast a chat <ArrowRight size={18} /></Link></section> : <div className="mt-10 grid gap-5 md:grid-cols-2">{reports.map((report) => <Link className="card group border-2 border-transparent p-6 transition hover:-translate-y-1 hover:border-[#112b4d] hover:shadow-[5px_6px_0_#112b4d]" href={`/r/${report.id}`} key={report.id}><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#e84b20] text-white"><FileText size={22} /></span><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${report.unlocked ? "bg-[#a9c9a9]" : "bg-[#f6a913]"}`}>{report.unlocked ? "Unlocked" : "Preview"}</span></div><h2 className="display mt-6 text-3xl font-black">{report.chatName}</h2><p className="mt-3 text-sm text-[#3b4d5f]">{report.messageCount.toLocaleString()} messages · {report.participantCount} participants</p><div className="mt-6 flex items-center justify-between border-t border-[#112b4d]/10 pt-4 text-xs font-bold text-[#3b4d5f]"><span className="flex items-center gap-2">{report.deliveryStatus ? <MessageCircleMore size={15} /> : <LockKeyhole size={15} />}{report.deliveryStatus ? `WhatsApp ${report.deliveryStatus.toLowerCase()}` : "Private"}</span><ArrowRight className="transition group-hover:translate-x-1" size={18} /></div></Link>)}</div>}</div></main>;
}
