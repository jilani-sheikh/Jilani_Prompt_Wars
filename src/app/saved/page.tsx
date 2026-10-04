"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ArrowRight, History, ShieldCheck, Sparkles, Plus, Compass } from "lucide-react";
import { DecisionRecord } from "@/lib/types";

export default function SavedJourneysPage() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/decisions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.decisions)) {
          setDecisions(data.decisions);
        }
      })
      .catch((err) => console.error("Error loading decisions:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                Personal Archive
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
              Your Decisions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Revisit how your thinking has evolved over time.
            </p>
          </div>

          <Link
            href="/#explore"
            className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Audit New Decision</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs font-mono space-y-3">
            <Sparkles className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading your decisions...</p>
          </div>
        ) : decisions.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/[0.1] rounded-3xl p-8 sm:p-12 surface-card">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <History className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-serif font-bold text-slate-100 mb-2">No Saved Decisions Yet</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              When you examine a decision in Explore Mode, you can save your reasoning snapshots and reflections to revisit how your thinking matures over time.
            </p>
            <Link
              href="/#explore"
              className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold"
            >
              <span>Audit Your First Decision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {decisions.map((dec) => {
              const hasReflection = (dec.reflections?.length || 0) > 0;
              const dateStr = new Date(dec.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={dec.id}
                  className="p-6 sm:p-7 rounded-2xl surface-card border border-white/[0.08] hover:border-amber-400/30 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase bg-white/[0.04] border border-white/[0.08] text-slate-300 px-2.5 py-0.5 rounded-full">
                        {dec.category}
                      </span>
                      {dec.isHighStakes && (
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>Professional Advice Advised</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      Last updated {dateStr}
                    </span>
                  </div>

                  <h2 className="text-xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-2.5 leading-snug">
                    {dec.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                    {dec.context}
                  </p>

                  {/* Journey Flow Indicator */}
                  <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto no-scrollbar">
                      <span className="text-slate-300 font-medium whitespace-nowrap bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                        Initial thinking
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-amber-300 font-medium whitespace-nowrap bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                        Blind spots
                      </span>
                      <span className="text-slate-600">→</span>
                      <span
                        className={`font-medium whitespace-nowrap px-2.5 py-1 rounded-lg border ${
                          hasReflection
                            ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                            : "text-slate-500 bg-white/[0.02] border-white/[0.04] italic"
                        }`}
                      >
                        {hasReflection ? "Updated thinking" : "Reflection pending"}
                      </span>
                    </div>

                    <Link
                      href={`/journey/${dec.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/25 hover:border-amber-400/50 transition-all self-start sm:self-auto shadow-sm"
                    >
                      <span>Continue Journey</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
