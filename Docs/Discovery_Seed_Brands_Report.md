# Discovery V2 Seed Brands Report

> Generated: February 2026
> Purpose: Seed brand recommendations for NextCollab's brand discovery system

---

## Executive Summary

This report identifies the **top 10 most active brands** across 5 key niches based on Instagram sponsored post activity (#ad). These brands will serve as seeds for the DiscoveryV2 snowball algorithm to populate NextCollab's brand database.

### Key Findings

| Niche | Sponsored Posts Found | Recommended Seeds | Est. Discovery Cost |
|-------|----------------------|-------------------|---------------------|
| Beauty/Skincare | 536 | 10 | ~$3.50 |
| Fitness/Wellness | 238 | 10 | ~$2.80 |
| Food/Beverage | 809 | 10 | ~$3.20 |
| Fashion/Lifestyle | 1,000+ | 10 | ~$4.00 |
| Tech/Apps | 473 | 10 | ~$2.50 |
| **Total** | **3,000+** | **50** | **~$16.00** |

---

## Pricing Reference (API Dojo / Apify)

| Service | Cost |
|---------|------|
| Posts scraping | **$0.50 / 1,000 posts** |
| Profile fetch (by handle) | **$0.01 / profile** |
| First 40 profiles | **FREE** |

Source: [API Dojo Instagram Scraper](https://apify.com/apidojo/instagram-scraper)

---

## Niche 1: Beauty/Skincare

### Market Overview
- **Sponsored posts found**: 536
- **Key characteristics**: High volume of L'Oréal group brands, K-beauty growing, strong UK/EU presence
- **Typical creator size**: 10K-500K followers

### Top 10 Seed Brands

| Rank | Brand | Handle | Verified | Parent Company |
|------|-------|--------|----------|----------------|
| 1 | Lancôme | `@lancomeofficial` | ✅ | L'Oréal |
| 2 | Charlotte Tilbury | `@charlottetilbury` | ✅ | Puig |
| 3 | YSL Beauty | `@yslbeauty` | ✅ | L'Oréal |
| 4 | Maybelline | `@maybelline` | ✅ | L'Oréal |
| 5 | CeraVe | `@ceraveuki` | ✅ | L'Oréal |
| 6 | La Roche-Posay | `@larocheposay` | ✅ | L'Oréal |
| 7 | Kiehl's | `@kiehlsuki` | ✅ | L'Oréal |
| 8 | Benefit Cosmetics | `@benefitcosmeticsuk` | ✅ | LVMH |
| 9 | Beauty of Joseon | `@beautyofjoseon_official` | ✅ | Independent |
| 10 | SK-II | `@skii.usa` | ✅ | P&G |

### Cost Estimate (2 Layers)

```
Layer 0: Process 10 seed brands
├── Posts fetched: 10 brands × 50 posts avg = 500 posts
├── Profile fetches: 10
├── Creators discovered: ~60 (avg 6 per brand)
└── Cost: ~$0.35

Layer 1: Process discovered creators (max 50)
├── Posts fetched: 50 creators × 30 posts avg = 1,500 posts
├── Profile fetches: 50 + ~80 new entity saves = 130
├── New brands discovered: ~80
└── Cost: ~$1.55

Layer 2: Process new brands (max 20)
├── Posts fetched: 20 brands × 50 posts avg = 1,000 posts
├── Profile fetches: 20 + ~40 new entity saves = 60
├── More creators discovered: ~100+
└── Cost: ~$0.85

TOTAL BEAUTY/SKINCARE:
├── Posts: ~3,000
├── Profiles: ~200
├── Brands discovered: ~100
├── Creators discovered: ~150
├── Partnerships: ~300
└── Cost: ~$3.50
```

### Seed List (Copy-Paste Ready)
```json
["lancomeofficial", "charlottetilbury", "yslbeauty", "maybelline", "ceraveuki", "larocheposay", "kiehlsuki", "benefitcosmeticsuk", "beautyofjoseon_official", "skii.usa"]
```

---

## Niche 2: Fitness/Wellness

### Market Overview
- **Sponsored posts found**: 238
- **Key characteristics**: Activewear + supplements dominate, gym culture strong, protein brands very active
- **Typical creator size**: 50K-1M followers

### Top 10 Seed Brands

| Rank | Brand | Handle | Verified | Category |
|------|-------|--------|----------|----------|
| 1 | MyProtein | `@myprotein` | ✅ | Supplements |
| 2 | Gymshark | `@gymshark` | ✅ | Activewear |
| 3 | Factor Meals | `@factormeals` | ✅ | Meal Delivery |
| 4 | Celsius | `@celsiusuki` | ✅ | Energy Drinks |
| 5 | VQ Fit | `@vqfit` | ✅ | Activewear |
| 6 | Oner Active | `@oneractive` | ✅ | Activewear |
| 7 | PureGym | `@puregym.swiss` | ✅ | Gym Chain |
| 8 | Young & Wild | `@youngandwildbrand` | ✅ | Activewear |
| 9 | Cult Store | `@cultstore` | ✅ | Fitness Retail |
| 10 | NOCCO | `@nocco.usa` | ✅ | Energy Drinks |

### Cost Estimate (2 Layers)

```
Layer 0: Process 10 seed brands
├── Posts fetched: 10 brands × 40 posts avg = 400 posts
├── Profile fetches: 10
├── Creators discovered: ~50 (avg 5 per brand)
└── Cost: ~$0.30

Layer 1: Process discovered creators (max 50)
├── Posts fetched: 50 creators × 25 posts avg = 1,250 posts
├── Profile fetches: 50 + ~60 new entity saves = 110
├── New brands discovered: ~60
└── Cost: ~$1.35

Layer 2: Process new brands (max 20)
├── Posts fetched: 20 brands × 40 posts avg = 800 posts
├── Profile fetches: 20 + ~30 new entity saves = 50
├── More creators discovered: ~80+
└── Cost: ~$0.70

TOTAL FITNESS/WELLNESS:
├── Posts: ~2,450
├── Profiles: ~170
├── Brands discovered: ~80
├── Creators discovered: ~130
├── Partnerships: ~250
└── Cost: ~$2.80
```

### Seed List (Copy-Paste Ready)
```json
["myprotein", "gymshark", "factormeals", "celsiusuki", "vqfit", "oneractive", "puregym.swiss", "youngandwildbrand", "cultstore", "nocco.usa"]
```

---

## Niche 3: Food/Beverage

### Market Overview
- **Sponsored posts found**: 809
- **Key characteristics**: CPG brands, alcohol sponsors, appliance brands (Frigidaire), meal kits
- **Typical creator size**: 20K-300K followers

### Top 10 Seed Brands

| Rank | Brand | Handle | Verified | Category |
|------|-------|--------|----------|----------|
| 1 | Frigidaire | `@frigidaire` | ✅ | Appliances |
| 2 | Wonderful Pistachios | `@wonderfulpistachios` | ✅ | Snacks |
| 3 | Envy Apples | `@envyapples` | ✅ | Produce |
| 4 | St Pierre | `@stpierreusa` | ✅ | Bakery |
| 5 | Plenish | `@plenishdrinks` | ✅ | Beverages |
| 6 | Arla | `@arladairyuk` | ✅ | Dairy |
| 7 | La Vie Foods | `@laviefoods.uk` | ✅ | Plant-Based |
| 8 | Love Corn | `@lovecorn_snacks` | ✅ | Snacks |
| 9 | Opie's Foods | `@opiesfoods` | ✅ | Specialty |
| 10 | Idahoan | `@idahoanfoods` | ✅ | Meal Solutions |

### Cost Estimate (2 Layers)

```
Layer 0: Process 10 seed brands
├── Posts fetched: 10 brands × 45 posts avg = 450 posts
├── Profile fetches: 10
├── Creators discovered: ~55 (avg 5.5 per brand)
└── Cost: ~$0.32

Layer 1: Process discovered creators (max 50)
├── Posts fetched: 50 creators × 28 posts avg = 1,400 posts
├── Profile fetches: 50 + ~70 new entity saves = 120
├── New brands discovered: ~70
└── Cost: ~$1.50

Layer 2: Process new brands (max 20)
├── Posts fetched: 20 brands × 45 posts avg = 900 posts
├── Profile fetches: 20 + ~35 new entity saves = 55
├── More creators discovered: ~90+
└── Cost: ~$0.75

TOTAL FOOD/BEVERAGE:
├── Posts: ~2,750
├── Profiles: ~185
├── Brands discovered: ~90
├── Creators discovered: ~145
├── Partnerships: ~280
└── Cost: ~$3.20
```

### Seed List (Copy-Paste Ready)
```json
["frigidaire", "wonderfulpistachios", "envyapples", "stpierreusa", "plenishdrinks", "arladairyuk", "laviefoods.uk", "lovecorn_snacks", "opiesfoods", "idahoanfoods"]
```

---

## Niche 4: Fashion/Lifestyle

### Market Overview
- **Sponsored posts found**: 1,000+ (largest niche)
- **Key characteristics**: Fast fashion dominates, activewear crossover, strong UK influencer market
- **Typical creator size**: 10K-500K followers

### Top 10 Seed Brands

| Rank | Brand | Handle | Verified | Category |
|------|-------|--------|----------|----------|
| 1 | MOTF | `@motf_official` | ✅ | Premium Fashion |
| 2 | Berlook | `@berlookofficial` | ✅ | Activewear |
| 3 | Very UK | `@veryuk` | ✅ | Retail |
| 4 | Sweaty Betty | `@sweatybetty` | ✅ | Activewear |
| 5 | Holland & Cooper | `@hollandcooper` | ✅ | Premium Fashion |
| 6 | Glowmode | `@glowmode_official` | ✅ | Activewear |
| 7 | TALA | `@wearetala` | ✅ | Sustainable Activewear |
| 8 | Young LA | `@younglaforher` | ✅ | Streetwear |
| 9 | Unalteredd | `@unalteredd` | ✅ | Loungewear |
| 10 | Daily Objects | `@dailyobjects` | ✅ | Accessories |

### Cost Estimate (2 Layers)

```
Layer 0: Process 10 seed brands
├── Posts fetched: 10 brands × 60 posts avg = 600 posts
├── Profile fetches: 10
├── Creators discovered: ~70 (avg 7 per brand)
└── Cost: ~$0.40

Layer 1: Process discovered creators (max 50)
├── Posts fetched: 50 creators × 35 posts avg = 1,750 posts
├── Profile fetches: 50 + ~90 new entity saves = 140
├── New brands discovered: ~90
└── Cost: ~$1.80

Layer 2: Process new brands (max 20)
├── Posts fetched: 20 brands × 60 posts avg = 1,200 posts
├── Profile fetches: 20 + ~50 new entity saves = 70
├── More creators discovered: ~120+
└── Cost: ~$1.00

TOTAL FASHION/LIFESTYLE:
├── Posts: ~3,550
├── Profiles: ~220
├── Brands discovered: ~110
├── Creators discovered: ~190
├── Partnerships: ~380
└── Cost: ~$4.00
```

### Seed List (Copy-Paste Ready)
```json
["motf_official", "berlookofficial", "veryuk", "sweatybetty", "hollandcooper", "glowmode_official", "wearetala", "younglaforher", "unalteredd", "dailyobjects"]
```

---

## Niche 5: Tech/Apps

### Market Overview
- **Sponsored posts found**: 473
- **Key characteristics**: VPNs very active, SaaS tools, mobile apps, developer tools
- **Typical creator size**: 50K-2M followers

### Top 10 Seed Brands

| Rank | Brand | Handle | Verified | Category |
|------|-------|--------|----------|----------|
| 1 | Surfshark | `@surfshark` | ✅ | VPN |
| 2 | Malwarebytes | `@malwarebytesofficial` | ✅ | Security |
| 3 | MongoDB | `@mongodb` | ✅ | Database |
| 4 | JetBrains | `@jetbrains` | ✅ | Dev Tools |
| 5 | Cash App | `@cashapp` | ✅ | Fintech |
| 6 | Back Market | `@backmarket` | ✅ | Refurbished Tech |
| 7 | Notability | `@notabilityapp` | ✅ | Productivity |
| 8 | Higgsfield AI | `@higgsfield.ai` | ✅ | AI Tools |
| 9 | Plaud AI | `@plaud_official` | ✅ | AI Hardware |
| 10 | Hume AI | `@hume.ai` | ✅ | Voice AI |

### Cost Estimate (2 Layers)

```
Layer 0: Process 10 seed brands
├── Posts fetched: 10 brands × 35 posts avg = 350 posts
├── Profile fetches: 10
├── Creators discovered: ~40 (avg 4 per brand)
└── Cost: ~$0.27

Layer 1: Process discovered creators (max 50)
├── Posts fetched: 50 creators × 22 posts avg = 1,100 posts
├── Profile fetches: 50 + ~50 new entity saves = 100
├── New brands discovered: ~50
└── Cost: ~$1.20

Layer 2: Process new brands (max 20)
├── Posts fetched: 20 brands × 35 posts avg = 700 posts
├── Profile fetches: 20 + ~25 new entity saves = 45
├── More creators discovered: ~60+
└── Cost: ~$0.60

TOTAL TECH/APPS:
├── Posts: ~2,150
├── Profiles: ~155
├── Brands discovered: ~70
├── Creators discovered: ~100
├── Partnerships: ~200
└── Cost: ~$2.50
```

### Seed List (Copy-Paste Ready)
```json
["surfshark", "malwarebytesofficial", "mongodb", "jetbrains", "cashapp", "backmarket", "notabilityapp", "higgsfield.ai", "plaud_official", "hume.ai"]
```

---

## Combined Discovery Summary

### All 50 Seeds (5 Niches × 10 Brands)

```json
{
  "beauty": ["lancomeofficial", "charlottetilbury", "yslbeauty", "maybelline", "ceraveuki", "larocheposay", "kiehlsuki", "benefitcosmeticsuk", "beautyofjoseon_official", "skii.usa"],
  "fitness": ["myprotein", "gymshark", "factormeals", "celsiusuki", "vqfit", "oneractive", "puregym.swiss", "youngandwildbrand", "cultstore", "nocco.usa"],
  "food": ["frigidaire", "wonderfulpistachios", "envyapples", "stpierreusa", "plenishdrinks", "arladairyuk", "laviefoods.uk", "lovecorn_snacks", "opiesfoods", "idahoanfoods"],
  "fashion": ["motf_official", "berlookofficial", "veryuk", "sweatybetty", "hollandcooper", "glowmode_official", "wearetala", "younglaforher", "unalteredd", "dailyobjects"],
  "tech": ["surfshark", "malwarebytesofficial", "mongodb", "jetbrains", "cashapp", "backmarket", "notabilityapp", "higgsfield.ai", "plaud_official", "hume.ai"]
}
```

### Total Discovery Estimates (All 5 Niches)

| Metric | Beauty | Fitness | Food | Fashion | Tech | **TOTAL** |
|--------|--------|---------|------|---------|------|-----------|
| Seeds | 10 | 10 | 10 | 10 | 10 | **50** |
| Posts Scraped | 3,000 | 2,450 | 2,750 | 3,550 | 2,150 | **13,900** |
| Profile Fetches | 200 | 170 | 185 | 220 | 155 | **930** |
| Brands Discovered | 100 | 80 | 90 | 110 | 70 | **450** |
| Creators Discovered | 150 | 130 | 145 | 190 | 100 | **715** |
| Partnerships | 300 | 250 | 280 | 380 | 200 | **1,410** |
| **Est. Cost** | $3.50 | $2.80 | $3.20 | $4.00 | $2.50 | **$16.00** |

---

## Recommended Execution Strategy

### Phase 1: MVP Launch (Immediate)
Run discovery on **3 priority niches**:
1. Beauty/Skincare (highest creator demand)
2. Fashion/Lifestyle (largest volume)
3. Fitness/Wellness (engaged community)

**Cost**: ~$10.30
**Expected**: ~290 brands, ~470 creators, ~930 partnerships

### Phase 2: Expansion (Week 1)
Add remaining niches:
4. Food/Beverage
5. Tech/Apps

**Cost**: ~$5.70
**Expected**: +160 brands, +245 creators, +480 partnerships

### Phase 3: Maintenance (Ongoing)
- Weekly discovery runs with new trending seeds
- Monitor for new emerging brands
- Expand to additional niches (Travel, Gaming, Home/Interior)

---

## API Configuration

### DiscoveryV2 Request Template

```typescript
// Example request for Beauty niche
const beautyDiscovery = {
  seedBrands: [
    "lancomeofficial",
    "charlottetilbury",
    "yslbeauty",
    "maybelline",
    "ceraveuki",
    "larocheposay",
    "kiehlsuki",
    "benefitcosmeticsuk",
    "beautyofjoseon_official",
    "skii.usa"
  ],
  maxDepth: 2,
  maxBrandsPerLayer: 20,
  maxCreatorsPerLayer: 50,
  useSmartPostLimit: true,
  onlyPaidPartnership: false
};
```

### Endpoint
```
POST /api/brands/discover-v2
```

---

## Data Sources

- **Instagram Sponsored Posts**: Xpoz MCP (#ad keyword search)
- **Pricing Data**: [API Dojo Instagram Scraper](https://apify.com/apidojo/instagram-scraper)
- **Profile Verification**: Xpoz MCP getInstagramUser

---

## Notes

1. **Exclude mega-brands**: SHEIN, Temu excluded as seeds (too broad, not creator-focused)
2. **L'Oréal dominance**: Beauty niche heavily weighted toward L'Oréal brands (Lancôme, YSL, Maybelline, CeraVe, La Roche-Posay, Kiehl's)
3. **Cross-niche overlap**: Gymshark appears in both Fitness and Fashion
4. **Regional focus**: UK/EU brands prioritized per NextCollab target market
5. **Cost buffer**: Actual costs may be 10-20% higher due to rate limiting and retries

---

*Report generated for NextCollab brand discovery system*
