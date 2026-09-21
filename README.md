# APPCOM Call Scorecard

An internal tool for scoring sales calls against the APPCOM framework — **A**cceptance, **P**urpose, **P**robing, **C**onsulting, **O**vercome Objections, **M**otivate to Act. Log a call, score it yourself, and let a panel of reviewers score the same call independently — the app shows each panelist's scores plus the averaged view.

Built with Next.js (App Router), Tailwind CSS, Drizzle ORM, and Postgres. No external auth provider required — accounts and sessions are handled by the app itself. The database layer uses a standard Postgres driver, so it works with any provider's connection string — these instructions use Supabase, but Neon, Vercel Postgres, Railway, etc. all work too.

## What's included

- Email + password login and registration (optionally restricted to your company's email domain)
- Log a call: rep name, account/prospect, call date, recording link, context notes
- Score a call against all six APPCOM elements (1–5 each) plus an overall 1–10 rating, with the sub-questions from the original APPCOM score card (top qualifying questions, "cost of doing nothing," buying process, etc.)
- Panel scoring: any signed-in user can add their own scorecard to a call; the call page shows every panelist's scores side by side and the averaged score per APPCOM element

## No-terminal setup (browser only)

Everything below can also be done without opening a terminal:

1. **GitHub** — create a new empty repository at [github.com/new](https://github.com/new) (don't add a README/license, so it starts empty). On the empty repo's page, click **"uploading an existing file"**, then drag in everything *inside* this unzipped folder (not the folder itself) — 44 files, well under GitHub's upload limit — and click **Commit changes**.
2. **Database** — create a free project at [supabase.com](https://supabase.com). In Project Settings → Database, copy the **Transaction pooler** connection string (port 6543) — this is the one to use for `DATABASE_URL` since serverless functions need pooled connections. Replace the `[YOUR-PASSWORD]` placeholder in it with your database password (set when you created the project).
3. **Tables** — in Supabase's dashboard, open the **SQL Editor**, paste in the contents of `drizzle/0000_legal_major_mapleleaf.sql` from this repo, then run it. That creates the `users`, `calls`, and `scorecards` tables — no `db:push` needed.
4. **Deploy** — at [vercel.com/new](https://vercel.com/new), import the GitHub repo from step 1. In Settings → Environment Variables, add `DATABASE_URL` (your Supabase connection string) and `AUTH_SECRET` (any long random string — ask Claude to generate one if needed). Deploy.
5. Open the deployed URL, register an account, and log your first call.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `DATABASE_URL` — see step 2 below.
- `AUTH_SECRET` — generate one with `openssl rand -base64 32`.
- `ALLOWED_EMAIL_DOMAIN` — optional. Set to `zocks.io` to restrict registration to your company domain, or leave blank to allow anyone to register (fine for a first test drive; tighten before sharing the link widely).

## 2. Create the database (Supabase)

Any Postgres provider works (see the note at the top), but these steps use Supabase:

1. Create a free project at [supabase.com](https://supabase.com) and set a database password when prompted (save it).
2. In Project Settings → Database, copy the **Transaction pooler** connection string (port `6543`) — pooled connections are what serverless functions need. Swap in your real password where it says `[YOUR-PASSWORD]`.
3. Paste it into `DATABASE_URL` in `.env.local`.

Once `DATABASE_URL` is set, push the schema (creates the `users`, `calls`, and `scorecards` tables):

```bash
npm run db:push
```

Run this again any time `src/db/schema.ts` changes.

## 3. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000`, register an account, and log your first call.

## 4. Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/appcom-scorecard.git
git branch -M main
git push -u origin main
```

(This repo already has an initial commit from setup — you're just adding the remote and pushing.)

## 5. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. In **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Supabase transaction-pooler connection string from step 2.
   - `AUTH_SECRET` — the same value from your `.env.local`, or generate a fresh one with `openssl rand -base64 32`.
   - `ALLOWED_EMAIL_DOMAIN` — optional, e.g. `zocks.io`.
3. Deploy. **Set the environment variables before the first deploy** — the app reads `DATABASE_URL`/`AUTH_SECRET` at startup and the build will fail without them.
4. After the first deploy, push the schema to the production database once: run `npm run db:push` locally pointed at the production `DATABASE_URL`, or paste `drizzle/0000_legal_major_mapleleaf.sql` into Supabase's SQL Editor and run it (you've likely already done this in step 3 above if you're following the same database for local and production).

Once it's live, every `git push` to `main` redeploys automatically.

## How scoring works

- Anyone with an account can log a call and anyone can add their own scorecard to any call — that's the "panel" model: each reviewer scores independently, and nothing is shared or averaged until they submit.
- A user can only have one scorecard per call; submitting again updates it in place.
- The call detail page shows the panel average per APPCOM element (out of 5) and the average overall rating (out of 10), plus every individual scorecard with its notes.

## Roles: members and coaches

Every account is either a **member** (a rep) or a **coach**. Members see only the calls they logged or scored on the dashboard — but a direct link to any call still works for anyone signed in, so a coach can share a call with specific panelists even if it's not "theirs." Coaches see every call and can add or deactivate users from **Manage users** in the nav.

Self-registration (`/register`) always creates a member account — there's no self-serve way to become a coach, by design. To make the first coach, run this once in your database's SQL editor (Supabase → SQL Editor), after that person has registered:

```sql
UPDATE users SET role = 'coach' WHERE email = 'you@example.com';
```

After that, that person can promote or add further coaches from the Manage Users page itself.

Deactivating a user (rather than deleting them) blocks their login but keeps every call they logged and every scorecard they submitted intact — there's no destructive delete in the UI on purpose, since the underlying foreign keys cascade-delete a user's calls/scorecards if the row itself is ever removed.

**Note:** deploying this role change invalidates existing sessions (the session cookie now carries a role claim older tokens don't have) — everyone, including you, will need to log in again once it's live.

## Project structure

```
src/
  app/
    login/, register/        auth pages + server actions
    calls/new/                log-a-call form
    calls/[id]/                call detail + panel scores
    calls/[id]/score/          APPCOM scoring form
    actions/logout.ts
  components/                shared UI (nav, rating input, submit button)
  db/                         Drizzle schema + client
  lib/
    auth.ts                  password hashing, session cookies (Node runtime)
    session.ts               JWT sign/verify only (Edge-safe, used by proxy.ts)
    appcom.ts                 APPCOM element definitions + scoring helpers
  proxy.ts                    route protection (Next.js "proxy"/middleware)
```

## Customizing

- **Scoring scale** — element scores are 1–5 and the overall rating is 1–10; adjust `SCORE_MIN`/`SCORE_MAX` in `src/lib/appcom.ts` and the `overallRating` validation in `src/app/calls/[id]/score/actions.ts` if you want a different scale.
- **Who can register** — set `ALLOWED_EMAIL_DOMAIN`. For tighter control (invite-only), remove the public `/register` page and create accounts by inserting rows directly, or ask and this can be added.
- **Branding** — colors and fonts live in `src/app/globals.css` (Zocks purple/green palette, Plus Jakarta Sans + JetBrains Mono already wired up).
