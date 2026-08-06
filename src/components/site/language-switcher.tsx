import Link from "next/link";
import { Check, Languages } from "lucide-react";
import { localeNames, locales, replaceLocale, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale, pathname, label }: { locale: Locale; pathname: string; label: string }) {
  return (
    <details className="group relative">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#112b4d]/15 bg-white/55 px-3 text-sm font-bold hover:bg-white [&::-webkit-details-marker]:hidden">
        <Languages aria-hidden="true" size={16} />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="sr-only">{label}</span>
      </summary>
      <div className="absolute right-0 top-12 z-50 min-w-56 rounded-2xl border border-[#112b4d]/15 bg-[#fffaf0] p-2 shadow-xl">
        <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[.14em] text-[#3b4d5f]">{label}</p>
        {locales.map((candidate) => (
          <Link
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#f8efd9]"
            href={replaceLocale(pathname, candidate)}
            hrefLang={candidate}
            key={candidate}
            lang={candidate}
          >
            {localeNames[candidate]}
            {candidate === locale && <Check aria-hidden="true" className="text-[#e84b20]" size={16} strokeWidth={3} />}
          </Link>
        ))}
      </div>
    </details>
  );
}
