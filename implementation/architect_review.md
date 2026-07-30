# 🏗️ Senior Architect Review — Implementation Plan v6

**Reviewed by**: Senior Architect Agent  
**Date**: 2026-07-29  
**Verdict**: Plan is **architecturally sound** with **7 gaps** identified and **3 corrections** needed before implementation.

---

## ✅ What's Solid

| Area | Assessment |
|---|---|
| **Feature-first module architecture** | Excellent — clean domain separation under `src/features/` |
| **Prisma schema design** | Well-normalized, proper indexes, correct cascade/setNull semantics |
| **Docker multi-stage build** | Optimal 3-stage pattern, non-root execution, Alpine base |
| **Security posture** | 26 measures cover OWASP Top 10 comprehensively |
| **Cost strategy** | Realistic ~$15-25/month; free-tier LLM selections are viable |
| **RBAC model** | Feature-level granularity with `full/read/none` per module is flexible |
| **Observability stack** | Pino → Sentry → AuditLog → UptimeRobot covers all four pillars |

---

## 🔴 Gap 1: CI/CD Pipeline (GitHub Actions) — MISSING

> [!CAUTION]
> **No CI/CD pipeline is defined.** The plan mentions `npm audit` in CI (security item #23) but never defines the actual GitHub Actions workflow. This is a critical omission for a production-grade application.

### What Must Be Added
1. **`.github/workflows/ci.yml`** — Triggered on every PR and push to `main`:
   - Install dependencies (`pnpm install --frozen-lockfile`)
   - TypeScript type-check (`npx tsc --noEmit`)
   - ESLint lint (`npx eslint .`)
   - Vitest unit/integration tests (`npm run test`)
   - Security audit (`npm audit --audit-level=high`)
   - Prisma schema validation (`npx prisma validate`)
   - Docker build smoke test (`docker build -f docker/Dockerfile .`)

2. **`.github/workflows/deploy.yml`** — Triggered on push to `main` (after CI passes):
   - SSH into Hetzner VPS
   - Execute `scripts/deploy.sh` for zero-downtime rolling deployment
   - Post-deploy health check verification
   - Slack/Discord notification on success/failure (optional)

3. **`.github/workflows/db-backup.yml`** — Scheduled cron (`0 3 * * *`):
   - SSH trigger of `scripts/backup-db.sh`
   - Verify backup integrity

4. **`.github/dependabot.yml`** — Weekly automated dependency update PRs

---

## 🔴 Gap 2: Error Boundary & Suspense Strategy — INCOMPLETE

The plan lists `error.tsx` and `loading.tsx` at root level but doesn't specify:
- **Per-feature `error.tsx`** boundaries (e.g., a GBP API failure shouldn't crash the entire dashboard)
- **Streaming with `<Suspense>`** boundaries around heavy data-fetching components (TanStack Table, Recharts charts)
- **`not-found.tsx`** at the `(dashboard)` route group level for 404s within the dashboard

### Recommendation
Each module route group should have its own `error.tsx` and strategic `loading.tsx` / `<Suspense>` placements.

---

## 🔴 Gap 3: Database Connection Pooling — MISSING

On a 4GB RAM Hetzner VPS running 6 Docker containers, PostgreSQL connection exhaustion is a real risk.

### What Must Be Added
- **Prisma connection pooling** via `connection_limit` in the datasource URL
- **PgBouncer** as a lightweight connection pooler sidecar (or configure PostgreSQL `max_connections` appropriately)
- Document recommended `DATABASE_URL` format: `postgresql://user:pass@postgres:5432/qrm?connection_limit=10&pool_timeout=20`

---

## 🔴 Gap 4: API Route Versioning & Error Contract — MISSING

The plan defines `/api/health`, `/api/cron/`, `/api/webhooks/` but doesn't establish:
- A **consistent API error response shape** (e.g., `{ success: boolean, error?: { code: string, message: string } }`)
- **API route middleware pattern** for auth + rate-limiting + error-catching on every route
- Whether webhook endpoints require **signature verification** (e.g., HMAC for incoming GBP webhooks)

### Recommendation
Create `src/lib/api/response.ts` with standardized `successResponse()` and `errorResponse()` helpers used across all route handlers.

---

## 🔴 Gap 5: File Upload & Storage Strategy — UNDERSPECIFIED

The plan mentions Cloudflare R2 for storage but doesn't define:
- **Upload flow**: Client → signed presigned URL → direct R2 upload (recommended) vs. Client → Server → R2
- **File type/size validation** on both client and server
- **Image optimization pipeline** (sharp resize before R2 upload for logos, post images)
- Where `imageUrl`, `logoUrl`, `pdfUrl`, `reportPdfUrl` fields actually get their values

### Recommendation
Define a `src/lib/storage/` module with `uploadToR2()`, `getSignedUrl()`, and `deleteFromR2()` helpers. All file fields in Prisma should store R2 object keys, not full URLs.

---

## 🔴 Gap 6: Database Migration Strategy for Production — MISSING

The plan uses `npx prisma migrate dev` implicitly but doesn't define:
- **Production migration workflow**: `prisma migrate deploy` (not `dev`) in Docker entrypoint
- **Migration rollback strategy** for failed deployments
- **Seed strategy separation**: Dev seeds vs. production initial data (Super Admin account creation)

### Recommendation
Add a `docker/entrypoint.sh` that runs `npx prisma migrate deploy` before `node server.js`, and document the rollback procedure.

---

## 🔴 Gap 7: Testing Strategy — THIN

The plan mentions Vitest and `__tests__/` directories but doesn't define:
- **Minimum coverage targets** (recommend 80% for `src/lib/`, 60% for features)
- **Test database strategy** (separate `DATABASE_URL_TEST` pointing to a test container)
- **Server Action testing patterns** (mocking Prisma, mocking Redis)
- **E2E test runner** — Playwright for E2E or just unit/integration? The plan has Playwright for crawling but doesn't mention it for UI E2E testing.

### Recommendation
Use Playwright for E2E tests (login flow, RBAC guards, CRUD operations) in addition to its SEO crawling role. Define test database lifecycle in CI.

---

## 🟡 Correction 1: Package Manager Inconsistency

The plan says **pnpm** in the runtime section (line 35) but the Dockerfile uses `npm ci` (line 246) and `package-lock.json` (line 245). Pick one:

### Recommendation
**Use `pnpm`** consistently everywhere — it's faster, stricter, and uses ~60% less disk space than npm. Update:
- Dockerfile: `COPY pnpm-lock.yaml ./` → `RUN corepack enable && pnpm install --frozen-lockfile`
- CI: `pnpm install --frozen-lockfile`
- Scripts: `pnpm run build`, `pnpm run test`
- Add `pnpm-workspace.yaml` (even for single-package, it enforces strict mode)

---

## 🟡 Correction 2: `tailwind.config.ts` May Not Be Needed

Tailwind CSS v4 uses **CSS-first configuration** (`@theme` directives in `globals.css`) and typically doesn't need a `tailwind.config.ts` file. The plan lists it in the folder structure (line 887). In Tailwind v4:
- Design tokens go in `globals.css` via `@theme { ... }`
- Content detection is automatic (no `content: [...]` config needed)

### Recommendation
Remove `tailwind.config.ts` from the folder structure. Use CSS-first config in `globals.css`. Only create `tailwind.config.ts` if a specific plugin (e.g., `tailwind-animate`) requires it.

---

## 🟡 Correction 3: Missing Prisma Schema Additions

Several schema gaps for a production app:

| Missing | Why It's Needed |
|---|---|
| `Account` and `Session` models | Required by NextAuth.js v5 for OAuth + database session strategy |
| `VerificationToken` model | Required by NextAuth.js for email verification and magic links |
| `createdBy` field on `Lead`, `Agreement`, `Post`, `ServicePage` | Needed for audit trail — who created this record? |
| `GbpReview` model | Module 5 and 12 need to store fetched GBP reviews for the review feed and reply tracking |
| `KeywordRankHistory` model | Module 6 needs historical rank data points for trend charts, not just `currentRank`/`previousRank` |
| `CitationListing` model | Module 13's NAP consistency checker needs a table of directory listings, not just backlinks |

---

## 📋 Summary of Required Additions Before Implementation

| # | Item | Priority | Effort |
|---|---|---|---|
| 1 | GitHub Actions CI/CD workflows (3 files + dependabot) | 🔴 Critical | Medium |
| 2 | Per-feature error boundaries & Suspense strategy | 🔴 High | Low |
| 3 | PgBouncer / connection pooling config | 🔴 High | Low |
| 4 | Standardized API error contract | 🔴 High | Low |
| 5 | R2 storage upload/download module | 🔴 High | Medium |
| 6 | Production migration & rollback strategy | 🔴 High | Low |
| 7 | Testing strategy & coverage targets | 🟡 Medium | Low |
| 8 | Fix pnpm vs npm inconsistency | 🟡 Medium | Trivial |
| 9 | Fix Tailwind v4 CSS-first config | 🟡 Low | Trivial |
| 10 | Add missing Prisma models (NextAuth, GbpReview, KeywordRankHistory, CitationListing) | 🔴 High | Medium |

> [!IMPORTANT]
> All 10 items above are incorporated into the phase-by-phase task breakdown documents. **The `implementation_plan.md` file is NOT modified** — these corrections live as implementation guidance in the phase docs.
