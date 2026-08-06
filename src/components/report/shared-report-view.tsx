"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { reportSchema, type RoastReport } from "@/domain/report";
import { FullReport } from "@/components/report/report-view";

export function SharedReportView({ token }: { token: string }) {
  const [report, setReport] = useState<RoastReport | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/shared/${encodeURIComponent(token)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { report?: RoastReport };
        if (!response.ok || !payload.report) throw new Error("missing");
        setReport(reportSchema.parse(payload.report));
      })
      .catch((error) => { if (error instanceof Error && error.name !== "AbortError") setMissing(true); });
    return () => controller.abort();
  }, [token]);

  if (missing) return <main className="grid min-h-screen place-items-center px-5 text-center"><div><h1 className="display text-5xl font-black">The invitation expired.</h1><p className="mt-4 text-[#3b4d5f]">Ask the report owner for a fresh link.</p><Link className="btn btn-primary mt-8" href="/create">Make your own report</Link></div></main>;
  if (!report) return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#e84b20]" size={36} /></main>;
  return <main className="min-h-screen bg-[#fffaf0]"><header className="border-b border-[#112b4d]/10 bg-[#f8efd9]"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5"><Logo /><span className="flex items-center gap-2 text-xs font-bold text-[#3b4d5f]"><LockKeyhole size={14} /> Shared private report</span></div></header><section className="bg-[#f8efd9] px-5 py-16 text-center"><span className="eyebrow">Shared from {report.chatName}</span><h1 className="display mx-auto mt-6 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.05em] md:text-8xl">{report.title}</h1><p className="display mx-auto mt-6 max-w-2xl text-xl font-semibold italic text-[#3b4d5f]">{report.subtitle}</p></section><FullReport report={report} /></main>;
}
