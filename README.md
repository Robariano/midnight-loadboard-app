# Midnight Loadboard — Working App

This is the real, working backend for Midnight Loadboard: carrier verification signup, load posting,
load claiming, and the coverage attestation safety system we designed. Your existing marketing site
(built in GoDaddy Website Builder) stays as-is — its buttons will link out to this app.

## What's included

- **/get-verified** — carrier signup form → saves to a real database
- **/post-load** — shipper load posting form → saves to a real database
- **/loads** — browse open loads (with search/filter by lane, equipment, rate, pickup date), claim a
  load, mark a confirmed load delivered, rate a carrier after delivery
- **/confirm/[token]** — the private driver confirmation page (sent via SMS or email)
- **/carriers/[id]** — public carrier profile: verification status + shipper ratings/reviews
- **/revoked-carriers** — public list of carriers whose verified status has been revoked
- Full coverage attestation logic: flags, on-hold loads, carrier flag counts
- Automatic SMS (Twilio) and email (Resend) delivery of the driver confirmation link
- Daily automated check (Vercel Cron) that warns carriers before their on-file insurance expires

## Step 1 — Create a free Supabase account (your database)

1. Go to supabase.com, sign up free, create a new project.
2. Once created, go to the **SQL Editor** in the left sidebar.
3. Open `supabase-schema.sql` from this folder, copy all of it, paste it into the SQL editor, and click **Run**.
   This creates all your tables (carriers, loads, coverage_attestations, coverage_flags).
4. Go to **Settings > API** in Supabase. Copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (NOT the anon key — the service_role one, keep it secret) → this is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 2 — Set up your environment variables

1. In this project folder, copy `.env.local.example` to a new file named `.env.local`
2. Paste in your real Supabase URL and service role key from Step 1
3. Also add a line: `ADMIN_PASSWORD=pick-a-password-only-you-know` — this protects your new admin dashboard

## Step 3 — Run it locally to test (optional but recommended)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — try submitting the Get Verified form and Post a Load form, check that
the data shows up in your Supabase project (Table Editor tab).

**Important:** New carrier signups default to `verified_status = 'pending'`. To approve them, go to
`/admin`, log in with your `ADMIN_PASSWORD`, and you'll land on a review screen (`/admin/carriers`)
listing every carrier with links to their submitted CDL, insurance, and authority documents, plus their
flag counts. Click Approve or Revoke there — no need to touch Supabase directly for this.

## Step 4 — Deploy for real (free)

1. Push this folder to a GitHub repository (create one at github.com if you don't have one).
2. Go to vercel.com, sign up free, click "Add New Project," and import that GitHub repo.
3. In Vercel's project settings, add the same two environment variables from your `.env.local`.
4. Click Deploy. Vercel gives you a live URL (e.g. `midnight-loadboard-app.vercel.app`).

## Step 5 — Connect it to your GoDaddy site

On your existing GoDaddy Website Builder pages, change the button links:
- "Get Verified" button → point to `https://your-vercel-url.vercel.app/get-verified`
- "Post a Load" button → point to `https://your-vercel-url.vercel.app/post-load`
- "Browse Loads" button → point to `https://your-vercel-url.vercel.app/loads`

GoDaddy Website Builder lets you edit a button's link URL directly in its editor — no code needed there.

## If you're setting this up fresh (new Supabase project)

Just run `supabase-schema.sql` — it already includes every table, including `carrier_ratings` and the
`insurance_alert_sent_at` column.

## If you already had this app running before July 2026

Your Supabase project has the original tables already, so don't re-run `supabase-schema.sql` (it'll
error on tables that already exist). Instead, run `supabase-migration-ratings-and-alerts.sql` once —
same steps: SQL Editor > New Query > paste > Run. It only adds what's new: the `carrier_ratings` table
and the `insurance_alert_sent_at` column on `carriers`.

You'll also want to add these new environment variables (same two places as before — `.env.local` and
your Vercel project settings):

- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — powers email delivery of the driver confirmation link when a
  driver only has an email on file (no phone). Free account at resend.com.
- `CRON_SECRET` — any long random string. Set it in Vercel's project settings and Vercel will
  automatically use it to authenticate the daily insurance-expiration check (see `vercel.json`) —
  nothing else to configure.

## Next steps / things not yet built

- **Carrier login** — carriers currently claim loads by pasting their Carrier ID (found in their
  verification confirmation). A real login system would be a nice upgrade later, not required to launch.
- **Re-verification flow** — there's a `pending_reverification` status reserved in the schema for when a
  carrier's docs need a refresh, but no UI/flow triggers it yet.
- **Escalating flags** — `coverage_flags` supports `resolved`/`escalated` states in the schema, but only
  `open` is ever set today; there's no admin action yet to resolve or escalate a flag.

## Files that matter most

- `supabase-schema.sql` — full database structure (fresh installs)
- `supabase-migration-ratings-and-alerts.sql` — incremental migration (existing installs)
- `vercel.json` — the daily insurance-expiration cron schedule
- `app/api/loads/[id]/claim/route.js` — the core claim + attestation trigger logic (SMS/email dispatch)
- `app/api/attestations/[token]/route.js` — where "neither" creates a flag and puts a load on hold
- `app/api/cron/insurance-alerts/route.js` — the daily insurance-expiration warning job
- `app/api/loads/[id]/rate/route.js` — carrier rating submission
