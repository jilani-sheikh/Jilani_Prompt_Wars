import { DecisionCategory, RiskLevel } from "./types";

export interface HighStakesClassification {
  isHighStakes: boolean;
  category: DecisionCategory;
  categoryLabel: string;
  riskLevel: RiskLevel;
  safetyNotice: string | null;
  guidanceFocus: string[];
}

const HIGH_STAKES_KEYWORDS = {
  medical: [
    "surgery", "cancer", "medication", "doctor", "diagnosis", "treatment",
    "chemotherapy", "dose", "hospital", "therapy", "symptoms", "prescription",
    "physician", "disease", "mental health", "depression", "suicide", "pain"
  ],
  legal: [
    "lawsuit", "court", "attorney", "lawyer", "divorce", "custody", "sue",
    "plea", "settlement", "contract breach", "copyright infringement", "patent",
    "criminal", "bail", "testify", "arbitration", "charges"
  ],
  financial: [
    "life savings", "mortgage", "bankruptcy", "all-in", "crypto", "leverage",
    "debt", "foreclosure", "pension", "retire early", "liquidate", "options trading",
    "high risk investment", "borrow against"
  ],
  safety: [
    "safety", "hazard", "dangerous", "emergency", "evacuation", "chemical",
    "abuse", "harassment", "physical risk", "weapon", "protective order"
  ],
};

export function detectHighStakes(text: string): HighStakesClassification {
  const normalized = text.toLowerCase();

  for (const word of HIGH_STAKES_KEYWORDS.medical) {
    if (normalized.includes(word)) {
      return {
        isHighStakes: true,
        category: "medical",
        categoryLabel: "Medical & Health Care Consideration",
        riskLevel: "High",
        safetyNotice:
          "High-Stakes Notice: This reasoning audit is designed solely to help you examine assumptions, uncertainties, and critical questions. It is NOT medical advice and does NOT provide definitive recommendations. Consult a licensed medical doctor or healthcare professional before making health-related decisions.",
        guidanceFocus: [
          "Questions to ask your attending physician or specialist",
          "Clarifying underlying clinical assumptions vs verifiable lab/clinical data",
          "Identifying second opinion needs and risk-benefit trade-offs",
        ],
      };
    }
  }

  for (const word of HIGH_STAKES_KEYWORDS.legal) {
    if (normalized.includes(word)) {
      return {
        isHighStakes: true,
        category: "legal",
        categoryLabel: "Legal & Jurisdictional Consideration",
        riskLevel: "High",
        safetyNotice:
          "High-Stakes Notice: This reasoning audit is structured to uncover overlooked legal variables, contractual ambiguities, and evidentiary gaps. It does NOT constitute legal advice or attorney representation. Consult qualified legal counsel licensed in your jurisdiction.",
        guidanceFocus: [
          "Documentary evidence and contractual obligations to inspect",
          "Potential liabilities and unaddressed contractual clauses",
          "Questions to bring to your consultation with an attorney",
        ],
      };
    }
  }

  for (const word of HIGH_STAKES_KEYWORDS.safety) {
    if (normalized.includes(word)) {
      return {
        isHighStakes: true,
        category: "safety",
        categoryLabel: "Personal Safety & Risk Management",
        riskLevel: "High",
        safetyNotice:
          "High-Stakes Notice: Safety-critical situations demand objective risk mitigation, not unilateral speculative choices. This tool assists in identifying overlooked threat vectors and emergency resources. Contact local emergency authorities or certified safety experts immediately if anyone is in danger.",
        guidanceFocus: [
          "Physical safety buffers and emergency contingency plans",
          "Immediate escalation channels and protective protocols",
          "Removal of irreversible single-point-of-failure assumptions",
        ],
      };
    }
  }

  for (const word of HIGH_STAKES_KEYWORDS.financial) {
    if (normalized.includes(word)) {
      return {
        isHighStakes: true,
        category: "financial",
        categoryLabel: "Major Financial & Capital Allocation",
        riskLevel: "Moderate",
        safetyNotice:
          "Important Financial Notice: High-consequence financial commitments require rigorous downside scenario modeling. This tool identifies optimism biases, hidden leverage, and liquidity gaps. It does not provide certified financial planning or investment advice.",
        guidanceFocus: [
          "Downside capital preservation and liquidity buffers",
          "Stress-testing assumptions against market downturns",
          "Independent certified fiduciary verification",
        ],
      };
    }
  }

  return {
    isHighStakes: false,
    category: "other",
    categoryLabel: "Strategic & Personal Decision Analysis",
    riskLevel: "General",
    safetyNotice: null,
    guidanceFocus: [
      "Rigorous assumption stress-testing",
      "Overlooked second-order consequences",
      "Actionable questions to investigate before committing",
    ],
  };
}
