import Link from "next/link";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function LocalizedFooter({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <footer className="shell grid gap-7 py-10 text-sm text-[#3b4d5f] md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <strong className="text-[#112b4d]">© 2026 Roastin Has Notes</strong>
        <p className="mt-2 max-w-xl">{dictionary.landing.privacyNote}</p>
      </div>
      <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-3 font-bold">
        <Link href={localizedPath(locale, "/privacy")}>{dictionary.common.privacy}</Link>
        <Link href={localizedPath(locale, "/terms")}>{dictionary.common.terms}</Link>
        <Link href={localizedPath(locale, "/help")}>{dictionary.common.help}</Link>
        <Link href={localizedPath(locale, "/contact")}>{dictionary.common.contact}</Link>
        <Link href={localizedPath(locale, "/delete")}>{dictionary.common.deleteData}</Link>
        <span>{dictionary.common.adultOnly}</span>
      </nav>
    </footer>
  );
}
