"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { DecisionRecord, ReflectionRecord } from "@/lib/types";

interface ReflectionCardProps {
  decision: DecisionRecord;
  exploredSpotIds: string[];
  onReflectionSaved: (reflection: ReflectionRecord, updatedDecision: DecisionRecord) => void;
}

export function ReflectionCard({
  decision,
  exploredSpotIds,
  onReflectionSaved,
}: ReflectionCardProps) {
  const [updatedReasoning, setUpdatedReasoning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingReflections = decision.reflections || [];
  const latestReflection = existingReflections[existingReflections.length - 1];
  const hasReflection = existingReflections.length > 0 && !isEditing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatedReasoning.trim()) {
      setError("Please write how your thinking or perspective has changed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/decisions/${decision.id}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userNote: "Updated reasoning after examining blind spots and assumptions.",
          updatedReasoning,
          exploredSpots: exploredSpotIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update thinking.");
      }

      setIsEditing(false);
      setUpdatedReasoning("");
      onReflectionSaved(data.reflection, data.decision);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving reflection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="reflection-section" className="surface-card rounded-3xl p-6 sm:p-9 mt-12 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      {hasReflection && latestReflection ? (
        /* Visual Evolution State */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Your thinking has evolved
              </h2>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reflect again</span>
            </button>
          </div>

          <div className="space-y-4 pt-3">
            {/* Before */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06]">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Before (Initial Reasoning)
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &ldquo;{decision.influences}&rdquo;
              </p>
            </div>

            <div className="flex justify-center text-amber-400/80">
              <span className="text-base font-bold">↓</span>
            </div>

            {/* What you discovered */}
            <div className="p-5 rounded-2xl bg-amber-400/5 border border-amber-400/20">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>What you discovered</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-100">
                {decision.analysis?.blindSpots.slice(0, 3).map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong className="text-white">{b.title}:</strong> <span className="text-slate-300">{b.description}</span></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center text-emerald-400/80">
              <span className="text-base font-bold">↓</span>
            </div>

            {/* Now */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#0e171b] border border-emerald-500/30 shadow-lg">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                Now (Your Updated Thinking)
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                &ldquo;{latestReflection.updatedReasoning}&rdquo;
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Input State */
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Has this changed how you think?
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            After seeing these blind spots, what are you thinking differently now? Formulate your updated reasoning.
          </p>

          {error && (
            <div className="p-3.5 mb-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="updated-thinking-input" className="block text-xs font-semibold text-slate-300 mb-2">
                Your updated thinking
              </label>
              <textarea
                id="updated-thinking-input"
                rows={4}
                value={updatedReasoning}
                onChange={(e) => setUpdatedReasoning(e.target.value)}
                placeholder="e.g. Seeing the risk of academic burnout and unverified mentorship makes me want to negotiate part-time hours, or interview an ex-intern first..."
                className="w-full px-4 py-3.5 rounded-2xl input-refined text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 transition-all leading-relaxed"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              <span className="text-[11px] text-slate-500">
                Your original reasoning is always preserved so you can see your thinking grow.
              </span>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  <span>{loading ? "Updating..." : "Update My Thinking"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
