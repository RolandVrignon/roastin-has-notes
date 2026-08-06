import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileUp,
  Fingerprint,
  LockKeyhole,
  MessageCircleMore,
  Mic2,
  Quote,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/site/header";

const steps = [
  { n: "01", icon: FileUp, title: "Drop the receipts", text: "Export your WhatsApp chat and upload the .txt or .zip. It takes about 20 seconds." },
  { n: "02", icon: Sparkles, title: "Roastin takes notes", text: "He reads between the lines, spots the patterns, and writes a report that feels suspiciously accurate." },
  { n: "03", icon: MessageCircleMore, title: "Read, gasp, share", text: "Get portraits, awards, inside jokes and a final verdict made for your exact group." },
];

const faqs = [
  ["Do you keep my conversation?", "No. Your original chat is encrypted while the report is created, then permanently deleted. Your private report stays available until you delete it."],
  ["Will people in my chat know?", "Only if you tell them. Reports are private by default. Sharing creates a separate link that you can revoke at any time."],
  ["Is it mean?", "Roastin is observant, not cruel. He roasts repeat behaviours and group habits, never identity, appearance or sensitive personal traits."],
  ["What chats work best?", "Active WhatsApp groups with three or more people are gold, but couples, best friends, families and teams work too."],
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Header />

      <section className="relative border-b border-[#112b4d]/15 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -left-14 top-20 size-32 rotate-12 opacity-20 starburst" />
        <div className="pointer-events-none absolute right-[43%] top-12 text-4xl text-[#f6a913]">✦</div>
        <div className="shell grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <span className="eyebrow">The group chat report</span>
            <h1 className="display mt-6 max-w-[760px] text-[clamp(3.5rem,7vw,6.9rem)] font-black leading-[.82] tracking-[-.065em]">
              Your chat has <span className="relative inline-block text-[#e84b20]">secrets.</span><br />
              Roastin has notes.
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-[#3b4d5f] md:text-xl">
              Upload a WhatsApp conversation. Get the unfiltered, weirdly accurate report nobody in the chat would dare to write.
            </p>
            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link className="btn btn-primary w-full sm:w-auto" href="/create">
                Get my chat report <ArrowRight size={19} strokeWidth={2.7} />
              </Link>
              <span className="flex items-center gap-2 text-sm font-bold text-[#3b4d5f]">
                <LockKeyhole size={16} /> Your chat is deleted after analysis
              </span>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold">
              {["No account needed", "Private by default", "Ready in minutes"].map((item) => (
                <span className="flex items-center gap-2" key={item}><span className="grid size-5 place-items-center rounded-full bg-[#a9c9a9]"><Check size={13} strokeWidth={3} /></span>{item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] lg:translate-x-8">
            <div className="absolute -left-9 -top-8 z-10 rotate-[-10deg] rounded-full border-2 border-[#112b4d] bg-[#f6a913] px-5 py-3 text-center font-black shadow-[4px_5px_0_#112b4d]">
              <span className="display block text-2xl leading-none">Ouch.</span>
              <span className="text-[10px] uppercase tracking-wider">He noticed that too</span>
            </div>
            <div className="overflow-hidden rounded-[34px] border-[3px] border-[#112b4d] bg-[#112b4d] p-2 shadow-[12px_14px_0_#e84b20] rotate-[1.5deg]">
              <Image alt="Roastin Has Notes brand and host" className="aspect-[3/2] w-full rounded-[25px] object-cover object-[73%_34%]" height={1024} priority src="/brand/roastin-brand-board.png" width={1536} />
            </div>
            <div className="ticket-edge absolute -bottom-9 left-1/2 z-10 w-[84%] -translate-x-1/2 rotate-[-2deg] bg-[#fffaf0] px-7 py-5 shadow-xl">
              <div className="flex gap-4">
                <Quote className="shrink-0 text-[#e84b20]" fill="currentColor" size={26} />
                <p className="display text-lg font-bold leading-snug">“Three people make plans. One person actually checks the dates. You already know who.”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#112b4d] py-5 text-[#f8efd9]">
        <div className="flex min-w-max items-center justify-center gap-10 text-sm font-black uppercase tracking-[.12em] md:gap-20">
          <span>Nobody asked.</span><span className="text-[#f6a913]">✦</span><span>Roastin answered.</span><span className="text-[#e84b20]">✦</span><span>The receipts are in.</span>
        </div>
      </section>

      <section className="py-24 md:py-32" id="how-it-works">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Ridiculously easy</span>
            <h2 className="display mt-5 text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">From group chat to <span className="scribble">main event</span></h2>
            <p className="mx-auto mt-7 max-w-xl text-lg text-[#3b4d5f]">No questionnaires. No awkward quizzes. Roastin works with what your group already said.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map(({ n, icon: Icon, title, text }, index) => (
              <article className={`card relative p-7 md:p-8 ${index === 1 ? "md:-translate-y-5" : ""}`} key={title}>
                <span className="absolute right-6 top-5 display text-5xl font-black text-[#112b4d]/10">{n}</span>
                <span className={`grid size-14 place-items-center rounded-2xl border-2 border-[#112b4d] ${index === 0 ? "bg-[#f6a913]" : index === 1 ? "bg-[#e84b20] text-white" : "bg-[#a9c9a9]"}`}><Icon size={25} strokeWidth={2.4} /></span>
                <h3 className="display mt-7 text-3xl font-black tracking-tight">{title}</h3>
                <p className="mt-3 leading-7 text-[#3b4d5f]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#112b4d]/15 bg-[#efdcb7]/55 py-24 md:py-32">
        <div className="shell grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="eyebrow">A report only your chat could make</span>
            <h2 className="display mt-5 text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">Generic personality tests could never.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#3b4d5f]">Every observation is grounded in actual patterns: who starts the plans, who ghosts them, who has exactly one reaction emoji, and who says “on my way” from the shower.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Full participant portraits", "Group awards", "Your private dictionary", "Hidden dynamics", "Green, yellow & red flags", "Predicted reactions"].map((item) => <span className="flex items-center gap-3 font-bold" key={item}><Check className="text-[#e84b20]" size={18} strokeWidth={3} />{item}</span>)}
            </div>
          </div>
          <div className="relative">
            <div className="card rotate-[1.5deg] overflow-hidden border-2 border-[#112b4d] p-3 shadow-[9px_10px_0_#112b4d]">
              <div className="rounded-[18px] bg-[#fffaf0] p-7 md:p-10">
                <div className="flex items-start justify-between border-b border-[#112b4d]/20 pb-6">
                  <div><span className="text-[10px] font-black uppercase tracking-[.18em] text-[#e84b20]">Participant portrait</span><h3 className="display mt-2 text-4xl font-black">Maya</h3></div>
                  <span className="rounded-full bg-[#a9c9a9] px-4 py-2 text-xs font-black">THE LOGISTICS DEPT.</span>
                </div>
                <p className="display mt-7 text-2xl font-bold leading-snug">Maya doesn’t make plans. She launches small infrastructure projects that happen to involve brunch.</p>
                <div className="my-7 rounded-2xl bg-[#f8efd9] p-5 text-sm font-medium italic text-[#3b4d5f]">“Okay but are we actually booking this or are we doing our usual thing?”</div>
                <div className="flex items-center justify-between text-sm font-bold"><span>Receipts reviewed: 4,821</span><span className="text-[#e84b20]">Accuracy: upsetting</span></div>
              </div>
            </div>
            <span className="absolute -bottom-7 -right-4 rotate-6 rounded-full border-2 border-[#112b4d] bg-[#f6a913] px-5 py-3 text-sm font-black shadow-[3px_4px_0_#112b4d]">She knows it’s true ✦</span>
          </div>
        </div>
      </section>

      <section className="bg-[#e84b20] py-24 text-white md:py-28" id="privacy">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.15em]"><ShieldCheck size={17} /> Your chat stays yours</span>
              <h2 className="display mt-5 text-5xl font-black leading-[.94] tracking-[-.04em] md:text-7xl">The tea is hot. Our storage isn’t.</h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">We need your conversation to write the report. We do not need to keep it.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [Fingerprint, "Processed once", "Used only to create your private report."],
                [Trash2, "Never kept", "Permanently deleted when generation ends."],
                [ShieldCheck, "Never training", "Never sold or used to train AI models."],
              ].map(([Icon, title, text]) => {
                const PrivacyIcon = Icon as typeof ShieldCheck;
                return <article className="rounded-3xl border border-white/25 bg-[#bd3214]/45 p-6" key={String(title)}><PrivacyIcon size={30} /><h3 className="display mt-10 text-2xl font-black">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-white/80">{String(text)}</p></article>;
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32" id="faq">
        <div className="shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div><span className="eyebrow">Before you hand over the gossip</span><h2 className="display mt-5 text-5xl font-black tracking-[-.04em] md:text-6xl">Fair questions.</h2><Mic2 className="mt-10 rotate-[-12deg] text-[#e84b20]" size={72} strokeWidth={1.6} /></div>
          <div className="divide-y divide-[#112b4d]/20 border-y border-[#112b4d]/20">
            {faqs.map(([q, a], index) => <details className="group py-6" key={q} open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black"><span>{q}</span><ChevronDown className="transition-transform group-open:rotate-180" size={20} /></summary><p className="max-w-2xl pt-4 leading-7 text-[#3b4d5f]">{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="px-4 pb-5">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[34px] bg-[#112b4d] px-6 py-20 text-center text-white md:py-28">
          <span className="text-3xl text-[#f6a913]">✦</span>
          <h2 className="display mx-auto mt-5 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.05em] md:text-8xl">Your group chat already wrote the material.</h2>
          <p className="mx-auto mt-7 max-w-xl text-lg text-white/70">Roastin is just brave enough to say it out loud.</p>
          <Link className="btn btn-primary mt-9" href="/create">Hand over the receipts <ArrowRight size={19} /></Link>
        </div>
      </section>

      <footer className="shell flex flex-col gap-5 py-10 text-sm text-[#3b4d5f] sm:flex-row sm:items-center sm:justify-between">
        <span className="font-bold">© 2026 Roastin Has Notes</span>
        <div className="flex gap-6"><a href="#privacy">Privacy</a><a href="#faq">FAQ</a><span>18+ only</span></div>
      </footer>
    </main>
  );
}
