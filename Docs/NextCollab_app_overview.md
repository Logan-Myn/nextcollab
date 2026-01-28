# NextCollab - App Overview

> Product specifications, features, and technical implementation

---

## Product Concept

**NextCollab** is a creator tool that helps Instagram creators find and pitch brand sponsors.

- **What it is:** A searchable database of brands that sponsor Instagram creators, with AI-powered matching
- **What it's NOT:** A marketplace where brands post opportunities
- **Model:** MeetSponsors for Instagram

### Core Value Proposition

> Stop waiting for brands to find you. Find them first.

**For creators:** Search 1000s of brands, get AI-matched recommendations, pitch with confidence.

**For agencies:** Manage multiple creators, bulk search, team collaboration.

---

## Target Users

### Primary: Instagram Creators

| Segment | Followers | Needs |
|---------|-----------|-------|
| **Nano** | 1K-10K | First sponsorship, rate guidance |
| **Micro** | 10K-100K | More sponsors, better rates |
| **Mid-tier** | 100K-500K | Premium brands, efficiency |

### Secondary: Creator Agencies

- Manage 5-50+ creators
- Need bulk tools and team access
- Higher willingness to pay
- Better-Auth organizations support this

---

## Onboarding Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. SIGN UP                                             │
│     Email + password (Better-Auth)                      │
│     ↓                                                   │
│  2. ENTER INSTAGRAM USERNAME                            │
│     "What's your Instagram handle?"                     │
│     @________________                                   │
│     ↓                                                   │
│  3. XPOZ FETCHES PUBLIC DATA (2-3 seconds)              │
│     Loading: "Analyzing your profile..."                │
│     ↓                                                   │
│  4. SHOW RESULTS                                        │
│     ┌─────────────────────────────────────────────┐     │
│     │ Based on @fashionista_paris:                │     │
│     │                                             │     │
│     │ Niche: Fashion & Lifestyle                  │     │
│     │ Followers: 45.2K                            │     │
│     │ Engagement: ~3.1%                           │     │
│     │                                             │     │
│     │ 🎯 12 brands match your profile             │     │
│     │                                             │     │
│     │ [See Your Matches →]                        │     │
│     └─────────────────────────────────────────────┘     │
│     ↓                                                   │
│  5. DASHBOARD                                           │
│     Browse matches, search brands, set alerts           │
│     ↓                                                   │
│  6. OPTIONAL: CONNECT INSTAGRAM (OAuth)                 │
│     "Unlock deeper insights & media kit"                │
│     - Audience demographics                             │
│     - Detailed engagement analytics                     │
│     - Auto-generated media kit                          │
└─────────────────────────────────────────────────────────┘
```

---

## Features by Phase

### Phase 1: MVP

| Feature | Description | Priority |
|---------|-------------|----------|
| **Brand Database** | Scraped via Xpoz MCP (#ad, #sponsored detection) | Must have |
| **Search & Filters** | Niche, follower range, engagement, location | Must have |
| **AI "For You" Feed** | Daily personalized brand recommendations | Must have |
| **Creator Profile** | Auto-populated from Instagram username | Must have |
| **Basic Alerts** | Email when new brands match | Must have |
| **Favorites** | Save brands to a list | Must have |

### Phase 2: Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Instagram OAuth** | Connect for insights & demographics | High |
| **Media Kit Builder** | Auto-generate from profile data | High |
| **Rate Calculator** | Pricing based on similar creators | High |
| **Partnership Tracker** | CRM-lite (Pitched → Confirmed → Paid) | Medium |
| **Saved Searches** | Reusable filter combinations | Medium |
| **Stripe Integration** | Subscription billing | High |

### Phase 3: Advanced

| Feature | Description | Priority |
|---------|-------------|----------|
| **Pitch Generator** | AI-written pitch emails | Medium |
| **Competitor Analysis** | "Brands that sponsor @competitor" | Medium |
| **Profile Optimization** | AI suggestions to improve profile | Low |
| **Agency Dashboard** | Multi-profile management | High |
| **Team Collaboration** | Invite team members | Medium |

### Phase 4: Scale

| Feature | Description |
|---------|-------------|
| **API Access** | For agencies with custom tools |
| **Mobile App** | React Native |
| **Advanced Analytics** | Trends, market insights |
| **Contact Database** | Apollo.io integration (decision-makers) |

---

## AI Matching Algorithm

### Scoring Factors

| Factor | Weight | Data Source |
|--------|--------|-------------|
| **Niche alignment** | 30% | Creator hashtags vs brand's usual partners |
| **Follower range fit** | 25% | Brand's typical partner size |
| **Engagement compatibility** | 20% | Creator rate vs brand expectations |
| **Activity score** | 15% | How often brand sponsors (recent = higher) |
| **Location match** | 10% | EU brands prefer EU creators |

### Match Score

- **90-100:** Perfect match - brand actively sponsors creators like you
- **70-89:** Strong match - good alignment on most factors
- **50-69:** Potential match - worth exploring
- **<50:** Weak match - not shown in "For You"

### Explanation

Each recommendation includes why:
> "This brand sponsors 5 fashion creators monthly in your follower range. They prefer Reels content and EU-based creators."

---

## Database Schema

### Auth Tables (Better-Auth - Already Created)

```sql
user          -- User accounts
session       -- Active sessions
account       -- OAuth/credential accounts
verification  -- Email verification tokens
```

### App Tables (To Add)

```sql
-- Creator profile (linked to user)
creator_profile
  id              UUID PRIMARY KEY
  user_id         TEXT REFERENCES user(id)
  instagram_id    TEXT
  instagram_username TEXT UNIQUE
  followers       INTEGER
  engagement_rate DECIMAL
  niche           TEXT
  bio             TEXT
  profile_picture TEXT
  instagram_connected BOOLEAN DEFAULT FALSE
  connected_at    TIMESTAMP
  last_synced_at  TIMESTAMP
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

-- Brand database (populated via Xpoz)
brand
  id              UUID PRIMARY KEY
  name            TEXT
  instagram_username TEXT UNIQUE
  niche           TEXT
  activity_score  INTEGER (0-100)
  typical_follower_min INTEGER
  typical_follower_max INTEGER
  partnership_count INTEGER
  last_partnership_at TIMESTAMP
  content_preference TEXT (reels, posts, stories)
  location        TEXT
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

-- Detected partnerships (scraped)
partnership
  id              UUID PRIMARY KEY
  brand_id        UUID REFERENCES brand(id)
  creator_instagram_id TEXT
  creator_username TEXT
  post_url        TEXT
  post_type       TEXT (reel, post, story)
  engagement      INTEGER
  detected_at     TIMESTAMP

-- User favorites
favorite
  id              UUID PRIMARY KEY
  user_id         TEXT REFERENCES user(id)
  brand_id        UUID REFERENCES brand(id)
  created_at      TIMESTAMP
  UNIQUE(user_id, brand_id)

-- AI matches
match
  id              UUID PRIMARY KEY
  user_id         TEXT REFERENCES user(id)
  brand_id        UUID REFERENCES brand(id)
  score           INTEGER (0-100)
  reasons         JSONB
  created_at      TIMESTAMP
  seen_at         TIMESTAMP
  UNIQUE(user_id, brand_id)

-- Saved searches
saved_search
  id              UUID PRIMARY KEY
  user_id         TEXT REFERENCES user(id)
  name            TEXT
  filters         JSONB
  alert_enabled   BOOLEAN DEFAULT FALSE
  created_at      TIMESTAMP

-- Partnership tracker (CRM-lite) - Phase 2
outreach
  id              UUID PRIMARY KEY
  user_id         TEXT REFERENCES user(id)
  brand_id        UUID REFERENCES brand(id)
  status          TEXT (pitched, negotiating, confirmed, completed, rejected)
  notes           TEXT
  pitched_at      TIMESTAMP
  confirmed_at    TIMESTAMP
  paid_at         TIMESTAMP
  amount          DECIMAL
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Edge)                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Next.js 16 App                                     │    │
│  │  - Landing page                                     │    │
│  │  - Auth (Better-Auth)                               │    │
│  │  - Creator dashboard                                │    │
│  │  - Brand search/discovery                           │    │
│  │  - API routes                                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
│   Neon (DB)     │ │  Stripe   │ │ Instagram API   │
│   Postgres      │ │  Billing  │ │ (OAuth users)   │
└─────────────────┘ └───────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     OVH SERVER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Background Jobs                                    │    │
│  │  - Xpoz MCP queries (brand scraping)                │    │
│  │  - Match calculation (daily)                        │    │
│  │  - Alert generation                                 │    │
│  │  - Data sync                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────┐ ┌─────────────────┐                    │
│  │  Redis          │ │  Cron Jobs      │                    │
│  │  (job queue)    │ │  (scheduling)   │                    │
│  └─────────────────┘ └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Brand Database Population:
1. OVH cron triggers Xpoz MCP query
2. Query: #ad, #sponsored, "Paid Partnership" on Instagram
3. Extract: brand accounts, creator partnerships
4. Store in Neon: brand table, partnership table
5. Calculate activity scores

Creator Onboarding:
1. User enters Instagram username
2. API calls Xpoz MCP for profile data
3. Analyze: niche (from hashtags), engagement, existing sponsors
4. Store in creator_profile table
5. Generate initial matches

Daily Matching:
1. OVH cron runs at 6 AM
2. For each creator: calculate match scores vs all brands
3. Store top 50 matches in match table
4. Send email alerts for new high-score matches
```

---

## Pricing

| Plan | Price | Limits | Features |
|------|-------|--------|----------|
| **Free** | €0 | 5 searches/month | Basic profile, limited matches, no alerts |
| **Creator Pro** | €49/month | Unlimited | Full search, AI matching, alerts, media kit, rate calculator |
| **Agency** | €149/month | 15 profiles | Team access, bulk tools, priority support |

### Free Tier Limits

- 5 brand searches per month
- See top 3 matches only
- No saved searches
- No email alerts
- Basic profile (no media kit)

### Upgrade Triggers

- "Unlock 12 more matches" → Pro
- "Save this search" → Pro
- "Get alerts for new brands" → Pro
- "Generate media kit" → Pro
- "Add team member" → Agency

---

## Pages & Routes

```
/                       Landing page (public)
/pricing                Pricing details (public)
/login                  Sign in (Better-Auth)
/signup                 Create account (Better-Auth)

/onboarding             Enter Instagram username
/onboarding/analyzing   Loading state (Xpoz fetch)
/onboarding/results     Show detected profile + matches

/dashboard              Main creator dashboard
/dashboard/matches      "For You" AI recommendations
/dashboard/search       Search & filter brands
/dashboard/favorites    Saved brands
/dashboard/alerts       Notification settings

/brand/[id]             Brand detail page

/settings               Account settings
/settings/profile       Edit profile
/settings/instagram     Connect/disconnect Instagram
/settings/billing       Stripe subscription management

/agency                 Agency dashboard (multi-profile)
/agency/creators        Manage creator profiles
/agency/team            Team members
```

---

## Development Roadmap

### Phase 1: MVP (4-6 weeks)

- [ ] Database schema (Drizzle migrations)
- [ ] Creator onboarding flow (username → Xpoz → profile)
- [ ] Brand database seeding (initial Xpoz scrape)
- [ ] Basic search & filters
- [ ] Simple matching algorithm
- [ ] "For You" feed
- [ ] Favorites
- [ ] Basic alerts (email)

### Phase 2: Monetization (3-4 weeks)

- [ ] Stripe integration
- [ ] Free tier limits
- [ ] Paywall implementation
- [ ] Instagram OAuth
- [ ] Media kit builder
- [ ] Rate calculator

### Phase 3: Growth (4-6 weeks)

- [ ] Partnership tracker (CRM)
- [ ] Saved searches
- [ ] Competitor analysis
- [ ] Agency features
- [ ] Team collaboration

### Phase 4: Scale

- [ ] API access
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Contact database

---

## Success Metrics

### MVP Launch

- 100 creator signups (first month)
- 10 paid subscriptions (Pro or Agency)
- 50% onboarding completion rate
- 3+ searches per active user per week

### Growth Phase

- 1,000 creator signups
- 100 paid subscriptions
- €5K MRR
- <5% monthly churn

---

## Next Steps

1. **Add Drizzle schema** - Migrate new tables
2. **Build onboarding flow** - Username input → Xpoz → results
3. **Seed brand database** - Initial Xpoz scrape
4. **Create dashboard** - Matches, search, favorites
5. **Add Stripe** - Subscription billing
6. **Beta launch** - 10-15 testers
