import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function LocalizedHeader({ locale, dictionary, pathname = "" }: { locale: Locale; dictionary: Dictionary; pathname?: string }) {
  const home = localizedPath(locale);
  return (
    <header className="relative z-40 border-b border-[#112b4d]/10 bg-[#f8efd9]/90 backdrop-blur-md">
      <div className="shell flex min-h-20 items-center justify-between gap-3 py-3">
        <Logo href={home} />
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-bold lg:flex">
          <Link href={`${home}#how-it-works`}>{dictionary.nav.how}</Link>
          <Link href={`${home}#privacy`}>{dictionary.nav.data}</Link>
          <Link href={`${home}#faq`}>{dictionary.nav.faq}</Link>
          <Link href="/reports">{dictionary.common.myReports}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher label={dictionary.common.language} locale={locale} pathname={localizedPath(locale, pathname)} />
          <Link className="btn btn-primary hidden min-h-11 px-5 text-sm md:inline-flex" href={localizedPath(locale, "/create")}>
            {dictionary.common.createReport} <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
