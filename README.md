# Midnight Loadboard — Working App

This is the real, working backend for Midnight Loadboard: carrier verification signup, load posting,
load claiming, and the coverage attestation safety system we designed. Your existing marketing site
(built in GoDaddy Website Builder) stays as-is — its buttons will link out to this app.

## What's included

- **/get-verified** — carrier signup form → saves to a real database
- **/post-load** — shipper load posting form → saves to a real database
- **/loads** — browse open loads, claim a load, triggers coverage attestation
- **/confirm/[token]** — the private driver confirmation page (sent via link)
- Full coverage attestation logic: flags, on-hold loads, carrier flag counts

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

## Next steps / things not yet built

- **Actual SMS/email sending** — the driver confirmation link is generated but not automatically texted/
  emailed yet. Adding this needs a service like Twilio (SMS) or Resend/SendGrid (email) — marked as a
  TODO in `app/api/loads/[id]/claim/route.js`.
- **Carrier login** — carriers currently claim loads by pasting their Carrier ID (found in their
  verification confirmation). A real login system would be a nice upgrade later, not required to launch.
- **Revoked Credentials page wiring** — the flag counts are tracked (`lifetime_flag_count`), but nothing
  yet automatically publishes to a public revoked list — that's a manual decision you'd make based on
  the flag pattern, per the Terms language we drafted.

## Files that matter most

- `supabase-schema.sql` — your database structure
- `app/api/loads/[id]/claim/route.js` — the core claim + attestation trigger logic
- `app/api/attestations/[token]/route.js` — where "neither" creates a flag and puts a load on hold
