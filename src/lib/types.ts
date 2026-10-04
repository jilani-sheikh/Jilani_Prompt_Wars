export type DecisionCategory =
  | "career"
  | "education"
  | "financial"
  | "business"
  | "personal"
  | "technology"
  | "travel"
  | "purchase"
  | "medical"
  | "legal"
  | "safety"
  | "other";

export type RiskLevel = "General" | "Moderate" | "High";

export interface AssumptionItem {
  id: string;
  assumption: string;
  whyItMatters: string;
  fragility: "Low" | "Medium" | "High";
}

export interface BlindSpotItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: string;
}

export interface ReasoningConflictItem {
  id: string;
  tension: string;
  sideA: string;
  sideB: string;
}

export interface InformationGapItem {
  id: string;
  gap: string;
  whyNeeded: string;
  howToVerify: string;
  searchTopic?: string;
}

export interface CriticalQuestionItem {
  id: string;
  question: string;
  purpose: string;
}

export interface AlternativePerspectiveItem {
  id: string;
  perspectiveName: string;
  viewpoint: string;
  keyConsideration: string;
}

export interface EvidenceDirectionItem {
  id: string;
  verifiableFact: string;
  suggestedSource: string;
}

export interface CoverageDimension {
  name: string;
  status: "Examined" | "Partially Examined" | "Unexamined";
  explanation: string;
}

export interface ReasoningCoverage {
  score: number; // 0-100% of dimensions covered
  label: string;
  dimensions: CoverageDimension[];
}

export interface ReasoningAnalysis {
  decisionType: DecisionCategory;
  categoryLabel: string;
  riskLevel: RiskLevel;
  isHighStakes: boolean;
  safetyNotice: string | null;
  summary: string;
  assumptions: AssumptionItem[];
  blindSpots: BlindSpotItem[];
  reasoningConflicts: ReasoningConflictItem[];
  informationGaps: InformationGapItem[];
  criticalQuestions: CriticalQuestionItem[];
  alternativePerspectives: AlternativePerspectiveItem[];
  evidenceDirections: EvidenceDirectionItem[];
  reasoningCoverage: ReasoningCoverage;
}

export type BlindSpotActionType =
  | "examine"
  | "challenge"
  | "missing_info"
  | "perspective"
  | "investigate";

export interface GroundedSource {
  title: string;
  url: string;
}

export interface SpotActionResult {
  action: BlindSpotActionType;
  spotTitle: string;
  deepDive: string;
  provocativeQuestions: string[];
  actionableSteps: string[];
  groundedEvidence?: {
    summary: string;
    sources: GroundedSource[];
  };
}

export interface DecisionRecord {
  id: string;
  title: string;
  context: string;
  influences: string;
  category: string;
  riskLevel: string;
  isHighStakes: boolean;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  anonymousId?: string | null;
  analysis?: ReasoningAnalysis;
  snapshots?: DecisionSnapshotRecord[];
  reflections?: ReflectionRecord[];
}

export interface DecisionSnapshotRecord {
  id: string;
  version: number;
  reasoning: string;
  analysis: ReasoningAnalysis;
  createdAt: string;
}

export interface ReflectionRecord {
  id: string;
  promptQuestion: string;
  userNote: string;
  updatedReasoning: string;
  exploredSpots?: string[];
  createdAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}
