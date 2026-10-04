"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, AlertCircle, Compass, ShieldCheck } from "lucide-react";
import { ReasoningAnalysis, DecisionRecord } from "@/lib/types";

interface ExploreFormProps {
  onAnalysisComplete: (decision: DecisionRecord, analysis: ReasoningAnalysis) => void;
}

const PRESET_EXAMPLES = [
  {
    label: "6-Month Internship Offer",
    decision: "Should I accept this 6-month frontend internship?",
    context: "₹15,000 monthly stipend, Pune on-site location, 6-month duration, 9 AM–6 PM work schedule, verbal promise of senior mentorship.",
    influences: "The stipend covers my rent, I feel peer pressure to have an internship on my resume, and I believe any practical experience will accelerate my career.",
  },
  {
    label: "Leaving Job for AI Startup",
    decision: "Should I resign from my software role to bootstrap a niche AI tool full-time?",
    context: "6 months of living expenses saved in cash, prototype built over weekends, 120 waitlist signups, zero paying customers yet, working remote.",
    influences: "The generative AI market is moving extremely fast, I feel unfulfilled at my corporate job, and I fear missing the adoption window.",
  },
  {
    label: "Medical: Spinal Fusion Surgery",
    decision: "Should I proceed with elective L4-L5 spinal fusion surgery next month?",
    context: "14 months of recurring lower back pain, completed two rounds of physiotherapy with temporary relief, orthopedic surgeon recommended fusion.",
    influences: "I am exhausted from constant discomfort, worried the nerve will worsen, and just want to return to physical athletics quickly.",
  },
];

const LOADING_MESSAGES = [
  "Looking for hidden assumptions...",
  "Checking what may be missing...",
  "Looking for conflicting priorities...",
  "Identifying questions worth asking...",
  "Synthesizing your reasoning audit...",
];

export function ExploreForm({ onAnalysisComplete }: ExploreFormProps) {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [influences, setInfluences] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const applyPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    setDecision(preset.decision);
    setContext(preset.context);
    setInfluences(preset.influences);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim() || !context.trim() || !influences.trim()) {
      setError("Please answer all three questions so we have enough context to examine your reasoning.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMsgIndex(0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, context, influences }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to complete reasoning audit. Please try again.");
      }

      onAnalysisComplete(data.decision, data.analysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to examine reasoning.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div id="explore" className="w-full max-w-3xl mx-auto py-12 sm:py-20 px-4">
      {/* Editorial Hero */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/25 mb-5 shadow-[0_0_15px_rgba(245,158,11,0.12)]">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-wide">A Tool For Clear Thinking</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-slate-100 mb-4 leading-tight">
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            The Blind Spot
          </span>
        </h1>
        <h2 className="text-xl sm:text-2xl font-serif italic text-amber-300/90 mb-4 max-w-lg mx-auto">
          See what your reasoning might be missing.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Bring us a decision you&apos;re considering. We&apos;ll challenge your assumptions, surface overlooked factors, and help you identify what you still need to know.
        </p>

        {/* Quick Example Starters */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs text-slate-500 mr-1 font-medium">Try an example:</span>
          {PRESET_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(ex)}
              className="px-3.5 py-1.5 rounded-full text-xs text-slate-300 hover:text-white bg-white/[0.04] hover:bg-amber-400/10 border border-white/[0.08] hover:border-amber-400/30 transition-all shadow-sm"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        className="surface-card rounded-3xl p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Top subtle golden light leak line */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-7 sm:space-y-8">
          {/* Question 01 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center shadow-sm">
                01
              </span>
              <label htmlFor="decision-input" className="text-base font-semibold text-slate-100">
                What decision are you considering?
              </label>
            </div>
            <input
              id="decision-input"
              type="text"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Should I accept this 6-month internship?"
              className="w-full px-4 py-3.5 rounded-xl input-refined text-sm text-slate-100 placeholder:text-slate-500 transition-all"
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500 pl-1">
              State the specific choice or dilemma you are facing.
            </p>
          </div>

          {/* Question 02 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center shadow-sm">
                02
              </span>
              <label htmlFor="context-input" className="text-base font-semibold text-slate-100">
                What do you know so far?
              </label>
            </div>
            <textarea
              id="context-input"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Stipend, location, duration, responsibilities, schedule..."
              className="w-full px-4 py-3.5 rounded-xl input-refined text-sm text-slate-100 placeholder:text-slate-500 transition-all leading-relaxed"
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500 pl-1">
              Key facts, constraints, timeline, or details you already know.
            </p>
          </div>

          {/* Question 03 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center shadow-sm">
                03
              </span>
              <label htmlFor="influences-input" className="text-base font-semibold text-slate-100">
                What&apos;s influencing your thinking?
              </label>
            </div>
            <textarea
              id="influences-input"
              rows={3}
              value={influences}
              onChange={(e) => setInfluences(e.target.value)}
              placeholder="I'm mainly attracted by the experience and stipend..."
              className="w-full px-4 py-3.5 rounded-xl input-refined text-sm text-slate-100 placeholder:text-slate-500 transition-all leading-relaxed"
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500 pl-1">
              Your main reasons, hopes, fears, or assumptions right now.
            </p>
          </div>
        </div>

        {/* Calm Reasoning Loading State */}
        {loading && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b0e16] border border-amber-400/30 text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-center gap-2.5 text-amber-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>Examining your reasoning...</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium transition-all duration-300">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
            <div className="w-36 h-1 rounded-full bg-slate-800 mx-auto overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Identifying hidden assumptions, blind spots, and unanswered questions.
            </p>
          </div>
        )}

        {/* Action Button & Subtext */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No account required • Never tells you what to decide.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? "Examining..." : "Examine My Reasoning"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
