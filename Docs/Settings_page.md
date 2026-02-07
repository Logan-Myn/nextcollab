# Settings Page — NextCollab

## Overview

Settings page for creators to manage their profile, account, appearance, notifications, and billing.

**Route:** `/settings` (protected, inside dashboard shell)
**Pattern:** Tab-based single page with vertical tabs (desktop) / horizontal scroll tabs (mobile)

---

## Sections

### Phase 1 (Core)

#### 1. Profile
- Display name (editable)
- Instagram username (editable + re-sync trigger)
- Niche selector (dropdown)
- Bio / pitch intro
- Profile picture (from IG or custom)

#### 2. Account
- Email display (with change flow)
- Change password
- Active sessions (from `session` table — show devices, revoke)
- Delete account (destructive, AlertDialog confirmation)

#### 3. Appearance
- Theme picker: Light / Dark / System (visual preview cards)

### Phase 2

#### 4. Notifications (requires new DB table)
- Email digest frequency: daily / weekly / off
- Match alerts
- Outreach reminders
- Product updates

### Phase 3

#### 5. Subscription & Billing (requires Stripe)
- Current plan
- Upgrade/downgrade
- Payment method
- Invoice history

---

## Architecture

- Single `/settings` page with client-side `Tabs` (shadcn/ui)
- URL hash sync for deep-linking (`#profile`, `#account`, `#appearance`)
- Server actions for data mutations
- Wrapped inside `DashboardShell`

## UI Layout

```
Desktop:
┌──────────┬──────────────────────────────────────┐
│ Profile  │  Section content                     │
│ Account  │  Form fields, cards, actions          │
│ Appear.  │                                      │
│ (Notifs) │         [Save Changes]               │
│ (Billing)│                                      │
└──────────┴──────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────────────────┐
│ [Profile] [Account] [Appearance] →              │
├─────────────────────────────────────────────────┤
│  Section content                                │
│  Form fields, cards, actions                    │
└─────────────────────────────────────────────────┘
```

## Components

| Component | Source | Usage |
|-----------|--------|-------|
| Tabs | shadcn/ui | Section navigation |
| Input, Label | shadcn/ui | Form fields |
| Select | shadcn/ui | Niche picker |
| Button | shadcn/ui | Save, destructive delete |
| AlertDialog | shadcn/ui | Delete account confirmation |
| Card | shadcn/ui | Section wrappers |
| BlurFade | Magic UI | Staggered animations |
| ShimmerButton | Magic UI | Primary save action |
| MagicCard | Magic UI | Theme preview cards |

## DB Impact

- **Phase 1:** No schema changes (uses existing `user` + `creator_profile`)
- **Phase 2:** New `notification_settings` table
- **Phase 3:** Stripe webhook tables

## API Endpoints Needed

- `PATCH /api/settings/profile` — Update name, bio, niche, Instagram username
- `POST /api/settings/profile/resync` — Trigger Instagram re-enrichment
- `PATCH /api/settings/account/email` — Update email (Better-Auth)
- `PATCH /api/settings/account/password` — Change password (Better-Auth)
- `GET /api/settings/account/sessions` — List active sessions
- `DELETE /api/settings/account/sessions/:id` — Revoke session
- `DELETE /api/settings/account` — Delete account
