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
| 3 | OVH Xpoz Service | ⬜ Pending | MCP client with `@modelcontextprotocol/sdk` |
| 4 | Stripe Setup | ⬜ Pending | Products, webhooks, customer portal |

### Week 2: Onboarding

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5 | Onboarding Flow | ⬜ Pending | Username → Xpoz fetch → Results |
| 6 | Creator Profile API | ⬜ Pending | CRUD for `creator_profile` table |
| 7 | Brand Seeding Script | ⬜ Pending | Scrape 500+ brands via Xpoz |
| 8 | Brand API | ⬜ Pending | Search, filter, detail endpoints |

### Week 3: Dashboard Core

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9 | Dashboard Layout | ⬜ Pending | Sidebar, header, responsive shell |
| 10 | Search Page | ⬜ Pending | Filters + results grid |
| 11 | Brand Card Component | ⬜ Pending | Reusable card with match score |
| 12 | Brand Detail Page | ⬜ Pending | Full info + partnerships |

### Week 4: Matching & Features

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13 | Matching Algorithm | ⬜ Pending | Score 0-100 with reasons |
| 14 | "For You" Feed | ⬜ Pending | `/dashboard/matches` |
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
/login                  Sign in
/signup                 Create account

Onboarding (auth required):
/onboarding             Enter Instagram username
/onboarding/analyzing   Loading state
/onboarding/results     Profile + matches preview

Dashboard (auth required):
/dashboard              Main dashboard
/dashboard/matches      "For You" feed
/dashboard/search       Search brands
/dashboard/favorites    Saved brands
/dashboard/alerts       Notification settings

Brand:
/brand/[id]             Brand detail page

Settings:
/settings               Account settings
/settings/profile       Edit profile
/settings/instagram     Connect Instagram
/settings/billing       Stripe portal
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
- `src/app/(protected)/onboarding/page.tsx` - Instagram username input
- `src/app/(protected)/dashboard/page.tsx` - Dashboard shell with sidebar
- `src/middleware.ts` - Route protection middleware

**Dependencies added:**
- `react-hook-form` - Form handling
- `zod` + `@hookform/resolvers` - Validation
- `lucide-react` - Icons

---

*Last updated: 2025-01-28*
