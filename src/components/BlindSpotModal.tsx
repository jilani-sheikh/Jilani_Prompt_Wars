"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  HelpCircle,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Eye,
} from "lucide-react";
import { BlindSpotItem, BlindSpotActionType, SpotActionResult } from "@/lib/types";

interface BlindSpotModalProps {
  spot: BlindSpotItem;
  decisionTitle: string;
  decisionContext: string;
  userInfluences: string;
  initialAction?: BlindSpotActionType;
  onClose: () => void;
  onSpotExplored?: (spotId: string) => void;
}

const ACTION_OPTIONS: Array<{
  id: BlindSpotActionType;
  label: string;
  icon: typeof Lightbulb;
}> = [
  { id: "examine", label: "Examine this", icon: Lightbulb },
  { id: "challenge", label: "Challenge this assumption", icon: AlertCircle },
  { id: "missing_info", label: "What info is missing?", icon: HelpCircle },
  { id: "perspective", label: "See another perspective", icon: Eye },
  { id: "investigate", label: "Investigate with Google", icon: Search },
];

export function BlindSpotModal({
  spot,
  decisionTitle,
  decisionContext,
  userInfluences,
  initialAction = "examine",
  onClose,
  onSpotExplored,
}: BlindSpotModalProps) {
  const [currentAction, setCurrentAction] = useState<BlindSpotActionType>(initialAction);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SpotActionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(async (action: BlindSpotActionType) => {
    setCurrentAction(action);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/explore-spot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionTitle,
          decisionContext,
          userInfluences,
          spot,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to explore this blind spot.");
      }

      setResult(data.result);
      if (onSpotExplored) {
        onSpotExplored(spot.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing exploration.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [decisionTitle, decisionContext, userInfluences, spot, onSpotExplored]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/explore-spot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decisionTitle,
            decisionContext,
            userInfluences,
            spot,
            action: initialAction,
          }),
        });

        const data = await res.json();
        if (!ignore) {
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Unable to explore this blind spot.");
          }
          setResult(data.result);
          if (onSpotExplored) {
            onSpotExplored(spot.id);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Error executing exploration.";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [decisionTitle, decisionContext, userInfluences, spot, initialAction, onSpotExplored]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 surface-card border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-white/[0.08] flex items-start justify-between bg-black/40">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/25 px-2.5 py-0.5 rounded-full shadow-sm">
                Explore This Blind Spot
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 truncate max-w-xs">{decisionTitle}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">{spot.title}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">{spot.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {ACTION_OPTIONS.map((opt) => {
            const isSelected = currentAction === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => executeAction(opt.id)}
                disabled={loading}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "btn-gold shadow-md"
                    : "btn-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300 leading-relaxed">
          {loading && (
            <div className="py-16 text-center space-y-3.5">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-200">
                Exploring: {ACTION_OPTIONS.find((a) => a.id === currentAction)?.label}...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Analyzing this blind spot against your decision context...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!loading && result && (
            <>
              {/* Main Analysis */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  What to consider
                </h3>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.07] text-slate-200 whitespace-pre-line text-sm leading-relaxed">
                  {result.deepDive}
                </div>
              </div>

              {/* Questions to Ask Yourself */}
              {result.provocativeQuestions && result.provocativeQuestions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Questions to ask yourself</span>
                  </h3>
                  <div className="space-y-2">
                    {result.provocativeQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 text-xs sm:text-sm text-amber-100 italic"
                      >
                        &ldquo;{q}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Verification Steps */}
              {result.actionableSteps && result.actionableSteps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Things to verify before deciding</span>
                  </h3>
                  <ul className="space-y-2">
                    {result.actionableSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-300"
                      >
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Google Grounded Evidence (When Investigate chosen) */}
              {result.groundedEvidence && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/20 to-[#0e141f] border border-sky-500/30 text-xs space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-sky-400 font-medium">
                    <Search className="w-4 h-4" />
                    <span className="text-sm font-semibold">Verified facts from Google Search</span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {result.groundedEvidence.summary}
                  </p>
                  {result.groundedEvidence.sources && result.groundedEvidence.sources.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Sources & References
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.groundedEvidence.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-sky-500/30 text-sky-300 hover:text-white hover:border-sky-400 transition-colors text-xs"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tied directly to: &ldquo;{decisionTitle}&rdquo;
          </span>
          <button
            onClick={onClose}
            className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            Done Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
