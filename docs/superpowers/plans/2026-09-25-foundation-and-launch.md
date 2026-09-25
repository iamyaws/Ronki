# Ronki foundation and first launch: implementation plan

> For agentic workers: executed inline by Fable (spec Part 1 is solo work). Steps use checkbox syntax for tracking.

**Goal:** Keep the backend and measurement alive, ship the cheap search repairs, and hand Marc a launch kit that brings real visitors the day after (25 to 26 Sep 2026).

**Architecture:** Changes ship on `foundation/2026-09-25` from `main` through a PR to production (Vercel builds `ronki.de` and `app.ronki.de` from `main`). Umami ships on its own branch once Marc's website ID exists. Brevo double opt-in ships as a migration plus a confirmation page once Marc's account and DNS records exist. The launch kit lives outside the public repo in `C:\Users\öööö\ronki\launch\`.

**Tech stack:** Vite + React website (`website/`), Vitest, Supabase (Postgres, pg_net, Vault), GitHub Actions, Umami Cloud, Brevo API v3.

**Spec:** `docs/strategy/2026-09-25-growth-engine-design.md`. Overnight changes from Marc ("go all out, use Astra, traffic by tomorrow") and Astra rep 1 (`C:\Users\öööö\ronki\reviews\`): launch this weekend with the existing morning printable, network first, art and renderer deferred.

## Global constraints

- No em-dashes in any copy, comment or commit message.
- No children's faces or names; no testimonials or user numbers we do not have; no fake urgency.
- Fable does not create accounts, post publicly or spend money. Marc does, guided one step at a time.
- Secrets never in chat: API keys go into `.env.local` or Supabase Vault, entered by Marc.
- Supabase MCP writes only touch rows this session created.
- After every deploy: check the live bundle changed and print the URL.

---

### Task 1: Git repair and backup (done 25 Sep)

- [x] Compare `C:\Users\öööö\ronki` against `design/bilderbuch` with a temporary index: working tree identical, only today's files untracked.
- [x] Re-register the folder as a worktree (`git worktree add --no-checkout` to scratch, move the `.git` file, `git worktree repair`, `git reset`).
- [x] `reviews/` excluded locally (`info/exclude`), branch confirmed on origin (it already was).
- [x] `main` in `louis-quest` fast-forwarded; branch `foundation/2026-09-25` created; spec moved in.

### Task 2: Daily keep-alive (done 25 Sep, ships with the PR)

**Files:** Modify `.github/workflows/supabase-keepalive.yml`

- [x] Cron `17 6 * * *`, loop over `leads_count` and `waitlist_count`, fail if either is not 200.
- [x] Both calls tested against production with curl: 200 and 200.
- [ ] After merge: `gh workflow run supabase-keepalive.yml` and confirm a green run on `main`.
- [ ] Watch Gmail for a Supabase pause warning until 16 Oct 2026; if one arrives, escalate Pro to Marc.

### Task 3: Gate dates (done 25 Sep)

**Files:** `docs/prd/RONKI-V2-PRD.md` section 12, `HANDOFF.md`, vault `HQ/admin/fristen.md`, `HQ/me/entscheidungen.md`, `HQ/projects/projekte.md`

- [x] Gate 1 on 15 Dec 2026; gate 2 counts all unpaid visitors by source (Umami).
- [x] HQ rebuilt (`python HQ/build_hq.py`), 46 HQ tests green.

### Task 4: Search repairs (done 25 Sep, ships with the PR)

**Files:** `website/index.html`, `website/src/pages/Home.tsx`, `website/src/components/RatgeberArticle.tsx`, `website/src/pages/ratgeber/MorgenTroedeln.tsx`, `website/src/pages/ratgeber/AbendroutineGrundschulkind.tsx`, test `website/tests/RatgeberArticle.test.tsx`

- [x] Test first: `updatedAt` shows "aktualisiert am" and sets `dateModified`; without it the schema mirrors the publish date. Failed before, passes after.
- [x] Home title `Ronki: Morgenroutine und Abendroutine für Kinder, ohne Streit` (61 chars), description about templates and kids 5 to 8, no em-dash.
- [x] `updatedAt="2026-09-15"` on the two articles rewritten that day.
- [x] Morning template title left as is: best click rate on the site (9.09% at position 14.6, keyword map).
- [x] Website tests: 63 pass.
- [ ] `npm run build:web` green, PR, merge, live bundle check.

### Task 5: Flow check on production (done 25 Sep)

- [x] Phone viewport: `/vorlagen/morgenroutine` renders, print works without email, no console errors, four PDFs 200.
- [x] Lead insert (201) and card `profile_upsert`/`profile_get` (200) through the same API the site uses; test rows deleted; baseline 3 cards, 0 activity rows, 0 leads.
- [x] Finding: last real card sync 18 May 2026; no card used since go-live.

### Task 6: Launch kit (tonight)

**Files:** `C:\Users\öööö\ronki\launch\2026-09-26\` (not in git)

- [ ] Tracked links per source: `?utm_source=<whatsapp|linkedin|instagram|tiktok|youtube|email>&utm_medium=<message|social>&utm_campaign=morgenroutine-start` to `/vorlagen/morgenroutine`.
- [ ] Messages: parent group, personal note, LinkedIn post, optional message for Huong's colleagues.
- [ ] Share picture 1080x1350 from the real sheet preview.
- [ ] Instagram carousel (6 slides, PNG) from the morning sheet and article.
- [ ] Shot lists for three adult-hands demonstration clips, five German hooks, captions per platform with platform-true calls to action (TikTok and Shorts links not clickable).
- [ ] Morning checklist: Umami first, then share, then accounts.
- [ ] Astra rep 2 reviews the kit before anything is published.

### Task 7: Umami (ready tonight, ships after Marc's signup)

**Files:** `website/index.html`, `website/src/lib/analytics.ts`, test `website/tests/analytics.test.ts`, `website/src/pages/Datenschutz.tsx`, `website/src/pages/FAQ_Page.tsx`, `website/src/components/AntiFeatures.tsx`

- [ ] Test first: `trackEvent` calls `window.umami.track(name, data)`, no-ops without the global, swallows errors.
- [ ] Swap the helper; keep event names and props.
- [ ] Privacy copy: Umami replaces Plausible (provider, server region from the signup, no cookies, no personal data).
- [ ] Morning: Marc signs up (EU region if offered), adds `www.ronki.de`, sends the website ID; Fable pastes the tracking script, deploys, checks a live pageview arrives.

### Task 8: Brevo double opt-in (after Marc's account and DNS)

- [ ] Marc: account, API key into `C:\Users\öööö\ronki\.env.local` as `BREVO_API_KEY`, domain authentication records at GoDaddy (DMARC on ronki.de is `p=quarantine`).
- [ ] `scripts/brevo-setup.mjs`: create list and German DOI template, print IDs.
- [ ] Migration: `leads.brevo_requested_at`, trigger on insert with `wants_updates` calling the Brevo DOI endpoint via pg_net with the key from Vault (`brevo_api_key`, entered by Marc in the SQL editor); skip when the address was already requested.
- [ ] Page `/bestaetigt` (noindex), privacy section `#vorlagen` names Brevo.
- [ ] End to end with Marc's own address, then delete the test lead and contact.

### Deferred to next week (Astra rep 1, agreed)

Character sheet and 18 motifs, video render script, `/hallo`, IndexNow.
