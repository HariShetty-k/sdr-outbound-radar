# Outreach Radar — SDR Outbound

A daily-queue prospecting tool for a single SDR covering the food & beverage vertical. Every day it surfaces restaurant brands matching the ICP (5+ outlets, any Indian city) that haven't been touched before, lets the SDR open a brand to see outlets, POS vendor, decision-makers, and menu, reach out over WhatsApp or LinkedIn, and log the brand as processed — after which it never resurfaces.

**Live demo:** _add your Vercel URL here_
**Design reference:** [SDR Outbound Radar canvas](https://claude.ai/code/artifact/de07eb55-314c-45c9-86a1-cf99cf206cb8)

## What it does

- **New Brands queue** — today's 10 ICP-matched, not-yet-processed brands, with a live count against the sidebar.
- **Brand detail dialog** — account snapshot (outlets, POS, cities, est. founding year), decision-maker cards with masked phone numbers and one-click WhatsApp (`wa.me` deep link, pre-filled opener) and LinkedIn buttons, a sample menu/pricing extract, and a notes field.
- **Mark as processed** — the one action that mutates state: it writes to Postgres, the brand disappears from the queue immediately, and it survives a reload.
- **Processed log** — a flat, searchable table of every brand reviewed, with outcome pills and CSV export for pipeline reporting.

## Stack

- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind CSS 4), fonts via `next/font` (Sora for headings, IBM Plex Sans for body)
- **Backend:** Supabase (Postgres + Row Level Security), queried directly from the client via `@supabase/supabase-js`
- **Hosting:** Vercel

## Data model

| Table | Purpose |
|---|---|
| `brand` | one row per restaurant brand — name, category, cities, outlet count, POS vendor, ICP match flag |
| `decision_maker` | contacts per brand — name, title, phone/WhatsApp, LinkedIn, email |
| `menu_item` | sample menu/pricing extract per brand |
| `processed_log` | the append-only action log — brand, SDR, timestamp, outcome, notes. A `unique` constraint on `brand_id` makes "already processed" a simple existence check |
| `sdr_user` | the SDR roster (single seeded user today, multi-SDR ready) |

Dedup logic: a brand is in the New Brands queue only if it has no row in `processed_log`. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full rationale, including the seen-vs-processed distinction planned for later phases.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Env vars needed (also required in Vercel's project settings):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
```

The schema and seed data (10 sample F&B brands) live in [`RUNBOOK.md`](./RUNBOOK.md)'s Block 2 SQL.

## Why this is a stronger portfolio piece than a generic CRUD app

`Brand`, `Outlet`, and `Decision Maker` are objects with relationships; **"Mark as processed" is an action that transitions a brand's state and writes an audit record** — the same modeling shape (objects, actions, state, an audit trail) that shows up in Ontology-style modeling, just expressed as a normal relational app instead of an ontology layer:

- **Objects** — `brand`, `decision_maker`, `menu_item` rows, each with typed properties and foreign-key relationships.
- **Action** — `markProcessed()` is the single state-mutating operation in the app; everything else (viewing, WhatsApp/LinkedIn links, search) is read-only, which is what keeps the daily-refresh logic simple.
- **State transition** — a brand moves from "in the New Brands queue" to "excluded from all future queues" the instant its `processed_log` row exists.
- **Audit trail** — `processed_log` is append-only: who processed it, when, with what outcome, and any notes — a permanent record rather than a mutated field on `brand`.

## What's out of scope today

Scraping, automated enrichment, and auth are explicitly deferred — see the phased plan in [`ARCHITECTURE.md`](./ARCHITECTURE.md) (Phase 2+). Today's build is Phase 0 + a slice of Phase 1: a real, seeded, fully wired app with one genuine write path.

## Stretch ideas

1. Supabase Auth (email/password), even single-user.
2. Automated discovery via Google Places API + a scheduled dedup/ICP job (Phase 2).
3. Decision-maker enrichment through a licensed provider (Apollo, Lusha) rather than manual entry (Phase 3).
