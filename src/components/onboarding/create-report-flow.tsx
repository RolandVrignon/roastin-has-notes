"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { strFromU8, unzipSync } from "fflate";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, FileArchive, Heart, LoaderCircle, LockKeyhole, MessageCircle, Smile, Sparkles, Upload, Users, X } from "lucide-react";
import { InlineWhatsappAuth } from "@/components/account/inline-whatsapp-auth";
import { Logo } from "@/components/brand/logo";
import { parseWhatsApp } from "@/lib/whatsapp";

type ChatType = "partner" | "friends" | "best-friend" | "family" | "work" | "other";

const chatTypes: Array<{ value: ChatType; label: string; detail: string; icon: typeof Heart }> = [
  { value: "friends", label: "Friends group", detail: "The beautiful chaos", icon: Users },
  { value: "partner", label: "Partner or crush", detail: "Read at your own risk", icon: Heart },
  { value: "best-friend", label: "Best friend", detail: "A two-person institution", icon: Smile },
  { value: "family", label: "Family", detail: "Generational lore included", icon: Users },
  { value: "work", label: "Work or team", detail: "Professionally unprofessional", icon: BriefcaseBusiness },
  { value: "other", label: "Something else", detail: "Roastin will figure it out", icon: MessageCircle },
];

const verificationCopy = { eyebrow: "One last step", title: "Keep your report.", text: "Verify your WhatsApp number now so we can create your report and send its private link after payment.", phoneLabel: "WhatsApp number", consent: "I agree to receive the verification code and transactional report links on WhatsApp. No marketing messages.", sendCode: "Send code on WhatsApp", codeTitle: "Check WhatsApp.", codeText: "We sent a six-digit verification code to {phone}.", codeLabel: "Six-digit code", verifyAndLaunch: "Verify and create my report", differentNumber: "Use a different number" };

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
[14/05/2026, 18:21] Maya: To the poll?
[14/05/2026, 18:21] Jules: hahaha
[17/05/2026, 10:07] Theo: Wait Lisbon is actually happening?
[17/05/2026, 10:08] Maya: I need a new group chat.`;

export function CreateReportFlow({ initiallyAuthenticated }: { initiallyAuthenticated: boolean }) {
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
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const parsed = useMemo(() => rawText ? parseWhatsApp(rawText) : null, [rawText]);
  const totalSteps = 5;

  async function readFile(file: File) {
    setError("");
    const extension = file.name.toLowerCase().split(".").pop();
    if (extension !== "txt" && extension !== "zip") {
      setError("Choose a WhatsApp .txt export or its .zip archive.");
      return;
    }
    if (file.size > 2_000_000) {
      setError("This beta accepts conversations up to 2 MB.");
      return;
    }
    let text: string;
    if (extension === "zip") {
      try {
        const archive = unzipSync(new Uint8Array(await file.arrayBuffer()));
        const textEntry = Object.entries(archive).find(([name]) => name.toLowerCase().endsWith(".txt"));
        if (!textEntry) throw new Error("missing text export");
        text = strFromU8(textEntry[1]);
      } catch {
        setError("This archive does not contain a readable WhatsApp text export.");
        return;
      }
    } else {
      text = await file.text();
    }
    const result = parseWhatsApp(text);
    if (result.messages.length < 8 || result.participants.length < 2) {
      setError("We could not find enough messages. Choose an unedited WhatsApp text export.");
      return;
    }
    setRawText(text);
    setFileName(file.name);
    setParticipantNames(Object.fromEntries(result.participants.map(({ name }) => [name, name])));
  }

  function useSample() {
    const sample = parseWhatsApp(sampleChat);
    setRawText(sampleChat);
    setFileName("lisbon-planning-committee.txt");
    setChatName("The Lisbon Planning Committee");
    setParticipantNames(Object.fromEntries(sample.participants.map(({ name }) => [name, name])));
    setError("");
  }

  async function generate() {
    if (!rawText) return;
    setLoading(true);
    setError("");
    try {
      const participantAliases = parsed?.participants.map(({ name }) => ({ sourceName: name, displayName: (participantNames[name] ?? name).trim() })) ?? [];
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatName, chatType, context, locale: "en", participantAliases, rawText }),
      });
      const payload = await response.json() as { reportId?: string; error?: string };
      if (response.status === 401) { setAuthenticated(false); setError("Your session expired. Verify your WhatsApp number to continue."); setLoading(false); return; }
      if (!response.ok || !payload.reportId) throw new Error(payload.error ?? "Report generation failed");
      setRawText("");
      router.push(`/r/${payload.reportId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Report generation failed");
      setLoading(false);
    }
  }

  function canContinue() {
    if (step === 1) return Boolean(rawText && parsed && parsed.messages.length >= 8);
    if (step === 4) {
      const names = parsed?.participants.map(({ name }) => (participantNames[name] ?? name).trim()) ?? [];
      return chatName.trim().length > 0 && names.every((name) => name.length > 0 && name.length <= 40)
        && new Set(names.map((name) => name.toLocaleLowerCase("en"))).size === names.length;
    }
    return true;
  }

  return (
    <main className="min-h-screen bg-[#fffaf0]">
      <header className="border-b border-[#112b4d]/10 bg-[#f8efd9]">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5">
          <Logo />
          <Link className="grid size-10 place-items-center rounded-full hover:bg-[#112b4d]/5" href="/"><X size={21} /><span className="sr-only">Close</span></Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-16 pt-7 md:pt-10">
        <div className="flex items-center gap-4">
          <span className="text-xs font-black uppercase tracking-[.15em] text-[#e84b20]">Step {step} of {totalSteps}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#112b4d]/10"><div className="h-full rounded-full bg-[#e84b20] transition-all duration-500" style={{ width: `${step / totalSteps * 100}%` }} /></div>
        </div>

        <section className="mt-10 min-h-[510px]">
          {step === 1 && <UploadStep error={error} fileName={fileName} inputRef={fileRef} onFile={readFile} onSample={useSample} parsed={parsed} />}
          {step === 2 && <ChatTypeStep value={chatType} onChange={setChatType} />}
          {step === 3 && <ContextStep value={context} onChange={setContext} />}
          {step === 4 && <ReviewStep chatName={chatName} onChatName={setChatName} onParticipantName={(sourceName, displayName) => setParticipantNames((current) => ({ ...current, [sourceName]: displayName }))} parsed={parsed} participantNames={participantNames} />}
          {step === 5 && <><LaunchStep chatName={chatName} confirmedAdult={confirmedAdult} loading={loading} onConfirmedAdult={setConfirmedAdult} parsed={parsed} />{!authenticated && <InlineWhatsappAuth copy={verificationCopy} launchReady={confirmedAdult} onVerified={async () => { setAuthenticated(true); await generate(); }} />}</>}
        </section>

        {error && step !== 1 && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}
        <div className="flex items-center justify-between border-t border-[#112b4d]/15 pt-6">
          <button className="btn btn-ghost" disabled={step === 1 || loading} onClick={() => setStep((current) => current - 1)} type="button"><ArrowLeft size={18} /> Back</button>
          {step < totalSteps ? (
            <button className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!canContinue()} onClick={() => setStep((current) => current + 1)} type="button">Continue <ArrowRight size={18} /></button>
          ) : authenticated ? (
            <button className="btn btn-primary min-w-48 disabled:cursor-not-allowed disabled:opacity-40" disabled={loading || !confirmedAdult} onClick={generate} type="button">{loading ? <><LoaderCircle className="animate-spin" size={19} /> Writing the report</> : <>Let Roastin cook <Sparkles size={18} /></>}</button>
          ) : <span />}
        </div>
      </div>
    </main>
  );
}

function StepTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mb-9"><span className="eyebrow">{eyebrow}</span><h1 className="display mt-4 text-4xl font-black leading-[.98] tracking-[-.04em] md:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#3b4d5f]">{text}</p></div>;
}

function ChatTypeStep({ value, onChange }: { value: ChatType; onChange: (value: ChatType) => void }) {
  return <><StepTitle eyebrow="Set the scene" title="What kind of chat are we dealing with?" text="Different groups have different laws of physics. This helps Roastin read the room." /><div className="grid gap-3 sm:grid-cols-2">{chatTypes.map(({ value: option, label, detail, icon: Icon }) => <button className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${value === option ? "border-[#e84b20] bg-[#f8efd9] shadow-[4px_5px_0_#112b4d]" : "border-[#112b4d]/15 bg-white hover:border-[#112b4d]/40"}`} key={option} onClick={() => onChange(option)} type="button"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${value === option ? "bg-[#e84b20] text-white" : "bg-[#112b4d]/5"}`}><Icon size={20} /></span><span><strong className="block">{label}</strong><span className="mt-1 block text-sm text-[#3b4d5f]">{detail}</span></span>{value === option && <Check className="ml-auto text-[#e84b20]" size={19} strokeWidth={3} />}</button>)}</div></>;
}

function ContextStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <><StepTitle eyebrow="Optional context" title="Anything Roastin should know?" text="A sentence is enough. Skip this if the messages speak for themselves." /><textarea className="min-h-44 w-full resize-none rounded-3xl border-2 border-[#112b4d]/20 bg-white p-6 text-lg outline-none placeholder:text-[#3b4d5f]/45 focus:border-[#e84b20]" maxLength={500} onChange={(event) => onChange(event.target.value)} placeholder="We have known each other since university, and somehow every holiday plan becomes a six-week negotiation..." value={value} /><div className="mt-3 text-right text-xs font-bold text-[#3b4d5f]">{value.length}/500</div></>;
}

function UploadStep({ error, fileName, inputRef, onFile, onSample, parsed }: { error: string; fileName: string; inputRef: React.RefObject<HTMLInputElement | null>; onFile: (file: File) => void; onSample: () => void; parsed: ReturnType<typeof parseWhatsApp> | null }) {
  return <><StepTitle eyebrow="The receipts" title="Drop your WhatsApp export." text="Choose the .txt file or .zip archive from an export without media. Parsing happens in your browser before anything is sent." />{parsed ? <div className="rounded-3xl border-2 border-[#112b4d] bg-[#f8efd9] p-6 shadow-[6px_7px_0_#112b4d]"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl bg-[#a9c9a9]"><FileArchive size={23} /></span><div className="min-w-0"><strong className="block truncate">{fileName}</strong><span className="text-sm text-[#3b4d5f]">{parsed.messages.length.toLocaleString()} messages · {parsed.participants.length} participants</span></div><Check className="ml-auto text-[#e84b20]" strokeWidth={3} /></div><button className="mt-5 text-sm font-black text-[#e84b20] underline" onClick={() => inputRef.current?.click()} type="button">Choose a different file</button></div> : <button className="group flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#112b4d]/35 bg-[#f8efd9]/50 p-8 text-center hover:border-[#e84b20] hover:bg-[#f8efd9]" onClick={() => inputRef.current?.click()} type="button"><span className="grid size-16 place-items-center rounded-2xl bg-[#e84b20] text-white shadow-[4px_5px_0_#112b4d] transition-transform group-hover:-translate-y-1"><Upload size={28} /></span><strong className="mt-6 text-lg">Choose your .txt or .zip export</strong><span className="mt-2 text-sm text-[#3b4d5f]">Maximum 2 MB · No media files</span></button>}<input accept=".txt,.zip,text/plain,application/zip" className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} ref={inputRef} type="file" />{error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}<div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row"><span className="flex items-center gap-2 text-xs font-bold text-[#3b4d5f]"><LockKeyhole size={15} /> Original chat deleted after generation</span><button className="text-sm font-black text-[#e84b20] underline" onClick={onSample} type="button">Try the sample chat instead</button></div></>;
}

function ReviewStep({ chatName, onChatName, onParticipantName, parsed, participantNames }: { chatName: string; onChatName: (value: string) => void; onParticipantName: (sourceName: string, displayName: string) => void; parsed: ReturnType<typeof parseWhatsApp> | null; participantNames: Record<string, string> }) {
  const names = parsed?.participants.map(({ name }) => (participantNames[name] ?? name).trim()) ?? [];
  const valid = names.every((name) => name.length > 0 && name.length <= 40) && new Set(names.map((name) => name.toLocaleLowerCase("en"))).size === names.length;
  return <><StepTitle eyebrow="Cast of characters" title="Make sure we got the room right." text="Use first names or nicknames. These are the names that will appear in your report." /><label className="text-xs font-black uppercase tracking-[.13em] text-[#3b4d5f]">Chat name<input className="mt-2 block w-full rounded-2xl border-2 border-[#112b4d]/20 bg-white px-5 py-4 text-lg font-bold outline-none focus:border-[#e84b20]" maxLength={80} onChange={(event) => onChatName(event.target.value)} value={chatName} /></label><div className="mt-7 space-y-3">{parsed?.participants.map((participant, index) => { const displayName = participantNames[participant.name] ?? participant.name; return <label className="flex items-center gap-4 rounded-2xl border border-[#112b4d]/15 bg-white p-4" key={participant.name}><span className={`grid size-10 shrink-0 place-items-center rounded-full font-black ${["bg-[#f6a913]", "bg-[#a9c9a9]", "bg-[#e84b20] text-white"][index % 3]}`}>{(displayName || participant.name).charAt(0).toUpperCase()}</span><span className="sr-only">Display name for {participant.name}</span><input aria-label={`Display name for ${participant.name}`} className="min-w-0 flex-1 rounded-xl border border-[#112b4d]/15 bg-[#fffaf0] px-3 py-2 font-black outline-none focus:border-[#e84b20]" maxLength={40} onChange={(event) => onParticipantName(participant.name, event.target.value)} value={displayName} /><span className="shrink-0 text-sm font-bold text-[#3b4d5f]">{participant.messageCount.toLocaleString()} · {participant.share}%</span></label>; })}</div>{parsed && !valid && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">Each participant needs a unique first name or nickname.</p>}</>;
}

function LaunchStep({ chatName, confirmedAdult, loading, onConfirmedAdult, parsed }: { chatName: string; confirmedAdult: boolean; loading: boolean; onConfirmedAdult: (value: boolean) => void; parsed: ReturnType<typeof parseWhatsApp> | null }) {
  return <div className="text-center"><span className="starburst mx-auto grid size-20 place-items-center text-3xl text-white">✦</span><h1 className="display mx-auto mt-7 max-w-2xl text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">Roastin is ready for <span className="text-[#e84b20]">{chatName}</span>.</h1><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#3b4d5f]">{parsed?.messages.length.toLocaleString()} messages. {parsed?.participants.length} protagonists. Absolutely no idea what they are about to learn.</p><div className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-3">{["Patterns", "Portraits", "Verdict"].map((item, index) => <div className="rounded-2xl border border-[#112b4d]/15 bg-[#f8efd9] px-3 py-5" key={item}><span className="display text-2xl font-black text-[#e84b20]">0{index + 1}</span><strong className="mt-1 block text-sm">{item}</strong></div>)}</div><label className="mx-auto mt-7 flex max-w-xl cursor-pointer items-start gap-3 rounded-2xl border border-[#112b4d]/15 bg-white p-4 text-left text-sm leading-6 text-[#3b4d5f]"><input checked={confirmedAdult} className="mt-1 size-4 accent-[#e84b20]" onChange={(event) => onConfirmedAdult(event.target.checked)} type="checkbox" /><span>I confirm that I am 18+, that this conversation does not involve minors, and that I consent to its temporary processing and deletion after generation.</span></label>{loading && <p className="mt-8 animate-pulse font-bold text-[#e84b20]">Reading between the lines. This can take a minute…</p>}</div>;
}
