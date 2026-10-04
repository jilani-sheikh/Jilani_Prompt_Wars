import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";
import { ReasoningAnalysis, DecisionRecord, DecisionSnapshotRecord, ReflectionRecord } from "./types";

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | null = null;
let isPrismaAvailable = false;

// Initialize Prisma with PG adapter if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);
    prisma = globalThis.__prisma || new PrismaClient({ adapter });
    if (process.env.NODE_ENV !== "production") {
      globalThis.__prisma = prisma;
    }
    isPrismaAvailable = true;
  } catch (err) {
    console.warn("Prisma pool initialization failed, using resilient storage:", err);
  }
}

// Resilient file-backed store for offline / suspended Neon environments
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "storage.json");

interface LocalStore {
  users: Array<{ id: string; email: string; name?: string; avatarUrl?: string; createdAt: string }>;
  decisions: DecisionRecord[];
}

function getLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Reading local store failed:", e);
  }
  return { users: [], decisions: [] };
}

function saveLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.warn("Saving local store failed:", e);
  }
}

export const dbService = {
  async saveDecision(params: {
    title: string;
    context: string;
    influences: string;
    analysis: ReasoningAnalysis;
    userId?: string | null;
    anonymousId?: string | null;
  }): Promise<DecisionRecord> {
    const now = new Date().toISOString();
    const id = "dec_" + Math.random().toString(36).substring(2, 10);

    // Try Prisma first if available
    if (prisma && isPrismaAvailable) {
      try {
        const created = await prisma.decision.create({
          data: {
            id,
            title: params.title,
            context: params.context,
            influences: params.influences,
            category: params.analysis.decisionType,
            riskLevel: params.analysis.riskLevel,
            isHighStakes: params.analysis.isHighStakes,
            currentStage: "explored",
            userId: params.userId || undefined,
            anonymousId: params.anonymousId || undefined,
            snapshots: {
              create: {
                version: 1,
                reasoning: params.influences,
                analysis: JSON.parse(JSON.stringify(params.analysis)),
              },
            },
          },
          include: {
            snapshots: true,
            reflections: true,
          },
        });

        const createdWithRelations = created as unknown as {
          id: string;
          title: string;
          context: string;
          influences: string;
          category: string;
          riskLevel: string;
          isHighStakes: boolean;
          currentStage: string;
          createdAt: Date;
          updatedAt: Date;
          userId: string | null;
          anonymousId: string | null;
          snapshots?: Array<{
            id: string;
            version: number;
            reasoning: string;
            analysis: unknown;
            createdAt: Date;
          }>;
        };

        return {
          id: createdWithRelations.id,
          title: createdWithRelations.title,
          context: createdWithRelations.context,
          influences: createdWithRelations.influences,
          category: createdWithRelations.category,
          riskLevel: createdWithRelations.riskLevel,
          isHighStakes: createdWithRelations.isHighStakes,
          currentStage: createdWithRelations.currentStage,
          createdAt: createdWithRelations.createdAt.toISOString(),
          updatedAt: createdWithRelations.updatedAt.toISOString(),
          userId: createdWithRelations.userId,
          anonymousId: createdWithRelations.anonymousId,
          analysis: params.analysis,
          snapshots: (createdWithRelations.snapshots || []).map((s) => ({
            id: s.id,
            version: s.version,
            reasoning: s.reasoning,
            analysis: s.analysis as unknown as ReasoningAnalysis,
            createdAt: s.createdAt.toISOString(),
          })),
        };
      } catch (e) {
        isPrismaAvailable = false;
        console.warn("Prisma save failed, falling back to persistent local repository:", e);
      }
    }

    // Resilient local fallback
    const store = getLocalStore();
    const snapshot: DecisionSnapshotRecord = {
      id: "snap_1_" + id,
      version: 1,
      reasoning: params.influences,
      analysis: params.analysis,
      createdAt: now,
    };

    const newDecision: DecisionRecord = {
      id,
      title: params.title,
      context: params.context,
      influences: params.influences,
      category: params.analysis.decisionType,
      riskLevel: params.analysis.riskLevel,
      isHighStakes: params.analysis.isHighStakes,
      currentStage: "explored",
      createdAt: now,
      updatedAt: now,
      userId: params.userId,
      anonymousId: params.anonymousId,
      analysis: params.analysis,
      snapshots: [snapshot],
      reflections: [],
    };

    store.decisions.unshift(newDecision);
    saveLocalStore(store);
    return newDecision;
  },

  async addReflection(params: {
    decisionId: string;
    userNote: string;
    updatedReasoning: string;
    exploredSpots?: string[];
  }): Promise<ReflectionRecord | null> {
    const now = new Date().toISOString();

    if (prisma && isPrismaAvailable) {
      try {
        const created = await prisma.reflection.create({
          data: {
            decisionId: params.decisionId,
            userNote: params.userNote,
            updatedReasoning: params.updatedReasoning,
            exploredSpots: params.exploredSpots ? params.exploredSpots : undefined,
          },
        });

        // Also add updated snapshot
        const existingDecision = await prisma.decision.findUnique({
          where: { id: params.decisionId },
          include: { snapshots: { orderBy: { version: "desc" }, take: 1 } },
        });

        if (existingDecision) {
          const nextVersion = (existingDecision.snapshots[0]?.version || 1) + 1;
          const prevAnalysis = (existingDecision.snapshots[0]?.analysis || {}) as unknown as ReasoningAnalysis;
          await prisma.decisionSnapshot.create({
            data: {
              decisionId: params.decisionId,
              version: nextVersion,
              reasoning: params.updatedReasoning,
              analysis: JSON.parse(JSON.stringify(prevAnalysis)),
            },
          });
          await prisma.decision.update({
            where: { id: params.decisionId },
            data: { currentStage: "reflected" },
          });
        }

        return {
          id: created.id,
          promptQuestion: created.promptQuestion,
          userNote: created.userNote,
          updatedReasoning: created.updatedReasoning,
          exploredSpots: params.exploredSpots,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma reflection save failed, using local store:", e);
      }
    }

    const store = getLocalStore();
    const decision = store.decisions.find((d) => d.id === params.decisionId);
    if (!decision) return null;

    const refId = "ref_" + Math.random().toString(36).substring(2, 9);
    const reflection: ReflectionRecord = {
      id: refId,
      promptQuestion: "Has this changed how you think about the decision?",
      userNote: params.userNote,
      updatedReasoning: params.updatedReasoning,
      exploredSpots: params.exploredSpots,
      createdAt: now,
    };

    if (!decision.reflections) decision.reflections = [];
    decision.reflections.push(reflection);
    decision.currentStage = "reflected";

    const nextVer = (decision.snapshots?.length || 1) + 1;
    const newSnapshot: DecisionSnapshotRecord = {
      id: `snap_${nextVer}_${decision.id}`,
      version: nextVer,
      reasoning: params.updatedReasoning,
      analysis: decision.analysis!,
      createdAt: now,
    };
    if (!decision.snapshots) decision.snapshots = [];
    decision.snapshots.push(newSnapshot);

    saveLocalStore(store);
    return reflection;
  },

  async getDecision(id: string): Promise<DecisionRecord | null> {
    if (prisma && isPrismaAvailable) {
      try {
        const found = await prisma.decision.findUnique({
          where: { id },
          include: {
            snapshots: { orderBy: { version: "asc" } },
            reflections: { orderBy: { createdAt: "asc" } },
          },
        });

        if (found) {
          const latestSnapshot = found.snapshots[found.snapshots.length - 1];
          return {
            id: found.id,
            title: found.title,
            context: found.context,
            influences: found.influences,
            category: found.category,
            riskLevel: found.riskLevel,
            isHighStakes: found.isHighStakes,
            currentStage: found.currentStage,
            createdAt: found.createdAt.toISOString(),
            updatedAt: found.updatedAt.toISOString(),
            userId: found.userId,
            anonymousId: found.anonymousId,
            analysis: (latestSnapshot?.analysis || {}) as unknown as ReasoningAnalysis,
            snapshots: found.snapshots.map((s) => ({
              id: s.id,
              version: s.version,
              reasoning: s.reasoning,
              analysis: s.analysis as unknown as ReasoningAnalysis,
              createdAt: s.createdAt.toISOString(),
            })),
            reflections: found.reflections.map((r) => ({
              id: r.id,
              promptQuestion: r.promptQuestion,
              userNote: r.userNote,
              updatedReasoning: r.updatedReasoning,
              exploredSpots: Array.isArray(r.exploredSpots) ? (r.exploredSpots as string[]) : [],
              createdAt: r.createdAt.toISOString(),
            })),
          };
        }
      } catch (e) {
        console.warn("Prisma fetch failed, checking local store:", e);
      }
    }

    const store = getLocalStore();
    return store.decisions.find((d) => d.id === id) || null;
  },

  async getUserDecisions(userIdOrAnonymousId: string): Promise<DecisionRecord[]> {
    if (prisma && isPrismaAvailable) {
      try {
        const list = await prisma.decision.findMany({
          where: {
            OR: [
              { userId: userIdOrAnonymousId },
              { anonymousId: userIdOrAnonymousId },
            ],
          },
          include: {
            snapshots: { orderBy: { version: "asc" } },
            reflections: { orderBy: { createdAt: "asc" } },
          },
          orderBy: { createdAt: "desc" },
        });

        return list.map((found) => {
          const latest = found.snapshots[found.snapshots.length - 1];
          return {
            id: found.id,
            title: found.title,
            context: found.context,
            influences: found.influences,
            category: found.category,
            riskLevel: found.riskLevel,
            isHighStakes: found.isHighStakes,
            currentStage: found.currentStage,
            createdAt: found.createdAt.toISOString(),
            updatedAt: found.updatedAt.toISOString(),
            userId: found.userId,
            anonymousId: found.anonymousId,
            analysis: (latest?.analysis || {}) as unknown as ReasoningAnalysis,
            snapshots: found.snapshots.map((s) => ({
              id: s.id,
              version: s.version,
              reasoning: s.reasoning,
              analysis: s.analysis as unknown as ReasoningAnalysis,
              createdAt: s.createdAt.toISOString(),
            })),
            reflections: found.reflections.map((r) => ({
              id: r.id,
              promptQuestion: r.promptQuestion,
              userNote: r.userNote,
              updatedReasoning: r.updatedReasoning,
              createdAt: r.createdAt.toISOString(),
            })),
          };
        });
      } catch (e) {
        console.warn("Prisma list failed, using local store:", e);
      }
    }

    const store = getLocalStore();
    return store.decisions.filter(
      (d) => d.userId === userIdOrAnonymousId || d.anonymousId === userIdOrAnonymousId
    );
  },

  async associateUser(decisionId: string, email: string, name?: string): Promise<void> {
    const userId = "usr_" + email.replace(/[^a-zA-Z0-9]/g, "_");

    if (prisma && isPrismaAvailable) {
      try {
        await prisma.user.upsert({
          where: { email },
          update: { name },
          create: { id: userId, email, name },
        });
        await prisma.decision.update({
          where: { id: decisionId },
          data: { userId },
        });
        return;
      } catch (e) {
        console.warn("Prisma user association failed:", e);
      }
    }

    const store = getLocalStore();
    let user = store.users.find((u) => u.email === email);
    if (!user) {
      user = { id: userId, email, name, createdAt: new Date().toISOString() };
      store.users.push(user);
    }
    const dec = store.decisions.find((d) => d.id === decisionId);
    if (dec) {
      dec.userId = userId;
    }
    saveLocalStore(store);
  },
};
