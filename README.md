# Zen-G News

Modern news platform built with Next.js 15, Supabase, and Netlify.

## Deployment

- **Hosting**: Netlify (auto-deploys on every push to `main`)
- **Database**: Supabase (`vcvsnjkigbonjzbveppn`)
- **Auth**: Supabase Auth (admin + editor roles)
- **Scheduled functions**:
  - RSS ingestion every 5 minutes
  - Scheduled publish every 1 minute
- **Env vars**: configured in Netlify dashboard

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run dev
```

## Database setup

Run `supabase/migrations/0001_init.sql` once in Supabase SQL Editor.
