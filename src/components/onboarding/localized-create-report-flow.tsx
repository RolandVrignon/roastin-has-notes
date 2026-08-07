"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { strFromU8, unzipSync } from "fflate";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, FileArchive, Heart, LoaderCircle, LockKeyhole, MessageCircle, Smile, Sparkles, Upload, Users, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { parseWhatsApp } from "@/lib/whatsapp";

type ChatType = "partner" | "friends" | "best-friend" | "family" | "work" | "other";

const typeDefinitions: Array<{ value: ChatType; icon: typeof Heart }> = [
  { value: "friends", icon: Users }, { value: "partner", icon: Heart }, { value: "best-friend", icon: Smile },
  { value: "family", icon: Users }, { value: "work", icon: BriefcaseBusiness }, { value: "other", icon: MessageCircle },
];

const sampleChat = `[12/05/2026, 09:12] Maya: Are we actually booking Lisbon or just liking TikToks about it?
[12/05/2026, 09:14] Jules: I am 100% in
[12/05/2026, 09:14] Theo: Same
[12/05/2026, 09:16] Maya: Great. Dates?
[12/05/2026, 11:42] Theo: June could work
[12/05/2026, 11:45] Maya: June has 30 days Theodore
[12/05/2026, 11:46] Jules: hahaha
[12/05/2026, 11:48] Maya: I have made a poll
[14/05/2026, 18:03] Maya: The poll has been seen by everyone and answered by me
[14/05/2026, 18:04] Jules: Sorry doing it now
[14/05/2026, 18:20] Theo: On my way
[14/05/2026, 18:21] Maya: To the poll?`;

export function LocalizedCreateReportFlow({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.onboarding;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [chatType, setChatType] = useState<ChatType>("friends");
  const [context, setContext] = useState("");
  const [chatName, setChatName] = useState("The Usual Suspects");
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const parsed = useMemo(() => rawText ? parseWhatsApp(rawText) : null, [rawText]);
  const totalSteps = 5;

  async function readFile(file: File) {
    setError("");
    const extension = file.name.toLowerCase().split(".").pop();
    if (extension !== "txt" && extension !== "zip") return setError(copy.errors.format);
    if (file.size > 2_000_000) return setError(copy.errors.size);
    let text: string;
    if (extension === "zip") {
      try {
        const archive = unzipSync(new Uint8Array(await file.arrayBuffer()));
        const textEntry = Object.entries(archive).find(([name]) => name.toLowerCase().endsWith(".txt"));
        if (!textEntry) throw new Error("missing text export");
        text = strFromU8(textEntry[1]);
      } catch { return setError(copy.errors.archive); }
    } else text = await file.text();
    const result = parseWhatsApp(text);
    if (result.messages.length < 8 || result.participants.length < 2) return setError(copy.errors.short);
    setRawText(text);
    setFileName(file.name);
    setParticipantNames(Object.fromEntries(result.participants.map(({ name }) => [name, name])));
  }

  function useSample() {
    const sample = parseWhatsApp(sampleChat);
    setRawText(sampleChat); setFileName("lisbon-planning-committee.txt"); setChatName("The Lisbon Planning Committee"); setParticipantNames(Object.fromEntries(sample.participants.map(({ name }) => [name, name]))); setError("");
  }

  async function generate() {
    if (!rawText) return;
    setLoading(true); setError("");
    try {
      const participantAliases = parsed?.participants.map(({ name }) => ({ sourceName: name, displayName: (participantNames[name] ?? name).trim() })) ?? [];
      const response = await fetch("/api/reports/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatName, chatType, context, locale, participantAliases, rawText }) });
      const payload = await response.json() as { reportId?: string; error?: string };
      if (!response.ok || !payload.reportId) throw new Error(payload.error ?? copy.errors.generation);
      setRawText("");
      router.push(`/r/${payload.reportId}?lang=${locale}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : copy.errors.generation); setLoading(false); }
  }

  const resolvedParticipantNames = parsed?.participants.map(({ name }) => (participantNames[name] ?? name).trim()) ?? [];
  const participantNamesValid = resolvedParticipantNames.every((name) => name.length > 0 && name.length <= 40)
    && new Set(resolvedParticipantNames.map((name) => name.toLocaleLowerCase("en"))).size === resolvedParticipantNames.length;
  const canContinue = step === 3 ? Boolean(rawText && parsed && parsed.messages.length >= 8) : step === 4 ? Boolean(chatName.trim() && participantNamesValid) : true;

  return (
    <main className="min-h-screen bg-[#fffaf0]" lang={locale}>
      <header className="border-b border-[#112b4d]/10 bg-[#f8efd9]"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5"><Logo href={localizedPath(locale)} /><Link aria-label={copy.close} className="grid size-10 place-items-center rounded-full hover:bg-[#112b4d]/5" href={localizedPath(locale)}><X aria-hidden="true" size={21} /></Link></div></header>
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-7 md:pt-10">
        <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[.15em] text-[#e84b20]">{copy.step} {step} {copy.of} {totalSteps}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#112b4d]/10"><div className="h-full rounded-full bg-[#e84b20] transition-all duration-500" style={{ width: `${step / totalSteps * 100}%` }} /></div></div>
        <section className="mt-10 min-h-[510px]">
          {step === 1 && <><StepTitle eyebrow={copy.types.eyebrow} text={copy.types.text} title={copy.types.title} /><div className="grid gap-3 sm:grid-cols-2">{typeDefinitions.map(({ value, icon: Icon }) => { const option = copy.types.options[value]; return <button className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${chatType === value ? "border-[#e84b20] bg-[#f8efd9] shadow-[4px_5px_0_#112b4d]" : "border-[#112b4d]/15 bg-white hover:border-[#112b4d]/40"}`} key={value} onClick={() => setChatType(value)} type="button"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${chatType === value ? "bg-[#e84b20] text-white" : "bg-[#112b4d]/5"}`}><Icon aria-hidden="true" size={20} /></span><span><strong className="block">{option.label}</strong><span className="mt-1 block text-sm text-[#3b4d5f]">{option.detail}</span></span>{chatType === value && <Check aria-hidden="true" className="ml-auto text-[#e84b20]" size={19} strokeWidth={3} />}</button>; })}</div></>}
          {step === 2 && <><StepTitle eyebrow={copy.context.eyebrow} text={copy.context.text} title={copy.context.title} /><textarea className="min-h-44 w-full resize-none rounded-3xl border-2 border-[#112b4d]/20 bg-white p-6 text-lg outline-none placeholder:text-[#3b4d5f]/45 focus:border-[#e84b20]" maxLength={500} onChange={(event) => setContext(event.target.value)} placeholder={copy.context.placeholder} value={context} /><div className="mt-3 text-right text-xs font-bold text-[#3b4d5f]">{context.length}/500</div></>}
          {step === 3 && <><StepTitle eyebrow={copy.upload.eyebrow} text={copy.upload.text} title={copy.upload.title} />{parsed ? <div className="rounded-3xl border-2 border-[#112b4d] bg-[#f8efd9] p-6 shadow-[6px_7px_0_#112b4d]"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl bg-[#a9c9a9]"><FileArchive aria-hidden="true" size={23} /></span><div className="min-w-0"><strong className="block truncate">{fileName}</strong><span className="text-sm text-[#3b4d5f]">{parsed.messages.length.toLocaleString(locale)} {copy.upload.messages} · {parsed.participants.length} {copy.upload.participants}</span></div><Check aria-hidden="true" className="ml-auto text-[#e84b20]" strokeWidth={3} /></div><button className="mt-5 text-sm font-black text-[#e84b20] underline" onClick={() => fileRef.current?.click()} type="button">{copy.upload.replace}</button></div> : <button className="group flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#112b4d]/35 bg-[#f8efd9]/50 p-8 text-center hover:border-[#e84b20]" onClick={() => fileRef.current?.click()} type="button"><span className="grid size-16 place-items-center rounded-2xl bg-[#e84b20] text-white shadow-[4px_5px_0_#112b4d]"><Upload aria-hidden="true" size={28} /></span><strong className="mt-6 text-lg">{copy.upload.choose}</strong><span className="mt-2 text-sm text-[#3b4d5f]">{copy.upload.limits}</span></button>}<input accept=".txt,.zip,text/plain,application/zip" className="hidden" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} ref={fileRef} type="file" />{error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}<div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row"><span className="flex items-center gap-2 text-xs font-bold text-[#3b4d5f]"><LockKeyhole aria-hidden="true" size={15} />{copy.upload.privacy}</span><button className="text-sm font-black text-[#e84b20] underline" onClick={useSample} type="button">{copy.upload.sample}</button></div></>}
          {step === 4 && <><StepTitle eyebrow={copy.review.eyebrow} text={copy.review.text} title={copy.review.title} /><label className="text-xs font-black uppercase tracking-[.13em] text-[#3b4d5f]">{copy.review.chatName}<input className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-lg font-bold outline-none focus:border-[#e84b20]" maxLength={80} onChange={(event) => setChatName(event.target.value)} value={chatName} /></label><div className="mt-7 space-y-3">{parsed?.participants.map((participant, index) => { const displayName = participantNames[participant.name] ?? participant.name; return <label className="flex items-center gap-4 rounded-2xl border border-[#112b4d]/15 bg-white p-4" key={participant.name}><span className={`grid size-10 shrink-0 place-items-center rounded-full font-black ${["bg-[#f6a913]", "bg-[#a9c9a9]", "bg-[#e84b20] text-white"][index % 3]}`}>{(displayName || participant.name).charAt(0).toUpperCase()}</span><span className="sr-only">{copy.review.participantName}: {participant.name}</span><input aria-label={`${copy.review.participantName}: ${participant.name}`} className="min-w-0 flex-1 rounded-xl border border-[#112b4d]/15 bg-[#fffaf0] px-3 py-2 font-black outline-none focus:border-[#e84b20]" maxLength={40} onChange={(event) => setParticipantNames((current) => ({ ...current, [participant.name]: event.target.value }))} value={displayName} /><span className="shrink-0 text-sm font-bold text-[#3b4d5f]">{participant.messageCount.toLocaleString(locale)} · {participant.share}%</span></label>; })}</div>{parsed && !participantNamesValid && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{copy.review.invalidNames}</p>}</>}
          {step === 5 && <div className="text-center"><span className="starburst mx-auto grid size-20 place-items-center text-3xl text-white">✦</span><h1 className="display mx-auto mt-7 max-w-2xl text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">{copy.launch.ready} <span className="text-[#e84b20]">{chatName}</span>.</h1><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#3b4d5f]">{parsed?.messages.length.toLocaleString(locale)} {copy.launch.messages}. {parsed?.participants.length} {copy.launch.protagonists}. {copy.launch.warning}</p><div className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-3">{copy.launch.cards.map((item, index) => <div className="rounded-2xl border border-[#112b4d]/15 bg-[#f8efd9] px-3 py-5" key={item}><span className="display text-2xl font-black text-[#e84b20]">0{index + 1}</span><strong className="mt-1 block text-sm">{item}</strong></div>)}</div><label className="mx-auto mt-7 flex max-w-xl cursor-pointer items-start gap-3 rounded-2xl border border-[#112b4d]/15 bg-white p-4 text-left text-sm leading-6 text-[#3b4d5f]"><input checked={confirmedAdult} className="mt-1 size-4 accent-[#e84b20]" onChange={(event) => setConfirmedAdult(event.target.checked)} type="checkbox" /><span>{copy.launch.consent}</span></label>{loading && <p className="mt-8 animate-pulse font-bold text-[#e84b20]">{copy.launch.loading}</p>}</div>}
        </section>
        {error && step !== 3 && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}
        <div className="flex items-center justify-between border-t border-[#112b4d]/15 pt-6"><button className="btn btn-ghost" disabled={step === 1 || loading} onClick={() => setStep((current) => current - 1)} type="button"><ArrowLeft aria-hidden="true" size={18} />{copy.back}</button>{step < totalSteps ? <button className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} type="button">{copy.continue}<ArrowRight aria-hidden="true" size={18} /></button> : <button className="btn btn-primary min-w-48 disabled:cursor-not-allowed disabled:opacity-40" disabled={loading || !confirmedAdult} onClick={generate} type="button">{loading ? <><LoaderCircle aria-hidden="true" className="animate-spin" size={19} />{copy.launch.loading}</> : <>{copy.launch.cta}<Sparkles aria-hidden="true" size={18} /></>}</button>}</div>
      </div>
    </main>
  );
}

function StepTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mb-9"><span className="eyebrow">{eyebrow}</span><h1 className="display mt-4 text-4xl font-black leading-[.98] tracking-[-.04em] md:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#3b4d5f]">{text}</p></div>;
}
