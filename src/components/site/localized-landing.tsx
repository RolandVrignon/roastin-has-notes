import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, FileUp, Fingerprint, LockKeyhole, MessageCircleMore, Mic2, Quote, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { LocalizedFooter } from "@/components/site/localized-footer";
import { LocalizedHeader } from "@/components/site/localized-header";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const stepIcons = [FileUp, Sparkles, MessageCircleMore];
const privacyIcons = [Fingerprint, Trash2, ShieldCheck];

export function LocalizedLanding({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const createHref = localizedPath(locale, "/create");
  return (
    <main className="overflow-hidden" id="content" lang={locale}>
      <LocalizedHeader dictionary={dictionary} locale={locale} />

      <section className="relative border-b border-[#112b4d]/15 pb-20 pt-14 md:pb-28 md:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-14 top-20 size-32 rotate-12 opacity-20 starburst" />
        <div className="shell grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <span className="eyebrow">{dictionary.landing.eyebrow}</span>
            <h1 className="display mt-6 max-w-[780px] text-[clamp(3.4rem,7vw,6.9rem)] font-black leading-[.82] tracking-[-.065em]">
              {dictionary.landing.titleBefore} <span className="text-[#e84b20]">{dictionary.landing.titleAccent}</span><br />{dictionary.landing.titleAfter}
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-[#3b4d5f] md:text-xl">{dictionary.landing.subtitle}</p>
            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link className="btn btn-primary w-full sm:w-auto" href={createHref}>{dictionary.common.createReport}<ArrowRight aria-hidden="true" size={19} strokeWidth={2.7} /></Link>
              <span className="flex items-center gap-2 text-sm font-bold text-[#3b4d5f]"><LockKeyhole aria-hidden="true" size={16} />{dictionary.landing.privacyNote}</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold">
              {dictionary.landing.trust.map((item) => <span className="flex items-center gap-2" key={item}><span className="grid size-5 place-items-center rounded-full bg-[#a9c9a9]"><Check aria-hidden="true" size={13} strokeWidth={3} /></span>{item}</span>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] lg:translate-x-8">
            <div className="overflow-hidden rounded-[34px] border-[3px] border-[#112b4d] bg-[#112b4d] p-2 shadow-[12px_14px_0_#e84b20] rotate-[1.5deg]">
              <Image alt="Roastin Has Notes" className="aspect-[3/2] w-full rounded-[25px] object-cover object-[73%_34%]" height={1024} priority src="/brand/roastin-brand-board.png" width={1536} />
            </div>
            <div className="ticket-edge absolute -bottom-9 left-1/2 z-10 w-[84%] -translate-x-1/2 rotate-[-2deg] bg-[#fffaf0] px-7 py-5 shadow-xl">
              <div className="flex gap-4"><Quote aria-hidden="true" className="shrink-0 text-[#e84b20]" fill="currentColor" size={26} /><p className="display text-lg font-bold leading-snug">“Maya doesn’t make plans. She launches small infrastructure projects that happen to involve brunch.”</p></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-hidden="true" className="overflow-hidden bg-[#112b4d] py-5 text-[#f8efd9]">
        <div className="flex min-w-max items-center justify-center gap-10 text-sm font-black uppercase tracking-[.12em] md:gap-20">
          {dictionary.landing.ticker.map((item, index) => <span className="contents" key={item}><span>{item}</span>{index < dictionary.landing.ticker.length - 1 && <span className={index % 2 ? "text-[#e84b20]" : "text-[#f6a913]"}>✦</span>}</span>)}
        </div>
      </section>

      <section className="scroll-mt-20 py-24 md:py-32" id="how-it-works">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">{dictionary.landing.howEyebrow}</span><h2 className="display mt-5 text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">{dictionary.landing.howTitle}</h2><p className="mx-auto mt-7 max-w-xl text-lg text-[#3b4d5f]">{dictionary.landing.howText}</p></div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {dictionary.landing.steps.map(({ title, text }, index) => { const Icon = stepIcons[index]; return <article className={`card relative p-7 md:p-8 ${index === 1 ? "md:-translate-y-5" : ""}`} key={title}><span className="absolute right-6 top-5 display text-5xl font-black text-[#112b4d]/10">0{index + 1}</span><span className={`grid size-14 place-items-center rounded-2xl border-2 border-[#112b4d] ${index === 0 ? "bg-[#f6a913]" : index === 1 ? "bg-[#e84b20] text-white" : "bg-[#a9c9a9]"}`}><Icon aria-hidden="true" size={25} /></span><h3 className="display mt-7 text-3xl font-black tracking-tight">{title}</h3><p className="mt-3 leading-7 text-[#3b4d5f]">{text}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#112b4d]/15 bg-[#efdcb7]/55 py-24 md:py-32">
        <div className="shell grid items-center gap-14 lg:grid-cols-2">
          <div><span className="eyebrow">{dictionary.landing.reportEyebrow}</span><h2 className="display mt-5 text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">{dictionary.landing.reportTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-[#3b4d5f]">{dictionary.landing.reportText}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{dictionary.landing.features.map((item) => <span className="flex items-center gap-3 font-bold" key={item}><Check aria-hidden="true" className="text-[#e84b20]" size={18} strokeWidth={3} />{item}</span>)}</div></div>
          <div className="card rotate-[1.5deg] border-2 border-[#112b4d] p-8 shadow-[9px_10px_0_#112b4d] md:p-10"><span className="text-[10px] font-black uppercase tracking-[.18em] text-[#e84b20]">Participant portrait</span><h3 className="display mt-2 text-4xl font-black">Maya</h3><p className="display mt-7 text-2xl font-bold leading-snug">“Okay but are we actually booking this or are we doing our usual thing?”</p></div>
        </div>
      </section>

      <section className="scroll-mt-20 bg-[#e84b20] py-24 text-white md:py-28" id="privacy">
        <div className="shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.15em]"><ShieldCheck aria-hidden="true" size={17} />{dictionary.landing.privacyEyebrow}</span><h2 className="display mt-5 text-5xl font-black leading-[.94] tracking-[-.04em] md:text-7xl">{dictionary.landing.privacyTitle}</h2><p className="mt-6 max-w-lg text-lg leading-8 text-white/85">{dictionary.landing.privacyText}</p><Link className="mt-6 inline-block font-black underline" href={localizedPath(locale, "/privacy")}>{dictionary.common.privacy} →</Link></div>
          <div className="grid gap-4 sm:grid-cols-3">{dictionary.landing.privacyCards.map(({ title, text }, index) => { const Icon = privacyIcons[index]; return <article className="rounded-3xl border border-white/25 bg-[#bd3214]/45 p-6" key={title}><Icon aria-hidden="true" size={30} /><h3 className="display mt-10 text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-white/80">{text}</p></article>; })}</div>
        </div>
      </section>

      <section className="scroll-mt-20 py-24 md:py-32" id="faq">
        <div className="shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div><span className="eyebrow">{dictionary.landing.faqEyebrow}</span><h2 className="display mt-5 text-5xl font-black tracking-[-.04em] md:text-6xl">{dictionary.landing.faqTitle}</h2><Mic2 aria-hidden="true" className="mt-10 rotate-[-12deg] text-[#e84b20]" size={72} strokeWidth={1.6} /></div>
          <div className="divide-y divide-[#112b4d]/20 border-y border-[#112b4d]/20">{dictionary.landing.faqs.map(({ question, answer }, index) => <details className="group py-6" key={question} open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black"><span>{question}</span><ChevronDown aria-hidden="true" className="transition-transform group-open:rotate-180" size={20} /></summary><p className="max-w-2xl pt-4 leading-7 text-[#3b4d5f]">{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="px-4 pb-5"><div className="mx-auto max-w-[1400px] overflow-hidden rounded-[34px] bg-[#112b4d] px-6 py-20 text-center text-white md:py-28"><span className="text-3xl text-[#f6a913]">✦</span><h2 className="display mx-auto mt-5 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.05em] md:text-8xl">{dictionary.landing.finalTitle}</h2><p className="mx-auto mt-7 max-w-xl text-lg text-white/70">{dictionary.landing.finalText}</p><Link className="btn btn-primary mt-9" href={createHref}>{dictionary.landing.finalCta}<ArrowRight aria-hidden="true" size={19} /></Link></div></section>
      <LocalizedFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
