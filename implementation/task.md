# 📋 QRM Dashboard — Live Task Tracker

> **Status**: 🟢 Phase 1 Complete — Ready for Phase 2  
> **Current Phase**: Phase 1 — Foundation, DevOps & RBAC  
> **Last Updated**: 2026-07-29

---

## Phase 1 — Foundation, DevOps & RBAC (~2 weeks)

### Workstream A: Project Initialization & Tooling
- [x] **1.1** Initialize Next.js 15+ project (pnpm + Turbopack + standalone output)
- [x] **1.2** Configure TypeScript strict mode, path aliases, t3-env
- [x] **1.3** Install & configure Tailwind CSS v4 (CSS-first `@theme` config)
- [x] **1.4** Install shadcn/ui + generate base components
- [x] **1.5** Setup ESLint flat config, Prettier, EditorConfig
- [x] **1.6** Setup Husky, lint-staged, commitlint (Conventional Commits)
- [x] **1.7** Create AGENTS.md + `.gemini/rules/frontend.md` + `.gemini/rules/backend.md`

### Workstream B: Database & Authentication
- [x] **1.8** Setup Prisma 6 + complete schema (incl. NextAuth + 6 new models) + seed script
- [x] **1.9** Build NextAuth.js v5 auth + RBAC middleware + permission verifier + auth pages

### Workstream C: Dashboard Shell & Core Modules
- [x] **1.10** Build Dashboard Layout (sidebar, topbar, theme switch, command palette)
- [x] **1.11** Build Module 1 (Dashboard Home) + Module 2 (Client Management)
- [x] **1.12** Build Module 16 (Notifications) + Module 17 (Audit Log)

### Workstream D: DevOps & CI/CD
- [x] **1.13** Docker stack (Dockerfile, docker-compose, Nginx) + 8 shell scripts
- [x] **1.14** GitHub Actions CI/CD (ci.yml + deploy.yml + dependabot) + Observability (Pino, Sentry, health check)

---

## Phase 2 — Core SEO Workflow & LLM Abstraction (~3 weeks)

### Workstream A: Shared Infrastructure
- [ ] **2.1** Build LLM Client abstraction layer (Groq + Cerebras + Gemini failover)
- [ ] **2.2** Build R2 Storage module (presigned URLs, upload, download, delete)
- [ ] **2.3** Build standardized API error contract (`successResponse` / `errorResponse`)

### Workstream B: Lead CRM Pipeline (Module 3)
- [ ] **2.4** Build Lead Generation Kanban board + list view (drag-and-drop)
- [ ] **2.5** Build Lead Detail, scoring algorithm, quick audit trigger
- [ ] **2.6** Build Lead → Client conversion workflow

### Workstream C: Service Agreements (Module 4)
- [ ] **2.7** Build Agreement template editor + PDF generation + email sending

### Workstream D: SEO Data & Analysis (Modules 6, 7)
- [ ] **2.8** Integrate DataForSEO API client
- [ ] **2.9** Build Module 6 (Keyword Research) + KeywordRankHistory model
- [ ] **2.10** Build Module 7 (Competitor Analysis) — domain matrix, keyword gap, SoV

### Workstream E: Tasks & Reminders (Module 14)
- [ ] **2.11** Build Module 14 (Tasks Kanban) — recurring tasks, client linking
- [ ] **2.12** Build BullMQ email digest worker + React Email templates

---

## Phase 3 — Local SEO, GBP & Graphic Engine (~3 weeks)

### Workstream A: Google Integration
- [ ] **3.1** Setup Google Cloud Project (GBP API, Maps API, OAuth consent)
- [ ] **3.2** Build Google OAuth integration flow + token refresh + encryption

### Workstream B: GBP Profile & Reviews (Module 5)
- [ ] **3.3** Build GBP Profile Optimization (profile score, sync, review table)
- [ ] **3.4** Build GBP review feed + AI reply generator (Groq + tone presets)

### Workstream C: Post Generator & Graphics (Module 8)
- [ ] **3.5** Build AI caption generator (Groq/Gemini + post type templates)
- [ ] **3.6** Build Dual-Mode Graphic Engine (Mode A: Ideogram/Imagen, Mode B: Satori/Canvas)
- [ ] **3.7** Build Post Calendar + Queue UI + BullMQ GBP scheduler worker

### Workstream D: Local Ranking Grid (Module 9)
- [ ] **3.8** Build Local Ranking Grid (Google Maps + grid overlay + rank markers)
- [ ] **3.9** Build grid snapshot worker + historical comparison + export

### Workstream E: Content & Reputation (Modules 10, 12)
- [ ] **3.10** Build Module 10 (Service Pages Generator) — wizard, AI copy, JSON-LD
- [ ] **3.11** Build Module 12 (Auto Reply Generator) — tone presets, approval workflow

---

## Phase 4 — Technical Audits & Polish (~2 weeks)

### Workstream A: Playwright Crawler (Module 11)
- [ ] **4.1** Build Playwright headless crawler worker (extractors + utils)
- [ ] **4.2** Build Module 11 (SEO Audit) — health score, issue categorization, CWV
- [ ] **4.3** Build branded PDF audit report generator

### Workstream B: Backlinks & Citations (Module 13)
- [ ] **4.4** Build Backlinks module — inventory, toxic flagging, trend chart
- [ ] **4.5** Build CitationListing model + NAP consistency checker

### Workstream C: Performance Monitoring (Module 15)
- [ ] **4.6** Build Module 15 (Performance Checker) — PageSpeed API + CWV charts
- [ ] **4.7** Build weekly performance cron worker

### Workstream D: Settings & RBAC (Module 18)
- [ ] **4.8** Build Settings (profile, branding, integrations manager, appearance)
- [ ] **4.9** Build Super Admin RBAC Matrix UI (18-module permission grid)

### Workstream E: Security & Deployment
- [ ] **4.10** OWASP security audit + CSP verification + rate-limit stress test
- [ ] **4.11** Production deployment to Hetzner VPS + smoke test + backup verification

---

## 📊 Progress Summary

| Phase | Total | Done | In Progress | Remaining |
|---|---|---|---|---|
| **Phase 1** | 14 | 14 | 0 | 0 |
| **Phase 2** | 12 | 0 | 0 | 12 |
| **Phase 3** | 11 | 0 | 0 | 11 |
| **Phase 4** | 11 | 0 | 0 | 11 |
| **Total** | **48** | **14** | **0** | **34** |
