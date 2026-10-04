"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ExploreForm } from "@/components/ExploreForm";
import { DecisionMap } from "@/components/DecisionMap";
import { SaveJourneyModal } from "@/components/SaveJourneyModal";
import { DecisionRecord, ReasoningAnalysis } from "@/lib/types";

export default function Home() {
  const [activeDecision, setActiveDecision] = useState<DecisionRecord | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ReasoningAnalysis | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleAnalysisComplete = (decision: DecisionRecord, analysis: ReasoningAnalysis) => {
    setActiveDecision(decision);
    setActiveAnalysis(analysis);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setActiveDecision(null);
    setActiveAnalysis(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = () => {
    // User linked
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-col font-sans">
      <Header onOpenAuthModal={() => setIsSaveModalOpen(true)} />

      <main className="flex-1">
        {!activeDecision || !activeAnalysis ? (
          <ExploreForm onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <DecisionMap
            decision={activeDecision}
            analysis={activeAnalysis}
            onReset={handleReset}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
          />
        )}
      </main>

      {/* Save Journey / Personal Mode Modal */}
      {activeDecision && (
        <SaveJourneyModal
          decisionId={activeDecision.id}
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 text-center text-xs text-slate-400 bg-[#080a0f]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 space-y-2.5">
          <p className="font-mono text-amber-300/80 font-medium">
            The Blind Spot • Independent Reasoning Audit Platform
          </p>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            &ldquo;Challenge my reasoning, don&apos;t make the decision for me.&rdquo; Designed to expose assumptions, uncover overlooked variables, and elevate human critical thinking.
          </p>
        </div>
      </footer>
    </div>
  );
}
