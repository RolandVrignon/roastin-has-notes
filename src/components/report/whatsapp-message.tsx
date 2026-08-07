import { CheckCheck, MessageCircleMore } from "lucide-react";
import { parseReportEvidence } from "@/lib/report-evidence";

export function WhatsappMessage({ evidence }: { evidence: string }) {
  const parsed = parseReportEvidence(evidence);
  if (!parsed.isQuote) return <p className="rounded-2xl border border-[#112b4d]/10 bg-[#f8efd9] px-5 py-4 text-sm leading-6 text-[#3b4d5f]"><MessageCircleMore className="mr-2 inline text-[#e84b20]" size={16} />{parsed.message}</p>;

  return <div>
    <div className="flex justify-end pr-2">
      <blockquote className="relative max-w-[92%] rounded-2xl rounded-br-sm bg-[#d9fdd3] px-4 py-3 pr-10 text-[15px] leading-6 text-[#111b21] shadow-sm md:max-w-[82%]">
        <span aria-hidden="true" className="absolute -bottom-px -right-2 h-4 w-3 bg-[#d9fdd3] [clip-path:polygon(0_0,0_100%,100%_100%)]" />
        <span>{parsed.message}</span>
        <CheckCheck aria-label="Message WhatsApp cité" className="absolute bottom-2.5 right-3 text-[#53bdeb]" size={17} strokeWidth={2.5} />
      </blockquote>
    </div>
    {parsed.note && <p className="mt-3 text-sm leading-6 text-[#3b4d5f]">{parsed.note}</p>}
  </div>;
}
