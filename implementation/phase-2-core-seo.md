# Phase 2 — Core SEO Workflow & LLM Abstraction

**Duration**: ~3 weeks (12 subtasks)  
**Prerequisites**: Phase 1 complete — authenticated dashboard shell with sidebar, Client Management, and Docker stack running  
**Outcome**: Lead CRM pipeline, Service Agreements with PDF generation, Keyword & Competitor analysis from DataForSEO, Tasks board, and LLM + Storage infrastructure ready for Phase 3.

---

## Workstream A: Shared Infrastructure Modules

### 2.1 — Build LLM Client Abstraction Layer

**Goal**: Multi-provider LLM abstraction that gracefully falls back across free-tier providers.

**File**: `src/lib/api/llm.ts`

**Architecture**:
```typescript
interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

interface LLMResponse {
  content: string;
  provider: 'groq' | 'cerebras' | 'gemini';
  model: string;
  tokensUsed: number;
}

// Provider priority chain (tries each until success):
// 1. Groq (Llama 3.3 70B) — 500K tokens/day free
// 2. Cerebras (Llama 3.3 70B) — 1M tokens/day free
// 3. Google Gemini Flash — rate-limited free tier
```

**Key Features**:
- Automatic failover: if Groq returns 429 (rate limit), seamlessly try Cerebras → Gemini
- JSON mode support for structured SEO analysis outputs
- Token usage tracking (log to Pino for daily monitoring)
- Configurable provider order in Settings (Module 18)

**Packages**:
```bash
pnpm add groq-sdk @google/generative-ai
```

**Acceptance Criteria**:
- [x] `llmClient.generate({ prompt: '...' })` returns content from the first available provider
- [x] Automatic fallback works when primary provider is rate-limited
- [x] Token usage is logged to Pino

---

### 2.2 — Build R2 Storage Module

**Goal**: Centralized file upload/download for PDFs, images, logos, and audit reports.

**File**: `src/lib/storage/`

> [!IMPORTANT]
> **Architect Gap #5 Fix**: The original plan referenced Cloudflare R2 but never defined the upload flow.

**Architecture**:
```
src/lib/storage/
├── index.ts          # Public API: uploadFile(), getSignedUrl(), deleteFile()
├── r2-client.ts      # Cloudflare R2 S3-compatible client via @aws-sdk/client-s3
├── validators.ts     # File type + size validation (Zod)
└── constants.ts      # Allowed MIME types, max sizes, bucket paths
```

**Upload Flow** (Presigned URL — Recommended):
1. Client requests presigned upload URL via Server Action
2. Server generates presigned PUT URL from R2 (5-min expiry)
3. Client uploads directly to R2 (bypasses our server bandwidth)
4. Client confirms upload; server stores R2 object key in Prisma

**Packages**:
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Acceptance Criteria**:
- [x] `uploadFile()` generates a presigned URL and returns it
- [x] `getSignedUrl()` returns a time-limited read URL for any stored object
- [x] File validation rejects non-allowed MIME types and oversized files
- [x] All Prisma `*Url` fields store R2 object keys (not full URLs)

---

### 2.3 — Build Standardized API Error Contract

**Goal**: Consistent error response format across all API routes and Server Actions.

> [!IMPORTANT]
> **Architect Gap #4 Fix**: No error contract was defined in the original plan.

**File**: `src/lib/api/response.ts`

```typescript
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;        // e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED', 'NOT_FOUND'
    message: string;     // Human-readable description
    details?: unknown;   // Zod validation errors, etc.
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T): ApiSuccess<T>;
export function errorResponse(code: string, message: string, details?: unknown): ApiError;
```

**Acceptance Criteria**:
- [x] Every API route handler uses `successResponse()` / `errorResponse()`
- [x] All Server Actions return typed `ApiResponse<T>`
- [x] Frontend knows to check `response.success` before accessing `response.data`

---

## Workstream B: Lead CRM Pipeline (Module 3)

### 2.4 — Build Lead Generation Kanban Board & List View

**Goal**: Full CRM pipeline with drag-and-drop Kanban and data-table list view.

**Files**:
```
src/app/(dashboard)/leads/
├── page.tsx                        # Main leads page (toggle Kanban / List)
├── [id]/page.tsx                   # Lead detail page
├── loading.tsx                     # Loading skeleton
└── error.tsx                       # Error boundary

src/features/leads/
├── actions.ts                      # Server Actions (CRUD + status transitions)
├── schemas.ts                      # Zod validation schemas
└── components/
    ├── lead-kanban.tsx             # Kanban board (6 columns)
    ├── lead-list.tsx               # TanStack Table list view
    ├── lead-card.tsx               # Draggable lead card
    ├── lead-form.tsx               # Create/edit lead form (React Hook Form + Zod)
    ├── lead-detail-slideout.tsx    # Slide-over panel for lead details
    └── lead-score-badge.tsx        # Visual score indicator (0-100)
```

**Kanban Columns**: `NEW` → `CONTACTED` → `AUDIT_SENT` → `PROPOSAL` → `WON` → `LOST`

**Packages**:
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Acceptance Criteria**:
- [x] Kanban board renders leads in correct columns
- [x] Drag-and-drop moves a lead between stages (triggers Server Action + audit log)
- [x] List view supports search, sort, and filter by status/score
- [x] Toggle between Kanban and List views preserves state

---

### 2.5 — Lead Detail, Scoring, & Quick Audit Trigger

**Goal**: Rich lead detail panel with automated scoring and one-click mini SEO audit.

**Lead Scoring Algorithm**:
```
Score = (hasWebsite × 20) + (hasGBP × 20) + (gbpReviewCount × 0.5, max 20) 
      + (estimatedBudget bracket × 20) + (responseRecency × 20)
```

**Quick Audit Trigger**: Dispatches a lightweight BullMQ job that:
1. Fetches meta tags and heading structure from the lead's website URL via a simple `fetch()` (no Playwright yet — that's Module 11)
2. Checks if the site has a `robots.txt` and `sitemap.xml`
3. Returns a mini score and stores it on the lead record

**Acceptance Criteria**:
- [x] Lead detail slide-over shows all fields, notes, and history
- [x] Score auto-calculates on lead creation and updates
- [x] Quick audit returns basic meta tag analysis within 10 seconds

---

### 2.6 — Lead → Client Conversion Workflow

**Goal**: One-click conversion that transfers lead data into a new Client profile.

**Flow**:
1. User clicks "Convert to Client" on a `WON` lead
2. Confirmation dialog shows pre-filled Client form (name, domain, industry)
3. On confirm: creates Client, sets Lead status to `WON`, creates audit log entry
4. Redirect to new Client detail page

**Acceptance Criteria**:
- [x] Conversion creates a Client record with data from the Lead
- [x] Lead status is set to `WON` and marked as converted
- [x] Audit log records both the Lead status change and Client creation
- [x] Cannot convert a lead that's already been converted

---

## Workstream C: Service Agreements (Module 4)

### 2.7 — Agreement Template Editor, PDF Generation, Email Sending

**Goal**: Create, fill, generate PDF, and email SEO service contracts.

**Files**:
```
src/app/(dashboard)/agreements/
├── page.tsx                        # Agreement list (TanStack Table)
├── new/page.tsx                    # Create new agreement
├── [id]/page.tsx                   # Agreement detail + PDF preview
├── loading.tsx
└── error.tsx

src/features/agreements/
├── actions.ts                      # Server Actions (CRUD + send email + generate PDF)
├── schemas.ts                      # Zod schemas
├── pdf/
│   ├── agreement-template.tsx      # @react-pdf/renderer template
│   └── generate-pdf.ts            # Server-side PDF generation
└── components/
    ├── agreement-form.tsx          # Rich text editor with variable placeholders
    ├── agreement-table.tsx         # Status tracking table
    ├── agreement-pdf-preview.tsx   # In-browser PDF preview
    └── deliverable-checklist.tsx   # Monthly deliverables manager
```

**Template Variables**: `{{client_name}}`, `{{client_domain}}`, `{{monthly_fee}}`, `{{start_date}}`, `{{end_date}}`, `{{deliverables_list}}`

**Packages**:
```bash
pnpm add @react-pdf/renderer @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
pnpm add react-hook-form @hookform/resolvers
```

**Acceptance Criteria**:
- [x] Rich text editor supports variable placeholders
- [x] PDF generation produces clean, branded contract
- [x] PDF can be previewed in-browser before sending
- [x] "Send Agreement" dispatches email with PDF attachment via Resend
- [x] Agreement status transitions (DRAFT → SENT → SIGNED → EXPIRED → CANCELLED)

---

## Workstream D: SEO Data & Analysis (Modules 6, 7)

### 2.8 — Integrate DataForSEO API Client

**Goal**: Reusable DataForSEO API client for keyword research, SERP data, and backlink analysis.

**File**: `src/lib/api/dataforseo.ts`

**Endpoints to Wrap**:
- `keywords_data/google/search_volume/live` — Search volume, CPC, competition
- `serp/google/organic/live/regular` — Live SERP results
- `backlinks/summary/live` — Domain backlink summary
- `on_page/task_post` — On-page SEO analysis

**Features**:
- Base64 auth header construction
- Automatic retry on 5xx errors (3 attempts with exponential backoff)
- Response type definitions matching DataForSEO schemas
- Usage tracking (log cost per request to Pino)

**Acceptance Criteria**:
- [x] `dataForSeo.getSearchVolume(['keyword1', 'keyword2'])` returns structured volume data
- [x] API errors are caught and returned via `errorResponse()`
- [x] Credentials are stored encrypted in DB (not in env vars after initial setup)

---

### 2.9 — Build Module 6 (Keyword Research)

**Goal**: Full keyword research, tracking, and analysis tool.

**Files**:
```
src/app/(dashboard)/keywords/
├── page.tsx                        # Keyword research & tracker
├── loading.tsx
└── error.tsx

src/features/keywords/
├── actions.ts                      # Server Actions (search, add to tracker, bulk import/export)
├── schemas.ts                      # Zod schemas
└── components/
    ├── keyword-search.tsx          # DataForSEO search interface
    ├── keyword-tracker.tsx         # Tracked keywords table (TanStack Table)
    ├── keyword-detail-panel.tsx    # Historical rank chart (Recharts line chart)
    ├── bulk-import-modal.tsx       # CSV upload for bulk keyword import
    ├── intent-badge.tsx            # Search intent tag (Informational/Commercial/etc.)
    └── serp-feature-tag.tsx        # Local Pack / Featured Snippet / PAA badges
```

**Architect Addition — `KeywordRankHistory` Model**:
The `currentRank`/`previousRank` fields on `Keyword` only track the last two data points. For historical trend charts, we need a separate `KeywordRankHistory` model:
```prisma
model KeywordRankHistory {
  id         String   @id @default(cuid())
  keywordId  String
  rank       Int
  url        String?
  checkedAt  DateTime @default(now())
  keyword    Keyword  @relation(fields: [keywordId], references: [id], onDelete: Cascade)
  @@index([keywordId, checkedAt])
}
```

**Acceptance Criteria**:
- [x] Search returns keyword data from DataForSEO (volume, CPC, KD, intent)
- [x] Keywords can be added to a client's tracking list
- [x] Historical rank chart shows data from `KeywordRankHistory` model
- [x] Bulk CSV import/export works correctly
- [x] AI auto-classifies search intent via LLM client

---

### 2.10 — Build Module 7 (Competitor Analysis)

**Goal**: Track and compare client domain performance against SERP competitors.

**Files**:
```
src/app/(dashboard)/competitors/
├── page.tsx
├── loading.tsx
└── error.tsx

src/features/competitors/
├── actions.ts                      # Server Actions (add competitor, fetch metrics, gap analysis)
├── schemas.ts
└── components/
    ├── competitor-matrix.tsx        # Side-by-side domain comparison table
    ├── keyword-gap-table.tsx       # Keywords competitors rank for but client doesn't
    ├── sov-chart.tsx               # Share of Voice pie chart (Recharts)
    └── competitor-form.tsx         # Add/remove competitor domains
```

**Acceptance Criteria**:
- [x] Add up to 5 competitor domains per client
- [x] Domain comparison matrix shows DA, backlinks, estimated traffic
- [x] Keyword gap analysis identifies opportunities
- [x] Share of Voice chart renders correctly

---

## Workstream E: Tasks & Reminders (Module 14)

### 2.11 — Build Tasks Kanban Board

**Goal**: Internal agency task management with client/module linking.

**Files**:
```
src/app/(dashboard)/tasks/
├── page.tsx                        # Tasks page (Kanban + list toggle)
├── loading.tsx
└── error.tsx

src/features/tasks/
├── actions.ts                      # Server Actions (CRUD + status transitions)
├── schemas.ts
└── components/
    ├── task-kanban.tsx             # Kanban board (TODO/IN_PROGRESS/REVIEW/DONE)
    ├── task-card.tsx               # Draggable task card
    ├── task-form.tsx               # Create/edit task form
    ├── task-filters.tsx            # Filter by assignee, client, priority, due date
    └── recurring-task-modal.tsx   # Configure daily/weekly/monthly recurrence
```

**Acceptance Criteria**:
- [x] Kanban board with drag-and-drop status transitions
- [x] Tasks link to specific clients and SEO modules
- [x] Recurring tasks auto-create new instances on schedule
- [x] Filter by assignee, client, priority, and due date

---

### 2.12 — Build BullMQ Email Digest Worker

**Goal**: Automated morning email summary of tasks due today.

**Files**:
```
src/workers/email.worker.ts         # BullMQ worker: sends daily task digests
src/lib/email/
├── client.ts                       # Resend email client wrapper
└── templates/
    ├── daily-digest.tsx            # React Email template for task summary
    ├── agreement-sent.tsx          # Agreement email template
    └── notification-alert.tsx      # Super Admin alert email template
```

**Schedule**: BullMQ repeatable job at 09:00 AM daily (configurable)

**Packages**:
```bash
pnpm add resend react-email @react-email/components bullmq
```

**Acceptance Criteria**:
- [x] Worker sends morning digest emails to all team members with pending tasks
- [x] Emails use branded React Email templates
- [x] Worker retries 3 times with exponential backoff on failure
- [x] BullMQ dashboard shows job status and history (via BullMQ Board or logs)
