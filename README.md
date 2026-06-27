# FAN-TRAK

Administrative platform for content creators. Built with React + Express + Supabase.

## Structure

```
Fan-Trak/
├── apps/
│   ├── landing/        ← Waitlist signup + Floor Research form
│   └── survey/         ← Creator Survey (33 questions)
└── supabase/
    └── migrations/     ← Run these in your Supabase SQL Editor
```

## Setup

### 1. Supabase Database

Run `supabase/migrations/001_initial_schema.sql` in your [Supabase SQL Editor](https://supabase.com/dashboard/project/tgyctkwmrncltgryubmx/sql).

### 2. Environment Variables

Both apps need these env vars (set in Vercel dashboard):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | `https://tgyctkwmrncltgryubmx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON from Google Cloud service account key |

### 3. Vercel Deployment

Deploy each app separately from this monorepo:
- **Landing + Floor Research**: Root Directory = `apps/landing`
- **Creator Survey**: Root Directory = `apps/survey`

### 4. Google Sheets

The service account `fan-trak-sheets@nodal-operand-361714.iam.gserviceaccount.com` must have Editor access to the spreadsheet.

## Data Access

- All submissions are stored in Supabase (persistent, queryable)
- Every submission also appends a row to [Fan-Trak Leads & Research](https://docs.google.com/spreadsheets/d/11etQYmPiNiwFk4blhaEjdxQtCNXQxYydyn0S0IQgOvA/edit)
- Only the service role key can read data from Supabase

## Brand

- **FAN** = Magenta `#FF0080`
- **TRAK** = Cyan `#00BFFF`  
- Background = Navy `#1A1A2E`
