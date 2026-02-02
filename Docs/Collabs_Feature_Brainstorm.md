# Collabs Feature Brainstorm

> **Date:** February 2, 2025
> **Status:** Research & Planning
> **Scope:** Partnerships → Collabs feature enhancement

---

## Problem Analysis

### Current State Issues

From analyzing the screenshot and codebase, we identified several critical problems:

| Issue | Root Cause | Impact |
|-------|------------|--------|
| **Duplicate creators displayed** | Query returns partnership rows (per-post), not unique creators | Confusing UX, appears broken |
| **Missing follower data** | `discoveredCreator` join sometimes fails, shows "— followers" | Incomplete information |
| **Misleading stats** | `totalCollabs` shows API limit (20), not actual count | Users see wrong data |
| **Limited actionable data** | Only shows username, niche, post type, date | No engagement metrics |
| **No post links** | `postUrl` fetched but never rendered | Can't verify partnerships |
| **No pagination** | Hard `LIMIT 20` in query | Can't browse full history |

### Technical Root Cause (Duplicates)

```sql
-- Current query returns ONE row per partnership post
SELECT * FROM partnership
LEFT JOIN discovered_creator ON ...
ORDER BY detected_at DESC
LIMIT 20

-- Creator X with 3 posts = 3 rows in results = 3 cards in UI
```

**Solution needed:** Aggregate by unique creator, show post count per creator.

---

## Naming: "Partnerships" → "Collabs"

### Rationale

| Current | Proposed | Why |
|---------|----------|-----|
| Partnerships | Collabs | Brand alignment with "NextCollab" |
| Partnership tab | Collabs tab | Shorter, more modern |
| partnershipCount | collabCount | Consistency |

### Migration Impact

- **Database:** No schema change needed (internal naming can stay)
- **Frontend:** UI labels only
- **API:** Consider adding aliases for backward compatibility
- **Docs:** Update terminology

**Recommendation:** Keep `partnership` in code/DB, only change UI labels to "Collab/Collabs"

---

## Feature Enhancement Ideas

### 1. Aggregated Creator View (Priority: Critical)

**Current:** Show each partnership post as separate card
**Proposed:** Aggregate by creator, show collab summary

```
┌─────────────────────────────────────────────────────────┐
│ 👤 @george_gkrimas ✓                                    │
│ 125K followers · Lifestyle                              │
│                                                         │
│ 📊 3 collabs with this brand                           │
│    └─ 2 Videos, 1 Sidecar · Last: 3 days ago           │
│                                                         │
│ 💫 Avg engagement: 4.2%                                │
│                                                         │
│ [View Posts ↗]  [View Profile]                         │
└─────────────────────────────────────────────────────────┘
```

**Data changes needed:**
- Group partnerships by `creatorUsername`
- Count posts per creator
- Calculate avg engagement per creator-brand pair
- Show post type breakdown

### 2. Accurate Statistics (Priority: High)

**Current stats (misleading):**
```
Total Collabs: 20      ← Actually API limit
Unique Creators: 18    ← Only from 20-sample
Avg Followers: 50K     ← Sample average
```

**Proposed stats (separate query):**
```sql
SELECT
  COUNT(*) as total_collabs,
  COUNT(DISTINCT creator_username) as unique_creators,
  AVG(creator_followers) as avg_followers,
  MAX(detected_at) as last_collab
FROM partnership
WHERE brand_id = ?
```

**New UI:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   47         │     32       │    125K      │   3 days     │
│ Total Collabs│Unique Creators│Avg Followers │  Last Collab │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 3. Engagement Data Display (Priority: High)

**Currently available but not shown:**
- `partnership.engagement` (likes + comments)
- `partnership.postUrl` (link to Instagram post)

**Proposed additions:**
- Engagement rate: `engagement / creator_followers * 100`
- Post performance indicator (above/below creator average)
- Direct link to Instagram post

### 4. Filtering & Sorting (Priority: Medium)

**Filter by:**
- Creator follower range (micro, mid, macro, mega)
- Niche/category
- Post type (Reels, Stories, Carousel, etc.)
- Recency (last 30/60/90 days)

**Sort by:**
- Most recent (default)
- Most collabs
- Highest engagement
- Highest followers

### 5. Creator Cards Enhancement (Priority: Medium)

**Add to creator cards:**
- Verified badge (from `discoveredCreator.isVerified`)
- Follower count (not "— followers")
- Engagement rate badge
- Collab frequency indicator
- Quick actions: View Profile, View on Instagram

### 6. Collab Timeline View (Priority: Low)

Visual timeline showing collab history over 12 months:
```
Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
 ●         ●    ●              ●    ●              ●    ●●
```

### 7. Similar Creators Section (Priority: Low)

"Creators similar to those who collab with [Brand]"
- Based on niche + follower range
- Helps users discover potential fits

---

## Implementation Approaches

### Approach A: Frontend Aggregation (Quick Fix)

**Pros:**
- No backend changes
- Fast to implement
- Fixes duplicate issue immediately

**Cons:**
- Still limited to 20 posts
- Stats remain inaccurate
- Performance concern if scaling

**Implementation:**
```typescript
// Group partnerships by creator
const creatorMap = partnerships.reduce((acc, p) => {
  const key = p.creatorUsername;
  if (!acc[key]) {
    acc[key] = { ...p, postCount: 1, posts: [p] };
  } else {
    acc[key].postCount++;
    acc[key].posts.push(p);
  }
  return acc;
}, {});

const uniqueCreators = Object.values(creatorMap);
```

### Approach B: Backend Aggregation (Recommended)

**Pros:**
- Accurate stats
- Scalable
- Better data structure

**Cons:**
- More development time
- API changes needed

**New endpoint:** `GET /api/brands/:id/collabs/creators`
```typescript
// Returns aggregated creator data
{
  stats: {
    totalCollabs: 47,
    uniqueCreators: 32,
    avgFollowers: 125000,
    lastCollabAt: "2025-01-30"
  },
  creators: [
    {
      username: "george_gkrimas",
      followers: 125000,
      niche: "Lifestyle",
      isVerified: true,
      profilePicture: "...",
      collabCount: 3,
      avgEngagement: 4.2,
      postTypes: ["Video", "Video", "Sidecar"],
      lastCollabAt: "2025-01-30",
      posts: [
        { url: "...", type: "Video", engagement: 5200, date: "..." },
        // ...
      ]
    }
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 32
  }
}
```

### Approach C: Hybrid (Phased)

**Phase 1:** Frontend aggregation (immediate fix)
**Phase 2:** Backend aggregation endpoint
**Phase 3:** Advanced features (filtering, timeline, etc.)

---

## Data Quality Improvements

### Backend Service Enhancements

Based on analysis of `nextcollab-xpoz-service`:

1. **Ensure follower data is populated**
   - Issue: Some `discoveredCreator` records have null followers
   - Fix: Re-fetch via Apify if followers is null

2. **Engagement rate calculation**
   - Add `engagementRate` field to partnership table
   - Calculate: `engagement / creator_followers * 100`

3. **Creator profile pictures**
   - Many showing placeholder/default
   - Ensure Backblaze B2 upload runs for all creators

4. **Deduplication audit**
   - Run entity classification on older records
   - Ensure no brands in `discovered_creator` table

---

## UX/UI Recommendations

### Based on Industry Research

**1. Show Trust Signals**
- Verified badge prominently
- Collab frequency badge ("Active collaborator")
- Brand engagement range

**2. Engagement Timeline**
- Mini sparkline showing engagement trend
- Color coding: green (consistent), yellow (variable)

**3. Quick Stats Cards**
- Redesign stat boxes with clearer labels
- Add "Last collab" timestamp
- Show engagement rate range

**4. Action-Oriented Design**
- "View on Instagram" button for each collab
- "Similar Creators" quick link
- "Export Collab List" for pitch prep

---

## Competitive Insights

From research on CreatorIQ, GRIN, Upfluence, AspireIQ:

| Feature | Industry Standard | NextCollab Current | Recommendation |
|---------|-------------------|-------------------|----------------|
| Deduplication | Creator-level aggregation | Post-level (duplicates) | Aggregate by creator |
| Engagement metrics | Rate + trend | Not shown | Add engagement rate |
| Post links | Always shown | Not shown | Add "View Post" link |
| Filtering | Multi-dimensional | None | Add follower/niche filters |
| Timeline view | Visual history | None | Consider for v2 |
| Collaboration count | Accurate total | Limited to 20 | Fix with separate query |

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Fix duplicate display | High | Low | 🔴 Critical |
| Accurate stats query | High | Low | 🔴 Critical |
| Show follower data | High | Low | 🔴 Critical |
| Rename to "Collabs" | Medium | Low | 🟡 High |
| Engagement rate display | High | Medium | 🟡 High |
| Post URL links | Medium | Low | 🟡 High |
| Filtering options | Medium | Medium | 🟢 Medium |
| Sorting options | Medium | Low | 🟢 Medium |
| Pagination | Medium | Medium | 🟢 Medium |
| Timeline view | Low | High | 🔵 Low |
| Similar creators | Low | High | 🔵 Low |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (This Sprint)

1. **Frontend: Aggregate by creator** - Dedupe the display
2. **Backend: Stats query** - Get accurate totals
3. **UI: Rename to Collabs** - Update tab label
4. **Fix: Show follower counts** - Ensure data populated

### Phase 2: Data Enhancement

1. Add engagement rate calculation
2. Show post URLs with "View" links
3. Add filtering (follower range, niche)
4. Add sorting options

### Phase 3: Advanced Features

1. Pagination for large collab lists
2. Creator profile cards enhancement
3. Collab timeline visualization
4. "Similar creators" recommendations

---

## Questions to Resolve

1. **Naming scope:** Change only UI labels, or also API/DB naming?
2. **Aggregation level:** Show individual posts expandable, or just summary?
3. **Filtering priority:** Which filters are most valuable for creators?
4. **Mobile:** How should collabs display on mobile devices?
5. **Export:** Should users be able to export collab data (CSV, PDF)?

---

## Next Steps

- [ ] Review and approve approach
- [ ] Create implementation tasks
- [ ] Design mockups for new UI
- [ ] Implement Phase 1 fixes
- [ ] Test with real brand data
- [ ] Gather user feedback
