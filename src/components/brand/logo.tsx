import Link from "next/link";

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link aria-label="Roastin Has Notes, home" className="inline-flex items-center gap-2" href={href}>
      <span className="starburst grid size-8 place-items-center text-[11px] font-black text-white">R</span>
      {!compact && (
        <span className="leading-none">
          <strong className="display block text-[22px] font-black tracking-[-.04em]">ROASTIN</strong>
          <span className="block text-[8px] font-black tracking-[.36em] text-[#e84b20]">HAS NOTES</span>
        </span>
      )}
    </Link>
  );
}
