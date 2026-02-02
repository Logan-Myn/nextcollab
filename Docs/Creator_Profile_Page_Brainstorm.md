# Creator Profile Page Brainstorm

> **Date:** February 2, 2025
> **Status:** Research & Planning
> **Reference:** MeetSponsors creator profiles

---

## Problem Analysis

### Why Creator Profiles Matter for NextCollab

NextCollab is for **creators** finding brands to pitch. A creator profile page serves multiple purposes:

| Use Case | Who Benefits | Value |
|----------|--------------|-------|
| **Self-view** | Creator (logged in user) | See their own stats, track partnerships, build media kit |
| **Discovery** | Other creators | Learn from successful creators in their niche |
| **Social proof** | Brands (future) | Verify creator legitimacy before responding to pitches |

### MeetSponsors Reference (Screenshot)

Key elements from the MeetSponsors creator profile:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Avatar] Oui In France                      [Get Contact] [YT] │
│ • 100k subscribers • 268 videos                                 │
│ [Travel and Experiences] [English]                              │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ Dashboard | Videos | Sponsors | Similar YouTubers | Media Kit   │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ SUBSCRIBERS    MEDIAN VIEWS    VIDEOS/MONTH    BRANDS           │
│ 100k           16k             1.6             8                 │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ Latest videos                                   View all →      │
│ [Video 1] [Video 2] [Video 3 🔒] [Video 4 🔒]                  │
│                                                                 │
│ Performance in Travel and Experiences                           │
│ [🔒 Locked - Compare performance with niche averages]          │
│ [Unlock niche insights]                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Data Available

### What We Already Have

| Data | Table | Notes |
|------|-------|-------|
| Username, name, bio | `discovered_creator` | From Apify scraping |
| Followers, following | `discovered_creator` | Stored |
| Profile picture | `discovered_creator` | Uploaded to Backblaze |
| Verified status | `discovered_creator` | Boolean |
| Niche | `discovered_creator` | Text (sometimes null) |
| Partnership count | `discovered_creator` | Aggregated |
| Brand collaborations | `partnership` | Query by creator username |
| Entity classification | `discovered_creator` | AI-powered (creator vs brand) |

### What's Missing

| Data | Difficulty | Source |
|------|------------|--------|
| Posts count | Easy | Add to Apify scrape |
| Engagement rate | Medium | Calculate from partnership data |
| Recent posts | Medium | Xpoz/Apify fetch on-demand |
| Posting frequency | Medium | Calculate from post timestamps |
| Audience demographics | Hard | Requires Instagram OAuth |
| Rate card/pricing | N/A | User-entered or estimated |

---

## Feature Ideas

### 1. Creator Profile Page (`/creator/[username]`)

**Adapting MeetSponsors for Instagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Avatar] @george_gkrimas ✓                     [IG] [Share]    │
│ GRM3D • 70.9K followers                                         │
│ [3D Printing] [Tech] [Greece]                                   │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ Dashboard | Collabs | Similar Creators                          │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ FOLLOWERS     ENGAGEMENT    COLLABS    BRANDS WORKED WITH       │
│ 70.9K         2.1%          12         8                        │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ Brand Collaborations                            View all →      │
│ [OBSBOT] [Brand2] [Brand3] [Brand4]                            │
│  2 posts   1 post   3 posts  1 post                            │
│                                                                 │
│ Bio                                                             │
│ "3D Printing Enthusiast, Greece..."                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Stats to Display

**Primary Stats (Above fold):**
| Stat | Source | Calculation |
|------|--------|-------------|
| Followers | `discovered_creator.followers` | Direct |
| Engagement Rate | Partnership data | `AVG(engagement) / followers * 100` |
| Total Collabs | `partnership` count | `COUNT(*)` where creator |
| Brands Worked With | `partnership` | `COUNT(DISTINCT brand_id)` |

**Secondary Stats (Dashboard tab):**
- Follower tier (Nano/Micro/Mid/Macro/Mega)
- Average engagement per post
- Most common post types
- Most recent collab date
- Account age indicator

### 3. Tabs Structure

**Tab 1: Dashboard (Overview)**
- Bio and basic info
- Quick stats grid
- Recent activity

**Tab 2: Collabs (Brand History)**
- List of brands they've worked with
- Number of posts per brand
- Post types used
- Links to actual Instagram posts

**Tab 3: Similar Creators**
- Creators in same niche
- Similar follower range
- Helps with competitor research

### 4. Engagement Rate Calculation

Since we store `engagement` (likes + comments) per partnership post:

```sql
-- Calculate creator's engagement rate from their collabs
SELECT
  creator_username,
  AVG(engagement) as avg_engagement,
  MAX(creator_followers) as followers,
  (AVG(engagement) / MAX(creator_followers) * 100) as engagement_rate
FROM partnership
WHERE creator_username = 'george_gkrimas'
GROUP BY creator_username
```

**Note:** This is engagement on sponsored posts only. For overall engagement, we'd need to fetch regular posts.

### 5. Brands Worked With Section

```typescript
// Query to get brands a creator has worked with
const brandsWorkedWith = await db
  .select({
    brandId: partnership.brandId,
    brandName: brand.name,
    brandUsername: brand.instagramUsername,
    brandLogo: brand.profilePicture,
    collabCount: count(partnership.id),
    lastCollab: sql`MAX(${partnership.detectedAt})`,
  })
  .from(partnership)
  .innerJoin(brand, eq(partnership.brandId, brand.id))
  .where(eq(partnership.creatorUsername, username))
  .groupBy(partnership.brandId, brand.name, brand.instagramUsername, brand.profilePicture)
  .orderBy(sql`MAX(${partnership.detectedAt}) DESC`)
  .limit(10);
```

---

## Use Cases

### Use Case 1: Creator Views Their Own Profile

**Value:** See partnership history, track growth, understand market position

**Features needed:**
- Auth check: Is this my profile?
- Enhanced stats (engagement trends, comparison to niche average)
- "Edit profile" or "Sync from Instagram" button
- Export media kit (future)

### Use Case 2: Creator Researches Other Creators

**Value:** Learn what brands similar creators work with, benchmark performance

**Features needed:**
- Public profile view (limited data)
- "Similar creators" section
- Niche/category browsing

### Use Case 3: Brand Vets a Creator (Future)

**Value:** Before responding to pitch, verify creator legitimacy

**Features needed:**
- Public profile with key stats
- Partnership history (social proof)
- Verification badges

---

## Implementation Approach

### Phase 1: Basic Profile Page (MVP)

**Scope:** Use existing data only

1. Create `/creator/[username]/page.tsx`
2. Create `/api/creators/by-username/[username]/route.ts`
3. Query `discovered_creator` + `partnership` tables
4. Display:
   - Profile header (avatar, name, followers, verified)
   - Stats grid (followers, collabs count, brands count)
   - Bio
   - Brands worked with (from partnerships)

**Effort:** 1-2 days

### Phase 2: Enhanced Stats

**Scope:** Add calculated metrics

1. Calculate engagement rate from partnership data
2. Add follower tier classification
3. Add "most common post types" analysis
4. Add similar creators recommendations

**Effort:** 2-3 days

### Phase 3: Content Samples (Optional)

**Scope:** Fetch recent posts on-demand

1. Fetch recent posts from Xpoz/Apify when profile is viewed
2. Cache for 24 hours
3. Display content grid with engagement metrics

**Effort:** 3-4 days + API costs

---

## API Design

### Endpoint: `GET /api/creators/by-username/[username]`

**Response:**
```typescript
{
  data: {
    // Basic profile
    id: string,
    instagramUsername: string,
    fullName: string,
    bio: string,
    followers: number,
    following: number,
    isVerified: boolean,
    profilePicture: string,
    niche: string,

    // Calculated stats
    stats: {
      totalCollabs: number,
      uniqueBrands: number,
      avgEngagement: number,
      engagementRate: number,
      followerTier: 'nano' | 'micro' | 'mid' | 'macro' | 'mega',
      lastCollabAt: string,
    },

    // Brand collaborations
    brandsWorkedWith: [
      {
        brandId: string,
        brandName: string,
        brandUsername: string,
        brandLogo: string,
        collabCount: number,
        lastCollabAt: string,
        postTypes: string[],
      }
    ],

    // Similar creators
    similarCreators: [
      {
        username: string,
        followers: number,
        niche: string,
        profilePicture: string,
        collabCount: number,
      }
    ]
  }
}
```

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Basic profile page | High | Low | P0 |
| Stats grid (followers, collabs) | High | Low | P0 |
| Brands worked with section | High | Medium | P0 |
| Engagement rate calculation | Medium | Low | P1 |
| Follower tier badge | Low | Low | P1 |
| Similar creators | Medium | Medium | P2 |
| Recent posts (content samples) | Medium | High | P3 |
| Media kit export | Low | High | P3 |

---

## Questions to Resolve

1. **Access control:** Should creator profiles be fully public or require login?
2. **Self-edit:** Can creators edit/enhance their discovered profile?
3. **Linking:** Should `discovered_creator` link to `creator_profile` for logged-in users?
4. **URL structure:** `/creator/[username]` or `/c/[username]`?
5. **Similar creators:** Based on niche only, or also follower tier?

---

## Next Steps

- [ ] Review and approve approach
- [ ] Decide on access control model
- [ ] Create API endpoint
- [ ] Build profile page component
- [ ] Test with real creator data
