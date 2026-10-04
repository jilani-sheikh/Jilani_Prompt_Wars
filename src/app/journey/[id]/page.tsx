"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { DecisionMap } from "@/components/DecisionMap";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { DecisionRecord, ReasoningAnalysis } from "@/lib/types";

export default function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/decisions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.decision) {
          throw new Error(data.error || "Decision not found");
        }
        setDecision(data.decision);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error fetching decision");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <Link
            href="/saved"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Your Decisions</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-500 text-xs font-mono space-y-2">
            <Sparkles className="w-5 h-5 animate-spin mx-auto text-amber-400" />
            <p>Loading decision journey & evolution snapshots...</p>
          </div>
        ) : error || !decision ? (
          <div className="max-w-md mx-auto my-16 p-6 rounded-xl bg-[#12161f] border border-rose-800 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h2 className="text-base font-semibold text-slate-200 mb-1">Journey Not Found</h2>
            <p className="text-xs text-slate-400 mb-4">{error || "This journey could not be retrieved."}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Start New Decision Audit
            </Link>
          </div>
        ) : (
          <DecisionMap
            decision={decision}
            analysis={decision.analysis as ReasoningAnalysis}
            onReset={() => {
              router.push("/");
            }}
            onOpenSaveModal={() => {}}
          />
        )}
      </main>
    </div>
  );
}
