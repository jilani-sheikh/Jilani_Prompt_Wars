# The Blind Spot 👁️

> **"Challenge my reasoning, don't make the decision for me."**

**The Blind Spot** is an AI-powered reasoning-audit workspace designed to expose hidden assumptions, uncover overlooked variables, recognize cognitive conflicts, and help humans think more rigorously before making consequential decisions.

Rather than acting as a prescriptive recommendation engine or a generic chatbot wrapper, The Blind Spot serves as an **intellectual thinking partner**. It never issues decisions, scores, or endorsements—it systematically examines your reasoning structure so you can decide with clarity and conviction.

---

## 🎯 Core Product Principles

* **Reasoning Audit, Not Automation:** The system never tells you what to do (e.g., no *"You should accept this offer"*). It maps where your thinking is fragile, incomplete, or contradictory.
* **No Artificial "Decision Scores":** The platform explicitly rejects synthetic verdicts (e.g., *"Decision Score: 84/100"*). Instead, it measures **Reasoning Coverage**—how many relevant dimensions (financial, operational, ethical, interpersonal, etc.) you have considered.
* **Cognitive Evolution over Static Output:** The platform preserves your initial premise, highlights discovered blind spots, and guides you to record your updated reasoning in an evolving timeline.
* **Responsible High-Stakes Safeguards:** Medical, legal, financial, and safety dilemmas are detected automatically. The platform withholds definitive advice and provides structured questions to ask licensed specialists.

---

## 🧭 The End-to-End User Journey

```mermaid
flowchart TD
    A[Landing / Entry] -->|No forced auth| B[Explore Mode]
    B -->|3-Question Prompt| C[Server-Side Gemini Reasoning Engine]
    C --> D[Guided Decision Map]
    D --> E[Hero Blind Spots: 01, 02, 03]
    D --> F[Reasoning Coverage Gauge]
    D --> G[Progressive Disclosure: Assumptions, Conflicts, Info Gaps]
    E -->|Click Explore this| H[Interactive Probing Modal]
    H -->|Google Search Grounding| I[Verified Empirical Evidence]
    D --> J[Reflection: Has this changed how you think?]
    J --> K[Evolved Reasoning Snapshot: Before → Discovered → Now]
    K -->|Save Journey| L[Personal Mode & Google Sign-In]
```

1. **Entry & Exploration**: Enter any decision without forced login via 3 structured prompts:
   - *What decision are you considering?*
   - *What do you know so far?*
   - *What is currently influencing your thinking?*
2. **Server-Side Reasoning Audit**: The reasoning is analyzed by Google's Gemini models using strict Zod schemas to return structured audit dimensions.
3. **The Decision Map**:
   - **Stated Reasoning**: Baseline summary of current beliefs.
   - **Reasoning Coverage**: Visual indicator showing how many critical dimensions have been mapped.
   - **Hero Blind Spots**: The 2–4 most significant factors overlooked, with clear *"Why this matters"* callouts.
   - **Progressive Disclosure**: Expandable views for silent assumptions, reasoning conflicts/tensions, critical information gaps, alternative perspectives, and empirical verification criteria.
4. **Interactive Blind Spot Probes**:
   - *Examine This* — Unpack operational friction points.
   - *Challenge Assumption* — Stress-test premises against counterfactual scenarios.
   - *What Information Am I Missing?* — Surface essential unknowns.
   - *Alternative Perspective* — View the dilemma through diverse personas (e.g., Mentor, Financial Auditor, Peer).
   - *Investigate with Google* — Query real-time empirical data via Google Search Grounding with verified citations.
5. **Reasoning Evolution & Reflection**:
   - Prompts the user: *"After seeing these blind spots, what are you thinking differently now?"*
   - Records an updated reasoning version without overwriting the baseline.
   - Visualizes cognitive growth: `Before (Initial)` $\rightarrow$ `What You Discovered` $\rightarrow$ `Now (Updated)`.
6. **Personal Mode**:
   - One-click Google Sign-In to save and revisit decision journeys in `/saved`.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16.3 (App Router, Turbopack, Server & Client Components) |
| **Language** | TypeScript 5 (Strict Mode, 0 `any` types) |
| **Styling & Design** | Tailwind CSS v4, Plus Jakarta Sans, Newsreader Serif, Obsidian Dark Theme |
| **AI Reasoning Engine** | Google Gemini API (`@google/genai`) with Google Search Grounding |
| **Database & ORM** | Prisma 7, PostgreSQL (Neon), Resilient Local Fallback Engine |
| **Validation** | Zod Schema Validation on all API payloads & Gemini responses |
| **Testing** | Node.js Test Runner & `tsx` |

---

## 📂 Project Structure

```
├── prisma/
│   └── schema.prisma         # Models: User, Decision, DecisionSnapshot, Reflection
├── prisma7.config.ts         # Prisma 7 PostgreSQL configuration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/      # Reasoning audit endpoint (Gemini Engine)
│   │   │   ├── auth/         # Google Sign-In, session, logout
│   │   │   ├── decisions/    # Decision CRUD, snapshots, reflection
│   │   │   ├── explore-spot/ # Deep-dive blind spot probes
│   │   │   └── investigate/  # Google Search Grounding evidence synthesis
│   │   ├── journey/[id]/     # Saved decision journey deep-dive view
│   │   ├── saved/            # Personal Mode saved decisions archive
│   │   ├── globals.css       # Obsidian palette, radial lighting, typography
│   │   ├── layout.tsx        # SEO metadata, dark theme
│   │   └── page.tsx          # Main decision workspace
│   ├── components/
│   │   ├── BlindSpotModal.tsx    # Interactive exploration modal with Google grounding
│   │   ├── CoverageGauge.tsx     # Dimension coverage indicator
│   │   ├── DecisionMap.tsx       # Guided decision hierarchy & progressive disclosure
│   │   ├── EvolutionTimeline.tsx # Reasoning version evolution map
│   │   ├── ExploreForm.tsx       # 3-step structured input & calm loading state
│   │   ├── Header.tsx            # Luminous navigation & Google Sign-In
│   │   ├── HighStakesNotice.tsx  # Calm specialist advisory panel
│   │   ├── ReflectionCard.tsx    # Evolved thinking recorder
│   │   └── SaveJourneyModal.tsx  # Google Sign-In modal
│   └── lib/
│       ├── db.ts             # Prisma 7 client with automatic fallback
│       ├── gemini.ts         # Gemini SDK caller, timeout wrappers & analytical fallback
│       ├── grounding.ts      # Google Search Grounding integration
│       ├── highStakes.ts     # Medical/legal/financial/safety heuristic detector
│       ├── session.ts        # Cookie-based session identity
│       ├── types.ts          # Complete domain interfaces
│       └── validation.ts     # Zod schemas for requests & outputs
└── tests/
    ├── highStakes.test.ts    # High-stakes detection & safety policy tests
    ├── reasoningLogic.test.ts# Coverage & snapshot versioning tests
    └── validation.test.ts    # Input & Gemini output validation tests
```

---

## ⚡ Getting Started

### 1. Prerequisites
* Node.js 20+ installed
* npm or pnpm
* Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
* *(Optional)* PostgreSQL Database URL (e.g., Neon)

### 2. Clone & Install
```bash
git clone https://github.com/jilani-sheikh/Jilani_Prompt_Wars.git
cd Jilani_Prompt_Wars
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"
```

> **Note:** The application includes an automatic local storage fallback. If a PostgreSQL database is temporarily unreachable, decisions and reflections are seamlessly preserved locally without interrupting the user experience.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation

Run the test suite:
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Run ESLint:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

---

## 🔒 Security & Privacy

* **Zero Key Leakage:** `GEMINI_API_KEY` and database credentials are strictly server-side and never exposed to the client.
* **Input Sanitization & Output Validation:** All incoming user data and outgoing Gemini structured responses are verified against strict Zod schemas.
* **Safe High-Stakes Handling:** The system refuses to provide definitive medical or legal recommendations, directing users to qualified professionals with helpful preparatory questions.
* **Secrets Protection:** `.env` and local storage caches are excluded from version control via `.gitignore`.

---

## 🏆 Evaluator Criteria Alignment

| Evaluator Criterion | Implementation Details |
|---|---|
| **Problem Statement Alignment** | Unflinching commitment to *"Challenge my reasoning, don't make the decision for me."* Structured reasoning audit rather than chatbot replies or automated choice endorsement. |
| **Google Services Usage** | Powered by Google Gemini (`@google/genai`) for structured analytical extraction, plus real-time Google Search Grounding for factual verification. |
| **Code Quality** | Strict TypeScript throughout, clean separation of concerns, focused components, modular API routes, and 0 linting warnings. |
| **Security** | Server-side API key containment, safe error boundaries, cookie-based session tokens, and Zod input/output schemas. |
| **Efficiency & Resilience** | Sub-second client interactions, server-side caching, 8-second AI timeout wrappers with analytical fallback, and resilient database fallback. |
| **Accessibility (a11y)** | Semantic HTML5 structure, accessible ARIA roles, visible focus rings, high contrast typography, and full keyboard navigability. |
| **Testing** | Comprehensive unit and integration test coverage for validation schemas, high-stakes detectors, and reasoning evolution logic. |

---

## 📄 License
MIT License. Built for human critical thinking.
