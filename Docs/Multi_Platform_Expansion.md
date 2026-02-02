# Multi-Platform Expansion: Vertical Video Strategy

> Analysis and implementation plan for expanding NextCollab to TikTok and YouTube Shorts

---

## Executive Summary

**Opportunity:** Position NextCollab as "MeetSponsors for vertical video creators" covering Instagram Reels, TikTok, and YouTube Shorts.

**Market Gap:** MeetSponsors owns YouTube long-form. Nobody owns vertical video across platforms.

| Platform | Long-form | Short-form (Vertical) |
|----------|-----------|----------------------|
| YouTube | MeetSponsors (€99/mo) | **Gap** |
| TikTok | N/A | **Gap** (TikTok One requires 10K+) |
| Instagram | N/A | NextCollab (current focus) |

**Verdict:** Technically feasible, strategically valuable, moderate cost increase (~2x scraping).

---

## Market Research

### Market Size

- Creator economy ad spend: $29.5B (2024) → $37B (2025)
- Short-form video ad spend: $146B projected by 2028
- 75%+ of platforms are brand-focused, almost none are creator-first
- Small creators (1K-100K) excluded from official marketplaces

### Existing Competitors

| Platform | Model | Gap |
|----------|-------|-----|
| **TikTok One** | Official marketplace | Requires 10K+ followers, TikTok-only |
| **Mysocial Sponsors** | Creator search | Weak product, poor UX |
| **Collabstr** | Marketplace (brands post) | Not creator-initiated |
| **MeetSponsors** | Creator search | YouTube long-form only |

**Key Finding:** No creator-first, cross-platform vertical video sponsor discovery tool exists.

### TikTok Creator Pain Points

1. **Exclusion from TikTok One** - 10K follower minimum excludes micro-creators
2. **No sponsor database** - Manual research or waiting for inbound
3. **Cross-platform friction** - Content repurposed to Reels/Shorts but tools are siloed
4. **Brand discovery gap** - Brands active on TikTok aren't tracked anywhere

---

## Apify Pricing Analysis

### TikTok Scraping

| Service | Cost | Notes |
|---------|------|-------|
| Profile scraper | $0.005/profile | $5 per 1,000 profiles |
| Posts/videos | $0.30/1,000 posts | Includes hashtags, mentions |
| Speed | 500 profiles/min | High throughput |

**Key capability:** `isPaidPartnership` field available for sponsored detection.

### YouTube Shorts Scraping

| Service | Cost | Notes |
|---------|------|-------|
| Shorts scraper | $0.50/1,000 shorts | Cheapest option |
| Pay-per-result | $0.005/video | Alternative pricing |

**Key capability:** Sponsor segment detection available.

### Monthly Cost Estimates

| Scale | Instagram | TikTok | YouTube | Total |
|-------|-----------|--------|---------|-------|
| 10K profiles | ~$100 | ~$50 | ~$50 | **~$200/mo** |
| 50K profiles | ~$500 | ~$250 | ~$250 | **~$1,000/mo** |
| 100K profiles | ~$800 | ~$400 | ~$400 | **~$1,600/mo** |

---

## Snowball Effect: Cross-Platform Discovery

### Current Instagram Snowball (Brand Discovery v2)

```
1. Seed brands → Fetch their posts → Find creator collaborators
2. Creators → Fetch their posts → Find more brands (paidPartnership)
3. New brands → Repeat
```

### Cross-Platform Expansion

```
Instagram Discovery
       │
       ▼
Brand X sponsors @fashionista_paris on Instagram
       │
       ▼
Check: Does @fashionista_paris have TikTok?
       │ (70%+ creators are multi-platform)
       ▼
Scrape TikTok: @fashionista_paris
       │
       ▼
Find: Brand Y sponsors them on TikTok (not on Instagram!)
       │
       ▼
Cross-pollinate: Add Brand Y to database
       │
       ▼
Brand Y → Check their Instagram creators too
```

### Why Cross-Platform Works

1. **Creators are multi-platform** - 70%+ active on 2+ platforms
2. **Brands sponsor across platforms** - Same campaign, different formats
3. **Each platform reveals new brands** - Some only active on TikTok
4. **Content repurposing** - Same Reel posted as TikTok and Short

---

## Technical Implementation

### Database Schema Changes

```sql
-- Add platform tracking to brand
ALTER TABLE brand ADD COLUMN platforms JSONB DEFAULT '{"instagram": true}';
ALTER TABLE brand ADD COLUMN tiktok_username TEXT;
ALTER TABLE brand ADD COLUMN youtube_channel_id TEXT;

-- Add platform tracking to discovered_creator
ALTER TABLE discovered_creator ADD COLUMN platforms JSONB DEFAULT '{"instagram": true}';
ALTER TABLE discovered_creator ADD COLUMN tiktok_username TEXT;
ALTER TABLE discovered_creator ADD COLUMN youtube_handle TEXT;

-- Add platform to partnership
ALTER TABLE partnership ADD COLUMN platform TEXT DEFAULT 'instagram';
-- Values: 'instagram', 'tiktok', 'youtube_shorts'

-- Add platform to creator_profile (authenticated users)
ALTER TABLE creator_profile ADD COLUMN tiktok_username TEXT;
ALTER TABLE creator_profile ADD COLUMN youtube_handle TEXT;
```

### New Backend Services

```
nextcollab-xpoz-service/src/services/
├── apify.ts                  # (existing) Instagram
├── apify-tiktok.ts           # (new) TikTok scraping
├── apify-youtube.ts          # (new) YouTube Shorts scraping
├── discovery-tiktok.ts       # (new) TikTok snowball discovery
├── discovery-youtube.ts      # (new) YouTube snowball discovery
├── discovery-orchestrator.ts # (new) Cross-platform coordination
```

### TikTok Service

**Apify Actor:** `apidojo/tiktok-scraper`

```typescript
interface TikTokPost {
  id: string;
  text: string;               // Caption
  hashtags: string[];
  mentions: string[];
  authorMeta: {
    id: string;
    name: string;
    nickName: string;         // @username
    verified: boolean;
  };
  stats: {
    diggCount: number;        // Likes
    shareCount: number;
    commentCount: number;
    playCount: number;
  };
  isPaidPartnership?: boolean;  // Official disclosure
}

// Sponsored detection methods:
// 1. isPaidPartnership field (official)
// 2. Hashtags: #ad, #sponsored, #partner, #gifted, #collab
// 3. Caption text: "Paid partnership with", "Ad", "Sponsored by"
```

### YouTube Shorts Service

**Apify Actor:** `webdatalabs/youtube-shorts-scraper`

```typescript
interface YouTubeShort {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  hashtags: string[];
  hasSponsorSegment?: boolean;  // SponsorBlock data
}

// Sponsored detection methods:
// 1. Description: "Sponsored by", "Thanks to X"
// 2. Hashtags: #ad, #sponsored
// 3. SponsorBlock integration (community labels)
// 4. Pinned comments with brand mentions
```

### Cross-Platform Orchestrator

```typescript
interface CrossPlatformDiscoveryConfig {
  platforms: ('instagram' | 'tiktok' | 'youtube_shorts')[];
  seedBrands: string[];
  maxDepth: number;
  maxEstimatedCost: number;
}

async function runCrossPlatformDiscovery(config) {
  // 1. Discover on each platform in parallel
  const results = await Promise.all([
    runInstagramDiscovery(config),
    runTikTokDiscovery(config),
    runYouTubeDiscovery(config),
  ]);

  // 2. Cross-reference: Find creators on multiple platforms
  const crossPlatformCreators = findCrossPlatformCreators(results);

  // 3. Cross-reference: Find brands on multiple platforms
  const crossPlatformBrands = findCrossPlatformBrands(results);

  // 4. Merge into unified database
  await mergeDiscoveryResults(results);
}
```

### New API Endpoints

```typescript
// Existing
POST /brands/discover-v2           // Instagram discovery

// New platform-specific
POST /brands/discover-tiktok       // TikTok discovery
POST /brands/discover-youtube      // YouTube Shorts discovery
POST /brands/discover-cross        // Cross-platform orchestrated

// New filters
GET /brands?platform=tiktok        // Filter by platform
GET /brands/:username?platforms=true  // Include all platform data
```

---

## Frontend Presentation

### Recommended: Unified View (Option B)

```
┌──────────────────────────────────────────────────┐
│  Brand: Sephora                                  │
│                                                  │
│  Active on:  [IG ✓]  [TikTok ✓]  [Shorts ✗]     │
│                                                  │
│  Recent partnerships:                            │
│  • @beauty_guru (IG Reel, 2 days ago)            │
│  • @makeupqueen (TikTok, 5 days ago)             │
│  • @skincaresam (IG Story, 1 week ago)           │
│                                                  │
│  [See All Partners]  [Pitch This Brand]          │
└──────────────────────────────────────────────────┘
```

**Rationale:** Creators want to see brands, not platforms. Show platform availability as metadata.

### Creator Profile View

```
┌──────────────────────────────────────────────────┐
│  Your connected profiles:                        │
│  ┌────────────────────────────────────────────┐  │
│  │ @fashionista_paris (IG)     45K followers  │  │
│  │ @fashionista_paris (TikTok) 120K followers │  │
│  │ + Connect YouTube                          │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Brands matching ALL your profiles:              │
│  Sephora, Zara, H&M, Shein...                    │
│                                                  │
│  Platform-specific opportunities:                │
│  • TikTok only: Gymshark (perfect for your niche)│
│  • IG only: Cartier (luxury, IG-focused)         │
└──────────────────────────────────────────────────┘
```

---

## Pricing Strategy

### Current

| Plan | Price | Features |
|------|-------|----------|
| Free | €0 | 5 searches/month, Instagram only |
| Creator Pro | €49/month | Unlimited, Instagram only |
| Agency | €149/month | 15 profiles, Instagram only |

### With Multi-Platform

| Plan | Price | Features |
|------|-------|----------|
| Free | €0 | 5 searches/month, Instagram only |
| Creator Pro | €59/month | Unlimited, all platforms |
| Agency | €199/month | 15 profiles, all platforms |

**Justification:** 3x platforms = 20% price increase (value-based, not cost-based).

---

## Implementation Timeline

### Phase 1: Ship Instagram MVP (Current)
- Complete current roadmap
- Get 10+ paying customers
- Validate model works

### Phase 2: Add TikTok (Month 2-3 after MVP)

| Task | Time |
|------|------|
| DB schema migration | 2-3 hours |
| `apify-tiktok.ts` service | 1 day |
| TikTok discovery pipeline | 1-2 days |
| Frontend: TikTok username input | 1 day |
| Frontend: Platform badges | 1 day |
| Testing | 1 day |
| **Total** | **~1 week** |

### Phase 3: Add YouTube Shorts (Month 4)

| Task | Time |
|------|------|
| `apify-youtube.ts` service | 1 day |
| YouTube discovery pipeline | 1-2 days |
| Cross-platform orchestrator | 2-3 days |
| Frontend: YouTube handle input | 1 day |
| Testing | 1-2 days |
| **Total** | **~1-2 weeks** |

### Phase 4: Cross-Platform Features (Month 5+)

- Multi-platform matching algorithm
- "Found on both" badges
- Cross-platform brand insights
- Platform-specific recommendations

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Apify rate limits | Medium | Multiple accounts, throttling |
| TikTok blocks scrapers | Medium | Apify handles this, backup providers |
| YouTube changes Shorts API | Low | Multiple scrapers available |
| Complexity creep | High | Launch IG first, add platforms in phases |
| Cost overruns | Medium | Start with 10K profiles, monitor closely |
| Different data structures | Medium | Abstract platform-specific logic in services |

---

## Strategic Positioning

### Current
> "MeetSponsors for Instagram"

### Expanded
> "MeetSponsors for vertical video creators"
>
> The only sponsor database covering Instagram Reels, TikTok, and YouTube Shorts.

### Marketing Angles

1. **Cross-platform reach** - "See which brands sponsor across all platforms"
2. **Small creator friendly** - "No follower minimums like TikTok One"
3. **Creator-first** - "You search for brands, not wait for them"
4. **Time savings** - "One dashboard instead of three"

---

## Decision Summary

| Question | Answer |
|----------|--------|
| Is there a market gap? | Yes, confirmed |
| Is Apify pricing acceptable? | Yes, ~$200-1K/month for scale |
| Can snowball work cross-platform? | Yes, creators are multi-platform |
| Is it technically feasible? | Yes, backend is modular |
| Should we do this? | Yes, but after Instagram MVP |

---

## Next Steps

1. **Now:** Complete Instagram MVP, get paying customers
2. **Month 2:** Add TikTok username to onboarding (optional field)
3. **Month 2-3:** Implement TikTok discovery pipeline
4. **Month 4:** Add YouTube Shorts support
5. **Month 5+:** Cross-platform features and optimization

---

## Sources

- MeetSponsors.com (pricing, features)
- Apify.com (TikTok scraper, YouTube scraper pricing)
- TikTok Creator Marketplace documentation
- Influencer Marketing Hub 2025 reports
- Internal: Brand_Discovery_v2.md, NextCollab_research.md
