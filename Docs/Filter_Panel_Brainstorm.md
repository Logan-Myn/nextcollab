# Filter Panel Brainstorm - Brand Discovery

## Current State Analysis

### Data We Actually Have (from Neon DB)

| Data Point | Available | Distribution |
|------------|-----------|--------------|
| **Total Brands** | 244 | - |
| **Categories** | 13 unique | tech (24), gaming (12), other (9), retail (8), media (6), beauty (6), fashion (5), food (4)... |
| **Niche field** | 0 populated | **Empty - not used** |
| **Verified accounts** | 85 (35%) | Many known brands unverified (e.g., OBSBOT) |
| **Has website** | 226 (93%) | High coverage |
| **typical_creator_niches** | 220 brands | tech, lifestyle, art, food, beauty, travel, pets, sports, fitness, fashion |
| **avg_creator_followers** | 27 brands with data | Distribution across Micro to Mega tiers |
| **Partnership activity** | - | Very High (2), High (6), Medium (27), Low (185), None (24) |
| **Active this month** | 220 | 90% have recent partnerships |

### Current Filter Problems

1. **"Brand Size" (Followers)** - Irrelevant. A brand's follower count doesn't correlate with sponsorship budget or activity. Small Instagram presence ≠ small brand.

2. **"Verified Only"** - Misleading. Many legitimate brands (OBSBOT, smaller DTC brands) lack verification. This filter excludes 65% of brands.

3. **"Category" as a list** - UX issue. 13 categories scrolling isn't ideal. Should be searchable or visual.

4. **Missing: Creator Tier Match** - We have `avg_creator_followers` data showing what size creators brands typically work with - this is highly valuable for creators.

5. **Missing: Niche Match** - We have `typical_creator_niches` showing what content niches brands sponsor - critical for discovery.

---

## Proposed New Filter Strategy

### Remove These Filters

| Filter | Reason |
|--------|--------|
| Brand Size (Followers) | Follower count doesn't indicate brand size or budget |
| Verified Only | Too many false negatives (legitimate brands unverified) |

### Keep & Improve

| Filter | Improvement |
|--------|-------------|
| Activity Level | Keep but relabel: "Sponsorship Activity" with clearer tiers |
| Sort Options | Keep Best Match, Most Active, A-Z |

### Add These New Filters

#### 1. **"Works with creators like you"** (Creator Tier Match)
Uses `avg_creator_followers` to match brands to creator's follower tier.

```
Tiers (based on user's followers):
- Nano creators (< 10K)
- Micro creators (10K - 50K)
- Mid-tier creators (50K - 100K)
- Macro creators (100K - 500K)
- Mega creators (500K+)
```

**UX**: Auto-enabled when user has profile. Shows brands whose typical creator partners match user's size.

#### 2. **"Sponsors your niche"** (Content Niche Match)
Uses `typical_creator_niches` to match brands to creator's content type.

```
Available niches from data:
- Tech, Lifestyle, Art, Food, Beauty
- Travel, Pets, Sports, Fitness, Fashion
```

**UX**: Auto-enabled when user has profile niche. Shows brands actively sponsoring that content type.

#### 3. **"Has website"** (Contact Signal)
93% of brands have websites - useful for outreach research.

**UX**: Simple toggle. "Has website" indicates easier outreach path.

---

## New Filter Panel Design

### Layout: Horizontal Pill-Based Filters

Instead of accordion panel with lists, use:

```
┌─────────────────────────────────────────────────────────────────┐
│ [All] [For You ✨]        [🔍 Search brands...]        [⚙ More] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Smart Filters (auto-applied when profile exists):              │
│  ┌──────────────────┐ ┌───────────────────┐ ┌────────────────┐  │
│  │ 👤 My Creator    │ │ 🎯 Sponsors my    │ │ ⚡ Active this │  │
│  │    Tier          │ │    niche          │ │    month       │  │
│  │    ✓ Enabled     │ │    ✓ Tech         │ │    ○ Off       │  │
│  └──────────────────┘ └───────────────────┘ └────────────────┘  │
│                                                                  │
│  Category: [All ▾]  Activity: [Any ▾]  Sort: [Best Match ▾]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Groups

#### Primary (Always Visible)
1. **Search** - Text search across brand name, username, bio
2. **Category** - Dropdown with icons (not scrolling list)
3. **Activity Level** - "Any", "Active (1+)", "Very Active (5+)"
4. **Sort** - Best Match, Most Active, A-Z

#### Smart Filters (Profile-Dependent)
These appear as toggle cards when user has a profile:

1. **"Matches my tier"** - Brands working with similar-sized creators
2. **"Sponsors my niche"** - Brands sponsoring user's content category
3. **"Active this month"** - Recent partnership activity

#### Advanced (Collapsed by Default)
1. **Has website** - Toggle
2. **Partnership count** - Range slider (1-10+)

---

## Category Redesign

### Current Problem
- 13 categories in a scrolling list
- No visual hierarchy
- "Other" category is meaningless

### Proposed: Visual Category Grid

```
┌─────────────────────────────────────────────────────────┐
│  Category                                          [×]  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │   💻    │ │   🎮    │ │   💄    │ │   👗    │       │
│  │  Tech   │ │ Gaming  │ │ Beauty  │ │Fashion  │       │
│  │   24    │ │   12    │ │    6    │ │    5    │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │   🛍️    │ │   📺    │ │   🍕    │ │   🎬    │       │
│  │ Retail  │ │  Media  │ │  Food   │ │ Entmt   │       │
│  │    8    │ │    6    │ │    4    │ │    3    │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
│  + 5 more categories                                    │
└─────────────────────────────────────────────────────────┘
```

Benefits:
- Visual scanning faster than list reading
- Brand counts provide context
- Top categories featured, others collapsed

---

## Activity Level Redesign

### Current Problem
- "Very Active", "Active", "Quiet" unclear meaning
- Based on arbitrary thresholds

### Proposed: Partnership-Based Tiers

| Tier | Criteria | Label | Visual |
|------|----------|-------|--------|
| 🔥 Hot | 5+ partnerships | "Very Active" | Fire badge |
| ⚡ Active | 1-4 partnerships | "Active" | Lightning badge |
| 💤 Quiet | 0 partnerships | "New/Quiet" | Zzz badge |

**UX Change**: Show actual partnership count on brand cards instead of vague labels.

```
┌──────────────────────────────┐
│  Brand Name          🔥 12   │  ← "12 recent collabs"
│  @username                   │
└──────────────────────────────┘
```

---

## Sort Options Redesign

### Current Options
- Best Match (AI)
- Most Active
- Followers (remove)
- A to Z

### Proposed Options

| Sort | Description | Icon |
|------|-------------|------|
| **Best Match** | AI relevance score | ✨ |
| **Most Collabs** | Partnership count desc | 🔥 |
| **Rising** | Recently started sponsoring | 📈 |
| **A-Z** | Alphabetical | 🔤 |

**New: "Rising"** - Brands with 1-3 partnerships (new to sponsoring). Less competition for creators.

---

## Implementation Priority

### Phase 1: Quick Wins
1. ❌ Remove "Brand Size" filter
2. ❌ Remove "Verified Only" filter
3. ✏️ Rename "Brand Size" to "Creator Tier Match" using `avg_creator_followers`
4. ✏️ Add "Sponsors my niche" using `typical_creator_niches`

### Phase 2: UX Improvements
1. 🎨 Convert category list to visual grid
2. 🎨 Add partnership count badges to brand cards
3. 🎨 Horizontal pill filters for smart toggles

### Phase 3: Advanced
1. ➕ Add "Rising brands" sort option
2. ➕ Add "Has website" filter
3. ➕ Range slider for partnership count

---

## Data Gaps to Address

| Missing Data | How to Get | Priority |
|--------------|------------|----------|
| Brand `niche` field empty | Use `category` + AI classification | Low (category works) |
| More `typical_creator_niches` | Run more discovery jobs | Medium |
| More `avg_creator_followers` | Aggregate from partnerships | Medium |

---

## Sources & Research

- [Algolia: Best marketplace UX practices for search](https://www.algolia.com/blog/ecommerce/best-marketplace-ux-practices-for-search)
- [Sprout Social: Top Influencer Marketing Platforms 2026](https://sproutsocial.com/insights/influencer-marketing-platforms/)
- [InfluenceFlow: Platform Solutions for Brand and Creator Management](https://influenceflow.io/resources/platform-solutions-for-brand-and-creator-management-complete-2026-guide/)
- [KOLSprite: Best TikTok Influencer Search Tools 2026](https://www.kolsprite.com/blog/best-TikTok-influencer-search-tools-2026)
