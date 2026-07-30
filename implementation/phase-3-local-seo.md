# Phase 3 — Local SEO, GBP & Dual-Mode Graphic Engine

**Duration**: ~3 weeks (11 subtasks)  
**Prerequisites**: Phase 2 complete — LLM abstraction, R2 storage, DataForSEO client, and Lead/Client/Keyword modules functional  
**Outcome**: Full Google Business Profile integration, AI post generation with branded graphic engine, local ranking grid, service pages generator, and automated GBP publishing.

---

## Workstream A: Google Integration Foundation

### 3.1 — Setup Google Cloud Project

**Goal**: Create and configure Google Cloud project with required APIs for GBP, Maps, and Search Console.

**Steps**:
1. Create a Google Cloud Project (or use existing one)
2. Enable these APIs:
   - **Google My Business API** (Business Profile Performance API)
   - **Google Business Profile API**
   - **Google Maps JavaScript API**
   - **Google Maps Geocoding API**
   - **PageSpeed Insights API** (already free, no key needed for basic use)
   - **Google Search Console API** (optional, for future GSC integration)
3. Create OAuth 2.0 credentials:
   - Application type: Web Application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`, `https://yourdomain.com/api/auth/callback/google`
4. Configure OAuth consent screen:
   - User type: External (can restrict to internal later)
   - Scopes: `business.manage`, `maps`, `webmasters.readonly`
5. Create API key for Maps JavaScript API (restrict to HTTP referrers)
6. Store all credentials securely:
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
   - Maps API key in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

> [!TIP]
> **Free Tier**: Google Maps Essentials plan provides 10,000 Dynamic Maps loads/month free. Google Business Profile API has generous daily quotas (10K-25K requests/day).

**Files Modified**:
- `.env.example` (add all Google env vars)

**Acceptance Criteria**:
- [x] OAuth consent screen is configured and approved
- [x] All required APIs are enabled in Google Cloud Console
- [x] OAuth credentials and Maps API key are stored in `.env.local`

---

### 3.2 — Build Google OAuth Integration Flow

**Goal**: Connect client GBP accounts via OAuth 2.0 with automatic token refresh.

**Files**:
```
src/lib/api/google.ts               # Google OAuth helper (token exchange, refresh)
src/lib/api/gbp.ts                  # Google Business Profile API client
src/lib/api/gsc.ts                  # Google Search Console API client (stub for future)
src/app/api/integrations/google/
├── connect/route.ts                # Initiate OAuth flow
└── callback/route.ts              # Handle OAuth callback, store tokens
```

**Token Management**:
- Access tokens stored encrypted (AES-256-GCM) in `GbpIntegration.accessToken`
- Refresh tokens stored encrypted in `GbpIntegration.refreshToken`
- Auto-refresh middleware: check `expiryDate` before every API call; if expired, use refresh token to get new access token
- Create `src/lib/crypto.ts` — `encrypt()` / `decrypt()` helpers using Node.js `crypto` module

**Packages**:
```bash
pnpm add googleapis google-auth-library
```

**Acceptance Criteria**:
- [x] "Connect GBP" button initiates OAuth flow and redirects to Google consent screen
- [x] Callback stores encrypted tokens in `GbpIntegration`
- [x] Token auto-refresh works transparently when access token expires
- [x] "Disconnect" button revokes tokens and clears the integration record
- [x] Encryption/decryption of tokens works correctly with `src/lib/crypto.ts`

---

## Workstream B: GBP Profile & Reviews (Module 5)

### 3.3 — Build GBP Profile Optimization Module

**Goal**: Profile completeness scoring and GBP data dashboard.

**Files**:
```
src/app/(dashboard)/gbp/
├── page.tsx                        # GBP overview for selected client
├── [clientId]/page.tsx             # Client-specific GBP detail
├── loading.tsx
└── error.tsx

src/features/gbp/
├── actions.ts                      # Server Actions (sync profile, calculate score, list reviews)
├── schemas.ts
├── scoring.ts                      # Profile completeness scoring algorithm
└── components/
    ├── gbp-connect-button.tsx      # OAuth connect/disconnect button
    ├── gbp-profile-card.tsx        # Profile overview with completeness score
    ├── gbp-score-breakdown.tsx     # 100-point breakdown (Name, Category, Hours, etc.)
    ├── gbp-review-table.tsx        # Review list with rating filter and reply status
    ├── gbp-post-history.tsx        # Previously published GBP updates
    └── gbp-sync-status.tsx         # Last synced timestamp + manual sync button
```

**Profile Completeness Scoring** (`scoring.ts`):
```
Score = Name filled (10) + Primary Category (10) + Additional Categories (5) 
      + Address complete (10) + Phone number (5) + Hours set (10) + Website URL (5)
      + Description (10) + Attributes filled (10) + Photos > 5 (10) + Posts > 3 (10)
      + Reviews responded > 50% (5)
```

**Acceptance Criteria**:
- [x] Profile completeness score calculates correctly (0-100)
- [x] GBP data syncs from Google API on demand and on connect
- [x] Score breakdown shows which fields are missing/incomplete
- [x] Review table displays all reviews with rating, text, and reply status

---

### 3.4 — Build GBP Review Feed + AI Reply Generator

**Goal**: Unified review inbox with AI-powered response generation.

**Files**:
```
src/features/gbp/components/
├── review-feed.tsx                 # Unified inbox of pending reviews
├── review-reply-composer.tsx       # AI draft + manual edit + publish
└── tone-preset-selector.tsx        # Professional / Friendly / Apologetic / Gratitude
```

**AI Reply Flow**:
1. User selects a review → clicks "Generate Reply"
2. System sends review text + tone preset + client context to Groq (via LLM abstraction)
3. AI generates personalized response referencing specific reviewer feedback
4. User can edit the draft in a rich text area
5. "Publish Reply" posts directly to GBP via Google My Business API

**Architect Addition — `GbpReview` Model**:
```prisma
model GbpReview {
  id              String   @id @default(cuid())
  clientId        String
  gbpReviewId     String   @unique    // Google's review ID
  reviewerName    String
  rating          Int                  // 1-5 stars
  comment         String?  @db.Text
  replyText       String?  @db.Text
  replyStatus     String   @default("PENDING") // PENDING, DRAFTED, PUBLISHED
  publishedAt     DateTime?
  fetchedAt       DateTime @default(now())
  client          Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  @@index([clientId, replyStatus])
}
```

**Acceptance Criteria**:
- [x] Review feed shows all reviews with pending/replied status
- [x] AI generates contextual replies with selected tone preset
- [x] Published replies appear in GBP via API
- [x] Review data is persisted in `GbpReview` table for history

---

## Workstream C: Post Generator & Graphic Engine (Module 8)

### 3.5 — Build AI Caption Generator

**Goal**: Generate SEO-optimized GBP post captions using LLM.

**Files**:
```
src/features/posts/
├── actions.ts                      # Server Actions (generate caption, save draft, schedule, publish)
├── schemas.ts
├── prompts/
│   ├── caption-system.ts           # System prompt for GBP post caption generation
│   ├── caption-promotional.ts      # Promotional post prompt template
│   ├── caption-educational.ts      # Educational/informational prompt template
│   └── caption-offer.ts           # Offer/discount prompt template
└── components/
    ├── caption-generator.tsx       # Caption generation UI (input + preview)
    ├── post-type-selector.tsx      # Promotional / Educational / Offer / Event
    └── caption-preview.tsx         # Preview with character count (1500 char limit)
```

**Caption Generation Prompt Structure**:
```
System: You are a local SEO expert writing Google Business Profile posts.
Context: Business: {client.name}, Industry: {client.industry}, Location: {city}
Task: Write a {postType} post about {topic}. Include a clear CTA. 
Constraints: Max 1500 characters. Include relevant local keywords. Professional tone.
```

**Acceptance Criteria**:
- [x] Captions generate via Groq/Gemini with context about the client
- [x] Character count indicator shows proximity to 1500-char GBP limit
- [x] Multiple post types supported (Promotional, Educational, Offer, Event)
- [x] User can edit generated caption before saving

---

### 3.6 — Build Dual-Mode Graphic Engine

**Goal**: Create branded promotional graphics for GBP posts.

**Files**:
```
src/features/posts/graphics/
├── mode-a/
│   ├── ideogram-client.ts          # Ideogram v4 API client
│   ├── imagen-client.ts            # Gemini Imagen API client
│   └── direct-flyer-generator.tsx  # Mode A UI (prompt → full AI image)
│
├── mode-b/
│   ├── background-generator.ts     # AI background generation (Gemini Imagen / FLUX)
│   ├── template-engine.ts          # Satori SVG / HTML5 Canvas overlay engine
│   ├── templates/
│   │   ├── promotional-badge.tsx   # Discount badge template
│   │   ├── offer-banner.tsx        # Special offer template
│   │   ├── info-card.tsx           # Informational post template
│   │   └── event-announcement.tsx  # Event template
│   └── hybrid-generator.tsx        # Mode B UI (background + overlay preview)
│
├── components/
│   ├── graphic-mode-toggle.tsx     # Switch between Mode A and Mode B
│   ├── brand-customizer.tsx        # Logo upload, color picker, font selector
│   ├── image-preview.tsx           # Live preview of generated graphic
│   └── image-export.tsx            # Download as PNG/JPG
│
└── utils/
    ├── image-compositing.ts        # Sharp-based server compositing
    └── font-loader.ts              # Load custom client fonts for Satori
```

**Mode A — Direct AI Flyer**:
- User writes a single prompt ("Create a 20% off pizza flyer for Mario's Pizzeria")
- Sends to Ideogram v4 API (best typography) or Gemini Imagen (free tier)
- Returns a fully AI-generated promotional graphic

**Mode B — Hybrid Canvas Template Engine** (Recommended):
1. **Step 1**: Generate or upload a background photo
   - AI: Gemini Imagen free tier or FLUX ($0.003/img)
   - Upload: Client's storefront/product photo → optimize via `sharp`
2. **Step 2**: Select a template overlay (Promotional Badge, Offer Banner, etc.)
3. **Step 3**: Customize overlay:
   - Client logo (from `Client.logoUrl`)
   - Brand colors (`Client.primaryColor`)
   - Text: headline, subheadline, phone number, discount code, CTA
4. **Step 4**: Render via **Satori** (`@vercel/og`) → SVG → composite with background via `sharp`
5. **Step 5**: Preview + Export as PNG (1200×900 for GBP)

**Packages**:
```bash
pnpm add @vercel/og satori sharp
```

**Acceptance Criteria**:
- [x] Mode A generates full AI graphics via Ideogram or Imagen
- [x] Mode B renders branded SVG overlays with 0% typo rate
- [x] Template customizer updates live preview in real-time
- [x] Final composite exports as 1200×900 PNG suitable for GBP
- [x] Client logo and brand colors auto-populate from Client profile

---

### 3.7 — Build Post Calendar, Queue & BullMQ GBP Scheduler

**Goal**: Interactive post scheduling calendar + automated GBP publishing.

**Files**:
```
src/features/posts/components/
├── post-calendar.tsx               # Monthly calendar view (FullCalendar or custom)
├── post-queue.tsx                  # Upcoming scheduled posts list
├── post-form.tsx                   # Create/edit post (caption + graphic + schedule)
└── post-status-badge.tsx           # DRAFT / SCHEDULED / PUBLISHED / FAILED

src/workers/gbp-sync.worker.ts     # BullMQ worker: publishes scheduled posts to GBP
```

**BullMQ Scheduler Worker Flow**:
1. When a post is scheduled (`status: SCHEDULED`, `scheduledFor: DateTime`), a BullMQ delayed job is created with `delay = scheduledFor - now()`
2. Worker picks up the job at the scheduled time
3. Worker calls Google My Business API `locations.localPosts.create` with the post content + image URL
4. On success: update `Post.status = PUBLISHED`, `Post.publishedAt = now()`, `Post.gbpPostId = responseId`
5. On failure: update `Post.status = FAILED`, notify Super Admin, retry up to 3 times

**Acceptance Criteria**:
- [x] Calendar view shows posts color-coded by status (Draft=gray, Scheduled=blue, Published=green, Failed=red)
- [x] Scheduling a post creates a BullMQ delayed job
- [x] Worker publishes to GBP at the scheduled time
- [x] Failed posts generate Super Admin notifications
- [x] Published posts show the GBP post ID for reference

---

## Workstream D: Local Ranking Grid (Module 9)

### 3.8 — Build Local Ranking Grid with Google Maps

**Goal**: Visualize local search ranking visibility across a geographic coordinate grid.

**Files**:
```
src/app/(dashboard)/local-grid/
├── page.tsx
├── loading.tsx
└── error.tsx

src/features/local-grid/
├── actions.ts                      # Server Actions (generate grid, fetch ranks, save snapshot)
├── schemas.ts
├── grid-calculator.ts              # Calculate lat/lng grid points from center + radius
└── components/
    ├── grid-map.tsx                # Google Maps with grid overlay
    ├── grid-controls.tsx           # Grid size (3×3/5×5/7×7), radius, keyword selector
    ├── rank-marker.tsx             # Colored circle marker (green=1, yellow=4, red=10+)
    ├── grid-comparison.tsx         # Side-by-side historical snapshot comparison
    └── grid-export.tsx             # Export grid map as image for client reports
```

**Grid Calculation** (`grid-calculator.ts`):
```typescript
function generateGridPoints(
  center: { lat: number; lng: number },
  gridSize: 3 | 5 | 7,
  radiusMiles: number
): Array<{ lat: number; lng: number; row: number; col: number }>
```

**Rank Data Source**: DataForSEO SERP API — query each grid point's lat/lng as the search location.

**Packages**:
```bash
pnpm add @vis.gl/react-google-maps
```

**Acceptance Criteria**:
- [x] Google Maps renders with a grid overlay of colored rank markers
- [x] Grid size and radius are configurable
- [x] Each grid point shows the client's exact ranking position
- [x] Color coding: Position 1-3 = green, 4-7 = yellow, 8-10 = orange, 11+ = red
- [x] Map renders without billing errors (within free tier quota)

---

### 3.9 — Grid Snapshot Worker + Historical Comparison

**Goal**: Save grid snapshots periodically for month-over-month progress reporting.

**Files**:
```
src/workers/grid-snapshot.worker.ts  # BullMQ worker: weekly grid re-check
```

**Worker Flow**: Every week (configurable), re-check all active client grid keywords and save new `RankingGrid` snapshots.

**Historical Comparison UI**: Side-by-side view of two grid snapshots with rank change indicators (▲ improved, ▼ declined, — stable).

**Acceptance Criteria**:
- [x] Snapshot worker runs weekly and creates new `RankingGrid` records
- [x] Historical comparison shows two snapshots with change arrows
- [x] Grid can be exported as a PNG image for client reports

---

## Workstream E: Content & Reputation Modules (Modules 10, 12)

### 3.10 — Build Service Pages Generator (Module 10)

**Goal**: Generate localized SEO landing page content with JSON-LD schema markup.

**Files**:
```
src/app/(dashboard)/service-pages/
├── page.tsx                        # Service pages list
├── new/page.tsx                    # Page generation wizard
├── [id]/page.tsx                   # Generated page preview
├── loading.tsx
└── error.tsx

src/features/service-pages/
├── actions.ts                      # Server Actions (generate content, save, export)
├── schemas.ts
├── prompts/
│   └── service-page-system.ts      # System prompt for SEO landing page generation
├── json-ld-generator.ts            # Generate LocalBusiness + Service JSON-LD
└── components/
    ├── page-wizard.tsx             # Step-by-step generation form
    ├── content-preview.tsx         # HTML preview with heading structure
    ├── json-ld-preview.tsx         # JSON-LD schema preview + validator
    └── export-options.tsx          # Copy HTML / Markdown / JSON-LD
```

**Generation Wizard Steps**:
1. Select client → Enter service name → Target city/region → Primary keyword
2. AI generates 1,200+ word landing page with H1-H3 structure, FAQs, and CTAs
3. Auto-generate JSON-LD schema (`LocalBusiness` + `Service` types)
4. Preview → Edit → Copy/Export

**Acceptance Criteria**:
- [x] Wizard generates full-length SEO-optimized landing page content
- [x] JSON-LD schema is valid (passes Google's Rich Results Test format)
- [x] Content can be copied as HTML, Markdown, or JSON-LD
- [x] Multiple service pages can be generated per client

---

### 3.11 — Build Auto Reply Generator (Module 12)

**Goal**: AI-powered review response drafting with approval workflow.

**Files**:
```
src/app/(dashboard)/auto-replies/
├── page.tsx                        # Review reply dashboard (uses GBP review feed)
├── loading.tsx
└── error.tsx

src/features/auto-replies/
├── actions.ts                      # Server Actions (generate reply, save draft, publish)
├── schemas.ts
├── prompts/
│   └── reply-system.ts            # System prompt for review responses
└── components/
    ├── reply-inbox.tsx             # Pending reviews needing replies
    ├── reply-composer.tsx          # AI draft editor with tone presets
    └── reply-approval-flow.tsx    # Draft → Manager Review → Publish workflow
```

**Tone Presets**: Professional, Friendly, Apologetic, Gratitude — each modifies the LLM system prompt.

**Approval Workflow**:
- Content Writers can generate and save drafts
- Managers/Admins can approve and publish drafts to GBP
- Super Admin can publish directly without approval

**Acceptance Criteria**:
- [x] AI generates contextual replies referencing specific review content
- [x] Tone presets produce notably different response styles
- [x] Approval workflow respects RBAC (Content Writer drafts, Manager approves)
- [x] Published replies post to GBP via Google API
