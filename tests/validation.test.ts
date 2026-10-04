import test from "node:test";
import assert from "node:assert/strict";
import {
  AnalyzeRequestSchema,
  ExploreSpotRequestSchema,
  ReflectionRequestSchema,
  GeminiAnalysisOutputSchema,
} from "../src/lib/validation";

test("AnalyzeRequestSchema rejects empty or whitespace-only inputs", () => {
  const invalid = { decision: "   ", context: "Valid context", influences: "Valid influence" };
  const res = AnalyzeRequestSchema.safeParse(invalid);
  assert.equal(res.success, false);
});

test("AnalyzeRequestSchema accepts valid inputs", () => {
  const valid = {
    decision: "Should I accept this 6-month internship in Pune?",
    context: "₹15,000 stipend, 9 AM - 6 PM, frontend role",
    influences: "Stipend covers rent and peer pressure to intern",
  };
  const res = AnalyzeRequestSchema.safeParse(valid);
  assert.equal(res.success, true);
  if (res.success) {
    assert.equal(res.data.decision, valid.decision);
  }
});

test("ExploreSpotRequestSchema validates spot action types", () => {
  const spot = {
    id: "b1",
    title: "Burnout Risk",
    description: "Daily commute exceeds 90 minutes",
    impact: "High fatigue",
    category: "Operational",
  };

  const valid = {
    decisionTitle: "Internship in Pune",
    decisionContext: "Pune location",
    userInfluences: "Peer pressure",
    spot,
    action: "examine" as const,
  };

  assert.equal(ExploreSpotRequestSchema.safeParse(valid).success, true);

  const invalidAction = { ...valid, action: "make_decision_for_me" };
  assert.equal(ExploreSpotRequestSchema.safeParse(invalidAction).success, false);
});

test("ReflectionRequestSchema validates user reflection and updated reasoning", () => {
  const valid = {
    decisionId: "dec_123",
    userNote: "I realized the commute would drain my study hours.",
    updatedReasoning: "I will negotiate remote Fridays before signing.",
  };
  assert.equal(ReflectionRequestSchema.safeParse(valid).success, true);

  const tooShort = {
    decisionId: "dec_123",
    userNote: "Short",
    updatedReasoning: "No",
  };
  assert.equal(ReflectionRequestSchema.safeParse(tooShort).success, false);
});

test("GeminiAnalysisOutputSchema strictly validates structured reasoning outputs", () => {
  const mockAnalysis = {
    decisionType: "career" as const,
    categoryLabel: "Career Decision",
    riskLevel: "Moderate" as const,
    isHighStakes: false,
    safetyNotice: null,
    summary: "User is evaluating a short term role for career leverage.",
    assumptions: [
      { id: "a1", assumption: "Mentorship is guaranteed", whyItMatters: "May be neglected", fragility: "High" as const },
    ],
    blindSpots: [
      { id: "b1", title: "Commute Fatigue", description: "90 min commute", impact: "Exhaustion", category: "Operational" },
    ],
    reasoningConflicts: [
      { id: "c1", tension: "Stipend vs Learning", sideA: "Wants money", sideB: "Role is repetitive" },
    ],
    informationGaps: [
      { id: "g1", gap: "Predecessor feedback", whyNeeded: "Verify claims", howToVerify: "Ask alumni" },
    ],
    criticalQuestions: [
      { id: "q1", question: "What is the exit plan?", purpose: "Downside limit" },
    ],
    alternativePerspectives: [
      { id: "p1", perspectiveName: "Senior Architect", viewpoint: "Focus on code quality", keyConsideration: "Mentorship" },
    ],
    evidenceDirections: [
      { id: "e1", verifiableFact: "Average intern hours", suggestedSource: "Glassdoor" },
    ],
    reasoningCoverage: {
      score: 50,
      label: "Moderate Coverage",
      dimensions: [
        { name: "Financial", status: "Examined" as const, explanation: "Stipend noted" },
      ],
    },
  };

  const parsed = GeminiAnalysisOutputSchema.safeParse(mockAnalysis);
  assert.equal(parsed.success, true);
});
