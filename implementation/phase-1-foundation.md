# Phase 1 — Foundation, DevOps & RBAC

**Duration**: ~2 weeks (14 subtasks)  
**Prerequisites**: Node.js 20+ LTS installed, Docker Desktop running, GitHub repo created  
**Outcome**: A fully authenticated, RBAC-protected dashboard shell with Docker, CI/CD, observability, and 4 core modules live.

---

## Workstream A: Project Initialization & Tooling

### 1.1 — Initialize Next.js 15+ Project

**Goal**: Create the Next.js project with pnpm and Turbopack as the dev server bundler.

**Steps**:
1. Run `npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack` inside `QRM Dashboard/`
2. Verify `pnpm dev` starts Turbopack dev server at `localhost:3000`
3. Create `.nvmrc` with content `20`
4. Update `package.json` → `"engines": { "node": ">=20.0.0", "pnpm": ">=9.0.0" }`
5. Update `next.config.ts` → add `output: 'standalone'` for Docker

> [!IMPORTANT]
> **Architect Correction**: Use `pnpm` everywhere — not `npm`. Update all scripts in `package.json` if `create-next-app` defaults to npm.

**Files Created/Modified**:
- `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `.nvmrc`, `tsconfig.json`

**Acceptance Criteria**:
- [x] `pnpm dev` starts at `localhost:3000` with Turbopack
- [x] `pnpm build` produces standalone output in `.next/standalone/`
- [x] `.nvmrc` pins Node.js 20

---

### 1.2 — Configure TypeScript Strict Mode & Path Aliases

**Goal**: Maximum type safety from day one.

**Steps**:
1. Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "forceConsistentCasingInFileNames": true,
       "paths": {
         "@/*": ["./src/*"],
         "@/components/*": ["./src/components/*"],
         "@/features/*": ["./src/features/*"],
         "@/lib/*": ["./src/lib/*"],
         "@/hooks/*": ["./src/hooks/*"],
         "@/types/*": ["./src/types/*"]
       }
     }
   }
   ```
2. Install `@t3-oss/env-nextjs` and `zod` for type-safe environment variables
3. Create `src/lib/env.ts` with validated env schema

**Files Created/Modified**:
- `tsconfig.json`, `src/lib/env.ts`

**Acceptance Criteria**:
- [x] `pnpm tsc --noEmit` passes with zero errors
- [x] Path aliases resolve correctly (`@/lib/...`, `@/features/...`)
- [x] Missing required env vars throw at build time

---

### 1.3 — Install & Configure Tailwind CSS v4 (CSS-First Config)

**Goal**: Design system tokens via CSS-first `@theme` directives.

> [!IMPORTANT]
> **Architect Correction**: Tailwind CSS v4 uses CSS-first configuration. Do NOT create a `tailwind.config.ts` file unless a specific plugin (like `tailwind-animate`) requires it. All design tokens go in `src/app/globals.css` via `@theme { }`.

**Steps**:
1. Verify `create-next-app` installed Tailwind v4 (check `package.json`)
2. Configure `src/app/globals.css` with the agency design system:
   ```css
   @import "tailwindcss";

   @theme {
     --color-primary: oklch(0.65 0.22 260);
     --color-primary-foreground: oklch(0.98 0.01 260);
     --color-secondary: oklch(0.55 0.15 200);
     --color-accent: oklch(0.70 0.18 150);
     --color-destructive: oklch(0.55 0.22 25);
     --color-warning: oklch(0.75 0.18 80);
     --color-success: oklch(0.65 0.20 145);
     --color-muted: oklch(0.92 0.01 260);
     --color-background: oklch(0.99 0.005 260);
     --color-foreground: oklch(0.15 0.01 260);
     --color-card: oklch(1.0 0.0 0);
     --color-border: oklch(0.90 0.01 260);
     --font-sans: 'Inter', sans-serif;
     --font-mono: 'JetBrains Mono', monospace;
     --radius-sm: 0.375rem;
     --radius-md: 0.5rem;
     --radius-lg: 0.75rem;
     --radius-xl: 1rem;
   }

   /* Dark mode overrides */
   @media (prefers-color-scheme: dark) {
     @theme {
       --color-background: oklch(0.15 0.01 260);
       --color-foreground: oklch(0.95 0.005 260);
       --color-card: oklch(0.18 0.01 260);
       --color-border: oklch(0.25 0.01 260);
       --color-muted: oklch(0.22 0.01 260);
     }
   }
   ```
3. Download and self-host Inter and JetBrains Mono in `public/fonts/`
4. Configure `src/app/layout.tsx` with `next/font/local` font loading

**Files Created/Modified**:
- `src/app/globals.css`, `src/app/layout.tsx`, `public/fonts/`

**Acceptance Criteria**:
- [x] Design tokens render correctly in both light and dark modes
- [x] Custom fonts load without FOUT (Flash of Unstyled Text)
- [x] No `tailwind.config.ts` file exists (CSS-first config only)

---

### 1.4 — Install shadcn/ui & Generate Base Components

**Goal**: Copy-paste component library with consistent styling.

**Steps**:
1. Run `pnpm dlx shadcn@latest init` and configure for Tailwind v4
2. Generate ~25 base primitives:
   ```bash
   pnpm dlx shadcn@latest add button card input label select textarea
   pnpm dlx shadcn@latest add dialog sheet dropdown-menu popover tooltip
   pnpm dlx shadcn@latest add table tabs badge separator avatar
   pnpm dlx shadcn@latest add form checkbox radio-group switch slider
   pnpm dlx shadcn@latest add skeleton toast sonner command scroll-area
   ```
3. Create `components.json` with theme and alias configuration
4. Install `lucide-react` for icons, `framer-motion` for animations

**Packages**:
```bash
pnpm add lucide-react framer-motion class-variance-authority clsx tailwind-merge
```

**Files Created/Modified**:
- `components.json`, `src/components/ui/*.tsx` (25+ files), `src/lib/utils.ts`

**Acceptance Criteria**:
- [x] All 25 shadcn/ui primitives render correctly
- [x] `cn()` utility function works with Tailwind v4 class merging
- [x] Dark mode toggles correctly on all primitives

---

### 1.5 — Setup ESLint Flat Config, Prettier, EditorConfig

**Goal**: Consistent code quality enforcement.

**Steps**:
1. Create `eslint.config.mjs` with Next.js and TypeScript rules:
   ```js
   import { FlatCompat } from '@eslint/eslintrc';
   const compat = new FlatCompat();
   export default [
     ...compat.extends('next/core-web-vitals', 'next/typescript'),
     {
       rules: {
         '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
         '@typescript-eslint/no-explicit-any': 'error',
         'no-console': ['warn', { allow: ['warn', 'error'] }],
       },
     },
   ];
   ```
2. Create `.prettierrc`:
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "all",
     "printWidth": 100,
     "tabWidth": 2,
     "plugins": ["prettier-plugin-tailwindcss"]
   }
   ```
3. Create `.prettierignore` (node_modules, .next, coverage, dist)
4. Create `.editorconfig`

**Packages**:
```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

**Files Created/Modified**:
- `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.editorconfig`

---

### 1.6 — Setup Husky, lint-staged, Commitlint

**Goal**: Pre-commit quality gates and conventional commit messages.

**Steps**:
1. Install and initialize Husky:
   ```bash
   pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
   pnpm exec husky init
   ```
2. Create `.husky/pre-commit`:
   ```bash
   pnpm exec lint-staged
   ```
3. Create `.husky/commit-msg`:
   ```bash
   pnpm exec commitlint --edit "$1"
   ```
4. Create `commitlint.config.js`:
   ```js
   export default {
     extends: ['@commitlint/config-conventional'],
     rules: {
       'scope-enum': [2, 'always', [
         'auth', 'clients', 'leads', 'agreements', 'gbp', 'keywords',
         'competitors', 'posts', 'local-grid', 'service-pages', 'seo-audit',
         'auto-replies', 'backlinks', 'tasks', 'performance', 'notifications',
         'audit-log', 'settings', 'ui', 'api', 'db', 'devops', 'ci', 'docs'
       ]],
     },
   };
   ```
5. Create `lint-staged.config.js`:
   ```js
   export default {
     '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
     '*.{json,md,css}': ['prettier --write'],
   };
   ```

**Files Created/Modified**:
- `.husky/pre-commit`, `.husky/commit-msg`, `commitlint.config.js`, `lint-staged.config.js`

---

### 1.7 — Create AI Agent Coding Rules

**Goal**: Prevent AI coding agents from drifting from project standards.

**Steps**:
1. Create `AGENTS.md` at project root with global rules:
   - Feature-first directory structure (`src/features/<module>/`)
   - Zod validation on every Server Action
   - RBAC permission check on every Server Action
   - Pino audit logging on every mutation
   - File naming conventions (kebab-case files, PascalCase components)
   
2. Create `.gemini/rules/frontend.md`:
   - Use shadcn/ui primitives exclusively (no raw HTML `<input>`, `<select>`)
   - Use Tailwind CSS theme tokens (no hardcoded colors like `bg-blue-500`)
   - Every page must support dark/light themes
   - Every route group must have `error.tsx` and `loading.tsx`
   - Use `<Suspense>` boundaries around heavy data-fetching components
   - WCAG 2.1 AA compliance (semantic HTML, ARIA labels, keyboard navigation)
   
3. Create `.gemini/rules/backend.md`:
   - Prisma parameterized queries only (zero raw SQL)
   - Redis rate limiting on all public API routes
   - AES-256-GCM encryption for stored API keys
   - BullMQ workers must use exponential backoff retry (3 attempts)
   - All errors go through standardized `errorResponse()` helper
   - Connection pooling: `connection_limit=10` in DATABASE_URL

**Files Created**:
- `AGENTS.md`, `.gemini/rules/frontend.md`, `.gemini/rules/backend.md`

---

## Workstream B: Database & Authentication

### 1.8 — Setup Prisma 6 + Complete Schema + Seed Script

**Goal**: Full database schema with all models from the plan + architect corrections.

**Steps**:
1. Install Prisma:
   ```bash
   pnpm add prisma @prisma/client
   pnpm exec prisma init
   ```
2. Create `prisma/schema.prisma` with ALL models from the implementation plan PLUS these architect-review additions:
   - `Account` model (required by NextAuth.js v5 for OAuth providers)
   - `Session` model (required by NextAuth.js v5 for database sessions)
   - `VerificationToken` model (required by NextAuth.js v5 for email verification)
   - `GbpReview` model (for Module 5 & 12 review management)
   - `KeywordRankHistory` model (for Module 6 historical rank charts)
   - `CitationListing` model (for Module 13 NAP consistency checker)
   - `createdBy` field on `Lead`, `Agreement`, `Post`, `ServicePage`

3. Create `prisma/seed.ts` with development sample data:
   - 1 Super Admin user (agency owner)
   - 2 team members (SEO Specialist, Content Writer)
   - 3 sample clients with keywords, competitors, and GBP data
   - 5 sample leads in various pipeline stages
   - Sample tasks, agreements, and audit log entries

4. Configure `docker-compose.dev.yml` with PostgreSQL 16 and Redis 7 for local development

5. Run initial migration:
   ```bash
   pnpm exec prisma migrate dev --name init
   pnpm exec prisma db seed
   ```

> [!IMPORTANT]
> **Production Migration**: Use `prisma migrate deploy` (not `dev`) in the Docker entrypoint script. Create `docker/entrypoint.sh` that runs migrations before starting the app.

**Files Created/Modified**:
- `prisma/schema.prisma`, `prisma/seed.ts`, `docker/entrypoint.sh`

**Acceptance Criteria**:
- [x] All models from implementation plan + 6 new models are defined
- [x] `prisma migrate dev` runs without errors
- [x] `prisma db seed` populates development data
- [x] `prisma validate` passes

---

### 1.9 — Build NextAuth.js v5 Authentication + RBAC Middleware

**Goal**: Secure credential-based login with session management and granular RBAC.

**Steps**:
1. Install NextAuth v5:
   ```bash
   pnpm add next-auth@beta @auth/prisma-adapter bcrypt
   pnpm add -D @types/bcrypt
   ```
2. Create `src/lib/auth.ts` — NextAuth configuration:
   - Credentials provider (email + bcrypt password)
   - Prisma adapter for database sessions
   - Session callback to include `role` and `userId`
   - JWT strategy with short-lived tokens

3. Create `src/app/api/auth/[...nextauth]/route.ts`

4. Create `middleware.ts` — Next.js edge middleware:
   - Redirect unauthenticated users to `/login`
   - Allow public paths: `/login`, `/signup`, `/forgot-password`, `/api/health`
   - Apply Redis rate limiting headers

5. Create `src/lib/auth/permissions.ts` — Granular permission verifier:
   ```typescript
   export async function withPermission(
     featureName: FeatureKey,
     level: 'full' | 'read',
   ): Promise<(userId: string) => Promise<boolean>>
   ```
   - Checks `UserPermission.customPermissions` JSON → falls back to role defaults

6. Create `src/lib/auth/roles.ts` — Default role → permission mapping:
   ```typescript
   export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
     SUPER_ADMIN: { dashboard: 'full', clients: 'full', ... },
     VIEWER: { dashboard: 'read', clients: 'read', ... },
     // ...
   };
   ```

7. Create auth pages:
   - `src/app/(auth)/layout.tsx` — Clean centered layout (no sidebar)
   - `src/app/(auth)/login/page.tsx` — Login form
   - `src/app/(auth)/signup/page.tsx` — Signup (Super Admin invite only after initial setup)
   - `src/app/(auth)/forgot-password/page.tsx` — Password reset via Resend email

**Files Created**:
- `src/lib/auth.ts`, `middleware.ts`, `src/lib/auth/permissions.ts`, `src/lib/auth/roles.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, etc.

**Acceptance Criteria**:
- [x] Login/logout flow works end-to-end
- [x] Session includes `userId`, `role`, and `name`
- [x] Unauthenticated requests redirect to `/login`
- [x] `withPermission('clients', 'full')` correctly allows/denies based on role + custom overrides
- [x] Rate limiting blocks >20 login attempts/min from same IP

---

## Workstream C: Dashboard Shell & Core Modules

### 1.10 — Build Dashboard Layout (Sidebar, Topbar, Theme Switch)

**Goal**: The outer shell of the entire dashboard — sidebar navigation, top bar, theme toggle, and notification bell.

**Steps**:
1. Create `src/app/(dashboard)/layout.tsx` — Dashboard layout with sidebar + content area
2. Create `src/components/layouts/sidebar.tsx`:
   - Collapsible left sidebar with agency logo
   - Navigation items mapped to all 18 module routes
   - **Dynamic visibility**: Items hidden when user's permission for that module is `'none'`
   - Active state highlighting
   - Mobile-responsive hamburger menu

3. Create `src/components/layouts/topbar.tsx`:
   - Agency name / breadcrumbs
   - Search command palette (shadcn/ui `<Command>`)
   - Theme toggle (Light / Dark / System) via `next-themes`
   - Notification bell icon (placeholder, wired in 1.12)
   - User avatar dropdown (profile, settings, logout)

4. Install and configure `next-themes`:
   ```bash
   pnpm add next-themes
   ```

5. Create `src/app/(dashboard)/loading.tsx` — Global dashboard loading skeleton
6. Create `src/app/(dashboard)/error.tsx` — Global dashboard error boundary

**Files Created**:
- `src/app/(dashboard)/layout.tsx`, `src/components/layouts/sidebar.tsx`, `src/components/layouts/topbar.tsx`
- `src/app/(dashboard)/loading.tsx`, `src/app/(dashboard)/error.tsx`

**Acceptance Criteria**:
- [x] Sidebar shows/hides items based on user's RBAC permissions
- [x] Theme toggle switches between Light/Dark/System
- [x] Layout is responsive (mobile hamburger menu, collapsed sidebar on tablet)
- [x] Command palette opens with `⌘+K` / `Ctrl+K`

---

### 1.11 — Build Module 1 (Dashboard Home) + Module 2 (Client Management)

**Goal**: First two functional feature modules.

**Module 1 — Dashboard Home** (`src/app/(dashboard)/page.tsx`):
- KPI cards: Total Active Clients, Total Keywords, Avg Ranking Position, Pending Leads
- Ranking Distribution Chart (Recharts stacked bar)
- Recent Activity Feed (from `AuditLog`)
- Urgent Tasks Widget
- Client Health Indicator grid

**Module 2 — Client Management** (`src/app/(dashboard)/clients/`):
- `page.tsx` — Client list (TanStack Table with search, sort, filter by status/industry)
- `[id]/page.tsx` — Client detail with sub-tabs (Overview, Keywords, GBP, Competitors, Backlinks, Notes)
- `src/features/clients/actions.ts` — Server Actions (CRUD) with Zod validation + RBAC + audit logging
- `src/features/clients/schemas.ts` — Zod schemas for client forms
- `src/features/clients/components/` — Client card, client form, status badge

**Packages**:
```bash
pnpm add recharts @tanstack/react-table @tanstack/react-query
```

**Acceptance Criteria**:
- [x] Dashboard home loads with real data from seed DB
- [x] Client CRUD works (create, read, update, delete) with proper audit trail
- [x] Client list supports search, sort, and filter
- [x] Client detail page has working sub-tab navigation
- [x] All mutations are audit-logged

---

### 1.12 — Build Module 16 (Notifications) + Module 17 (Audit Log)

**Goal**: Real-time notification system and audit trail viewer.

**Module 16 — Notifications**:
- `src/features/notifications/components/notification-bell.tsx` — Bell icon with unread badge counter
- `src/features/notifications/components/notification-panel.tsx` — Dropdown panel listing recent notifications
- `src/features/notifications/actions.ts` — Server Actions: `getNotifications()`, `markAsRead()`, `markAllAsRead()`
- `src/hooks/use-realtime.ts` — Polling hook (every 30 seconds) for new notifications
- `src/lib/notifications.ts` — Helper to create notifications (called from other modules' Server Actions)
- Super Admin automatic alerts on critical events

**Module 17 — Audit Log**:
- `src/app/(dashboard)/activity-log/page.tsx` — Full audit trail table
- Filters: User, Action Type (CREATE/UPDATE/DELETE/LOGIN/EXPORT), Resource, Date Range
- JSON diff inspector modal (expand to see before/after payload changes)
- `src/features/audit-log/actions.ts` — Server Action: `getAuditLogs()` with pagination
- `src/lib/audit.ts` — Reusable `createAuditLog()` helper used across ALL modules

**Acceptance Criteria**:
- [x] Notification bell shows unread count
- [x] Creating/updating/deleting a client triggers a Super Admin notification
- [x] Audit log table displays all mutations with correct before/after data
- [x] JSON diff modal works for any resource type

---

## Workstream D: DevOps & CI/CD

### 1.13 — Docker Stack + 8 Shell Scripts

**Goal**: Complete containerized development and production environment.

**Steps**:
1. Create `docker/Dockerfile` — Multi-stage production build (3 stages, ~150MB final image)
   - Use `pnpm` (not npm): `RUN corepack enable && pnpm install --frozen-lockfile`
   - Add `docker/entrypoint.sh`: `npx prisma migrate deploy && node server.js`
   
2. Create `docker/Dockerfile.dev` — Development build with hot reload

3. Create `docker/Dockerfile.worker` — BullMQ worker standalone image

4. Create `docker/.dockerignore`

5. Create `docker/docker-compose.yml` (Production — 6 containers):
   - `app` (Next.js standalone)
   - `postgres` (PostgreSQL 16 Alpine + health check + persistent volume)
   - `redis` (Redis 7 Alpine + LRU policy)
   - `nginx` (1.27 Alpine + SSL + rate limiting + gzip/brotli)
   - `worker` (BullMQ background jobs)
   - `playwright` (Chromium headless on-demand)

6. Create `docker/docker-compose.dev.yml` (Development — 3 containers):
   - `postgres`, `redis`, `mailpit` (local email testing)

7. Create `docker/nginx/nginx.conf` — Reverse proxy with SSL termination, rate limiting, security headers

8. Create all 8 shell scripts in `scripts/`:
   - `setup-server.sh` — VPS provisioning (Docker, UFW, swap, SSH hardening)
   - `deploy.sh` — Zero-downtime rolling deployment with health check rollback
   - `backup-db.sh` — Daily gzip pg_dump with 30-day rotation
   - `restore-db.sh` — One-command database restore
   - `generate-env.sh` — Interactive env file builder
   - `ssl-setup.sh` — Let's Encrypt Certbot SSL provisioning
   - `seed-db.sh` — Development seeding wrapper
   - `health-check.sh` — 5-minute cron health reporter

**Acceptance Criteria**:
- [x] `docker compose -f docker/docker-compose.dev.yml up` starts PG + Redis + Mailpit
- [x] `docker compose -f docker/docker-compose.yml build` succeeds
- [x] Production app container image is ≤200MB
- [x] All 8 shell scripts are executable and have `#!/bin/bash` headers
- [x] Nginx config passes `nginx -t` validation

---

### 1.14 — GitHub Actions CI/CD + Dependabot + Observability

> [!CAUTION]
> **Architect Gap #1**: This was completely missing from the original plan.

**CI Pipeline** — `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm eslint .
      - run: pnpm prettier --check .

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: qrm_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/qrm_test
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/qrm_test
          REDIS_URL: redis://localhost:6379

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=high
      - run: npx prisma validate

  build:
    needs: [lint-typecheck, test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -f docker/Dockerfile -t qrm-dashboard:ci .
```

**Deploy Pipeline** — `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    needs: []
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Hetzner VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/qrm-dashboard
            git pull origin main
            bash scripts/deploy.sh
      - name: Post-deploy health check
        run: |
          sleep 30
          curl -sf https://${{ secrets.DOMAIN }}/api/health || exit 1
```

**Dependabot** — `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 10
    reviewers:
      - "shreyas-ambhaikar"
  - package-ecosystem: docker
    directory: "/docker"
    schedule:
      interval: weekly
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
```

**Observability Setup**:
1. Create `src/lib/logger.ts` — Pino structured logger:
   ```typescript
   import pino from 'pino';
   export const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     transport: process.env.NODE_ENV === 'development'
       ? { target: 'pino-pretty' }
       : undefined,
   });
   ```
2. Install Sentry:
   ```bash
   pnpm add @sentry/nextjs
   pnpm exec sentry-wizard@latest -i nextjs
   ```
3. Create `src/app/api/health/route.ts` — Health check endpoint:
   - Verify PostgreSQL connectivity (`prisma.$queryRaw`)
   - Verify Redis connectivity (`redis.ping()`)
   - Return JSON `{ status: 'ok', db: 'connected', redis: 'connected', uptime: ... }`
4. Setup Vitest:
   ```bash
   pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
   ```
5. Create `vitest.config.ts`

**Packages**:
```bash
pnpm add pino pino-pretty @sentry/nextjs
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

**Files Created**:
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/dependabot.yml`
- `src/lib/logger.ts`, `src/app/api/health/route.ts`, `vitest.config.ts`
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`

**Acceptance Criteria**:
- [x] CI pipeline runs on every PR with lint, typecheck, test, audit, and Docker build
- [x] Deploy pipeline triggers on push to `main`
- [x] Dependabot creates weekly PRs for outdated dependencies
- [x] `/api/health` returns `200` with DB and Redis status
- [x] Pino logs emit structured JSON in production
- [x] Sentry captures and reports errors with source maps
