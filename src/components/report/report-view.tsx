"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Award, Check, Flag, LoaderCircle, LockKeyhole, MessageCircleMore, RotateCcw, Settings, Share2, Sparkles, Star, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { reportSchema, type RoastReport } from "@/domain/report";
import { reportUi, type ReportUi } from "@/i18n/report-ui";
import { WhatsappDeliveryCard } from "@/components/report/whatsapp-delivery-card";
import { WhatsappMessage } from "@/components/report/whatsapp-message";
import { buildPortraitBlocks } from "@/lib/portrait-layout";

export function ReportView({ reportId }: { reportId: string }) {
  const search = useSearchParams();
  const [report, setReport] = useState<RoastReport | null>(null);
  const [missing, setMissing] = useState(false);
  const [generation, setGeneration] = useState<{ status: string; stage: string; progress: number; errorCode?: string | null }>({ status: "GENERATING", stage: "QUEUED", progress: 5 });
  const [unlocked, setUnlocked] = useState(false);
  const [offer, setOffer] = useState<{ formattedPrice: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [copied, setCopied] = useState(false);
  const ui = reportUi(report?.locale ?? search.get("lang"));

  useEffect(() => {
    const sessionId = search.get("session_id");
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      try {
        const statusResponse = await fetch(`/api/reports/${reportId}/status`, { cache: "no-store", signal: controller.signal });
        const statusPayload = await statusResponse.json() as { status?: string; stage?: string; progress?: number; errorCode?: string | null };
        if (!statusResponse.ok || !statusPayload.status || !statusPayload.stage || typeof statusPayload.progress !== "number") throw new Error("missing");
        setGeneration({ status: statusPayload.status, stage: statusPayload.stage, progress: statusPayload.progress, errorCode: statusPayload.errorCode });
        if (statusPayload.status === "FAILED") return;
        if (statusPayload.status !== "READY") {
          timer = setTimeout(load, 1_500);
          return;
        }

        const response = await fetch(`/api/reports/${reportId}${query}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json() as { report?: RoastReport; unlocked?: boolean; offer?: { formattedPrice: string } };
        if (!response.ok || !payload.report) throw new Error("missing");
        setReport(reportSchema.parse(payload.report));
        setUnlocked(Boolean(payload.unlocked));
        setOffer(payload.offer ?? null);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") setMissing(true);
      }
    }

    void load();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [reportId, search]);

  async function checkout() {
    setCheckoutLoading(true);
    setCheckoutError("");
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId }) });
    const payload = await response.json() as { checkoutUrl?: string; error?: string };
    if (payload.checkoutUrl) window.location.href = payload.checkoutUrl;
    else { setCheckoutError(payload.error ?? "Checkout could not be started"); setCheckoutLoading(false); }
  }

  async function share() {
    if (!unlocked) return;
    const response = await fetch(`/api/reports/${reportId}/share`, { method: "POST" });
    const payload = await response.json() as { shareUrl?: string };
    if (!payload.shareUrl) return;
    if (navigator.share) await navigator.share({ title: report?.title ?? "Roastin Has Notes", text: "The AI analysed our chat and this is way too accurate 😭", url: payload.shareUrl });
    else { await navigator.clipboard.writeText(payload.shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  }

  if (missing) return <main className="grid min-h-screen place-items-center px-5 text-center"><div><span className="starburst mx-auto grid size-20 place-items-center text-3xl text-white">?</span><h1 className="display mt-7 text-5xl font-black">This report left the group chat.</h1><p className="mt-4 text-[#3b4d5f]">It may have been deleted or created in another browser.</p><Link className="btn btn-primary mt-8" href="/create">Create a new report <RotateCcw size={18} /></Link></div></main>;
  if (generation.status === "FAILED") return <main className="grid min-h-screen place-items-center px-5 text-center"><div className="max-w-xl"><span className="starburst mx-auto grid size-20 place-items-center text-3xl text-white">!</span><h1 className="display mt-7 text-5xl font-black">{ui.failedTitle}</h1><p className="mt-4 text-[#3b4d5f]">{ui.failedBody}</p><Link className="btn btn-primary mt-8" href={`/${report?.locale ?? search.get("lang") ?? "en"}/create`}>{ui.tryAgain} <RotateCcw size={18} /></Link></div></main>;
  if (!report) return <main className="grid min-h-screen place-items-center px-5"><div className="w-full max-w-md text-center"><LoaderCircle className="mx-auto animate-spin text-[#e84b20]" size={40} /><span className="eyebrow mt-7">{generation.stage.toLowerCase()}</span><h1 className="display mt-5 text-4xl font-black">{ui.generatingTitle}</h1><p className="mt-4 text-[#3b4d5f]">{ui.generatingBody}</p><div className="mt-8 h-3 overflow-hidden rounded-full bg-[#112b4d]/10"><div className="h-full rounded-full bg-[#e84b20] transition-[width] duration-500" style={{ width: `${generation.progress}%` }} /></div></div></main>;

  return (
    <main className="min-h-screen bg-[#fffaf0]">
      <header className="sticky top-0 z-30 border-b border-[#112b4d]/10 bg-[#f8efd9]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5"><Logo href={`/${report.locale}`} /><div className="flex items-center gap-2"><span className="hidden items-center gap-2 text-xs font-bold text-[#3b4d5f] sm:flex"><LockKeyhole size={14} /> {ui.privateReport}</span>{unlocked && <><Link aria-label="Report settings" className="btn btn-cream min-h-10 px-3" href={`/reports/${reportId}/settings`}><Settings size={17} /></Link><button className="btn btn-cream min-h-10 px-4 text-sm" onClick={share} type="button">{copied ? <Check size={17} /> : <Share2 size={17} />} {copied ? ui.copied : ui.share}</button></>}</div></div>
      </header>

      <article>
        <section className="border-b border-[#112b4d]/15 bg-[#f8efd9] px-5 pb-20 pt-14 text-center md:pb-28 md:pt-20">
          <div className="mx-auto max-w-4xl"><span className="eyebrow">{ui.classic} · {report.stats.dateRange}</span><h1 className="display mt-7 text-5xl font-black leading-[.9] tracking-[-.055em] md:text-8xl">{report.title}</h1><p className="display mx-auto mt-7 max-w-2xl text-xl font-semibold italic leading-8 text-[#3b4d5f] md:text-2xl">{report.subtitle}</p><div className="mx-auto mt-10 flex max-w-xl justify-center divide-x divide-[#112b4d]/20 rounded-2xl border border-[#112b4d]/15 bg-[#fffaf0] py-5">{[[report.stats.messageCount.toLocaleString(report.locale), ui.messages], [String(report.stats.participantCount), ui.protagonists], ["100%", ui.calledOut]].map(([value, label]) => <div className="flex-1 px-3" key={label}><strong className="display block text-2xl font-black text-[#e84b20]">{value}</strong><span className="text-[10px] font-black uppercase tracking-[.12em]">{label}</span></div>)}</div></div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 md:py-24"><span className="eyebrow">{ui.opening}</span><p className="mt-7 text-lg font-medium leading-[1.65] text-[#223b59] md:text-xl">{report.opening}</p></section>

        <section className="border-y border-[#112b4d]/15 bg-[#f8efd9] py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5"><div className="flex items-end justify-between"><div><span className="eyebrow">{ui.cast}</span><h2 className="display mt-4 text-5xl font-black tracking-[-.045em] md:text-6xl">{ui.portraits}</h2></div><Users className="hidden text-[#e84b20] md:block" size={48} /></div><div className="mt-10 space-y-6">{report.participants.slice(0, unlocked ? undefined : 2).map((participant, index) => <section className="overflow-hidden rounded-3xl border-2 border-[#112b4d] bg-[#fffaf0] shadow-[6px_7px_0_#112b4d]" key={participant.name}><div className={`h-3 ${["bg-[#e84b20]", "bg-[#f6a913]", "bg-[#a9c9a9]"][index % 3]}`} /><div className="p-7 md:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[.15em] text-[#e84b20]">Portrait {String(index + 1).padStart(2, "0")}</span><h3 className="display mt-2 text-4xl font-black md:text-5xl">{participant.name}</h3></div><span className="rounded-full bg-[#112b4d] px-4 py-2 text-xs font-black uppercase tracking-wide text-white">{participant.title}</span></div><ParticipantPortrait evidence={participant.evidence} name={participant.name} portrait={participant.portrait} /><p className="mt-7 border-t border-[#112b4d]/15 pt-6 font-black text-[#e84b20]">{participant.finalLine}</p></div></section>)}</div></div>
        </section>

        {!unlocked ? <Paywall error={checkoutError} loading={checkoutLoading} onCheckout={checkout} price={offer?.formattedPrice ?? "$12.99"} ui={ui} /> : <><FullReport report={report} ui={ui} /><WhatsappDeliveryCard locale={report.locale} reportId={reportId} /></>}
      </article>
    </main>
  );
}

function ParticipantPortrait({ evidence, name, portrait }: { evidence: string[]; name: string; portrait: string }) {
  return <div className="mt-7 space-y-5">{buildPortraitBlocks(portrait, evidence).map((block, index) => block.type === "text"
    ? <p className="text-lg font-medium leading-[1.65] text-[#223b59] md:text-xl" key={`${name}-text-${index}`}>{block.text}</p>
    : <WhatsappMessage evidence={block.evidence} key={`${name}-evidence-${index}`} />)}</div>;
}

function Paywall({ error, loading, onCheckout, price, ui }: { error: string; loading: boolean; onCheckout: () => void; price: string; ui: ReportUi }) {
  return <section className="relative overflow-hidden bg-[#112b4d] px-5 py-20 text-white md:py-28"><div className="pointer-events-none absolute -right-10 -top-12 size-56 opacity-10 starburst" /><div className="mx-auto max-w-3xl text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e84b20]"><LockKeyhole size={25} /></span><h2 className="display mt-7 text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">{ui.paywallTitle}</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/70">{ui.paywallBody}</p><div className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">{ui.features.map((item) => <span className="flex items-center gap-2 text-sm font-bold" key={item}><Check className="text-[#f6a913]" size={17} strokeWidth={3} />{item}</span>)}</div><div className="mx-auto mt-10 max-w-md rounded-3xl bg-[#fffaf0] p-6 text-[#112b4d]"><div className="flex items-baseline justify-center gap-2"><strong className="display text-5xl font-black">{price}</strong><span className="text-sm font-bold text-[#3b4d5f]">{ui.oneTime}</span></div><p className="mt-2 text-xs font-bold text-[#3b4d5f]">{ui.privateDefault}</p>{error && <p className="mt-4 text-sm font-bold text-red-700">{error}</p>}<button className="btn btn-primary mt-6 w-full" disabled={loading} onClick={onCheckout} type="button">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>{ui.unlock} <ArrowRight size={18} /></>}</button></div></div></section>;
}

export function FullReport({ report, ui = reportUi(report.locale) }: { report: RoastReport; ui?: ReportUi }) {
  return <>
    <section className="mx-auto max-w-4xl px-5 py-20"><SectionHeading icon={Award} kicker={ui.awardsKicker} title={ui.awardsTitle} /><div className="mt-10 grid gap-5 md:grid-cols-3">{report.awards.map((award, index) => <article className="card p-6" key={award.title}><span className="display text-5xl font-black text-[#e84b20]/20">0{index + 1}</span><h3 className="display mt-4 text-2xl font-black">{award.title}</h3><strong className="mt-4 block text-[#e84b20]">{award.winner}</strong><p className="mt-3 text-sm leading-6 text-[#3b4d5f]">{award.reason}</p></article>)}</div></section>
    <section className="border-y border-[#112b4d]/15 bg-[#f8efd9] py-20"><div className="mx-auto max-w-4xl px-5"><SectionHeading icon={MessageCircleMore} kicker={ui.dictionaryKicker} title={ui.dictionaryTitle} /><div className="mt-10 divide-y divide-[#112b4d]/15 border-y border-[#112b4d]/15">{report.dictionary.map((entry) => <div className="grid gap-2 py-6 md:grid-cols-[.35fr_.65fr]" key={entry.term}><strong className="display text-2xl">“{entry.term}”</strong><p className="text-[#3b4d5f]">{entry.meaning}</p></div>)}</div></div></section>
    <section className="mx-auto grid max-w-5xl gap-8 px-5 py-20 md:grid-cols-2"><div><SectionHeading icon={Sparkles} kicker={ui.dynamicsKicker} title={ui.dynamicsTitle} /><div className="mt-8 space-y-4">{report.dynamics.map((item, index) => <p className="flex gap-4 text-lg leading-7" key={item}><span className="display text-2xl font-black text-[#e84b20]">{index + 1}.</span>{item}</p>)}</div></div><div><SectionHeading icon={Flag} kicker={ui.flagsKicker} title={ui.flagsTitle} /><div className="mt-8 space-y-4">{Object.entries(report.flags).map(([colour, flags]) => <div className="rounded-2xl border border-[#112b4d]/15 bg-white p-5" key={colour}><strong className="capitalize">{colour} flags</strong>{flags.map((flag) => <p className="mt-2 text-sm text-[#3b4d5f]" key={flag}>• {flag}</p>)}</div>)}</div></div></section>
    <section className="bg-[#e84b20] px-5 py-20 text-center text-white md:py-28"><Star className="mx-auto text-[#f6a913]" fill="currentColor" size={34} /><span className="mt-5 block text-xs font-black uppercase tracking-[.16em]">{ui.finalKicker}</span><p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-[1.65] md:text-xl">{report.finalVerdict}</p><button className="btn btn-cream mt-10" onClick={() => navigator.share?.({ title: report.title, url: window.location.href })} type="button">{ui.shareGroup} <Share2 size={18} /></button></section>
  </>;
}

function SectionHeading({ icon: Icon, kicker, title }: { icon: typeof Award; kicker: string; title: string }) {
  return <div><span className="eyebrow"><Icon size={16} />{kicker}</span><h2 className="display mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">{title}</h2></div>;
}
