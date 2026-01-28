# Brand Discovery v2 - Apify Paid Partnership Detection

## Problem with Current Approach (Hashtag-based)

The current discovery uses Xpoz to search for hashtags like `#ad`, `#sponsored`, `#pub`, etc.

**Limitations:**
- Misses posts without hashtags (many creators forget or don't use them)
- False positives from random hashtag usage
- Must parse captions to extract @brand mentions
- No way to detect Instagram's native "Paid Partnership" label

---

## New Discovery: Apify Fields

Apify's Instagram Post Scraper returns three key fields for sponsored content detection:

### 1. `paidPartnership` (boolean)
**Most reliable signal!**

When a creator uses Instagram's official "Paid partnership with @brand" label, this field is `true`.

```json
{
  "paidPartnership": true,
  "taggedUsers": [
    { "username": "mrbeast", "full_name": "MrBeast", "is_verified": true }
  ]
}
```

### 2. `coauthorProducers` (array)
When a creator uses Instagram's "Collab" feature, the partner appears here.

```json
{
  "coauthorProducers": [
    { "username": "obsbot", "id": "8294187240", "is_verified": false }
  ]
}
```

### 3. `taggedUsers` (array)
Users tagged in the post (may or may not be sponsors).

---

## Detection Matrix

| Scenario | `paidPartnership` | `coauthorProducers` | `taggedUsers` | Confidence |
|----------|-------------------|---------------------|---------------|------------|
| Official paid partnership | `true` | - | Brand | **100%** |
| Collab with brand | `false`/missing | Brand | Brand | **High** (needs validation) |
| Regular post with tags | `false`/missing | - | Users | **Low** (not sponsored) |

---

## Real Examples

### Example 1: Official Paid Partnership
**Creator:** @amixem | **Brand:** @mrbeast / @beastgames (Prime Video)

```json
{
  "ownerUsername": "amixem",
  "paidPartnership": true,
  "taggedUsers": [
    { "username": "mrbeast", "full_name": "MrBeast" },
    { "username": "beastgames", "full_name": "Beast Games" }
  ],
  "caption": "... disponible sur Prime Video ... @mrbeast @beastgames"
}
```
- No `#ad` or `#pub` hashtag
- `paidPartnership: true` confirms it's sponsored
- Brands directly available in `taggedUsers`

### Example 2: Collab Post (No Paid Partnership Label)
**Creator:** @maxtechexplore | **Brand:** @obsbot

```json
{
  "ownerUsername": "maxtechexplore",
  "coauthorProducers": [
    { "username": "obsbot", "full_name": "OBSBOT" }
  ],
  "taggedUsers": [
    { "username": "obsbot", "full_name": "OBSBOT" }
  ],
  "hashtags": ["OBSBOT", "webcam", "streaming", "tech"]
}
```
- No `paidPartnership` field
- Brand appears in `coauthorProducers` (collab feature)
- Could be brand partnership OR friend collab - needs AI validation

---

## Discovery Flow v2

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRAND DISCOVERY v2                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐
│ Entry Point │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Option A: Start from Known Brands   │
│ (We have 47 brands in database)     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Apify: Fetch posts where brand is   │
│ tagged or mentioned                 │
│ (Instagram Tagged Posts Scraper)    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Extract creators from posts         │
│ (ownerUsername field)               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Option B: Start from Creators       │
│ (From discovered_creator table)     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Apify: Fetch creator's recent posts │
│ (Instagram Profile Scraper)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ For each post, check:               │
│                                     │
│ 1. paidPartnership == true?         │
│    YES → Brand in taggedUsers       │
│          100% confirmed sponsored   │
│                                     │
│ 2. coauthorProducers exists?        │
│    YES → Potential brand collab     │
│          Queue for AI validation    │
│                                     │
│ 3. Neither?                         │
│    → Not a sponsored post, skip     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Save to database:                   │
│ - New brands → brand table          │
│ - New creators → discovered_creator │
│ - Partnerships → partnership table  │
└─────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Apify Service Enhancement
Add functions to `src/services/apify.ts`:
- `fetchCreatorPosts(username)` - Get recent posts for a creator
- `fetchBrandTaggedPosts(brandUsername)` - Get posts where brand is tagged

### Phase 2: New Discovery Service
Create `src/services/apify-discovery.ts`:
- `discoverFromCreators()` - Scan known creators for sponsored posts
- `discoverFromBrands()` - Scan known brands for tagged posts
- `extractSponsoredPosts(posts)` - Filter posts with paidPartnership or coauthorProducers

### Phase 3: Detection Logic
```typescript
function isSponsoredPost(post: ApifyPost): SponsoredPostResult | null {
  // Method 1: Official paid partnership (100% reliable)
  if (post.paidPartnership === true && post.taggedUsers?.length > 0) {
    return {
      brands: post.taggedUsers.map(u => u.username),
      confidence: 100,
      source: 'paid_partnership_label'
    };
  }

  // Method 2: Coauthor (needs validation)
  if (post.coauthorProducers?.length > 0) {
    return {
      brands: post.coauthorProducers.map(u => u.username),
      confidence: 70,
      source: 'coauthor',
      needsValidation: true
    };
  }

  return null;
}
```

### Phase 4: Hybrid Discovery
Combine both approaches:
1. **Xpoz hashtag search** - Catches explicit #ad posts (current method)
2. **Apify paidPartnership** - Catches official paid partnerships
3. **Apify coauthorProducers** - Catches collab posts

---

## Comparison: v1 vs v2

| Aspect | v1 (Hashtags) | v2 (Apify paidPartnership) |
|--------|---------------|----------------------------|
| Entry point | Search #ad, #sponsored | Known brands/creators |
| Brand detection | Parse caption for @mentions | Direct from taggedUsers/coauthorProducers |
| Reliability | Medium (misses non-hashtag posts) | High (catches official partnerships) |
| False positives | Yes (random #ad usage) | Low |
| Data source | Xpoz | Apify |
| Cost | Xpoz API | Apify API |

---

## Recommended Strategy

**Use BOTH methods:**

```
Discovery Sources:
├── Xpoz Hashtag Search (existing)
│   └── Good for: Explicit #ad posts, initial seeding
│
└── Apify Partnership Detection (new)
    ├── paidPartnership: true → 100% confirmed
    └── coauthorProducers → AI validate if brand

Snowball Effect:
1. Hashtags → Find initial brands/creators
2. Brands → Find all creators who worked with them
3. Creators → Find all brands they worked with
4. Repeat
```

---

## API Cost Consideration

| Tool | Cost | Use Case |
|------|------|----------|
| Xpoz | Per API call | Hashtag search, profile fetch |
| Apify | ~$0.01-0.02 per profile/post batch | Post scraping with paidPartnership |

Apify is slightly more expensive but provides the `paidPartnership` field that Xpoz doesn't have.

---

## Next Steps

1. [ ] Add Apify post fetching to `src/services/apify.ts`
2. [ ] Create `src/services/apify-discovery.ts`
3. [ ] Add `/brands/discover-v2` endpoint
4. [ ] Test with known creators who do paid partnerships
5. [ ] Implement snowball discovery (brands → creators → more brands)
