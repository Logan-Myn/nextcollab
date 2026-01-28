# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextCollab is an Instagram influencer sponsorship platform (similar to MeetSponsors for YouTube). It connects Instagram creators with brands/sponsors through a two-sided marketplace with AI-powered matching.

## Commands

```bash
bun dev          # Start development server (http://localhost:3000)
bun run build    # Build for production
bun start        # Start production server
bun lint         # Run ESLint

# Database (Drizzle)
bun db:generate  # Generate migrations from schema changes
bun db:migrate   # Run migrations
bun db:push      # Push schema directly (dev only)
bun db:studio    # Open Drizzle Studio GUI
```

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **React:** v19
- **Package Manager:** Bun
- **Database:** Neon (serverless Postgres)
- **Auth:** Better-Auth (with organizations/teams for agencies)
- **Payments:** Stripe (subscriptions)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Vercel (Edge)  │────▶│   Neon (DB)     │
│  Next.js App    │     │   Postgres      │
└────────┬────────┘     └─────────────────┘
         │
         │ Background jobs / Heavy processing
         ▼
┌─────────────────┐
│  OVH Server     │
│  - Redis        │
│  - Xpoz MCP     │
│  - Cron jobs    │
│  - Staging      │
└─────────────────┘
```

- Uses Next.js App Router (`src/app/`)
- Path alias: `@/*` maps to `./src/*`
- Fonts: Geist Sans and Geist Mono via `next/font`

### Key Files
- `src/lib/db.ts` - Neon database connection with Drizzle
- `src/lib/db/schema.ts` - Database schema (Better-Auth tables + app tables)
- `src/lib/auth.ts` - Better-Auth server configuration
- `src/lib/auth-client.ts` - Better-Auth React client hooks
- `src/app/api/auth/[...all]/route.ts` - Auth API routes

## Platform Features

- **Data Collection:** Instagram Graph API + Xpoz MCP for creator/brand intelligence
- **Databases:** Creator profiles, Brand/Sponsor profiles
- **Matching Algorithm:** ML-based recommendations scoring creator-brand fit
- **Features:** Search/discovery, messaging, analytics dashboards

## Key Conventions

- No Co-Author attribution on commits
- Never deploy unless explicitly requested with "CPD" or "deploy"
