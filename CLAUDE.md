# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextCollab is a creator tool for Instagram influencers (similar to MeetSponsors for YouTube). It helps creators find and pitch brand sponsors through a searchable database with AI-powered matching.

**Key distinction:** This is NOT a marketplace. Creators search for brands to pitch - brands don't post opportunities.

**Documentation:**
- `Docs/NextCollab_research.md` - Market research, competitor analysis, strategic decisions
- `Docs/NextCollab_app_overview.md` - Product specs, features, schema, roadmap

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
│  OVH Server     │────▶│   Neon (DB)     │
│  Next.js App    │     │   Postgres      │
│  + Redis        │     └─────────────────┘
│  + Backend API  │
│  + Cron jobs    │
└─────────────────┘
```

**Deployment:** Self-hosted on OVH server (Docker). No Vercel — do NOT deploy to Vercel.

- Uses Next.js App Router (`src/app/`)
- Path alias: `@/*` maps to `./src/*`
- Fonts: Geist Sans and Geist Mono via `next/font`

### Key Files
- `src/lib/db.ts` - Neon database connection with Drizzle
- `src/lib/db/schema.ts` - Database schema (Better-Auth tables + app tables)
- `src/lib/auth.ts` - Better-Auth server configuration
- `src/lib/auth-client.ts` - Better-Auth React client hooks
- `src/lib/instagram-service.ts` - Backend service client (profile fetching)
- `src/app/api/auth/[...all]/route.ts` - Auth API routes

## Platform Features

- **Brand Database:** Scraped via backend service (#ad, #sponsored detection)
- **AI Matching:** "For You" feed with personalized brand recommendations
- **Creator Profiles:** Auto-populated from Instagram username (Apify) + optional OAuth
- **Onboarding:** Username-first (low friction) → OAuth optional for deeper insights
- **Target:** EU creators first, agencies as secondary market

## Key Conventions

- No Co-Author attribution on commits
- Never deploy unless explicitly requested with "CPD" or "deploy"
- Deployment is self-hosted on OVH (Docker) — never deploy to Vercel
