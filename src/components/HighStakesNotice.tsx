import { ShieldCheck, HelpCircle } from "lucide-react";

interface HighStakesNoticeProps {
  notice: string;
  categoryLabel: string;
  suggestedQuestions?: string[];
}

export function HighStakesNotice({
  notice,
  categoryLabel,
  suggestedQuestions = [],
}: HighStakesNoticeProps) {
  return (
    <div className="surface-card rounded-2xl p-6 sm:p-7 mb-8 border border-amber-500/30 bg-gradient-to-br from-amber-950/25 via-[#0e131d] to-[#080a0f] shadow-xl text-amber-200 relative overflow-hidden">
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/25">
              Specialist Advisory
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-amber-100">
            This decision deserves professional input
          </h3>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            {notice}
          </p>
          <p className="text-xs text-amber-300/70">
            The Blind Spot helps you examine assumptions and uncertainties, but it cannot replace advice from a qualified {categoryLabel.toLowerCase()} specialist.
          </p>

          {suggestedQuestions && suggestedQuestions.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-amber-500/20">
              <div className="text-xs font-semibold text-amber-300 mb-2.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Questions you may want to ask a professional:</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-100/90">
                {suggestedQuestions.slice(0, 3).map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="italic">&ldquo;{q}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
