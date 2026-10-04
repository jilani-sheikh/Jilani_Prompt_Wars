"use client";

import { useState } from "react";
import {
  RotateCcw,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  ReasoningAnalysis,
  DecisionRecord,
  BlindSpotItem,
  BlindSpotActionType,
  ReflectionRecord,
} from "@/lib/types";
import { HighStakesNotice } from "./HighStakesNotice";
import { CoverageGauge } from "./CoverageGauge";
import { BlindSpotModal } from "./BlindSpotModal";
import { ReflectionCard } from "./ReflectionCard";
import { EvolutionTimeline } from "./EvolutionTimeline";

interface DecisionMapProps {
  decision: DecisionRecord;
  analysis: ReasoningAnalysis;
  onReset: () => void;
  onOpenSaveModal: () => void;
}

export function DecisionMap({
  decision: initialDecision,
  analysis,
  onReset,
  onOpenSaveModal,
}: DecisionMapProps) {
  const [currentDecision, setCurrentDecision] = useState<DecisionRecord>(initialDecision);
  const [activeSpot, setActiveSpot] = useState<BlindSpotItem | null>(null);
  const [activeAction, setActiveAction] = useState<BlindSpotActionType>("examine");
  const [exploredSpotIds, setExploredSpotIds] = useState<string[]>([]);

  // Progressive disclosure accordion state
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showInfoGaps, setShowInfoGaps] = useState(false);
  const [showPerspectives, setShowPerspectives] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const handleOpenSpot = (spot: BlindSpotItem, action: BlindSpotActionType = "examine") => {
    setActiveSpot(spot);
    setActiveAction(action);
  };

  const handleSpotExplored = (spotId: string) => {
    if (!exploredSpotIds.includes(spotId)) {
      setExploredSpotIds((prev) => [...prev, spotId]);
    }
  };

  const handleReflectionSaved = (reflection: ReflectionRecord, updated: DecisionRecord) => {
    setCurrentDecision(updated);
  };

  const suggestedHighStakesQuestions = analysis.criticalQuestions?.map((q) => q.question) || [];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-14 px-4 sm:px-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              {analysis.categoryLabel}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
              {analysis.riskLevel} Stakes
            </span>
          </div>
          <h1 className="text-xs sm:text-sm font-medium text-slate-400">
            Decision Reasoning Workspace
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onReset}
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Audit New Decision</span>
          </button>
          <button
            onClick={onOpenSaveModal}
            className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Save Journey</span>
          </button>
        </div>
      </div>

      {/* High-Stakes Notice (if applicable) */}
      {analysis.isHighStakes && analysis.safetyNotice && (
        <HighStakesNotice
          notice={analysis.safetyNotice}
          categoryLabel={analysis.categoryLabel}
          suggestedQuestions={suggestedHighStakesQuestions}
        />
      )}

      {/* Guided Decision Structure */}
      <div className="space-y-8">
        {/* 1. YOUR DECISION */}
        <section className="surface-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
            Your Decision
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight mb-5 leading-snug">
            {currentDecision.title}
          </h2>

          <div className="pt-5 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block mb-1.5">
                What is driving your thinking?
              </span>
              <p className="text-slate-200 italic leading-relaxed">
                &ldquo;{currentDecision.influences}&rdquo;
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Known facts & context
              </span>
              <p className="text-slate-300 leading-relaxed">
                {currentDecision.context}
              </p>
            </div>
          </div>
        </section>

        {/* 2. COVERAGE: How thoroughly have you examined this? */}
        <CoverageGauge coverage={analysis.reasoningCoverage} />

        {/* 3. HERO: WHAT YOU MIGHT BE OVERLOOKING (BLIND SPOTS) */}
        <section aria-labelledby="hero-blindspots" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 id="hero-blindspots" className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                  What you might be overlooking
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                The {analysis.blindSpots.length} critical factors currently missing or underweighted in your reasoning.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {analysis.blindSpots.map((spot, index) => {
              const isExplored = exploredSpotIds.includes(spot.id);
              const num = String(index + 1).padStart(2, "0");

              return (
                <div
                  key={spot.id}
                  className={`hero-spot-card rounded-2xl p-6 sm:p-7 ${
                    isExplored
                      ? "ring-1 ring-emerald-400/40 bg-gradient-to-br from-emerald-950/20 to-[#0e141f]"
                      : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/35 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                        {num}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-100">
                            {spot.title}
                          </h3>
                          {isExplored && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Explored</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Single clear primary action button */}
                    <button
                      onClick={() => handleOpenSpot(spot, "examine")}
                      className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400/15 hover:bg-amber-400/25 text-amber-200 border border-amber-400/30 hover:border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.1)] transition-all"
                    >
                      <span>Explore this</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                    {spot.description}
                  </p>

                  {/* Why this matters */}
                  <div className="pt-3 border-t border-white/[0.08] text-xs sm:text-sm flex items-baseline gap-2">
                    <span className="font-semibold text-amber-300">Why this matters:</span>
                    <span className="text-slate-300">{spot.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. PROGRESSIVE DISCLOSURE SECTIONS */}
        <div className="space-y-4 pt-2">
          {/* Section: What you're assuming */}
          <div className="surface-card rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                    What you&apos;re assuming
                  </h3>
                  <span className="text-xs text-amber-300 font-semibold bg-amber-400/15 border border-amber-400/25 px-2.5 py-0.5 rounded-full">
                    {analysis.assumptions.length} found
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Things your current reasoning silently takes for granted.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium">
                <span>{showAssumptions ? "Hide" : "View all assumptions"}</span>
                {showAssumptions ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showAssumptions && (
              <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.assumptions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-mono text-slate-500">Assumption</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            item.fragility === "High"
                              ? "text-rose-300 bg-rose-500/10 border-rose-500/25"
                              : "text-amber-300 bg-amber-500/10 border-amber-500/25"
                          }`}
                        >
                          {item.fragility} Fragility
                        </span>
                      </div>
                      <p className="font-medium text-slate-100 mb-2 leading-snug">
                        &ldquo;{item.assumption}&rdquo;
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-slate-500">Risk: </span>
                      {item.whyItMatters}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Where your thinking may conflict */}
          {analysis.reasoningConflicts.length > 0 && (
            <div className="surface-card rounded-2xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowConflicts(!showConflicts)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                      Where your thinking may conflict
                    </h3>
                    <span className="text-xs text-rose-300 font-semibold bg-rose-500/15 border border-rose-500/25 px-2.5 py-0.5 rounded-full">
                      {analysis.reasoningConflicts.length} tension{analysis.reasoningConflicts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Points where your stated priorities pull in opposing directions.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium">
                  <span>{showConflicts ? "Hide" : "View conflicts"}</span>
                  {showConflicts ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showConflicts && (
                <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.reasoningConflicts.map((conf) => (
                    <div key={conf.id} className="p-5 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                      <div className="font-semibold text-amber-300 mb-2.5 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>{conf.tension}</span>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px]">
                          <span className="text-slate-500 font-mono uppercase block mb-0.5">What you prioritize:</span>
                          <span className="text-slate-200">{conf.sideA}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px]">
                          <span className="text-amber-400/90 font-mono uppercase block mb-0.5">The hidden tension:</span>
                          <span className="text-amber-100">{conf.sideB}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: What you still need to find out */}
          <div className="surface-card rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowInfoGaps(!showInfoGaps)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                    What you still need to find out
                  </h3>
                  <span className="text-xs text-sky-300 font-semibold bg-sky-500/15 border border-sky-500/25 px-2.5 py-0.5 rounded-full">
                    {analysis.informationGaps.length} missing points
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Important facts you do not currently have but should know before deciding.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium">
                <span>{showInfoGaps ? "Hide" : "View missing info"}</span>
                {showInfoGaps ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showInfoGaps && (
              <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.informationGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-100 mb-1.5">
                        {gap.gap}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        {gap.whyNeeded}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] text-[11px] text-amber-300">
                      <span className="text-slate-500">How to find out: </span>
                      {gap.howToVerify}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Other ways to look at this */}
          <div className="surface-card rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowPerspectives(!showPerspectives)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                    Other ways to look at this
                  </h3>
                  <span className="text-xs text-slate-300 font-semibold bg-white/[0.06] border border-white/[0.09] px-2.5 py-0.5 rounded-full">
                    {analysis.alternativePerspectives.length} perspectives
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  How experienced outside observers would evaluate this exact dilemma.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium">
                <span>{showPerspectives ? "Hide" : "View perspectives"}</span>
                {showPerspectives ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showPerspectives && (
              <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.alternativePerspectives.map((persp) => (
                  <div key={persp.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2 mb-2 font-semibold text-slate-200">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{persp.perspectiveName}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      {persp.viewpoint}
                    </p>
                    <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-[11px]">
                      <span className="text-amber-400/90 font-mono uppercase block mb-0.5">Key question:</span>
                      <span className="text-amber-100">{persp.keyConsideration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Questions worth asking */}
          <div className="surface-card rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowQuestions(!showQuestions)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                    Questions worth asking
                  </h3>
                  <span className="text-xs text-slate-300 font-semibold bg-white/[0.06] border border-white/[0.09] px-2.5 py-0.5 rounded-full">
                    {analysis.criticalQuestions.length} questions
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Questions to ask yourself or other parties before committing.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium">
                <span>{showQuestions ? "Hide" : "View questions"}</span>
                {showQuestions ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showQuestions && (
              <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.criticalQuestions.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono uppercase">Key Question</span>
                    </div>
                    <p className="font-medium text-slate-100 mb-2 leading-relaxed">
                      &ldquo;{q.question}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Why it matters: {q.purpose}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: What to verify before deciding */}
          <div className="surface-card rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                    What to verify before deciding
                  </h3>
                  <span className="text-xs text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    {analysis.evidenceDirections.length} verification steps
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Concrete facts and data you can empirically confirm right now.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium">
                <span>{showEvidence ? "Hide" : "View verification steps"}</span>
                {showEvidence ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showEvidence && (
              <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.evidenceDirections.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                      Fact to Verify
                    </span>
                    <p className="text-slate-100 font-medium mb-2 leading-relaxed">
                      {ev.verifiableFact}
                    </p>
                    <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
                      <span className="text-slate-500">Source: </span>
                      {ev.suggestedSource}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. EVOLUTION TIMELINE */}
        <EvolutionTimeline decision={currentDecision} />

        {/* 6. REFLECTION CARD (Has this changed how you think?) */}
        <ReflectionCard
          decision={currentDecision}
          exploredSpotIds={exploredSpotIds}
          onReflectionSaved={handleReflectionSaved}
        />
      </div>

      {/* Interactive Blind Spot Modal */}
      {activeSpot && (
        <BlindSpotModal
          spot={activeSpot}
          decisionTitle={currentDecision.title}
          decisionContext={currentDecision.context}
          userInfluences={currentDecision.influences}
          initialAction={activeAction}
          onClose={() => setActiveSpot(null)}
          onSpotExplored={handleSpotExplored}
        />
      )}
    </div>
  );
}
