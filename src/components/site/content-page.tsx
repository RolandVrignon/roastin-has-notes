import { AlertTriangle } from "lucide-react";
import { LocalizedFooter } from "@/components/site/localized-footer";
import { LocalizedHeader } from "@/components/site/localized-header";
import type { Locale } from "@/i18n/config";
import type { ContentPage as ContentPageData, Dictionary } from "@/i18n/types";

export function ContentPage({ locale, dictionary, page, pathname }: { locale: Locale; dictionary: Dictionary; page: ContentPageData; pathname: string }) {
  const isLaunchWarning = page.sections.some((section) => section.title.toLowerCase().includes("launch") || section.title.toLowerCase().includes("lancement"));
  return (
    <main id="content" lang={locale}>
      <LocalizedHeader dictionary={dictionary} locale={locale} pathname={pathname} />
      <article className="shell grid gap-12 py-16 md:grid-cols-[.7fr_1.3fr] md:py-24">
        <header className="md:sticky md:top-28 md:self-start">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="display mt-5 text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">{page.title}</h1>
          <p className="mt-7 text-lg leading-8 text-[#3b4d5f]">{page.intro}</p>
          {isLaunchWarning && <div className="mt-7 flex gap-3 rounded-2xl border border-[#f6a913] bg-[#f6a913]/15 p-4 text-sm leading-6"><AlertTriangle aria-hidden="true" className="shrink-0" size={20} /><span>Beta · last reviewed 6 August 2026</span></div>}
        </header>
        <div className="space-y-5">
          {page.sections.map((section) => (
            <section className="card bg-[#fffaf0] p-6 md:p-8" key={section.title}>
              <h2 className="display text-3xl font-black tracking-tight">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p className="mt-4 leading-7 text-[#3b4d5f]" key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul className="mt-5 space-y-3">{section.bullets.map((item) => <li className="flex gap-3 leading-7 text-[#3b4d5f]" key={item}><span aria-hidden="true" className="mt-[.65rem] size-2 shrink-0 rounded-full bg-[#e84b20]" />{item}</li>)}</ul>}
            </section>
          ))}
        </div>
      </article>
      <LocalizedFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
