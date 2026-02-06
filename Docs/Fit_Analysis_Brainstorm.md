# Fit Analysis Brainstorm

> Redesigning the AI Check / Discovery matching with **bidirectional analysis** - enriching both brand AND creator data for accurate fit scoring.

## Current State

### What We Have Now
| Metric | Weight | Source |
|--------|--------|--------|
| Niche Alignment | 30% | `brand.category`, `brand.niche`, `brand.typicalCreatorNiches` |
| Follower Range Fit | 25% | `brand.typicalFollowerMin/Max`, `brand.avgCreatorFollowers` |
| Activity Score | 15% | `brand.partnershipCount` |
| Recency | 10% | `brand.lastPartnershipAt` |
| Verified Bonus | 5% | `brand.isVerifiedAccount` |

**Problem:** These metrics are okay but don't answer the creator's real questions:
- "Have they worked with creators like me?"
- "Am I too small/big for them?"
- "Can I deliver what they expect?"

### What MeetSponsors Shows (YouTube Reference)
```
✓ Worked with 1 YouTuber(s) similar to you
✓ Their smallest creator has 234K subscribers
✓ Works with FR creators
⚠ No recent activity
✓ Good content alignment (75/100) - expat life, travel estonia
✓ They typically need 16K+ views
```

**Key Insight:** MeetSponsors shows *comparative* data ("creators like you", "their smallest creator") rather than just absolute metrics. This makes creators feel confident about fit before pitching.

### The Problem: One-Sided Data

Currently we're collecting rich data about **brands** but our **creator profiles** are thin:
- We have: `followers`, `engagementRate`, `niche`, `bio`
- We're missing: location, avg views, content themes, post types, aesthetic, audience quality

**You can't compare what you don't measure.** To show "Your avg views: 9K" we need to actually track creator views.

### Two Creator Pools

| Table | Who | Current State | Should Be |
|-------|-----|---------------|-----------|
| `creator_profile` | Platform users | Basic metrics | Fully enriched |
| `discovered_creator` | Found via discovery | Minimal (followers, niche) | Also enriched |

**Key insight:** We need to enrich BOTH pools:
- **Platform users** → enriched at onboarding + periodic refresh
- **Discovered creators** → enriched during discovery pipeline (like brands)

Why enrich discovered creators?
1. Powers accurate "Similar creators like you" comparisons
2. Enables real `avgPartnerViews` and `avgPartnerEngagement` for brands
3. If discovered creator signs up later, data is ready
4. Better understanding of what creator profiles brands actually sponsor

---

## Part 1: Creator Profile Enrichment

### Why This Matters
To calculate fit, we need data on BOTH sides:

| Fit Metric | Brand Data Needed | Creator Data Needed |
|------------|-------------------|---------------------|
| Size Match | `avgCreatorFollowers`, `min/max` | `followers` ✓ |
| Performance Match | `avgPartnerViews`, `avgPartnerEngagement` | `avgViews`, `engagementRate` |
| Content Alignment | `contentThemes`, `preferredPostTypes` | `contentThemes`, `postTypeMix` |
| Geographic Fit | `creatorRegions`, `location` | `location` |
| Niche Match | `typicalCreatorNiches` | `niche`, `subNiches` |

### Creator Metrics to Collect

#### Performance Metrics (Scraped)
| Metric | Description | Source | Priority |
|--------|-------------|--------|----------|
| **Average Views** | Avg views across recent Reels | Apify `videoViewCount` | P0 |
| **Engagement Rate** | (likes + comments) / followers | Apify posts | P0 (exists, needs refresh) |
| **Best Performing Format** | Which post type gets most engagement | Apify posts analysis | P1 |
| **Post Frequency** | Posts per week average | Apify posts timestamps | P1 |
| **View-to-Follower Ratio** | Views / followers (reach indicator) | Calculated | P1 |

#### Content Analysis (AI-Powered)
| Metric | Description | Source | Priority |
|--------|-------------|--------|----------|
| **Content Themes** | Main topics: travel, fashion, food... | Claude Haiku on captions + hashtags | P0 |
| **Sub-Niches** | Specific angles: "budget travel", "sustainable fashion" | Claude Haiku | P1 |
| **Aesthetic Style** | Visual style: bright, moody, minimal, colorful | Future: image analysis | P2 |
| **Caption Style** | Long-form storytelling vs short punchy | Text analysis | P2 |
| **Language** | Primary content language | Detect from captions | P1 |

#### Profile Signals
| Metric | Description | Source | Priority |
|--------|-------------|--------|----------|
| **Location** | Country/region | Parse from bio + flag emojis | P0 |
| **Audience Quality Score** | Real followers estimate | Engagement patterns | P2 |
| **Growth Rate** | Follower change over time | Periodic scraping | P2 |
| **Link in Bio** | Has media kit / linktree | Apify `externalUrl` | P1 |
| **Is Verified** | Blue checkmark | Apify `verified` | Done |

### Creator Enrichment Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  Creator Onboarding / Profile Sync                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ 1. Fetch Profile      │
         │    (Apify scraper)    │
         │    - followers        │
         │    - bio              │
         │    - externalUrl      │
         │    - verified         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ 2. Fetch Recent Posts │
         │    (Last 20-50 posts) │
         │    - likesCount       │
         │    - commentsCount    │
         │    - videoViewCount   │
         │    - caption          │
         │    - hashtags         │
         │    - type (reel/post) │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ 3. Calculate Metrics  │
         │    - avgViews         │
         │    - engagementRate   │
         │    - postTypeMix      │
         │    - postFrequency    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ 4. AI Analysis        │
         │    (Claude Haiku)     │
         │    - contentThemes    │
         │    - subNiches        │
         │    - location (parse) │
         │    - language         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ 5. Store Enriched     │
         │    Profile            │
         └───────────────────────┘
```

### When to Enrich (Platform Users)

| Trigger | Action |
|---------|--------|
| **Onboarding** | Full enrichment (profile + posts + AI) |
| **Weekly Cron** | Refresh metrics for active users |
| **Manual Sync** | User clicks "Refresh my stats" |
| **Before Pitch** | Quick refresh if data > 7 days old |

---

## Part 1b: Discovered Creator Enrichment (Single-Pass During Discovery)

### The Insight: We Already Have The Data

During discovery, we're ALREADY fetching creator posts to find more brands:
```
Creator @alice → Fetch 3-month posts → Find #ad mentions → Discover brands
```

**We're throwing away valuable data!** Those same posts contain:
- `videoViewCount` → avgViews
- `likesCount`, `commentsCount` → engagement
- `type` → postTypeMix (reel/carousel/image)
- `caption`, `hashtags` → content themes, location

### Current vs Enhanced Discovery

```
CURRENT (Wasteful):
┌─────────────────────────────────────────────────────────────┐
│ Fetch creator posts                                         │
│    ↓                                                        │
│ Extract: brand mentions, #ad, collabs                       │
│    ↓                                                        │
│ Store: partnership (brandId, creatorUsername, postUrl)      │
│    ↓                                                        │
│ DISCARD: views, likes, captions, hashtags ❌                │
└─────────────────────────────────────────────────────────────┘

ENHANCED (Single-Pass - Zero Extra API Cost):
┌─────────────────────────────────────────────────────────────┐
│ Fetch creator posts (SAME API CALL)                         │
│    ↓                                                        │
│ Extract: brand mentions, #ad, collabs                       │
│    +                                                        │
│ Calculate: avgViews, engagement, postTypeMix                │
│    +                                                        │
│ Collect: captions + hashtags for AI batch                   │
│    ↓                                                        │
│ Store: enriched discovered_creator + partnership            │
│    ↓                                                        │
│ Queue: AI analysis batch (themes, location) ✅              │
└─────────────────────────────────────────────────────────────┘
```

### Zero Extra Apify Cost

| Data Point | Source | Already Fetched? |
|------------|--------|------------------|
| `videoViewCount` | Apify post | ✅ Yes |
| `likesCount` | Apify post | ✅ Yes |
| `commentsCount` | Apify post | ✅ Yes |
| `type` (reel/carousel) | Apify post | ✅ Yes |
| `caption` | Apify post | ✅ Yes |
| `hashtags` | Apify post | ✅ Yes |
| `timestamp` | Apify post | ✅ Yes |
| Profile (followers, bio) | Apify profile | ✅ Yes |

**Only additional cost:** Claude Haiku for theme extraction (~$0.001 per creator)

### Enhanced Discovery Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  Discovery v2 (Seed Brand Expansion)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ For each seed brand:  │
         │ Fetch partnerships    │
         │ (Apify posts)         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ For each creator:     │
         │ Fetch their posts     │◄──── WE ALREADY DO THIS
         │ (to find more brands) │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐   ┌───────────┐   ┌──────────────┐
│ Extract │   │ Calculate │   │ Collect for  │
│ Brand   │   │ Metrics   │   │ AI Batch     │
│ Mentions│   │ (NEW)     │   │ (NEW)        │
│         │   │           │   │              │
│ • #ad   │   │ • avgViews│   │ • captions   │
│ • collab│   │ • engage% │   │ • hashtags   │
│ • paid  │   │ • postMix │   │ • bio        │
└────┬────┘   └─────┬─────┘   └──────┬───────┘
     │              │                │
     └──────────────┼────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Store enriched discovered_creator           │
│ + partnership with full metrics             │
└─────────────────────────────────────────────┘
                    │
                    ▼
         ┌───────────────────────┐
         │ AI Batch (async)      │
         │ Claude Haiku:         │
         │ • content themes      │
         │ • location parsing    │
         │ • language detection  │
         └───────────────────────┘
```

### What Changes in xpoz-service

```typescript
// CURRENT: processCreatorPosts() - throws away data
function processCreatorPosts(posts: ApifyPost[]) {
  const brandMentions = extractBrandMentions(posts);
  return brandMentions; // ❌ Throws away views, engagement, etc.
}

// ENHANCED: processCreatorPosts() - single pass enrichment
function processCreatorPosts(posts: ApifyPost[], profile: ApifyProfile) {
  // 1. Extract brand mentions (existing logic)
  const brandMentions = extractBrandMentions(posts);

  // 2. Calculate metrics (NEW - from same data, zero cost)
  const metrics = calculateCreatorMetrics(posts);
  // {
  //   avgViews: 12500,
  //   avgLikes: 890,
  //   avgComments: 45,
  //   engagementRate: 4.2,
  //   postFrequency: 3.5,
  //   postTypeMix: { reels: 60, carousels: 30, images: 10 }
  // }

  // 3. Collect for AI batch (NEW)
  const aiInput = {
    bio: profile.biography,
    captions: posts.map(p => p.caption).join('\n'),
    hashtags: posts.flatMap(p => p.hashtags)
  };

  return { brandMentions, metrics, aiInput };
}

// Helper: Calculate metrics from posts we already have
function calculateCreatorMetrics(posts: ApifyPost[]) {
  const reels = posts.filter(p => p.type === 'video' || p.videoViewCount);
  const avgViews = reels.length > 0
    ? Math.round(reels.reduce((sum, p) => sum + (p.videoViewCount || 0), 0) / reels.length)
    : null;

  const totalEngagement = posts.reduce((sum, p) => sum + p.likesCount + p.commentsCount, 0);
  const avgEngagement = totalEngagement / posts.length;

  const postTypeMix = {
    reels: Math.round((reels.length / posts.length) * 100),
    carousels: Math.round((posts.filter(p => p.type === 'carousel').length / posts.length) * 100),
    images: Math.round((posts.filter(p => p.type === 'image').length / posts.length) * 100)
  };

  return { avgViews, avgEngagement, postTypeMix, /* ... */ };
}
```

### AI Batch Processing (Cost Efficient)

Instead of calling AI per creator (expensive), batch them:

```typescript
// Queue creators for AI analysis during discovery
const aiQueue: AiAnalysisInput[] = [];

// After discovery run completes, process batch
async function processAiBatch(queue: AiAnalysisInput[]) {
  // Group into batches of 20 creators
  for (const batch of chunk(queue, 20)) {
    const prompt = buildBatchPrompt(batch);
    const results = await claude.analyze(prompt);
    await updateDiscoveredCreatorsWithThemes(results);
  }
}
```

### Brand Aggregates (Now Real Data)

With enriched discovered creators, brand aggregates become accurate:

```typescript
async function updateBrandAggregates(brandId: string) {
  const partners = await db.query.discoveredCreator.findMany({
    where: inArray(id, partnerIds)
  });

  return {
    avgPartnerViews: avg(partners.map(p => p.avgViews)),
    avgPartnerEngagement: avg(partners.map(p => p.engagementRate)),
    creatorRegions: unique(partners.map(p => p.countryCode).filter(Boolean)),
    minCreatorFollowers: min(partners.map(p => p.followers)),
    contentThemes: mergeThemes(partners.map(p => p.contentThemes))
  };
}
```

### Matching Platform User to Discovered Creators

When a discovered creator signs up, we already have their data:

```typescript
// On signup with Instagram username
const existingDiscovered = await db.query.discoveredCreator
  .findFirst({ where: eq(instagramUsername, newUser.instagramUsername) });

if (existingDiscovered) {
  // Copy enriched data to creator_profile (FREE - already have it!)
  await copyEnrichmentData(existingDiscovered, newCreatorProfile);
  // Skip onboarding enrichment - we have fresh data
}
```

### Creator Profile UI: "Your Stats"

Show creators their own metrics so they understand what brands see:

```
┌──────────────────────────────────────────────────────────┐
│  Your Creator Profile                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Performance                                          │
│  ├─ Followers: 15,234                                    │
│  ├─ Avg Views: 8,500 (Reels)                            │
│  ├─ Engagement Rate: 4.2% (Above avg for your tier!)    │
│  └─ Post Frequency: 4.2 posts/week                      │
│                                                          │
│  🎯 Content Profile                                      │
│  ├─ Main Niche: Travel                                  │
│  ├─ Sub-niches: Budget travel, Solo female travel       │
│  ├─ Top Format: Reels (65%)                             │
│  └─ Style: Bright, upbeat                               │
│                                                          │
│  🌍 Location: France (EU)                               │
│                                                          │
│  💡 Based on your profile, you're a good fit for:       │
│     • Travel brands targeting EU                         │
│     • Lifestyle brands seeking micro-influencers        │
│     • Brands preferring Reels content                   │
│                                                          │
│  [Refresh Stats]                    Last updated: 2 days │
└──────────────────────────────────────────────────────────┘
```

---

## Part 2: Brand Analysis Metrics (Existing + Enhanced)

### Category 1: Creator Similarity
*"Have they worked with creators like me?"*

| Metric | Description | Data Source | Priority |
|--------|-------------|-------------|----------|
| **Similar Creator Count** | # of past partners in same niche + follower tier | `partnership` + `discovered_creator` | P0 |
| **Smallest Creator Size** | Minimum followers of creators they've sponsored | `MIN(partnership.creatorFollowers)` | P0 |
| **Average Creator Size** | Already have `avgCreatorFollowers` | Existing | Done |
| **Niche Overlap %** | % of their past partners in creator's niche | `partnership.creatorNiche` | P1 |

**UI Example:**
```
✓ Worked with 3 lifestyle creators like you
✓ Their smallest creator: 12K followers (you: 15K)
```

---

### Category 2: Geographic Fit
*"Do they work with creators in my region?"*

| Metric | Description | Data Source | Priority |
|--------|-------------|-------------|----------|
| **Brand Location** | Where the brand is based | `brand.location` (needs parsing) | P1 |
| **Creator Regions Worked** | Countries/regions of past partners | New: `partnership.creatorLocation` | P0 |
| **Language Match** | Brand content language vs creator | New: detect from posts | P2 |

**UI Example:**
```
✓ Works with EU creators
⚠ Brand based in US (may have shipping constraints)
```

---

### Category 3: Content Alignment
*"Does my content style match what they sponsor?"*

| Metric | Description | Data Source | Priority |
|--------|-------------|-------------|----------|
| **Post Type Match** | Reels vs Feed vs Stories preference | `brand.preferredPostTypes` (exists) | Done |
| **Content Themes** | AI-detected themes from brand's sponsored posts | New: AI analysis | P0 |
| **Aesthetic Match** | Visual style similarity (bright, minimal, moody) | New: image analysis | P3 |
| **Caption Style** | Long-form vs short, emoji usage | New: text analysis | P3 |

**UI Example:**
```
Content Alignment: 78/100
- Topics: travel, lifestyle, minimalism
- Prefers: Reels (65%), Carousels (30%)
```

---

### Category 4: Performance Requirements
*"Can I deliver what they expect?"*

| Metric | Description | Data Source | Priority |
|--------|-------------|-------------|----------|
| **Typical Views Required** | Avg views on sponsored posts | `partnership.engagement` + post views | P0 |
| **Engagement Expectation** | Avg engagement rate of their partners | Calculated from partners | P0 |
| **Post Frequency** | How often they sponsor | `partnershipCount / timeRange` | P1 |
| **Campaign Duration** | One-off vs ongoing | Pattern detection | P3 |

**UI Example:**
```
⚠ They typically need 20K+ views (you avg: 8K)
✓ Your engagement rate (4.2%) exceeds their avg partner (3.1%)
```

---

### Category 5: Activity & Timing
*"Is now a good time to pitch?"*

| Metric | Description | Data Source | Priority |
|--------|-------------|-------------|----------|
| **Recent Activity** | Partnerships in last 30/90 days | Already calculated | Done |
| **Seasonal Patterns** | Do they sponsor more in certain months? | Historical partnership dates | P2 |
| **Growth Trajectory** | Is the brand growing/declining? | `brand.followers` over time | P3 |
| **Response Likelihood** | ML prediction based on similar pitches | Future: outreach data | P3 |

**UI Example:**
```
🟢 Active: 3 partnerships this month
📈 Peak sponsorship months: Sept-Nov
```

---

### Category 6: Authenticity & Trust
*"Is this a legitimate brand worth pitching?"*

| Metric | Description | Data Source | Priority |
|--------|-------------|-------------|----------|
| **Verified Account** | Instagram blue check | `brand.isVerifiedAccount` | Done |
| **Follower:Following Ratio** | Brands typically have high ratio | `brand.followers / brand.following` | P1 |
| **Has Website** | Professional presence | `brand.hasWebsite` | Done |
| **Engagement Authenticity** | Real comments vs bots | New: comment analysis | P3 |
| **Partnership History Depth** | How long they've been sponsoring | First partnership date | P1 |

---

## Part 3: Schema Changes

### Creator Profile Table (Major Expansion)
```sql
ALTER TABLE creator_profile ADD COLUMN
  -- Performance metrics
  avg_views INTEGER,                    -- Average views on Reels
  avg_likes INTEGER,                    -- Average likes per post
  avg_comments INTEGER,                 -- Average comments per post
  post_frequency DECIMAL(3,1),          -- Posts per week
  view_to_follower_ratio DECIMAL(5,2),  -- Reach indicator

  -- Content analysis
  content_themes JSONB,                 -- ['travel', 'lifestyle', 'food']
  sub_niches JSONB,                     -- ['budget travel', 'solo female']
  post_type_mix JSONB,                  -- {reels: 65, carousel: 25, image: 10}
  primary_language TEXT,                -- 'en', 'fr', 'es'
  caption_style TEXT,                   -- 'storytelling', 'short', 'minimal'

  -- Profile signals
  location TEXT,                        -- 'France', 'EU'
  country_code TEXT,                    -- 'FR', 'US', 'DE'
  has_media_kit BOOLEAN DEFAULT FALSE,  -- Has linktree/media kit
  external_url TEXT,                    -- Bio link
  is_verified BOOLEAN DEFAULT FALSE,    -- Blue checkmark

  -- Quality signals
  audience_quality_score INTEGER,       -- 0-100, based on engagement patterns
  estimated_real_followers INTEGER,     -- Estimated non-bot followers

  -- Growth tracking
  followers_30d_ago INTEGER,            -- For growth rate calculation
  growth_rate DECIMAL(5,2),             -- % change in 30 days

  -- Enrichment metadata
  posts_analyzed INTEGER,               -- How many posts we analyzed
  enriched_at TIMESTAMP,                -- When we last ran full enrichment
  enrichment_version INTEGER;           -- Schema version for migrations
```

### Brand Table Additions
```sql
ALTER TABLE brand ADD COLUMN
  min_creator_followers INTEGER,        -- Smallest creator they've worked with
  creator_regions JSONB,                -- ['FR', 'DE', 'US']
  content_themes JSONB,                 -- ['travel', 'lifestyle', 'minimalism']
  avg_partner_engagement DECIMAL(5,2),  -- Average engagement of their partners
  avg_partner_views INTEGER,            -- Average views on sponsored posts
  first_partnership_at TIMESTAMP,       -- When they started sponsoring
  sponsorship_frequency DECIMAL(5,2),   -- Partnerships per month
  primary_language TEXT;                -- Brand's content language
```

### Partnership Table Additions
```sql
ALTER TABLE partnership ADD COLUMN
  creator_location TEXT,    -- Country/region of creator
  views INTEGER,            -- Views on this specific post
  post_caption TEXT,        -- For theme extraction
  likes INTEGER,            -- Likes on partnership post
  comments INTEGER;         -- Comments on partnership post
```

### Discovered Creator Table (Major Expansion)
```sql
ALTER TABLE discovered_creator ADD COLUMN
  -- Performance metrics (same as creator_profile)
  avg_views INTEGER,
  avg_likes INTEGER,
  avg_comments INTEGER,
  engagement_rate DECIMAL(5,2),
  post_frequency DECIMAL(3,1),
  view_to_follower_ratio DECIMAL(5,2),

  -- Content analysis
  content_themes JSONB,                 -- ['travel', 'lifestyle']
  sub_niches JSONB,                     -- ['budget travel']
  post_type_mix JSONB,                  -- {reels: 65, carousel: 25, image: 10}
  primary_language TEXT,                -- 'en', 'fr'

  -- Location
  location TEXT,                        -- 'France'
  country_code TEXT,                    -- 'FR'

  -- Enrichment metadata
  posts_analyzed INTEGER,
  enriched_at TIMESTAMP,
  enrichment_version INTEGER;
```

---

## Part 4: TypeScript Interfaces

### EnrichedCreatorProfile

```typescript
interface EnrichedCreatorProfile {
  // Basic info (existing)
  id: string;
  userId: string;
  instagramUsername: string;
  followers: number;
  bio: string | null;
  profilePicture: string | null;

  // Performance metrics (NEW)
  performance: {
    avgViews: number | null;           // Average Reel views
    avgLikes: number | null;
    avgComments: number | null;
    engagementRate: number;            // Percentage
    postFrequency: number;             // Posts per week
    viewToFollowerRatio: number | null; // Reach indicator
    bestPerformingFormat: 'reel' | 'carousel' | 'image';
  };

  // Content profile (NEW)
  content: {
    themes: string[];                  // ['travel', 'lifestyle']
    subNiches: string[];               // ['budget travel', 'solo female']
    postTypeMix: {
      reels: number;                   // Percentage
      carousels: number;
      images: number;
    };
    primaryLanguage: string;           // 'en', 'fr'
    captionStyle: 'storytelling' | 'short' | 'minimal';
  };

  // Location (NEW)
  location: {
    display: string | null;            // 'France'
    countryCode: string | null;        // 'FR'
    region: string | null;             // 'EU', 'NA', 'APAC'
  };

  // Quality signals (NEW)
  quality: {
    audienceQualityScore: number | null;  // 0-100
    estimatedRealFollowers: number | null;
    isVerified: boolean;
    hasMediaKit: boolean;
    externalUrl: string | null;
  };

  // Growth (NEW)
  growth: {
    followers30dAgo: number | null;
    growthRate: number | null;         // % change
    trend: 'growing' | 'stable' | 'declining';
  };

  // Metadata
  enrichedAt: Date | null;
  postsAnalyzed: number;
  enrichmentVersion: number;
}
```

### FitAnalysis Response Object

```typescript
interface FitAnalysis {
  overallScore: number; // 0-100

  creatorSimilarity: {
    score: number;
    similarCreatorCount: number;
    smallestCreatorSize: number;
    nicheOverlapPercent: number;
    explanation: string; // "Worked with 3 lifestyle creators like you"
  };

  sizeMatch: {
    score: number;
    creatorSize: number;
    brandMinSize: number;
    brandAvgSize: number;
    brandMaxSize: number;
    status: 'below_min' | 'in_range' | 'above_avg' | 'above_max';
    explanation: string;
  };

  geographicFit: {
    score: number;
    brandLocation: string | null;
    worksWithRegions: string[];
    creatorRegion: string | null;
    explanation: string;
  };

  contentAlignment: {
    score: number; // 0-100
    themes: string[];
    preferredPostTypes: string[];
    matchingThemes: string[];
    explanation: string;
  };

  performanceMatch: {
    score: number;
    requiredViews: number | null;
    creatorAvgViews: number | null;
    requiredEngagement: number | null;
    creatorEngagement: number | null;
    meetsRequirements: boolean;
    explanation: string;
  };

  activitySignal: {
    score: number;
    recentPartnerships: number; // last 30 days
    monthlyFrequency: number;
    lastPartnershipDaysAgo: number;
    status: 'very_active' | 'active' | 'moderate' | 'inactive';
    explanation: string;
  };

  trustSignals: {
    score: number;
    isVerified: boolean;
    hasWebsite: boolean;
    followerRatio: number;
    partnershipHistoryMonths: number;
    explanation: string;
  };
}
```

---

## UI Mockup

```
┌──────────────────────────────────────────────────────────┐
│  Brand Fit Analysis                           Score: 82  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ Creator Similarity                              92%  │
│     Worked with 5 travel creators similar to you         │
│     Smallest creator: 8K (you: 12K) ✓                    │
│                                                          │
│  ✅ Size Match                                      88%  │
│     You're in their sweet spot (10K-50K range)           │
│                                                          │
│  ⚠️ Performance Requirements                        65%  │
│     They typically need 15K+ views                       │
│     Your average: 9K views                               │
│                                                          │
│  ✅ Content Alignment                               85%  │
│     Topics: travel, lifestyle, minimalism                │
│     Prefers: Reels (70%)                                 │
│                                                          │
│  ✅ Activity                                        90%  │
│     Very active: 4 partnerships this month               │
│     🟢 Good time to pitch                                │
│                                                          │
│  ✅ Geographic Fit                                  80%  │
│     Works with EU creators ✓                             │
│     Brand based in: France                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Priority Matrix

### Platform User Enrichment (Foundation)
| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Creator avgViews collection | Critical | Medium | **P0** |
| Creator content themes extraction | Critical | Medium | **P0** |
| Creator location parsing | High | Low | **P0** |
| Creator post type mix | High | Low | **P0** |
| "Your Stats" UI | High | Medium | **P1** |
| Weekly refresh cron | Medium | Low | **P1** |
| Audience quality score | Low | High | **P2** |
| Growth rate tracking | Low | Medium | **P2** |

### Discovered Creator Enrichment (Single-Pass - Zero Extra API Cost)
| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Modify `processCreatorPosts()` to extract metrics | Critical | Low | **P0** |
| discovered_creator schema expansion | Critical | Low | **P0** |
| Store partnership with views/likes/caption | High | Low | **P0** |
| AI batch job for themes/location | High | Medium | **P1** |
| Link to platform user on signup | Medium | Low | **P1** |
| Brand aggregates from enriched data | High | Low | **P1** |

### Brand Analysis (Aggregates)
| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Similar Creator Count | High | Medium | **P0** |
| Min/Avg Creator Size Display | High | Low | **P0** |
| Brand content themes | High | High | **P0** |
| Avg partner views | High | Medium | **P0** |
| Geographic fit (creator regions) | High | Medium | **P1** |
| Engagement comparison | Medium | Low | **P1** |
| Follower ratio trust signal | Medium | Low | **P1** |
| Partnership history depth | Medium | Low | **P1** |
| Seasonal patterns | Medium | Medium | **P2** |
| Language match | Low | Medium | **P2** |
| Aesthetic match (AI) | Low | High | **P3** |
| Response likelihood ML | Low | High | **P3** |

---

## Implementation Phases

### Phase 0: Creator Profile Enrichment (Foundation)
**Must do first - can't compare without creator data**

- [ ] Add new columns to `creator_profile` table
- [ ] Build creator enrichment endpoint in xpoz-service
  - Fetch profile via Apify
  - Fetch last 30 posts
  - Calculate performance metrics (avgViews, engagementRate, postFrequency)
  - Run Claude Haiku for content themes + location parsing
- [ ] Integrate enrichment into onboarding flow
- [ ] Add "Your Stats" section to creator profile page
- [ ] Set up weekly cron for active user refresh

### Phase 1: Brand Aggregates (Quick Wins)
**Use existing partnership data**

- [ ] Calculate `min_creator_followers` from partnerships
- [ ] Aggregate `creator_regions` from partnership data
- [ ] Calculate `avg_partner_engagement` from partnerships
- [ ] Track `first_partnership_at` for history depth
- [ ] Add follower:following ratio trust signal

### Phase 2: Single-Pass Discovery Enhancement
**Enrich discovered creators using data we ALREADY fetch (zero extra API cost)**

- [ ] Add enrichment columns to `discovered_creator` table
- [ ] Modify `processCreatorPosts()` to extract metrics from existing data:
  - `avgViews` from `videoViewCount` (already in response)
  - `engagementRate` from `likesCount + commentsCount` (already in response)
  - `postTypeMix` from `type` field (already in response)
- [ ] Collect captions + hashtags for AI batch queue
- [ ] Store enriched partnership data (views, likes, comments, caption)
- [ ] Add AI batch job at end of discovery run (themes, location)
- [ ] Link discovered creator to platform user on signup (skip re-enrichment)

### Phase 2b: Brand Aggregates from Enriched Data
**Now that we have real creator data, calculate accurate brand aggregates**

- [ ] `avgPartnerViews` = AVG(discovered_creator.avgViews) for brand's partners
- [ ] `avgPartnerEngagement` = AVG(discovered_creator.engagementRate)
- [ ] `creatorRegions` = DISTINCT(discovered_creator.countryCode)
- [ ] `minCreatorFollowers` = MIN(discovered_creator.followers)
- [ ] Run Claude Haiku batch for brand `contentThemes` from partnership captions
- [ ] Calculate `sponsorshipFrequency` (partnerships/month)

### Phase 3: Fit Analysis API
**Build the comparison engine**

- [ ] Create `/api/brands/[id]/fit-analysis` endpoint
- [ ] Implement FitAnalysis response object
- [ ] Build comparison logic for each category:
  - Creator Similarity (requires enriched creator data)
  - Size Match
  - Performance Match (requires creator avgViews)
  - Content Alignment (requires both sides' themes)
  - Geographic Fit (requires both sides' location)
  - Activity Signal (existing)
  - Trust Signals

### Phase 4: UI Integration
**Show fit analysis to users**

- [ ] Brand detail page: Fit Analysis card
- [ ] Discovery feed: Quick fit indicators
- [ ] Creator profile: "Your Stats" dashboard
- [ ] Pitch wizard: Pre-pitch fit summary

### Phase 5: AI Enhancements
**Smart predictions and recommendations**

- [ ] "Best time to pitch" based on seasonal patterns
- [ ] Similar brand recommendations
- [ ] Content suggestions based on what brands sponsor
- [ ] Response likelihood ML (requires outreach data)

---

## Part 5: AI Prompts

### Creator Theme Extraction Prompt

```
Analyze this Instagram creator's profile and recent posts to extract their content profile.

BIO: {bio}

RECENT CAPTIONS & HASHTAGS:
{captions_and_hashtags}

Return JSON:
{
  "themes": ["primary theme", "secondary theme"],  // Max 3, from: travel, fashion, beauty, fitness, food, tech, lifestyle, gaming, photography, business, music, art, parenting, pets, sports, entertainment
  "subNiches": ["specific angle 1", "specific angle 2"],  // Max 3, be specific like "budget travel", "sustainable fashion"
  "location": "Country or null if unclear",
  "countryCode": "ISO 2-letter code or null",
  "primaryLanguage": "en/fr/es/de/etc",
  "captionStyle": "storytelling" | "short" | "minimal"
}
```

### Brand Theme Extraction Prompt (for partnerships)

```
Analyze these sponsored post captions to identify what content themes this brand sponsors.

BRAND: {brand_name}

SPONSORED POST CAPTIONS:
{partnership_captions}

Return JSON:
{
  "themes": ["theme1", "theme2"],  // What content topics they sponsor
  "targetAudience": "brief description",
  "preferredTone": "professional" | "casual" | "playful"
}
```

---

## Part 6: Backend Service Endpoints

### New Endpoints for xpoz-service

```typescript
// ============================================
// Platform User Enrichment (creator_profile)
// ============================================

POST /creators/enrich
Body: { instagramUsername: string, userId: string }
Response: EnrichedCreatorProfile
// Full enrichment: profile + 30 posts + AI analysis

POST /creators/enrich/batch
Body: { users: Array<{username, userId}> }
Response: { results: EnrichedCreatorProfile[], errors: string[] }
// Weekly cron for active platform users

GET /creators/:username/metrics
Response: { avgViews, engagementRate, postTypeMix, ... }
// Quick metrics without full enrichment

// ============================================
// Discovery Pipeline (single-pass enrichment built-in)
// ============================================

POST /brands/discover-v2
// ENHANCED: Now extracts creator metrics from posts we already fetch
// No extra API cost - just processes existing data differently
// Queues AI batch for themes/location at end of run

POST /discovery/ai-batch
// Process queued creators for AI theme extraction
// Called at end of discovery run or via cron

// ============================================
// Brand Aggregates (from enriched data)
// ============================================

POST /brands/aggregate/:brandId
// Recalculate from REAL enriched discovered_creator data:
// - avgPartnerViews, avgPartnerEngagement (from discovered_creator metrics)
// - creatorRegions (from discovered_creator.countryCode)
// - minCreatorFollowers (from discovered_creator.followers)

POST /brands/aggregate/all
// Cron job to refresh all brand aggregates

POST /brands/extract-themes/:brandId
// Run AI theme extraction on brand's partnership captions

// ============================================
// Fit Analysis
// ============================================

GET /fit/:brandId?creatorUsername=xxx
Response: FitAnalysis
// Full fit analysis comparing enriched creator vs enriched brand data
```

### New Endpoints for Next.js App

```typescript
// Creator profile
GET /api/profile/stats
// Returns enriched stats for current user

POST /api/profile/refresh
// Triggers re-enrichment of current user

// Fit analysis
GET /api/brands/[id]/fit
// Returns FitAnalysis for current user vs brand

GET /api/brands/matches
// Updated to use enriched creator data for scoring
```

---

## Part 7: Data Collection Notes

### Already Available via Xpoz/Apify
- `likesCount`, `commentsCount` → engagement calculation
- `videoViewCount` → views for Reels
- `locationName` → geographic signals (post location)
- `caption`, `hashtags` → content theme extraction
- `coauthorProducers` → collab detection

### Needs New Collection
- Creator location (parse from bio: "Based in Paris", "FR creator", flag emojis)
- Content themes (Claude Haiku batch analysis on partnership captions)
- Views aggregation (currently not stored per partnership)

---

## Research Sources

- [Modash - Influencer Search Tools](https://www.modash.io/blog/influencer-search-tools)
- [InfluenceFlow - Marketing Metrics by Industry 2026](https://influenceflow.io/resources/average-influencer-marketing-metrics-by-industry-2026-guide/)
- [Brand24 - Influencer Marketing Metrics](https://brand24.com/blog/influencer-marketing-metrics/)
- [Kicksta - How to Get Sponsored on Instagram](https://kicksta.co/blog/how-to-get-sponsored-on-instagram)

### Key Industry Insights
- Follower count alone is "nearly worthless" in 2026 - quality metrics matter more
- Engagement authenticity (real comments vs bots) is now a top selection criterion
- 47% of marketers prefer long-term partnerships over one-off posts
- Micro-influencers (10K-100K) achieve 8-12% engagement vs 2-4% for macro
- Instagram Reels get 40-60% higher engagement than Feed posts

---

## Open Questions

### Creator Enrichment
1. **Enrichment timing:** Full enrichment at onboarding (slower) or lazy enrichment on first match request?
2. **Post sample size:** 20 posts (faster, cheaper) or 50 posts (more accurate)?
3. **Manual override:** Should creators be able to edit their auto-detected themes/location?
4. **Privacy:** Do we show creators their "Audience Quality Score" or keep it internal?

### Fit Analysis
5. **Weight distribution:** How should we weight each category in the overall score?
6. **Threshold display:** Show warnings when creator doesn't meet requirements, or keep it positive-only?
7. **Comparison baseline:** What defines "similar creator" - same niche? Same tier? Both?
8. **Incomplete data:** What do we show when brand/creator data is incomplete?

### Data & Costs
9. **Refresh frequency:** Weekly refresh for all users, or only active users?
10. **Apify costs:** How many posts to fetch per creator? (Cost vs accuracy tradeoff)
11. **AI costs:** Batch theme extraction nightly, or real-time per request?

### Discovery Pipeline (Single-Pass)
12. **AI batch timing:** Run AI batch inline at end of discovery, or separate cron?
13. **Re-enrichment:** If we see same creator again, update metrics or skip?
14. **Threshold:** Min posts needed to calculate reliable avgViews? (5? 10?)
15. **Reels-only:** Calculate avgViews only from Reels, or include carousel/image estimates?

### UX
12. **Discovery integration:** Show fit score in discovery cards, or only on brand detail page?
13. **Fit threshold:** Should we hide/deprioritize brands where fit score < X%?
14. **Gamification:** Show creators how to improve their profile to match more brands?
