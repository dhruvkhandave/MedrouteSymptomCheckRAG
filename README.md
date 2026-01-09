# MedRoute

## Product Overview
MedRoute is a symptom-to-triage helper. A patient types their symptoms, MedRoute interprets them, scores urgency, suggests a next step, and can surface nearby providers by ZIP. It’s intended for product teams and engineers prototyping consumer-facing triage or care-routing flows. Typical user flow: enter symptoms → click “Analyze” → see severity/urgency + recommended action → optionally search providers near a ZIP → review cited reference patterns.

## How It Works
- **User symptom intake:** The Next.js page collects free-text symptoms and submits them to `/api/analyze`.
- **One-click triage action:** The “Analyze” button triggers the end-to-end pipeline and renders the structured result and recommendations.
- **Backend routes:** `/api/analyze` does the triage; `/api/providers` fetches nearby providers from the NPI registry; `/api/history` serves/saves past queries for authenticated users; `/api/voice-agent` powers a chat-based appointment bot.
- **Severity scoring & routing:** The LLM (Groq) extracts structured fields (symptoms, duration, risk factors, recommended specialist). Rule sets (`applyGlobalRules` plus optional user-specific rules) compute `final_score`, `urgency`, and `recommended_action`. A small pattern matcher adds supportive source matches, and a RAG step adds reference patterns.
- **AI vs. rule-based:** AI (Groq) handles natural-language extraction and the appointment bot dialog; AI embeddings (OpenAI) power the RAG reference matches. Scoring, guardrails, and routing decisions are deterministic rule-based logic.

## Architecture and Data Flow
- **High-level system:** Next.js app with API routes. Groq LLM for interpretation, OpenAI embeddings for RAG, Supabase for auth/history/rules, and CMS NPI Registry for provider lookup.
- **Key routes/services:** `/api/analyze` (triage), `/api/providers` (NPI lookup), `/api/history` (query history CRUD for authed users), `/api/admin/rules/*` (manage rule sets), `/api/voice-agent` (appointment chat flow).
- **Data storage:** Supabase Postgres holds users, health_queries (saved analyses), and global AI rules. Medical knowledge for RAG lives in `data/medical_knowledge.ts` (in-repo). No other database is used.
- **Data flow:** Browser → `/api/analyze` → Groq LLM → rule engine → (optional) Supabase save → OpenAI embeddings for RAG → response → UI render. Provider searches call `/api/providers`, which calls the public NPI Registry and returns simplified provider rows to the UI.

## Tech Stack
- **Frontend:** Next.js 14 + React + Tailwind CSS (fast iteration, single-page UX).
- **Backend:** Next.js API routes (co-located server logic, easy Vercel deploys).
- **AI:** Groq `llama-3.1-8b-instant` for extraction and appointment dialog; OpenAI `text-embedding-3-small` for RAG similarity.
- **Database/Auth:** Supabase (Postgres + auth) for sign-in, history, and admin rules.
- **External data:** CMS NPI Registry for provider lookup by ZIP + specialty taxonomy.
- **Infra:** Deployed on Vercel (serverless, edge-friendly defaults).

## Deployment
- **Prod:** Deployed on Vercel at https://symptom-check-groq-new.vercel.app/.
- **Environments:** Local uses `.env.local`; production uses Vercel project env vars. Supabase keys/URL should be scoped per environment.

## Local Setup
- **Prerequisites:** Node.js 18+, npm.
- **Environment variables (.env.local):**
  - `GROQ_API_KEY` (required; triage + appointment bot)
  - `OPENAI_API_KEY` (required for RAG reference matches)
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for auth/history)
  - `SUPABASE_SERVICE_ROLE_KEY` or service key with DB access for server routes that write history/rules
  - `ADMIN_EMAIL` (required for admin rules endpoints)
- **Install:** `npm install`
- **Run dev:** `npm run dev` then open `http://localhost:3000`

## API Overview (high level)
- **POST `/api/analyze`**  
  - Input: `{ input_text: string }` (plus auth cookies if logged in).  
  - Output: structured triage result (`structured_output`, `final_score`, `urgency`, `recommended_action`, `sources`, optional `rag_sources`). Saves to Supabase if the user is authenticated.
- **POST `/api/providers`**  
  - Input: `{ providerType?: string, zip: string }`.  
  - Output: Array of nearby providers (name, practiceName, address, phone) pulled from the NPI Registry; filters by taxonomy description with a code fallback.
- **GET/DELETE `/api/history`**  
  - Auth required (Supabase). Lists or deletes saved analyses for the current user.
- **POST `/api/voice-agent`**  
  - Input: `{ transcript: string, state?: object }`.  
  - Output: Dialog JSON for the appointment chat bot (step, suggested action, and text to say).

For deeper type details, see the corresponding files under `pages/api/` and `lib/`.
