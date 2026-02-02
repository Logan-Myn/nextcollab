# NextCollab - Implementation Roadmap

> Living document tracking MVP development progress

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Edge)                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Next.js 16 App                                     │    │
│  │  - Landing, Auth, Dashboard UI                      │    │
│  │  - API routes (proxy to OVH for Xpoz)               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐
│   Neon (DB)     │ │  Stripe   │ │  Resend   │ │  OVH Server     │
│   PostgreSQL    │ │  Billing  │ │  Emails   │ │  Xpoz MCP       │
└─────────────────┘ └───────────┘ └───────────┘ │  Client         │
                                                └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Xpoz MCP       │
                                                │  mcp.xpoz.ai    │
                                                └─────────────────┘
```

---

## Phase 1: MVP Tasks

### Week 1: Foundation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Auth Pages (`/login`, `/signup`) | ✅ Complete | Better-Auth email/password |
| 2 | Protected Routes Middleware | ✅ Complete | Guard `/dashboard/*`, `/onboarding/*` |
| 3 | OVH Xpoz Service | ✅ Complete | MCP client deployed on Dokploy (158.69.125.139:4000) |
| 4 | Stripe Setup | ⬜ Pending | Products, webhooks, customer portal |

### Week 2: Onboarding

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5 | Onboarding Flow | ✅ Complete | 3-step flow: username → analyzing → results → save |
| 6 | Creator Profile API | ✅ Complete | /api/instagram/profile, /save-profile, /me |
| 7 | Brand Seeding Script | ⬜ Pending | Scrape 500+ brands via Xpoz |
| 8 | Brand API | ✅ Complete | /api/brands (list), /api/brands/[id] (detail), /api/brands/matches |

### Week 3: Dashboard Core

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9 | Dashboard Layout | ✅ Complete | Dark mode design system, DashboardShell, 4-tab navigation |
| 10 | Search Page | ⬜ Pending | `/dashboard/discover` - Filters + results grid |
| 11 | Brand Card Component | ✅ Complete | BrandCard + BrandCardCompact with match score progress bar |
| 12 | Brand Detail Page | ✅ Complete | `/brand/[username]` - Full info + partnerships + fit analysis |

### Week 4: Matching & Features

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13 | Matching Algorithm | ✅ Complete | Niche + followers + activity + recency scoring (0-100) |
| 14 | "For You" Feed | ✅ Complete | Dashboard shows matched brands, stats, pipeline preview |
| 15 | Favorites Feature | ⬜ Pending | Save/unsave brands |
| 16 | Alerts Setup | ⬜ Pending | Resend email integration |

### Week 5-6: Polish & Launch

| # | Task | Status | Notes |
|---|------|--------|-------|
| 17 | Free Tier Limits | ⬜ Pending | 5 searches, 3 matches |
| 18 | Paywall Components | ⬜ Pending | Upgrade prompts |
| 19 | Settings Pages | ⬜ Pending | Profile, billing, notifications |
| 20 | Error States | ⬜ Pending | Empty, loading, error handling |
| 21 | Beta Testing | ⬜ Pending | 10-15 testers |

---

## Technical Specifications

### OVH Xpoz Service Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/instagram/profile` | POST | Fetch creator profile by username |
| `/api/instagram/search` | POST | Search posts (#ad, #sponsored) |
| `/api/brands/sync` | GET | Cron: populate brand database |
| `/api/matches/calculate` | POST | Run matching algorithm |

### Xpoz Queries

```
Brand Scraping:
- Query: #ad OR #sponsored OR "Paid partnership with"
- Filter: Instagram, last 30 days
- Extract: brand account, creator, engagement, post type

Profile Lookup:
- Query: @username
- Extract: followers, bio, recent posts, hashtags, engagement rate
```

### Matching Algorithm

```javascript
matchScore = (
  nicheAlignment * 0.30 +
  followerFit * 0.25 +
  engagementMatch * 0.20 +
  activityScore * 0.15 +
  locationMatch * 0.10
) * 100

// Score interpretation:
// 90-100: Perfect match
// 70-89: Strong match
// 50-69: Potential match
// <50: Not shown
```

### Email Alerts (Resend)

| Trigger | Template |
|---------|----------|
| New high-score match (>80) | `new-match` |
| Weekly digest | `weekly-digest` |
| Search limit reached | `upgrade-prompt` |

---

## Routes

```
Public:
/                       Landing page
/pricing                Pricing details
/login                  Sign in ✅
/signup                 Create account ✅

Onboarding (auth required):
/onboarding             3-step flow (username → analyzing → results) ✅

Dashboard (auth required):
/dashboard              For You - Stats + Matches + Pipeline ✅
/dashboard/discover     Search brands with filters ⬜
/dashboard/pipeline     CRM kanban board ⬜
/dashboard/saved        Favorited brands ⬜

Brand:
/brand/[username]       Brand detail page ✅

Settings:
/settings               Account settings ⬜
/settings/billing       Stripe portal ⬜
```

---

## Dependencies to Add

```bash
# Email
bun add resend

# Stripe
bun add stripe @stripe/stripe-js

# Forms & Validation
bun add react-hook-form zod @hookform/resolvers

# UI Enhancements
bun add lucide-react
```

---

## Status Legend

- ✅ Complete
- 🔄 In Progress
- ⬜ Pending
- ❌ Blocked

---

---

## Completed Tasks Log

### Task 1 & 2: Auth Pages + Protected Routes (2025-01-28)

**Files created:**
- `src/app/(auth)/layout.tsx` - Auth layout with redirect if logged in
- `src/app/(auth)/login/page.tsx` - Login form with validation
- `src/app/(auth)/signup/page.tsx` - Signup form with password requirements
- `src/app/(protected)/layout.tsx` - Protected layout with session check
- `src/middleware.ts` - Route protection middleware

**Dependencies added:**
- `react-hook-form` - Form handling
- `zod` + `@hookform/resolvers` - Validation
- `lucide-react` - Icons

### Task 3: OVH Xpoz Service (2025-01-28)

**Separate repo:** `nextcollab-xpoz-service` deployed on Dokploy (OVH)
- Express 5 + MCP SDK connecting to Xpoz MCP at `mcp.xpoz.ai`
- Xpoz tools: `getInstagramUser`, `getInstagramPostsByUser`, `getInstagramPostsByKeywords`
- Parameters: `identifier` + `identifierType` (not `username`)
- Response format: YAML-like text (custom parser)
- API key auth between Vercel and OVH
- Health check, cron jobs, brand sync endpoint

### Task 5, 6 & 9: Onboarding + Creator Profile + Dashboard (2025-01-28)

**Files created/updated:**
- `src/lib/xpoz.ts` - Xpoz service client for Next.js
- `src/app/api/instagram/profile/route.ts` - Proxy to OVH Xpoz service
- `src/app/api/instagram/save-profile/route.ts` - Save creator profile to DB
- `src/app/api/instagram/me/route.ts` - Get creator profile from DB
- `src/app/(protected)/onboarding/page.tsx` - Full 3-step onboarding flow
- `src/app/(protected)/dashboard/page.tsx` - Real profile data, stats, resync
- `next.config.ts` - Instagram CDN image domains

**Env vars added:**
- `XPOZ_SERVICE_URL` - OVH service URL
- `XPOZ_SERVICE_KEY` - API key for service auth

### Task 8, 11, 13, 14: Brand API + Dashboard UI + Matching (2025-01-29)

**Design System & Layout:**
- `src/app/globals.css` - Dark mode design system (#0a0a0f bg, #8b5cf6 purple, #06b6d4 cyan)
- `src/components/dashboard-shell.tsx` - Layout with sidebar (desktop) + bottom tabs (mobile)
- `src/components/brand-card.tsx` - BrandCard + BrandCardCompact with match scores
- `Docs/Dashboard_Design.md` - Design specification document

**Brand API Endpoints:**
- `src/app/api/brands/route.ts` - List brands with pagination, search, filters
- `src/app/api/brands/[id]/route.ts` - Get single brand with partnerships
- `src/app/api/brands/matches/route.ts` - AI-matched brands for creator

**Matching Algorithm (in /api/brands/matches):**
```javascript
// Factors: niche alignment, follower fit, activity score, recency
// Returns: score 0-100, matchReasons array, stats
```

**Dashboard Page Updates:**
- Stats overview (followers, engagement, niche, matches count)
- Brand matches grid with BrandCard components
- Pipeline preview (Saved/Pitched/Talking/Won)
- Trending brands section

### Task 12: Brand Detail Page (2025-01-29)

**URL Structure Decision:**
- Changed from `/brand/[id]` (UUID) to `/brand/[username]` (Instagram username)
- Cleaner, shareable URLs: `/brand/nike` instead of `/brand/a251cb1b-...`
- Already had unique index on `instagram_username` in database

**Files created:**
- `src/app/api/brands/by-username/[username]/route.ts` - API endpoint for username lookup
- `src/app/(protected)/brand/[username]/page.tsx` - Brand detail page component

**Files updated:**
- `src/components/brand-card.tsx` - Updated links to use username URLs

**Page Features:**
- Hero section with gradient header, brand avatar, verified badge
- Stats bar: followers, collabs, unique creators, avg partner size
- Action buttons: Pitch (disabled/coming soon), Save, Instagram, Share
- Tabbed content: Overview, Partnerships, Fit Analysis
- Match score calculation based on creator profile
- Similar Brands section
- Responsive design with dark theme

**Design Approach:** Hybrid style combining:
- Social profile familiar patterns (Instagram-like hero)
- Magazine editorial clean typography
- Data dashboard analytics sections

---

*Last updated: 2025-01-29*
