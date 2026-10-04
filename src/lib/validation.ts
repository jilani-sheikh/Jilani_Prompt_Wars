import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  decision: z
    .string()
    .trim()
    .min(5, "Decision description must be at least 5 characters")
    .max(1000, "Decision description is too long (maximum 1000 characters)"),
  context: z
    .string()
    .trim()
    .min(5, "Context must be at least 5 characters")
    .max(2500, "Context is too long (maximum 2500 characters)"),
  influences: z
    .string()
    .trim()
    .min(5, "Influences must be at least 5 characters")
    .max(1500, "Influences description is too long (maximum 1500 characters)"),
  anonymousId: z.string().optional(),
});

export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;

export const ExploreSpotRequestSchema = z.object({
  decisionTitle: z.string().min(1),
  decisionContext: z.string().min(1),
  userInfluences: z.string().min(1),
  spot: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.string(),
    category: z.string(),
  }),
  action: z.enum([
    "examine",
    "challenge",
    "missing_info",
    "perspective",
    "investigate",
  ]),
});

export type ExploreSpotRequestInput = z.infer<typeof ExploreSpotRequestSchema>;

export const ReflectionRequestSchema = z.object({
  decisionId: z.string().min(1),
  userNote: z
    .string()
    .trim()
    .min(5, "Reflection note must be at least 5 characters")
    .max(3000, "Reflection note cannot exceed 3000 characters"),
  updatedReasoning: z
    .string()
    .trim()
    .min(10, "Updated reasoning must be at least 10 characters")
    .max(3000, "Updated reasoning cannot exceed 3000 characters"),
  exploredSpots: z.array(z.string()).optional(),
});

export type ReflectionRequestInput = z.infer<typeof ReflectionRequestSchema>;

export const SaveJourneyRequestSchema = z.object({
  decisionId: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
});

export type SaveJourneyRequestInput = z.infer<typeof SaveJourneyRequestSchema>;

export const GeminiAnalysisOutputSchema = z.object({
  decisionType: z.enum([
    "career",
    "education",
    "financial",
    "business",
    "personal",
    "technology",
    "travel",
    "purchase",
    "medical",
    "legal",
    "safety",
    "other",
  ]),
  categoryLabel: z.string().min(1),
  riskLevel: z.enum(["General", "Moderate", "High"]),
  isHighStakes: z.boolean(),
  safetyNotice: z.string().nullable(),
  summary: z.string().min(1),
  assumptions: z.array(
    z.object({
      id: z.string(),
      assumption: z.string(),
      whyItMatters: z.string(),
      fragility: z.enum(["Low", "Medium", "High"]),
    })
  ).min(1),
  blindSpots: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      impact: z.string(),
      category: z.string(),
    })
  ).min(1),
  reasoningConflicts: z.array(
    z.object({
      id: z.string(),
      tension: z.string(),
      sideA: z.string(),
      sideB: z.string(),
    })
  ),
  informationGaps: z.array(
    z.object({
      id: z.string(),
      gap: z.string(),
      whyNeeded: z.string(),
      howToVerify: z.string(),
      searchTopic: z.string().optional(),
    })
  ).min(1),
  criticalQuestions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      purpose: z.string(),
    })
  ).min(1),
  alternativePerspectives: z.array(
    z.object({
      id: z.string(),
      perspectiveName: z.string(),
      viewpoint: z.string(),
      keyConsideration: z.string(),
    })
  ).min(1),
  evidenceDirections: z.array(
    z.object({
      id: z.string(),
      verifiableFact: z.string(),
      suggestedSource: z.string(),
    })
  ).min(1),
  reasoningCoverage: z.object({
    score: z.number().min(0).max(100),
    label: z.string(),
    dimensions: z.array(
      z.object({
        name: z.string(),
        status: z.enum(["Examined", "Partially Examined", "Unexamined"]),
        explanation: z.string(),
      })
    ),
  }),
});
