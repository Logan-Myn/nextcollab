# NextCollab - Market Research & Strategy

> Research, competitive analysis, and strategic decisions

---

## Part 1: MeetSponsors Analysis

### What is MeetSponsors?

**Created by:** Benjamin Code (French YouTuber/Developer)
**Launched:** 2023
**Platform:** YouTube only
**Team:** ~4 employees (grew from solo founder)

### Business Model Reality

MeetSponsors is **NOT** a two-sided marketplace. It's a **creator tool**:

| Aspect | Reality |
|--------|---------|
| **Revenue source** | 100% from creators/agencies (subscriptions) |
| **Brand side** | Database of 3,000+ sponsors compiled via data collection |
| **Value prop** | "Find sponsors to pitch" - creators search, not brands |
| **Model** | B2C SaaS selling to creators |

Brands don't pay to be listed. The brand database IS the product sold to creators.

### Key Features

1. **Sponsor Database** - 3,000+ active YouTube sponsors
2. **AI "For You" Algorithm** - Daily personalized recommendations with explanations
3. **Advanced Search** - Filter by niche, language, audience size, activity level
4. **Activity Tracking** - When brands are most active (best time to pitch)
5. **Competitor Intelligence** - See which brands sponsor similar creators
6. **Contact Database** - Decision-maker contacts via Apollo.io integration
7. **Media Kit Generator** - Auto-generate shareable media kits
8. **Real-time Alerts** - Notifications for new matching opportunities
9. **Saved Searches** - Reusable filter combinations
10. **Multi-profile Management** - For agencies managing multiple creators

### Pricing (2025)

| Plan | Price | Target |
|------|-------|--------|
| Creator | €99/month | Individual YouTubers |
| Agent | €119/month | Talent managers |
| Sponsor | €150/month | Brands (secondary) |

### Why It Works

1. **Solves real pain point** - Hours of manual research → minutes
2. **Clear ROI** - More sponsorship revenue justifies subscription
3. **High-value users** - Agencies managing multiple creators = sticky customers
4. **Network effects** - More data = better recommendations
5. **Built-in distribution** - Benjamin Code's 500K+ YouTube audience

---

## Part 2: Instagram Market Analysis

### Market Size

- **Creator economy:** $37 billion U.S. spending (2025)
- **Influencer marketing:** $23.59 billion industry (16.55% YoY growth)
- **Platform market:** $17-20 billion (2024-2025), projected $216 billion by 2033

### Instagram vs YouTube: Key Differences

| Aspect | YouTube | Instagram |
|--------|---------|-----------|
| **Public API** | Yes (API key, no OAuth for public data) | No (OAuth required for everything) |
| **MeetSponsors model** | Easy - enter channel URL | Harder - need scraping or OAuth |
| **Sponsorship value** | $10K-100K+ per video | Lower per-post, higher volume |
| **Native marketplace** | None | Creator Marketplace (beta, restricted) |
| **Data accessibility** | Developer-friendly | Privacy-first, restrictive |

### Existing Competitors

| Platform | Model | Primary Customer | Pricing |
|----------|-------|------------------|---------|
| **CreatorIQ** | Brand database | Enterprise brands | $35K-200K/year |
| **Aspire** | Two-sided marketplace | Brands (creators free) | ~$2,300/month |
| **Collabstr** | Marketplace (brands post) | SMB brands | Per-campaign |
| **Modash** | Creator database | Brands | $99+/month |
| **HypeAuditor** | Analytics + discovery | Brands | $399+/month |
| **Beacons** | Creator tools (link-in-bio) | Creators | Free-$90/month |

**Key insight:** 75%+ of platforms are brand-focused. Almost none are creator-focused like MeetSponsors.

### Creator Pain Points (2025 Research)

| Pain Point | % Affected | Current Solutions |
|------------|------------|-------------------|
| **Time pressure** | 36% | None effective |
| **Burnout** | 35% | None |
| **Algorithm changes** | 34% | None |
| **Fragmented tools** | High | 5-6 different apps |
| **No pricing benchmarks** | 21% (brands cite) | HypeAuditor, Beacons calculators |
| **72% pitch failure rate** | Most | Generic templates |
| **Payment delays** | Common | None |

### What Creators Want

1. **AI-powered tools** - 91% currently using AI
2. **Direct-to-fan models** - 95% pursuing
3. **AI brand matching** - 27% anticipate
4. **Rate calculators** - Universal need
5. **Media kit builders** - Essential for pitching
6. **Reduced manual work** - Biggest ask

---

## Part 3: Strategic Decisions

### Decision 1: Creator-Focused (Not Marketplace)

**We are NOT building a marketplace.** We're building a creator tool.

| Marketplace Model | Our Model |
|-------------------|-----------|
| Brands post opportunities | Creators search brand database |
| Wait for brands to find you | Proactively find and pitch brands |
| Platform takes commission | Flat subscription fee |
| Two-sided chicken-egg problem | One customer type |

**Rationale:**
- Easier GTM (reach creators directly on social)
- Validate demand faster (if creators pay, we have PMF)
- Lower CAC than enterprise brand sales
- MeetSponsors proved this works

### Decision 2: EU-First

**Start with European creators:**
- Less saturated than US market
- GDPR-compliant by design
- Expand globally based on user demand
- Language: English + French initially

### Decision 3: Hybrid Onboarding (Username → OAuth)

**Instagram doesn't allow public API access like YouTube.** Our solution:

```
Step 1: User enters Instagram username (no login)
        ↓
Step 2: Xpoz MCP fetches public data
        - Followers, bio, recent posts, hashtags
        ↓
Step 3: Show immediate value
        - "Your niche: Fashion"
        - "12 brands match your profile"
        ↓
Step 4: CTA to connect Instagram OAuth
        - Unlock demographics, insights, media kit
```

**Why this works:**
- Low friction (like MeetSponsors)
- User sees value before committing
- Xpoz already in our stack
- OAuth optional for power users

### Decision 4: Build Brand Database via Scraping

**How we'll populate the brand database:**

1. **Xpoz MCP queries** - Search #ad, #sponsored, "Paid Partnership"
2. **Index brands** - Name, niche, activity, typical creator size
3. **Track partnerships** - Which creators they've sponsored
4. **Update continuously** - OVH cron jobs

No need for brands to sign up. The database IS the product.

---

## Part 4: Competitive Positioning

### Our Unique Value

> "MeetSponsors for Instagram" - A creator tool that helps you find and pitch sponsors, not wait for them to find you.

### Competitive Moat

| Competitor | Their Focus | Our Differentiation |
|------------|-------------|---------------------|
| **Collabstr** | Marketplace (wait for brands) | Proactive search tool |
| **Aspire** | Brand-focused platform | Creator-focused |
| **Beacons** | Link-in-bio + media kit | + Sponsor discovery & matching |
| **HypeAuditor** | Analytics & fake detection | + Actionable sponsor leads |
| **MeetSponsors** | YouTube only | Instagram-first |

### Why We'll Win

1. **First-mover** - No MeetSponsors equivalent for Instagram
2. **Modern stack** - Next.js 16, serverless, fast iteration
3. **Xpoz integration** - Superior data vs building scrapers
4. **Agency support** - Better-Auth organizations built-in
5. **EU focus** - Underserved market
6. **No commissions** - Transparent flat pricing

---

## Part 5: Market Validation Needed

### Hypotheses to Test

1. **Creators will pay €49/month** for sponsor discovery (vs free alternatives)
2. **Username-first onboarding** converts better than OAuth-first
3. **AI matching** is more valuable than manual search
4. **EU creators** are underserved and eager for tools
5. **Agencies** will pay premium for multi-profile management

### Validation Plan

1. **Soft launch** - 10-15 beta testers (creators in network)
2. **Measure** - Search usage, match clicks, subscription conversion
3. **Iterate** - Based on feedback
4. **Scale** - When 3+ paying customers validate value

---

## Sources

- MeetSponsors.com (features, pricing, blog)
- IAB 2025 Creator Economy Report
- Epidemic Sound Future Creator Economy Report 2025
- Influencer Marketing Hub Benchmark Report 2025
- Sprout Social Platform Comparison 2026
- Astute Analytica Market Size Report 2026
- Various creator interviews and Reddit discussions
