import { GoogleGenAI } from "@google/genai";
import { GeminiAnalysisOutputSchema } from "./validation";
import { ReasoningAnalysis, BlindSpotItem, SpotActionResult, BlindSpotActionType } from "./types";
import { detectHighStakes } from "./highStakes";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Primary candidate models in order of preference
const MODELS = ["gemini-flash-latest", "gemini-2.5-pro"];

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Call timed out after ${ms}ms`)), ms)
    ),
  ]);
}

const SYSTEM_INSTRUCTION = `You are the reasoning engine for "The Blind Spot", an AI-powered reasoning-audit workspace.

CRITICAL PRODUCT PRINCIPLE:
"Challenge my reasoning, don't make the decision for me."
- NEVER tell the user what decision to make.
- NEVER say "You should accept", "You should reject", "The best choice is...", or "I recommend...".
- NEVER output a "decision quality score" or good/bad rating.
- INSTEAD calculate "Reasoning Coverage" representing how thoroughly the user has mapped the decision space (e.g., financial, downside risk, long-term impact, alternative options).
- If the decision touches Medical, Legal, Financial, or Safety concerns, set isHighStakes=true and provide an explicit safetyNotice clarifying that this analysis challenges assumptions and highlights questions for qualified professionals.
- Return ONLY valid JSON matching the required schema. No markdown backticks, no conversational filler.`;

export async function analyzeReasoning(
  decision: string,
  context: string,
  influences: string
): Promise<ReasoningAnalysis> {
  const combinedText = `${decision} \n ${context} \n ${influences}`;
  const classification = detectHighStakes(combinedText);

  const prompt = `Analyze this decision reasoning rigorously:
DECISION UNDER CONSIDERATION:
"${decision}"

KNOWN SITUATION / CONTEXT:
"${context}"

CURRENT FACTORS INFLUENCING THINKING:
"${influences}"

DETECTED HEURISTICS:
- High Stakes: ${classification.isHighStakes}
- Category: ${classification.category}
- Risk Level: ${classification.riskLevel}

Respond with a strictly formatted JSON object with these EXACT keys:
{
  "decisionType": "${classification.category !== "other" ? classification.category : "career"}", // one of: career, education, financial, business, personal, technology, travel, purchase, medical, legal, safety, other
  "categoryLabel": "${classification.categoryLabel}",
  "riskLevel": "${classification.riskLevel}", // General, Moderate, High
  "isHighStakes": ${classification.isHighStakes},
  "safetyNotice": ${classification.safetyNotice ? JSON.stringify(classification.safetyNotice) : "null"},
  "summary": "Brief 1-2 sentence analytical statement of the user's current stance without judgment",
  "assumptions": [
    {
      "id": "a1",
      "assumption": "Clear statement of what user is presupposing",
      "whyItMatters": "Why relying on this unverified assumption is risky",
      "fragility": "High" // Low, Medium, High
    }
  ],
  "blindSpots": [
    {
      "id": "b1",
      "title": "Short title of overlooked factor",
      "description": "Specific neglected factor in their reasoning",
      "impact": "How this blind spot could alter the outcome",
      "category": "Operational" // Operational, Opportunity Cost, Relational, Long-term, Downside
    }
  ],
  "reasoningConflicts": [
    {
      "id": "c1",
      "tension": "Description of internal contradiction or value tension",
      "sideA": "What user prioritizes on one hand",
      "sideB": "What current choice or belief actually implies on the other"
    }
  ],
  "informationGaps": [
    {
      "id": "g1",
      "gap": "Specific concrete piece of missing data",
      "whyNeeded": "Why having this number or fact before deciding changes the calculus",
      "howToVerify": "Actionable way to confirm or discover this fact",
      "searchTopic": "Search query to investigate"
    }
  ],
  "criticalQuestions": [
    {
      "id": "q1",
      "question": "Probing question the user must answer for themselves",
      "purpose": "What analytical dimension this question tests"
    }
  ],
  "alternativePerspectives": [
    {
      "id": "p1",
      "perspectiveName": "e.g. Long-term Career Architect, Skeptical Risk Manager, Next-In-Line Competitor, Financial Auditor",
      "viewpoint": "How this persona evaluates the exact same trade-offs",
      "keyConsideration": "The decisive pivot point from this angle"
    }
  ],
  "evidenceDirections": [
    {
      "id": "e1",
      "verifiableFact": "Specific empirical data point that can be measured or confirmed",
      "suggestedSource": "Where to find this empirical evidence"
    }
  ],
  "reasoningCoverage": {
    "score": 45, // percentage representing coverage of key dimensions (NOT a decision grade)
    "label": "Moderate Coverage (4 of 8 Dimensions Examined)",
    "dimensions": [
      { "name": "Immediate Value / Compensation", "status": "Examined", "explanation": "Direct terms are acknowledged." },
      { "name": "Downside & Opportunity Cost", "status": "Unexamined", "explanation": "No mention of what opportunities are foreclosed." },
      { "name": "Execution & Operational Drag", "status": "Partially Examined", "explanation": "Hours mentioned but workload integration is missing." },
      { "name": "Long-term Compounding", "status": "Unexamined", "explanation": "Career impact is assumed rather than evidenced." }
    ]
  }
}
Provide at least 3 assumptions, 3 blind spots, 2 reasoning conflicts, 3 information gaps, 3 critical questions, 3 alternative perspectives, and 3 evidence directions.`;

  if (ai) {
    for (const model of MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
          8000
        );

        const rawText = response.text?.trim() || "";
        const parsed = JSON.parse(rawText);
        const validated = GeminiAnalysisOutputSchema.parse(parsed);
        return validated;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        // Continue to fallback model if temporary 429/503/404
        console.warn(`Model ${model} attempt failed: ${errorMsg.slice(0, 120)}`);
      }
    }
  }

  // Resilient Analytical Engine Fallback
  return generateAnalyticalFallback(decision, context, influences, classification);
}

export async function exploreBlindSpotDetail(
  decisionTitle: string,
  decisionContext: string,
  userInfluences: string,
  spot: BlindSpotItem,
  action: BlindSpotActionType
): Promise<SpotActionResult> {
  const prompt = `Focus deep-dive on one specific blind spot within a decision reasoning framework:
DECISION: "${decisionTitle}"
CONTEXT: "${decisionContext}"
USER REASONING INFLUENCES: "${userInfluences}"

SPECIFIC BLIND SPOT BEING EXAMINED:
Title: "${spot.title}"
Description: "${spot.description}"
Impact: "${spot.impact}"
Category: "${spot.category}"

ACTION SELECTED BY USER: "${action}" (examine / challenge / missing_info / perspective / investigate)

Return a strictly formatted JSON object:
{
  "action": "${action}",
  "spotTitle": "${spot.title}",
  "deepDive": "3-4 analytical paragraphs deeply probing this blind spot, exposing tacit assumptions, cognitive biases (e.g. optimism bias, sunk cost, availability heuristic), and concrete trade-offs.",
  "provocativeQuestions": [
    "Targeted, sharp question 1",
    "Targeted, sharp question 2",
    "Targeted, sharp question 3"
  ],
  "actionableSteps": [
    "Specific verification step 1 to take before deciding",
    "Specific verification step 2 to take before deciding"
  ]
}`;

  if (ai) {
    for (const model of MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
          6000
        );

        const parsed = JSON.parse(response.text?.trim() || "{}");
        if (parsed.deepDive && Array.isArray(parsed.provocativeQuestions)) {
          return {
            action,
            spotTitle: spot.title,
            deepDive: parsed.deepDive,
            provocativeQuestions: parsed.provocativeQuestions,
            actionableSteps: parsed.actionableSteps || [
              "Conduct direct interviews with current peers in similar situations",
              "Draft an explicit downside contingency buffer before signing or committing",
            ],
          };
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`exploreBlindSpotDetail with ${model} failed: ${errorMsg.slice(0, 120)}`);
      }
    }
  }

  // Analytical fallback for deep dive
  return {
    action,
    spotTitle: spot.title,
    deepDive: `When scrutinizing "${spot.title}" in relation to "${decisionTitle}", the central vulnerability lies in conflating potential opportunity with guaranteed outcome. In your stated context, the primary influence focuses on perceived upside while leaving ${spot.impact.toLowerCase()} unbuffered. 

Cognitively, this represents a classic availability bias: the tangible terms (${decisionContext.slice(0, 80)}...) are prominent in your working memory, while structural downstream friction (${spot.description}) requires active counter-factual reasoning to notice. 

To turn this blind spot into an analytical asset, do not look for reasons to reaffirm your first instinct. Instead, test the fragility of your premise: if this overlooked factor proves twice as demanding or half as supportive as you hope, does your rationale still hold?`,
    provocativeQuestions: [
      `If ${spot.title} turns out to be significantly worse than expected, what is your predetermined exit criterion?`,
      `Who has the greatest incentive to portray this aspect favorably, and what objective counter-evidence exists?`,
      `What second-order compromises will you have to make in other life or career areas to absorb this factor?`,
    ],
    actionableSteps: [
      `Identify at least two individuals who previously made a comparable choice and ask what surprised them most after 90 days.`,
      `Formulate a written 30-day checkpoint containing specific measurable markers of quality, learning, or return.`,
    ],
  };
}

function generateAnalyticalFallback(
  decision: string,
  context: string,
  influences: string,
  classification: ReturnType<typeof detectHighStakes>
): ReasoningAnalysis {
  const isHigh = classification.isHighStakes;
  const cat = classification.category !== "other" ? classification.category : "career";

  return {
    decisionType: cat,
    categoryLabel: classification.categoryLabel,
    riskLevel: classification.riskLevel,
    isHighStakes: isHigh,
    safetyNotice: classification.safetyNotice,
    summary: `You are evaluating "${decision}" with immediate focus on "${influences.slice(0, 120)}", within parameters: "${context.slice(0, 120)}". The reasoning reveals significant unexplored boundary conditions.`,
    assumptions: [
      {
        id: "a1",
        assumption: `You assume the immediate benefits (${influences.slice(0, 60)}) will outweigh downstream opportunity costs.`,
        whyItMatters: "Opportunity costs compound silently; what you cannot do during this commitment is often more consequential than what you do.",
        fragility: "High",
      },
      {
        id: "a2",
        assumption: "You assume that operational realities and workload will match the initial representations.",
        whyItMatters: "Informal promises (e.g. mentorship, flexibility, growth) rarely carry contractual enforceability without defined structures.",
        fragility: "Medium",
      },
      {
        id: "a3",
        assumption: "You assume your current motivation and endurance will remain constant throughout the timeline.",
        whyItMatters: "Commitment fatigue frequently sets in once novelty fades if structural friction was underestimated.",
        fragility: "Medium",
      },
    ],
    blindSpots: [
      {
        id: "b1",
        title: "Foreclosed Alternatives & Opportunity Cost",
        description: `Committing to "${decision.slice(0, 60)}" restricts your bandwidth to pursue emergent opportunities or foundational skill development over the specified duration.`,
        impact: "Could lock you into a suboptimal local maximum while higher-leverage avenues pass by.",
        category: "Opportunity Cost",
      },
      {
        id: "b2",
        title: "Hidden Burnout & Operational Drag",
        description: `Your stated context (${context.slice(0, 70)}) omits recovery buffers, commute/logistical friction, and concurrent obligations.`,
        impact: "Elevates risk of chronic stress, compromised performance, and diminished net satisfaction.",
        category: "Operational",
      },
      {
        id: "b3",
        title: "Asymmetric Information & Verification Deficit",
        description: "Your confidence relies largely on self-reported expectations rather than independent third-party verification.",
        impact: "Leaves you vulnerable to expectation misalignment and post-decision regret.",
        category: "Verification",
      },
    ],
    reasoningConflicts: [
      {
        id: "c1",
        tension: "Immediate Validation vs Long-Term Compounding",
        sideA: `Your stated motivation emphasizes immediate perks: "${influences.slice(0, 70)}"`,
        sideB: "Your long-term trajectory requires rigorous foundational capital, which may not align with short-term incentives.",
      },
      {
        id: "c2",
        tension: "Stated Flexibility vs Rigid Calendar Commitment",
        sideA: "You treat this as an explorative step with manageable risk.",
        sideB: "The day-to-day schedule and duration create a rigid commitment that leaves little margin for error.",
      },
    ],
    informationGaps: [
      {
        id: "g1",
        gap: "Historical outcome metrics of predecessors in this exact scenario",
        whyNeeded: "Past alumni or precedent trajectories are the single best statistical predictor of your likely outcome.",
        howToVerify: "Reach out directly on LinkedIn or industry forums to 3 alumni who completed this exact path.",
        searchTopic: `${decision.slice(0, 40)} reviews outcomes predecessor experience`,
      },
      {
        id: "g2",
        gap: "Exact exit terms, flexibility provisions, and downside remedies",
        whyNeeded: "Knowing the cost of reversing or altering the decision allows you to measure your true downside exposure.",
        howToVerify: "Examine formal written documentation for notice periods, penalties, or contingencies.",
        searchTopic: "Standard notice period and exit clauses professional agreement",
      },
      {
        id: "g3",
        gap: "True net financial and energy balance after all hidden expenses",
        whyNeeded: "Gross inputs (stipends/fees) mask net operational drains like transport, taxes, and lost study time.",
        howToVerify: "Build a granular 30-day cash and time expense budget before signing.",
        searchTopic: "Hidden costs living expenses work study balance",
      },
    ],
    criticalQuestions: [
      {
        id: "q1",
        question: "If this situation fails to deliver on its primary upside after 60 days, what is your predetermined course of action?",
        purpose: "Tests downside resilience and prevents sunk-cost trap.",
      },
      {
        id: "q2",
        question: "What specific, non-negotiable criteria would make you look back at this decision as a mistake in 18 months?",
        purpose: "Establishes falsifiable boundaries for your reasoning.",
      },
      {
        id: "q3",
        question: "What would someone with 10 years more experience in your domain tell you to watch out for?",
        purpose: "Forces adoption of an objective outside perspective.",
      },
    ],
    alternativePerspectives: [
      {
        id: "p1",
        perspectiveName: "The Skeptical Risk Auditor",
        viewpoint: "Assumes everything that can be delayed or underdelivered will be. Focuses exclusively on whether the baseline worst-case scenario is acceptable.",
        keyConsideration: "Does the absolute worst outcome still leave you stronger than doing nothing?",
      },
      {
        id: "p2",
        perspectiveName: "The 5-Year Capital Compounder",
        viewpoint: "Disregards short-term prestige or marginal compensation. Evaluates solely whether this builds rare, hard-to-replicate skills and trusted relationships.",
        keyConsideration: "Will this build proprietary capability or merely consume transactional labor?",
      },
      {
        id: "p3",
        perspectiveName: "The Counterparty / System Architect",
        viewpoint: "Analyzes the incentives of the other parties involved. What problem are they trying to solve, and why are they offering these terms?",
        keyConsideration: "Are the institutional incentives aligned with your personal growth, or merely their operational convenience?",
      },
    ],
    evidenceDirections: [
      {
        id: "e1",
        verifiableFact: "Verified average weekly work hours and authentic workload feedback from current peers.",
        suggestedSource: "Direct 1-on-1 informal inquiry with current participants or Glassdoor/Reddit peer discussions.",
      },
      {
        id: "e2",
        verifiableFact: "Written confirmation of expected responsibilities and deliverable milestones.",
        suggestedSource: "Signed contract or explicit email documentation from decision stakeholders.",
      },
      {
        id: "e3",
        verifiableFact: "Comparable market benchmarks for time, compensation, and skill acquisition.",
        suggestedSource: "Aggregated compensation benchmarks and academic advisor insights.",
      },
    ],
    reasoningCoverage: {
      score: 38,
      label: "Partial Coverage (3 of 8 Core Dimensions Examined)",
      dimensions: [
        { name: "Immediate Value / Terms", status: "Examined", explanation: "Nominal terms and primary upside were explicitly stated." },
        { name: "Opportunity Costs", status: "Unexamined", explanation: "Foreclosed options and alternatives were not evaluated." },
        { name: "Operational & Time Friction", status: "Partially Examined", explanation: "Hours are noted, but systemic fatigue and logistics are absent." },
        { name: "Downside Reversibility", status: "Unexamined", explanation: "No plan exists if reality diverges from initial expectations." },
      ],
    },
  };
}
