import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function Header() {
  return (
    <header className="relative z-20 border-b border-[#112b4d]/10 bg-[#f8efd9]/90 backdrop-blur-md">
      <div className="shell flex h-20 items-center justify-between">
        <Logo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-bold md:flex">
          <a href="#how-it-works">How it works</a>
          <a href="#privacy">Privacy</a>
          <a href="#faq">FAQ</a>
          <Link href="/reports">My reports</Link>
        </nav>
        <Link className="btn btn-primary min-h-11 px-5 text-sm" href="/create">
          Roast my chat <ArrowUpRight size={17} strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
}
