# 📋 Quantum Reach Media — Master Task Breakdown

> **Source**: [implementation_plan.md](file:///C:/Users/Shreyas%20Ambhaikar/Desktop/QRM%20Dashboard/implementation_plan.md)  
> **Review**: [architect_review.md](file:///C:/Users/Shreyas%20Ambhaikar/Desktop/QRM%20Dashboard/architect_review.md)  
> **Last Updated**: 2026-07-29

---

## 🗺️ Phase Overview

```mermaid
gantt
    title QRM Dashboard — Implementation Phases
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Phase 1
    Project Init & Tooling          :p1a, 2026-08-01, 3d
    Database & Auth                 :p1b, after p1a, 4d
    Dashboard Shell & Layout        :p1c, after p1b, 3d
    DevOps & CI/CD                  :p1d, after p1a, 5d
    Observability                   :p1e, after p1b, 2d

    section Phase 2
    Lead Generation CRM             :p2a, after p1c, 4d
    Service Agreements & PDF        :p2b, after p2a, 4d
    DataForSEO & Keywords           :p2c, after p1c, 5d
    Competitor Analysis             :p2d, after p2c, 3d
    LLM Abstraction Layer           :p2e, after p1c, 3d
    Tasks & Reminders               :p2f, after p2e, 3d

    section Phase 3
    GBP Integration & OAuth         :p3a, after p2e, 5d
    Post Generator & Graphics       :p3b, after p3a, 6d
    Local Ranking Grid              :p3c, after p3a, 4d
    Service Pages Generator         :p3d, after p2e, 3d
    Auto Reply Generator            :p3e, after p3a, 3d

    section Phase 4
    Playwright Crawler & SEO Audit  :p4a, after p3b, 5d
    Backlinks & Citations           :p4b, after p2c, 4d
    Performance Checker             :p4c, after p4a, 3d
    Settings & Final RBAC           :p4d, after p3e, 3d
    Security Audit & Hardening      :p4e, after p4d, 3d
    Production Deployment           :p4f, after p4e, 2d
```

---

## 📂 Phase Documents

| Phase | Document | Modules Covered | Estimated Duration |
|---|---|---|---|
| **Phase 1** | [phase-1-foundation.md](file:///C:/Users/Shreyas%20Ambhaikar/Desktop/QRM%20Dashboard/phase-1-foundation.md) | Project Init, Tooling, Auth, RBAC, Database, Docker, CI/CD, Observability, Dashboard Layout, Module 1 (Dashboard Home), Module 2 (Client Mgmt), Module 16 (Notifications), Module 17 (Audit Log) | **~2 weeks** |
| **Phase 2** | [phase-2-core-seo.md](file:///C:/Users/Shreyas%20Ambhaikar/Desktop/QRM%20Dashboard/phase-2-core-seo.md) | Module 3 (Leads), Module 4 (Agreements), Module 6 (Keywords), Module 7 (Competitors), Module 14 (Tasks), LLM Abstraction Layer, R2 Storage Module | **~3 weeks** |
| **Phase 3** | [phase-3-local-seo.md](file:///C:/Users/Shreyas%20Ambhaikar/Desktop/QRM%20Dashboard/phase-3-local-seo.md) | Module 5 (GBP), Module 8 (Posts & Graphics), Module 9 (Local Grid), Module 10 (Service Pages), Module 12 (Auto Replies), Google OAuth Integration | **~3 weeks** |
| **Phase 4** | [phase-4-technical-polish.md](file:///C:/Users/Shreyas%20Ambhaikar/Desktop/QRM%20Dashboard/phase-4-technical-polish.md) | Module 11 (SEO Audit), Module 13 (Backlinks), Module 15 (Performance), Module 18 (Settings), Playwright Crawler, Security Hardening, Production Deployment | **~2 weeks** |

---

## 🔗 Dependency Graph

```mermaid
graph TD
    P1A[Phase 1: Project Init & Tooling] --> P1B[Phase 1: Database & Auth & RBAC]
    P1A --> P1D[Phase 1: Docker & CI/CD]
    P1B --> P1C[Phase 1: Dashboard Shell & Modules 1,2,16,17]
    P1B --> P1E[Phase 1: Observability Stack]
    
    P1C --> P2A[Phase 2: Module 3 - Leads CRM]
    P1C --> P2C[Phase 2: Module 6 - Keywords]
    P1C --> P2E[Phase 2: LLM Abstraction]
    
    P2A --> P2B[Phase 2: Module 4 - Agreements]
    P2C --> P2D[Phase 2: Module 7 - Competitors]
    P2E --> P2F[Phase 2: Module 14 - Tasks]
    
    P2E --> P3A[Phase 3: GBP OAuth & Module 5]
    P2E --> P3D[Phase 3: Module 10 - Service Pages]
    
    P3A --> P3B[Phase 3: Module 8 - Posts & Graphics]
    P3A --> P3C[Phase 3: Module 9 - Local Grid]
    P3A --> P3E[Phase 3: Module 12 - Auto Replies]
    
    P3B --> P4A[Phase 4: Playwright Crawler & Module 11]
    P2C --> P4B[Phase 4: Module 13 - Backlinks]
    P4A --> P4C[Phase 4: Module 15 - Performance]
    P3E --> P4D[Phase 4: Module 18 - Settings]
    P4D --> P4E[Phase 4: Security Audit]
    P4E --> P4F[Phase 4: Production Deployment]

    style P1A fill:#10b981
    style P1B fill:#10b981
    style P1C fill:#10b981
    style P1D fill:#10b981
    style P1E fill:#10b981
```

---

## 📊 Quick-Reference: All 48 Subtasks

### Phase 1 — Foundation, DevOps & RBAC (14 subtasks)
- [ ] 1.1 Initialize Next.js 15+ project with pnpm + Turbopack
- [ ] 1.2 Configure TypeScript strict mode, path aliases, `tsconfig.json`
- [ ] 1.3 Install & configure Tailwind CSS v4 (CSS-first `@theme` config)
- [ ] 1.4 Install shadcn/ui and generate base components (~25 primitives)
- [ ] 1.5 Setup ESLint flat config, Prettier, EditorConfig
- [ ] 1.6 Setup Husky, lint-staged, commitlint (Conventional Commits)
- [ ] 1.7 Create AGENTS.md and `.gemini/rules/*.md` coding rules
- [ ] 1.8 Setup Prisma 6 + full schema + NextAuth models + seed script
- [ ] 1.9 Build NextAuth.js v5 auth (credentials + session) + RBAC middleware
- [ ] 1.10 Build Dashboard Layout (sidebar, topbar, theme switch, notification bell)
- [ ] 1.11 Build Module 1 (Dashboard Home) + Module 2 (Client Management)
- [ ] 1.12 Build Module 16 (Notifications) + Module 17 (Audit Log)
- [ ] 1.13 Setup Docker (Dockerfile, docker-compose, Nginx) + 8 shell scripts
- [ ] 1.14 Setup GitHub Actions CI/CD + Dependabot + Observability (Pino, Sentry, Health Check)

### Phase 2 — Core SEO Workflow & LLM Abstraction (12 subtasks)
- [ ] 2.1 Build LLM Client abstraction (`src/lib/api/llm.ts`) — Groq + Cerebras + Gemini
- [ ] 2.2 Build R2 Storage module (`src/lib/storage/`) — upload, signed URLs, delete
- [ ] 2.3 Build standardized API error contract (`src/lib/api/response.ts`)
- [ ] 2.4 Build Module 3 (Lead Generation) — Kanban board + list view + CRM pipeline
- [ ] 2.5 Build Lead Detail slide-over, lead scoring, quick audit trigger
- [ ] 2.6 Build Lead → Client conversion workflow
- [ ] 2.7 Build Module 4 (Service Agreements) — template editor, PDF gen, email send
- [ ] 2.8 Integrate DataForSEO API client (`src/lib/api/dataforseo.ts`)
- [ ] 2.9 Build Module 6 (Keyword Research) — search, track, bulk import/export
- [ ] 2.10 Build Module 7 (Competitor Analysis) — domain matrix, keyword gap, SoV chart
- [ ] 2.11 Build Module 14 (Daily Tasks) — Kanban board, recurring tasks, client linking
- [ ] 2.12 Build BullMQ email digest worker for daily task summaries

### Phase 3 — Local SEO, GBP & Dual-Mode Graphic Engine (11 subtasks)
- [ ] 3.1 Setup Google Cloud Project (GBP API, Maps API, OAuth consent screen)
- [ ] 3.2 Build Google OAuth integration flow + token refresh logic
- [ ] 3.3 Build Module 5 (GBP Profile Optimization) — profile score, review table
- [ ] 3.4 Build GBP review feed + AI review reply generator (Groq)
- [ ] 3.5 Build Module 8 caption generator (AI text via Groq/Gemini)
- [ ] 3.6 Build Dual-Mode Graphic Engine (Mode A: Ideogram/Imagen, Mode B: Satori/Canvas)
- [ ] 3.7 Build Post Calendar & Queue UI + BullMQ GBP scheduler worker
- [ ] 3.8 Build Module 9 (Local Ranking Grid) — Google Maps JS API + grid overlay
- [ ] 3.9 Build grid snapshot worker + historical comparison + shareable reports
- [ ] 3.10 Build Module 10 (Service Pages Generator) — wizard, AI copy, JSON-LD
- [ ] 3.11 Build Module 12 (Auto Reply Generator) — tone presets, approval workflow

### Phase 4 — Playwright Crawler, Technical Audits & Polish (11 subtasks)
- [ ] 4.1 Build Playwright headless crawler worker (`src/workers/crawler/`)
- [ ] 4.2 Build Module 11 (Website SEO Audit) — health score, issue categorization
- [ ] 4.3 Build branded PDF audit report generator with Playwright screenshots
- [ ] 4.4 Build Module 13 (Backlinks & Citations) — inventory, toxic flagging
- [ ] 4.5 Build CitationListing model + NAP consistency checker
- [ ] 4.6 Build Module 15 (Web Performance Checker) — PageSpeed API + CWV charts
- [ ] 4.7 Build weekly performance cron worker
- [ ] 4.8 Build Module 18 (Settings) — profile, branding, integrations manager
- [ ] 4.9 Build Super Admin RBAC Matrix UI (feature access grid per user)
- [ ] 4.10 Conduct OWASP security audit, CSP verification, rate-limit stress test
- [ ] 4.11 Execute production deployment to Hetzner VPS + verify backups + final smoke test

---

## 📌 Cross-Cutting Concerns (Applied Throughout All Phases)

These are enforced via `AGENTS.md` and `.gemini/rules/*.md` on every subtask:

| Concern | Enforcement |
|---|---|
| **Zod validation** on every Server Action | Backend rule |
| **RBAC permission check** on every Server Action | Backend rule |
| **Pino audit log** on every CREATE/UPDATE/DELETE | Backend rule |
| **shadcn/ui primitives only** (no raw HTML inputs) | Frontend rule |
| **Dark/Light theme support** on every component | Frontend rule |
| **Per-feature `error.tsx`** boundary | Frontend rule |
| **`<Suspense>` with loading skeleton** on heavy data fetches | Frontend rule |
| **Vitest tests** for new utility functions and Server Actions | QA rule |
| **Conventional Commits** on every commit message | Git hook |
