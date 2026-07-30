# 🤖 Quantum Reach Media — AI Agent Coding Rules

All AI coding agents (Claude, Gemini, OpenAI, AGY) MUST strictly adhere to the following rules when developing features for this project.

---

## 1. Directory & Code Organization
- **Feature-First Pattern**: All feature code MUST live in `src/features/<feature-name>/`.
  - `src/features/<module>/actions.ts` — Server Actions (data fetching & mutations)
  - `src/features/<module>/schemas.ts` — Zod validation schemas
  - `src/features/<module>/components/` — Feature-specific React components
- **Shared UI**: Base primitives live in `src/components/ui/`. Shared compound components live in `src/components/shared/`. Layouts live in `src/components/layouts/`.
- **Naming Conventions**:
  - Files and directories: `kebab-case` (e.g., `client-form.tsx`, `use-debounce.ts`)
  - Components and Types: `PascalCase` (e.g., `ClientForm`, `UserPermissions`)
  - Utilities and Actions: `camelCase` (e.g., `formatCurrency`, `getAuditLogs`)

---

## 2. Security & Data Mutations
- **Zod Validation**: EVERY Server Action or API route MUST validate input parameters using a Zod schema before accessing database or external APIs.
- **RBAC Check**: EVERY Server Action MUST verify the user's role and permission using `withPermission('featureKey', 'full'|'read')`.
- **Audit Logging**: EVERY `CREATE`, `UPDATE`, `DELETE`, or `EXPORT` operation MUST record an entry in the `AuditLog` table using `createAuditLog()`.
- **No Plaintext Secrets**: API keys, OAuth tokens, and sensitive client credentials MUST be encrypted using `src/lib/crypto.ts` before database storage.
- **No Raw SQL**: Use Prisma ORM parameterized queries exclusively. Never use `$queryRaw` with string concatenation.

---

## 3. UI & Styling
- **shadcn/ui Only**: Use shadcn/ui primitives (`Button`, `Card`, `Input`, `Dialog`, etc.). Do NOT write raw HTML `<input>`, `<select>`, or `<button>` tags without a compelling reason.
- **Tailwind CSS Tokens**: Use theme tokens (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.). Never hardcode hex/rgb colors.
- **Dark/Light Theme**: All components MUST render cleanly in both dark and light modes.
- **Accessibility**: Include `aria-label`, proper heading levels (H1-H3), and keyboard navigation focus states.

---

## 4. Error Handling & API Responses
- **Standardized API Response**: All API routes and Server Actions MUST return `ApiResponse<T>`:
  - Success: `successResponse(data)`
  - Error: `errorResponse(code, message, details)`
- **Error Boundaries**: Every route group under `src/app/(dashboard)/` MUST have an `error.tsx` file to catch feature failures gracefully.
- **Suspense & Skeletons**: Heavy data-fetching components MUST be wrapped in `<Suspense fallback={<Skeleton />}>`.

---

## 5. External Setup & Dependency Documentation
- **Pending Items & Credentials**: If a feature requires new external API keys, service integrations, database changes, webhooks, or manual configuration steps, you MUST document them immediately in `EXTERNAL_SETUP_GUIDE.md` (and its implementation directory copy) with clear, step-by-step instructions.

