# NextCollab Dashboard Design

> Design specification for the creator dashboard - opportunities-first approach

---

## Design Philosophy

### Core Concept: "Your Sponsorship Inbox"

Instead of overwhelming stats, NextCollab feels like a **curated inbox of opportunities**:

> "3 new brands want to work with creators like you today"

### Differentiation from MeetSponsors

| MeetSponsors | NextCollab |
|--------------|------------|
| YouTube-focused (videos, subscribers) | Instagram-focused (visual, reels, stories) |
| Green/white corporate | Dark mode with purple/cyan accents |
| Metric-heavy dashboard | Discovery-first experience |
| "Here's your stats" | "Here's who wants to work with you" |
| Passive data display | Actionable opportunities |

---

## Color System

### Light Theme (Default) - Instagram Native
```css
/* Background layers */
--background: #ffffff;           /* Pure white base */
--surface: #fafafa;              /* Card backgrounds */
--surface-elevated: #f5f5f5;     /* Hover states, modals */
--border: #dbdbdb;               /* Instagram-style borders */

/* Accent colors */
--accent: #833ab4;               /* Instagram Purple - primary actions */
--accent-light: rgba(131, 58, 180, 0.08);
--accent-secondary: #e1306c;     /* Instagram Pink - highlights */
--success: #00a86b;              /* Green - match scores */
--warning: #f59e0b;              /* Orange - alerts */

/* Text */
--foreground: #262626;           /* Instagram text black */
--muted: #737373;                /* Secondary text */

/* Brand gradient - Purple to Pink */
--gradient-brand: linear-gradient(135deg, #833ab4 0%, #e1306c 100%);
```

### Dark Theme (Option)
```css
/* Background layers */
--background: #0a0a0f;           /* Deep dark base */
--surface: #12121a;              /* Card backgrounds */
--surface-elevated: #1a1a24;     /* Hover states, modals */
--border: #2a2a3a;               /* Subtle borders */

/* Accent colors */
--accent: #8b5cf6;               /* Purple - primary actions */
--accent-light: rgba(139, 92, 246, 0.1);
--accent-secondary: #06b6d4;     /* Cyan - highlights */
--success: #10b981;              /* Green - match scores */
--warning: #f59e0b;              /* Orange - alerts */

/* Text */
--foreground: #fafafa;
--muted: #a1a1aa;

/* Brand gradient - Purple to Cyan */
--gradient-brand: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
```

### Instagram Gradient (Both themes)
```css
--instagram-gradient: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
```

---

## Navigation Structure

**4 tabs** (mobile-optimized):

```
[For You]  [Discover]  [Pipeline]  [Saved]
```

| Tab | Purpose |
|-----|---------|
| **For You** | AI matches + dashboard home (default) |
| **Discover** | Full brand search with filters |
| **Pipeline** | Outreach tracker (CRM-lite kanban) |
| **Saved** | Favorited brands |

---

## Dashboard Sections

### 1. Hero: Brand Matches Feed

Lead with **actionable opportunities**, not stats:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎯 3 New Opportunities                             Updated 2h ago  │
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ [BRAND LOGO] │ │ [BRAND LOGO] │ │ [BRAND LOGO] │                │
│  │  Lofree      │ │  CeraVe      │ │  Gymshark    │                │
│  │  96% Match   │ │  89% Match   │ │  85% Match   │                │
│  │  Tech/Desk   │ │  Skincare    │ │  Fitness     │                │
│  │ [View →]     │ │ [View →]     │ │ [View →]     │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
│                                                                     │
│                         [See All Matches]                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Compact Profile Bar

Always visible but minimal:

```
┌─────────────────────────────────────────────────────────────────────┐
│  [PFP] @username · 45.2K · Fashion · 3.2%          [Sync] [Edit]   │
│  Profile strength: ████████░░ 80%                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Niche Intelligence

Context for your position:

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Your Position in Fashion                                        │
│                                                                     │
│  Followers     45.2K    ▸  32K median     +41% above               │
│  Engagement    3.2%     ▸  2.8% median    +14% above               │
│  Partnerships  0        ▸  2.4 avg        Start pitching!          │
│                                                                     │
│  "You're in the top 35% of Fashion creators"                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Pipeline (Kanban CRM)

Track your outreach:

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 Your Pipeline                                   [+ Add Brand]   │
│                                                                     │
│  Saved (4)     │ Pitched (2)    │ Negotiating (1) │ Won (0)        │
│  ┌────────┐    │ ┌────────┐     │ ┌────────┐      │                │
│  │ Nike   │    │ │ Adidas │     │ │ Puma   │      │    🎉          │
│  │ Zara   │    │ │ H&M    │     │ └────────┘      │                │
│  └────────┘    │ └────────┘     │                 │                │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Trending in Your Niche

FOMO + relevance signals:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔥 Trending in Fashion                                             │
│                                                                     │
│  • Zara partnered with 12 creators this week                        │
│  • Shein is targeting micro-influencers (<50K)                      │
│  • New: Reformation entered the creator space                       │
│                                                                     │
│  [Browse Fashion Brands →]                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Brand Card Component

Each brand card shows:

```
┌─────────────────────────────────────────┐
│  [Logo]  Brand Name              🟢 Active
│          @instagram_username
│
│  Category: Fashion
│  Followers: 1.2M
│  Recent Collabs: 8 this month
│
│  ┌─────────────────────────────────┐
│  │  96% Match                      │
│  │  ████████████████░░░░ 96/100    │
│  └─────────────────────────────────┘
│
│  [♡ Save]  [View Details]  [Pitch →]
└─────────────────────────────────────────┘
```

### Match Explanation (on hover/click)

```
Why 96% match?
├── ✓ They sponsor tech creators (you're tech)
├── ✓ Your followers fit their range (10K-100K)
├── ✓ They posted 3 sponsored collabs this week
└── ✓ EU brand, you're EU-based
```

### Activity Indicators

```
🟢 Very Active (5+ collabs/week)
🟡 Active (1-4 collabs/week)
⚪ Quiet (no recent activity)
```

---

## Mobile Layout

```
┌─────────────────────────────┐
│  NextCollab          [≡]   │
├─────────────────────────────┤
│                             │
│  🎯 3 New Matches           │
│                             │
│  ┌───────────────────────┐ │
│  │ Lofree     96% Match  │ │
│  │ Tech · €€€ · 🟢       │ │
│  │ [View] [Save] [Pitch] │ │
│  └───────────────────────┘ │
│                             │
│  ┌───────────────────────┐ │
│  │ CeraVe     89% Match  │ │
│  │ Beauty · €€ · 🟡      │ │
│  │ [View] [Save] [Pitch] │ │
│  └───────────────────────┘ │
│                             │
├─────────────────────────────┤
│ [ForYou][Discover][Pipe][♡]│
└─────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Dashboard ✅ Current Sprint

1. Dark mode color system
2. Brand matches feed (real data)
3. Compact profile bar
4. 4-tab navigation
5. Brand card component

### Phase 2: Discovery & Details

6. Brand detail page
7. Search with filters
8. Favorites (save/unsave)

### Phase 3: Engagement & Retention

9. Pipeline/CRM kanban
10. Niche insights comparison
11. Trending section

### Phase 4: Growth

12. Match explanations
13. Pitch generator
14. Email alerts

---

## Technical Decisions

- **Light mode default** with dark mode option (user preference)
- **Theme toggle** in sidebar and mobile header
- **System preference** respected as fallback
- **No swipeable cards** for now (standard scroll)
- **Stats minimized** - focus on opportunities
- **Pipeline included** in MVP (adds stickiness)

---

*Last updated: 2025-01-29*
