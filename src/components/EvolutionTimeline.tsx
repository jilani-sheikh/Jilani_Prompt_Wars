import { History, ArrowRight } from "lucide-react";
import { DecisionRecord } from "@/lib/types";

interface EvolutionTimelineProps {
  decision: DecisionRecord;
}

export function EvolutionTimeline({ decision }: EvolutionTimelineProps) {
  const initialReasoning = decision.influences;
  const reflections = decision.reflections || [];

  return (
    <div className="surface-card rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-100">
            How your thinking has evolved
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {reflections.length > 0 ? `${reflections.length} reflection${reflections.length !== 1 ? "s" : ""}` : "Initial stage"}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-400/40 before:via-sky-400/30 before:to-emerald-400/40">
        {/* Step 1: Initial Reasoning */}
        <div className="relative">
          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#080a0f] border-2 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
              Initial Reasoning
            </div>
            <p className="text-xs sm:text-sm text-slate-300 italic mb-2 leading-relaxed">
              &ldquo;{initialReasoning}&rdquo;
            </p>
            <div className="text-[11px] text-slate-500">
              Context: {decision.context.slice(0, 100)}...
            </div>
          </div>
        </div>

        {/* Step 2: What was uncovered */}
        <div className="relative">
          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#080a0f] border-2 border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
              What was uncovered
            </div>
            <div className="space-y-1.5">
              {decision.analysis?.blindSpots.slice(0, 3).map((b, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong className="text-white">{b.title}:</strong> <span className="text-slate-400">{b.description}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Reflections */}
        {reflections.map((ref, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#080a0f] border-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/20 to-black/40 border border-emerald-500/30">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Your updated thinking
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                &ldquo;{ref.updatedReasoning}&rdquo;
              </p>
            </div>
          </div>
        ))}

        {reflections.length === 0 && (
          <div className="relative">
            <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#080a0f] border-2 border-slate-600" />
            <div className="p-4 rounded-xl border border-dashed border-white/[0.08] text-xs text-slate-400 flex items-center justify-between gap-2">
              <span>Ready for your reflection. Update your thinking below once you explore the blind spots.</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
