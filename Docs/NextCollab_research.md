# NextCollab - Instagram Influencer Sponsorship Platform

> Research & Planning Document

---

## Part 1: MeetSponsors Analysis (YouTube Model)

### What is MeetSponsors?
**Created by:** Benjamin Code (French YouTuber/Developer)
**Launched:** 2023
**Problem it solves:** Nearly half of creators' videos go unmonetized due to manual sponsor searching

### Core Business Model
MeetSponsors acts as a **two-sided marketplace/database** connecting:
- **YouTubers & Agents** (supply side) - creators looking for sponsorship opportunities
- **Brands & PR Companies** (demand side) - companies actively seeking YouTube sponsorships

### Key Features
1. **Centralized Sponsor Database** - Analyzes entire YouTube sponsorship market (~10,000+ brands)
2. **AI-Powered Matching** - Algorithm identifies sponsors most likely to collaborate
3. **Advanced Search Filters** - Filter by niche, language, sector, audience type, engagement
4. **Decision-Maker Contacts** - Direct access to key brand contacts
5. **Email Alerts** - Real-time notifications of new opportunities
6. **Competitor Analysis** - Identify brands sponsoring similar creators
7. **Channel Analysis Tools** - AI analyzes past content for sponsor potential

### Why It Works
1. Solves real pain point (unmonetized content = lost revenue)
2. Saves significant time (hours of manual research → minutes)
3. Provides direct ROI tracking
4. Targets high-value users (agents who manage multiple creators)
5. Creates network effects (more sponsors = more valuable for creators)

---

## Part 2: Instagram Sponsorship Landscape

### Current Instagram Monetization Channels
1. **Branded Content/Sponsored Posts** - "Paid Partnership" tag
2. **Creator Marketplace** (Instagram's native platform - launched 2022)
3. **Gifts on Reels** - Fans send money directly
4. **Ads on Reels** - Creator revenue share
5. **Seasonal Bonuses** - Performance-based payouts

### Instagram Creator Marketplace API Access
**Status:** Beta testing with select partners (Captiv8, CreatorIQ, Aspire)

**Available API Features:**
- Business Discovery - Access metadata and stats
- Prioritized DMs - Send project briefs directly
- Project Briefs - Structured sponsorship briefs
- Hashtag Search - Discover content by hashtags
- Page Insights - Track performance metrics

### Existing Competitors
- **Collabstr** - No commission fees, transparent pricing
- **Aspire** - Testing Instagram API access
- **CreatorIQ** - Enterprise creator management
- **Captiv8** - AI-powered influencer analytics

### Instagram vs YouTube Differences
| Aspect | YouTube | Instagram |
|--------|---------|-----------|
| Content Format | Long-form videos | Posts, Reels, Stories, Carousels |
| Native Marketplace | No official platform | Creator Marketplace (beta) |
| API Access | Limited | Expanding via Graph API |
| Creator Maturity | Well-established | Still growing |

---

## Part 3: NextCollab Architecture

### Finalized Tech Stack

**Frontend & Framework:**
- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- Bun (package manager)

**Backend & Database:**
- Neon (serverless Postgres)
- Drizzle ORM
- Better-Auth (authentication with organizations/teams)
- Stripe (subscriptions)

**Infrastructure:**
```
┌─────────────────┐     ┌─────────────────┐
│  Vercel (Edge)  │────▶│   Neon (DB)     │
│  Next.js App    │     │   Postgres      │
└────────┬────────┘     └─────────────────┘
         │
         │ Background jobs / Heavy processing
         ▼
┌─────────────────┐
│  OVH Server     │
│  - Redis        │
│  - Xpoz MCP     │
│  - Cron jobs    │
│  - Staging      │
└─────────────────┘
```

**Data Collection:**
- Instagram Graph API (official metrics)
- Xpoz MCP (social intelligence, creator discovery)

### Database Schema

**Auth Tables (Better-Auth):**
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth/credential accounts
- `verification` - Email verification tokens

**App Tables (To be added):**
- `creator_profile` - Creator-specific data
- `brand_profile` - Brand/agency data
- `sponsorship` - Sponsorship opportunities
- `match` - Creator-brand matches
- `campaign` - Active campaigns

---

## Part 4: Platform Features

### Creator Features
- Profile with Instagram metrics
- AI-powered brand recommendations
- Search/filter brand opportunities
- Media kit builder
- Analytics dashboard
- Direct messaging with brands

### Brand Features
- Search/discover creators by niche, engagement, location
- Post sponsorship opportunities
- Campaign management
- ROI tracking
- Bulk outreach tools (Agency plan)

### Matching Algorithm
**Factors:**
- Niche alignment (creator niche vs brand industry)
- Audience demographics match
- Engagement rate compatibility
- Growth trend analysis
- Previous sponsorship success patterns
- Budget alignment

**Implementation:**
- Scoring system (0-100 match score)
- ML-based recommendations (Phase 2)

---

## Part 5: Xpoz MCP Integration

### Why Xpoz
- No API key management complexity
- No rate limits on queries
- Real-time data access
- Cost-effective ($20/month for 1M results)

### Use Cases
1. **Creator Discovery** - Find creators by niche/hashtag
2. **Brand Mention Tracking** - Monitor campaign performance
3. **Competitor Analysis** - Track successful campaigns
4. **Trending Content Detection** - Identify viral formats
5. **Engagement Quality Analysis** - Detect fake engagement

---

## Part 6: Pricing Model

### Finalized Pricing Tiers

| Plan | Price | Target | Features |
|------|-------|--------|----------|
| **Starter** | Free | New creators | Basic profile, 5 searches/month, email notifications |
| **Creator Pro** | €49/month | Serious creators | Unlimited searches, AI recommendations, analytics, direct contacts, media kit |
| **Agency** | €149/month | Agencies | 15 creator profiles, team collaboration, bulk outreach, API access |

---

## Part 7: Competitive Advantages

1. **European Focus** - Start with EU creators (less saturated than US)
2. **Better-Auth Organizations** - Native support for agencies managing multiple creators
3. **Xpoz Integration** - Superior discovery/intelligence vs competitors
4. **Modern Stack** - Next.js 16, serverless, edge-first architecture
5. **Multi-Format Support** - Reels, Posts, Stories, Carousels
6. **Transparent Pricing** - No hidden commissions

---

## Part 8: Development Roadmap

### Phase 1: MVP (Current)
- [x] Landing page with pricing
- [x] Auth system (Better-Auth)
- [x] Database schema (Neon + Drizzle)
- [x] Vercel deployment
- [ ] Creator onboarding flow
- [ ] Brand onboarding flow
- [ ] Basic profile pages
- [ ] Simple search/filter

### Phase 2: Core Features
- [ ] Instagram Graph API integration
- [ ] Basic matching algorithm
- [ ] Creator/brand dashboards
- [ ] In-platform messaging
- [ ] Stripe subscription integration

### Phase 3: Advanced Features
- [ ] Xpoz MCP integration
- [ ] ML-based recommendations
- [ ] Analytics dashboards
- [ ] Media kit builder
- [ ] Campaign tracking

### Phase 4: Scale
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Team collaboration features

---

## Next Steps

1. ~~Build landing page~~ ✅
2. ~~Set up auth (Better-Auth)~~ ✅
3. ~~Set up database (Neon)~~ ✅
4. ~~Deploy to Vercel~~ ✅
5. **Add Stripe integration** - Subscription handling
6. **Build creator onboarding** - Profile creation flow
7. **Build brand onboarding** - Company registration
8. **Instagram Graph API** - Connect creator accounts
9. **Basic matching** - Simple niche/engagement matching
10. **Validate with users** - Get 10-15 beta testers
