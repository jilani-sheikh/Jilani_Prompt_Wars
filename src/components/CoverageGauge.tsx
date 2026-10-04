"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Compass } from "lucide-react";
import { ReasoningCoverage } from "@/lib/types";

interface CoverageGaugeProps {
  coverage: ReasoningCoverage;
}

export function CoverageGauge({ coverage }: CoverageGaugeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { dimensions = [] } = coverage;

  const total = dimensions.length || 8;
  const examinedCount = dimensions.filter((d) => d.status !== "Unexamined").length;

  return (
    <div className="surface-card rounded-2xl p-6 sm:p-7 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-semibold text-slate-100">
              How thoroughly have you examined this?
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            This shows which important areas you&apos;ve considered and which may still need attention. It is never a score for your decision.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100 flex items-baseline gap-1.5">
              <span className="text-amber-400 text-xl font-extrabold">{examinedCount}</span>
              <span className="text-slate-400 text-xs font-sans">of</span>
              <span>{total} areas considered</span>
            </div>

            {/* Glowing Segmented indicator bar */}
            <div className="w-40 h-2.5 rounded-full bg-slate-950 border border-white/[0.08] overflow-hidden mt-2 flex gap-1 p-0.5 shadow-inner">
              {dimensions.map((dim, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all ${
                    dim.status === "Examined"
                      ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                      : dim.status === "Partially Examined"
                      ? "bg-amber-400/50"
                      : "bg-slate-800/80"
                  }`}
                  title={`${dim.name}: ${dim.status}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium"
            aria-expanded={showDetails}
          >
            <span>{showDetails ? "Hide areas" : "See areas"}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Dimensions Breakdown */}
      {showDetails && (
        <div className="mt-5 pt-5 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dimensions.map((dim, i) => {
            const isConsidered = dim.status !== "Unexamined";
            return (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-slate-200">{dim.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isConsidered
                        ? "text-amber-300 bg-amber-400/10 border-amber-400/25"
                        : "text-slate-400 bg-slate-800/60 border-slate-700/50"
                    }`}
                  >
                    {isConsidered ? (
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-slate-500" />
                    )}
                    <span>{dim.status}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {dim.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
