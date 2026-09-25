# Ronki HANDOFF

_Single source of truth: done, in flight, backlog. Update before any /compact and at session end. Created 7 July 2026._

---

## Bilderbuch in the app (25 September 2026)

**LIVE since 25 Sep 2026, 19:49 UTC** (Marc: "push to main"). PR #14 merged as `770092c` (website and app together). Checked after the Vercel production deploys: app.ronki.de bundle `index-XpNMOyqB.js` to `index-Cr2hEU5F.js` (name chips, old-save split, feelings entry, 1 s guard, task pictures inside; theme #0544B0; hatch clips, name recordings and icons served); ronki.de (redirects to www.ronki.de) bundle `index-BVdpiTzB.js` to `index-BzYYt3Jw.js` (Bilderbuch markers inside, hero art served). No Supabase change was needed. First thing after go-live: open the parent area on Louis's tablet and answer the child-name note if it shows.

Marc's ask: make the new Bilderbuch design live in the real PWA, benchmarked against Jason Lee's "Watch Me Vibe Code an Animated App with Claude Fable 5.1 + Seedance 2.5" (YouTube, 18 Sep 2026); plan fully and build while he is away. Mid-run steers: subagents on Fable or Opus at high effort, Higgsfield as in the video, fresh research, Astra as reviewer and code reviewer, all work tracked in the shared GitHub repo.

**Where the work lives.** Branch `design/bilderbuch-app` on `iamyaws/Ronki` (pushed after every step), built on `design/bilderbuch` (the website redesign, also pushed now). Working copy: `C:\Users\öööö\ronki-bilderbuch-app` (a standalone clone, see the repair note below). Nothing is merged to `main`; production (app.ronki.de, ronki.de) is unchanged. Vercel builds previews for both projects on every push.

**Docs of the run.** Plan and benchmark table: `docs/plans/2026-09-25-bilderbuch-app-rollout.md`. Lane rules: `docs/plans/2026-09-25-lane-brief.md`. Research: `docs/research/2026-09-25-animated-companion-benchmark.md`. Surface map: `docs/specs/2026-09-25-bilderbuch-app-surface-map.md`. Every generation with prompt and cost: `docs/design-briefs/2026-09-25-higgsfield-log.md`. Reviews: `docs/reviews/2026-09-25-bilderbuch-app/`.

**Done.**
- Art, the video's way: character sheet first (turnaround, expressions, master cut-out), then 6 moods, 3 growth stages, 5 poses, 4 eggs plus cracked and peeking, 7 scenes, app icon; then Seedance 2.5 loops: the empty room (plants, boat, sun move), the night room (Ronki sleeping), Ronki idle, happy jump and cloud breathing as transparent animated WebP (keyed from green locally, cropped like the stills), and one hatch clip per egg; plus 12 task pictures from one sheet. 41 images and 9 clips, every image on model at the first try; 425 of 675 Higgsfield credits (cap was 450).
- Foundation: tokens remapped to Bilderbuch under the old names, self-hosted Fredoka, Gochi Hand, Be Vietnam Pro, Plus Jakarta Sans; primitives in `src/components/bilderbuch/` (PillButton, QuietLink, SpeechBubble, ChoiceTile, TopBar, PaperCard, DoodleIcon, MotionTicks, StickerBurst, SceneLoop, useReducedMotion); `MoodChibi` draws the art (24 callers unchanged); tab bar, banners, PIN pad, toast, celebration, install sheet; new icons.
- Screens: onboarding and hatch (pick an egg, it trembles, the matching clip cracks it, Ronki peeks out and wears that shell), first breath on sky, home (room loop with Ronki seated in his nest, mood tiles, one pill), the day strip (paper cards with doodles, a 1.4 s cheer with sticker burst instead of Lottie confetti), rewards, sitting with Ronki, the evening (night loop, one story line, quiet links), profile with the growth tree, diary and book as paper, expedition and away loop in the Morgenwald.
- Reviews (all in `docs/reviews/2026-09-25-bilderbuch-app/`, own read written before each Astra reply): code review round 1 (NOT YET, 3 findings: per-instance art fallback, hatchling keeps moods, no six-colour promise; fixed); design review round 1 (NOT YET, 9 findings: no worried Ronki after days away, a picture per task, stages keep their look, bounded cheer, one feeling map, loops rest when covered or idle, day strip opens on now; fixed; home order, the celebration countdown and the sound default disputed); round 2 on the disputed points only (sound default conceded by Astra; two flaws in my fixes found and fixed: the cheer bob looped, the room video did not rest off screen or when idle; home order and countdown go to Marc with options in `response-design-r2.md`).
- Guard: `npm run check:names` (tsc with checkJs, undefined names only). It caught nothing new but would have caught the RoomHub crash I shipped for 20 minutes today and the 22 Apr day-transition bug.
- Checks at the end of the run: app tests green (222), `check:names` clean, build green, the pre-existing 23 tsc errors unchanged. Vercel preview of both projects builds on every push; the app preview was checked to serve the new bundle (theme colour, self-hosted fonts, art paths, a hatch clip).

**Decisions made in the run (Marc may reverse any of them).**
1. Ronki is always red-orange. The egg a kid picks shows in the egg, the hatch clip and the hatchling's shell hat; the old `companionVariant` ids stay in state (cream forest, ember sunset, sun amber, cobalt teal), so nothing needs a migration.
2. Ronki sits on the room video as a transparent cut-out, so he still shows moods; the room itself loops.
3. Code-drawn sticker burst instead of a LottieFiles download (no new dependency, on style).
4. A worried Ronki after days away shows as calm on the profile (no guilt for skipping).
5. "Einrichten" is hidden until the painted room can show a wallpaper pick (`SHOW_ROOM_STYLE` in RoomHub).
7. The read-aloud button on the day strip is gone (it called the narrator, muted since 27 Apr); comes back with a Ronki voice line.
8. Voice stays on by default (your April decision); Astra challenged it (R6), I kept it.
6. The run ends at a preview, not a merge (the Bilderbuch brief asks for a green light before production).

**Open for Marc.**
1. Walk through the Vercel preview of `ronki-app` on the phone (a Loom with voice, as in the video, is the fastest feedback), then merge draft PR #14 (https://github.com/iamyaws/Ronki/pull/14, `design/bilderbuch-app` into `main`; website and app go live together). Final preview checked on 25 Sep (late, after the name chips): bundle `index-DBqC8LPd.js` with the chips, the name split and "Stimmt so", voice files served; before that `index-DA1vumjn.js` with the feelings entry and the 1 s guard; earlier check `index-CaYaezYE.js`: theme #0544B0, task pictures and per-egg hatch clips served.
2. Repair the old working folder `C:\Users\öööö\ronki`: on 25 Sep a `git worktree prune` removed its link to the main repo (it was registered under its old name `louis-quest-drachennest`). Files and commits are safe (all branches live in `C:\Users\öööö\louis-quest\.git`). Simplest fix: keep using `C:\Users\öööö\ronki-bilderbuch-app` (full clone with the same history and the GitHub remote), or recreate the link from `C:\Users\öööö\louis-quest` with `git worktree add` on a new folder. The auto-mode guard blocked the repair in this session.
3. ~~Name chips~~ Done (25 Sep, late, Marc's go): six voiced nickname chips for Ronki (Ronki, Funki, Flämmchen, Glut, Pieks, Knisti; Harry's voice, `scripts/gen-name-chip-voices.py`), typing behind "selbst schreiben". The pick is Ronki's `companionName`. Found and fixed on the way: since April the hatch name overwrote the child's own name (`completeOnboarding` copied `heroName` into `familyConfig.childName`); old saves get a one-time split and a check note in the parent area "Kind" section. **After the merge: open the parent area on Louis's tablet; if the note shows, put Louis's name back in and save.** Record: `docs/reviews/2026-09-25-bilderbuch-app/response-r4.md`.
4. ~~Two calls from the Astra review~~ Done on Marc's go (25 Sep, late): a small "Wie geht's dir?" pill beside "Hallo {Name}!" leads to the feelings picker (it first sat on the room and covered Ronki on short phones, found by the review workflow); celebration and game-end buttons guard for about 1 s with no numbers or ring. Reviewed by Astra and a 3-lens Claude workflow with adversarial checks; record in `docs/reviews/2026-09-25-bilderbuch-app/response-r3.md`. Watch in Louis's test whether 1 s is enough.

**Follow-ups.** Parent dashboard and legal pages still carry hard-coded teal accents (readable, not restyled). Freunde, micropedia creatures, mini-games, bosses and birthday scenes keep their old painterly art. The first-breath fire puff is still a gradient. `CaveStyleSheet` keeps the old look. Belohnungsbank copy still names Funkelzeit (pre-existing). Material Symbols still loads from Google for screens outside the core loop. The Profile's Pflege and Erinnerungen segments and the Buch are restyled but not reachable from any tab (pre-existing). Animated WebP on an old iPad and a Fire HD is untested on a real device.

## Where things stand (25 September 2026, overnight)

Growth engine approved by Marc: spec [docs/strategy/2026-09-25-growth-engine-design.md](docs/strategy/2026-09-25-growth-engine-design.md) (read its last section, "Changes the same night"), plan [docs/superpowers/plans/2026-09-25-foundation-and-launch.md](docs/superpowers/plans/2026-09-25-foundation-and-launch.md), keyword map [docs/strategy/2026-09-25-keyword-map.md](docs/strategy/2026-09-25-keyword-map.md). Astra reviews (not in git): `C:\Users\öööö\ronki\reviews\`. Launch kit (not in git): `C:\Users\öööö\ronki\launch\2026-09-26\KIT.md`.

**Found and fixed on 25 Sep:**
- Supabase paused again on 23 Sep although the weekly keep-alive answered 200 on 21 Sep. Restored by Fable via the Supabase MCP the same day (ACTIVE_HEALTHY). Keep-alive is now daily with two RPCs (PR 15). If a pause warning arrives within three weeks, move to Pro (Marc's rule).
- Plausible trial dead (stats deleted around 23 Oct). Umami replaces it (PR 17, draft, waits for Marc's website id).
- `C:\Users\öööö\ronki` was a broken worktree (its admin entry in `louis-quest/.git/worktrees` was gone). Re-registered; working tree matched `design/bilderbuch` exactly. `design/bilderbuch` was already on GitHub.
- Flow check on production (phone viewport and API): template page, print, PDFs, lead insert, card create and load all work. Test rows deleted.
- Baseline: 3 cards (last real sync 18 May 2026), 0 activity rows, 0 leads, 4 waitlist addresses (April). Nobody used Ronki since the backend died in May.

**Design note:** the Bilderbuch site went live at 19:49 UTC through PR 14 (section above), while this work was under way. All branches below were brought up to date with that `main`; share pictures and the launch kit use the Bilderbuch look. PR 18 (design/bilderbuch alone) became redundant and shows as merged.

**PRs (Marc, 26 Sep: "merge into main for the work that you feel is all green and ready to move"; Fable merges what is green and reviewed, drafts wait):**
- PR 15 `foundation/2026-09-25`: **MERGED 25 Sep, 20:04 UTC.** Daily keep-alive, gate 1 on 15 Dec, home title, article update dates, spec, plan, keyword map. Astra code review: no findings. Live check: bundle `index-BzYYt3Jw.js` to `index-BnlLcAq_.js`, new home title served, manual keep-alive run on main green (two RPCs).
- PR 19 `content/zeitumstellung`: **MERGED 25 Sep.** New Ratgeber article /ratgeber/zeitumstellung-kinder for the clock change on 25 Oct 2026 (keyword map move 3), five opened sources, two re-checked by Fable. Astra rep 3 found four points (step cadence against the autumn source, one overstated study claim, an unsourced meal rule, spring advice cited as autumn); all fixed; Astra code review no findings. Live: HTTP 200, crawler title, in the sitemap. Marc: request indexing in Search Console.
- PR 16 `launch/share-previews`: **MERGED 25 Sep.** Share pictures of the real sheets on the four template pages, short links `/morgen`, `/li`, `/ig`, `/tt`, `/yt` in the root `vercel.json` with a host rule (both Vercel projects read the root file; project root is `.`). Astra code review no findings. Live: all five links answer 307 to the morning template with their UTM tags (`/li` needed a few seconds on one edge), `ronki.de/morgen` goes via www, `app.ronki.de/morgen` is untouched, `og:image` on /vorlagen/morgenroutine is the new share picture.
- PR 17 `analytics/umami` (draft, now on main): Umami helper, script tag with placeholder id, privacy copy, "Vorlage Drucken" event. `website/tests/umami-snippet.test.ts` fails until the real id is in.
- PR 20 `mail/brevo-doi` (draft, stacked on 17): Brevo double opt-in. Migration `20260926000100_leads_brevo_doi.sql` NOT applied (trigger via pg_net, key and ids from Vault, inert until set), `scripts/brevo-setup.mjs`, `/bestaetigt` page, privacy copy naming Brevo. Waits for Marc's account, DKIM at GoDaddy, key in `.env.local`. Must not merge before Brevo is live (the privacy text names it).

**Launch kit (Bilderbuch look, reviewed):** `C:\Users\öööö\ronki\launch\2026-09-26\KIT.md` with carousel, story, share picture and the app icon as profile picture; art copied from `public/art/bilderbuch/`; renderer `launch/tools/carousel.mjs`. Astra reps 1 to 3 closed.

**Follow-ups found tonight:** the live template page promises a timetable ("Nach ein paar Wochen macht dein Kind die Schritte..."; Astra R2-01, site copy, Marc's call); the no-email print route could sit above the email form (R2-02); the printable sheets still use emoji-style icons while the app and the kit use the new task pictures (regenerate `website/public/vorlagen/*` with `scripts/print-vorlagen.mjs` once the sheets use the art).

**Next steps, in order:** Umami signup, id into PR 17, merge, check a live pageview; Search Console: request indexing for /ratgeber/zeitumstellung-kinder; messages from the kit (Sunday evening); Instagram, TikTok, YouTube accounts and first posts; LinkedIn Monday; Brevo double opt-in during the week (plan Task 8). Week of 28 Sep: Abendroutine refresh (keyword map #1), clock-change page before 25 Oct, character sheet, render script.

**Gates:** gate 1 (pull) 15 Dec 2026, gate 2 (reach) 15 Mar 2027 counting all unpaid visitors by source. Umami Hobby keeps six months of data: note the monthly numbers in this file.

Local build note: `louis-quest` needed `npm ci` (qrcode was missing from node_modules); Vercel builds from a clean install and was never affected.

## Where things stand (14 September 2026)

Revival check done, nothing built. Full write-up (German): [docs/strategy/2026-09-14-wiederbelebungs-check.md](docs/strategy/2026-09-14-wiederbelebungs-check.md). Raw Search Console export: `docs/analytics/gsc-2026-09-14/`.

- **Traffic:** Search Console, 13 Jun to 12 Sep 2026: 15 clicks, 1,403 impressions. /ratgeber/morgenroutine-grundschulkind ranks position 6.5 and takes 5 of the clicks. Impressions doubled after 8 Sep (Schulstart). More than half of all impressions are foreign typo searches landing on /en.
- **Backend was gone, now back:** Supabase project `jdpxfvqaoxmnyvlxikce` was paused around 25 May (inactivity) and got the "permanently frozen in 5 days" mail on 18 Aug. On the evening of 14 Sep the host did not resolve; Marc restored the project the same night and it answers again on 15 Sep (waitlist_count returns 4, profiles has 3 rows, all tables except `leads` and the never-created `game_state` exist). Between late May and 14 Sep, profile cards, QR login, cloud sync, waitlist and feedback forms were dead on the live site.

## Decision gates (set 15 September 2026)

Full text with the queries: PRD section 12 ([docs/prd/RONKI-V2-PRD.md](docs/prd/RONKI-V2-PRD.md)). Short form:

- **Gate 1, pull, check on 15 Dec 2026 (moved from 14 Nov on 25 Sep 2026):** at least one family we do not know created a card since go-live and used it on three or more distinct days (`profiles` joined with `profile_activity`, subtract our own cards). Umami cross-check: "Karte erstellt", "CTA Klick" by `cta`.
- **Gate 2, reach, check on 15 Mar 2027:** at least 500 unpaid visitors per month on ronki.de (Umami, search plus social, no ads, by source; average Jan and Feb 2027) and at least 100 distinct addresses across leads and waitlist (`select public.leads_count();`).
- Outcomes: both pass, start v2 Phase 1. Pull only, keep the app alive and work on reach. Reach only, keep the site as content asset, freeze the app, no v2. Neither, Ronki stays a family project. Ticklers for both dates sit in the HQ Fristen register.

## LIVE since 16 Sep 2026

The revival build is in production. Order kept: Marc ran `supabase/apply-2026-09-15.sql` in the SQL editor, the smoke script passed (read and write round trip, anon access to `profiles` now 401), then PR 12 was merged (merge commit b3525dc, 16 Sep 2026, 19:52 UTC).

| Check after deploy | Result |
|---|---|
| Website bundle | changed (index-CBsCUO8p.js to index-4GscKx0K.js), card CTA inside |
| App bundle | changed (index-DAc7hKam.js to index-Bc-y_Wtz.js), day transition bug gone, profile RPCs inside |
| Live card creation on ronki.de/profil-erstellen | card written via RPC, activity day recorded |
| Same card opened in app.ronki.de | parent setup skipped, child name kept, egg choice shown |
| Live template download with consent | lead stored with consent true |
| Keep-alive workflow, manual run on main | success |

The live test card and test lead were deleted right after, so the gate counters start clean: 3 cards and 4 addresses from before the revival.

Still open for Marc:
1. **Plausible**: create goals "CTA Klick", "Karte erstellt", "Vorlage Download" (custom events). 2 minutes. Until then the events arrive but no goal reports them.
2. **Mail provider** for the update box (EU, double opt-in) before promoting the templates.
3. Decide later: keep the weekly ping (default) or move to Supabase Pro.

Note: `main` is checked out in the worktree `C:\Users\öööö\louis-quest`, so this repo works on branches. Follow-ups start on `revival-followups` (from b3525dc).

## Done (overnight build, 15 Sep 2026)

Commit `54ec438`. Five Opus 5 build agents plus one review lane, orchestrated by Fable 5.1; about 1.0M subagent tokens against the 900k cap pitched in the plan (the backend and funnel agents ran heavier than estimated). Verified end to end against the local PostgREST mock (`npm run mock:supabase`): card created on the website via `profile_upsert`, loaded in the app via `profile_get`, template downloaded after consent with a `leads` insert, Plausible events fired. Tests: app 201 pass (the two old IndexedDB failures fixed in the review round), website 53 pass, both builds green. Review round (one Opus 5 lane, 7 blocking and 14 minor findings) applied in commit 2: consent split into a mandatory storage box and an optional updates box (`leads.wants_updates`), baseline migration for the objects that only existed live, keep-alive pings `leads_count()`, privacy section with Art. 7 Abs. 3 notice and a 24-month cap, article copy and descriptions fixed, gate query filters on `created_at`, print path tracked as `weg: druck`.

- **Lead magnet**: three A4 PDFs in `website/public/vorlagen/` (morgenroutine, abendroutine, kleine-geschwister), generated by `scripts/print-vorlagen.mjs` from the print routes `/print/vorlage-*` with headless Edge. `VorlageDownload` gate (email, one mandatory storage consent, one optional updates box, honest no-email print fallback) on all three Vorlage pages, `lib/leads.ts` writes to `leads`, duplicate means "already known", event "Vorlage Download". Privacy policy section `#vorlagen`, policy date 15 Sep 2026.
- **Funnel**: hero CTA trio (Karte erstellen, Vorlage holen, App öffnen) with "CTA Klick" events; the shared closing CTA (footer, article ends, Installieren) now sends parents to `/profil-erstellen` first; `/profil-erstellen` in the sitemap; "Karte erstellt" event after a successful upsert; hash scrolling for lazy routes.
- **Backend**: migrations `20260915000050_baseline_live_objects.sql` (waitlist RPCs, site_feedback, feedback, app_evals, view, captured from the live schema), `20260915000100_leads.sql` and `20260915000200_profiles_rpc.sql`, apply file for the SQL editor, `scripts/supabase-smoke.mjs`, `scripts/supabase-apply.mjs` (needs `pg`, not installed), weekly keep-alive workflow, app and website switched to `profile_get` / `profile_upsert`, offline stub gained `rpc`.
- **Content**: Abendroutine article rewritten around "Abendroutine für Kinder", Trödeln article strengthened around "Kind trödelt morgens", both with Quellen blocks (unverifiable claims removed), related-link titles updated everywhere.
- **Hygiene**: GH Pages workflows manual only, Vercel ignores `gh-pages` and `dev` branches, app meta description and manifest name refreshed, em-dashes removed from touched comments.
- **Docs**: PRD section 12 (decision gates), HQ ticklers and decision log, this file.

## Decisions made overnight (15 Sep 2026)

- **profiles access only via RPCs.** The live `profiles` table is listable with the anon key (three rows, kids' names inside). The migration drops all policies and routes access through security definer functions. One-way door: the old permissive policies were never in the repo, so they cannot be restored by script. The app keeps working because both clients now call the RPCs.
- **Activity is measured per card and day** in `profile_activity` (written by `profile_upsert`), no personal data. This is what Gate 1 reads.
- **Lead magnet is a convenience, not a toll.** The template pages stay printable without an email; the gate says so in plain words. No double opt-in yet because no mail provider exists; the policy states that no update mails go out until one does.
- **Card first, app second** on every CTA, because the app is a kid space that only scans.
- **A5 (ADHS article and template) was cut** per the plan's budget rule, then added on Marc's go the same morning (commit 4): article `/ratgeber/morgenroutine-adhs`, template `/vorlagen/adhs` with `adhs.pdf` (clip lane, no clock), five verified sources, 220k tokens.
- **No merge, no SQL applied to the live project overnight**, because the new bundle needs the RPCs and the old bundle needs the old policies; the two must switch together, so Marc does SQL then merge in the morning.
- **Not verified**: the mobile hero animation in the test browser (paused-tab artifact, markup and desktop render are fine); one real phone check is still worth a minute. The card seed problem this sentence used to describe is fixed, see the app fixes section below.

## App fixes found in browser testing (15 Sep 2026)

Marc asked for real checks in the app. The Vercel share links for the previews started redirecting to the Vercel login (429), so the checks ran on the production builds locally: `npm run mock:supabase`, website and app built against the mock and served with `vite preview`, a second browser origin (`http://[::1]:4175`) standing in for a fresh kid tablet.

- **Live bug, every returning family on a new day loses its state.** `applyDayTransition` in `src/context/TaskContext.tsx` read `prev.minigameStaminaMax`, but the function only has `s`. The rehydration throws, the app boots a fresh state and the save effect writes that empty state to the cloud. Introduced 22 Apr 2026 (cb04148), present in the live bundle on app.ronki.de today (`ronkiStamina:prev.minigameStaminaMax??10`). Reproduced with an onboarded profile dated yesterday: 7 tasks and 12 HP became 0 and the name disappeared. Fixed: `s.minigameStaminaMax`. `tsc` now reports no undefined names in the app; Vite never type-checks, which is why it slipped through. **Merging PR 12 ships this fix; until then app.ronki.de keeps resetting returning kids.**
- **Website card seed was overwritten on the first scan.** Two causes, both pre-existing: (1) the app boots once before the scan and saves a pristine local state dated today, which `syncLoadByToken` preferred over the seed; (2) the seed has no `quests`, so the rehydration treated it as a fresh start. Fixed: a never-onboarded local state no longer overwrites a cloud state that is further along (`src/utils/storage.ts`), and a seed without quests gets today's quests before rehydration. Verified: a card made on the website skips the parent setup on a fresh device, keeps the child's name and lands on the egg choice.
- **Also checked in the browser:** hero CTA trio, both rewritten articles and the ADHS article render, the Vorlagen page shows four cards, the ADHS template form stores a lead with both consent texts and `wants_updates = true`, card creation writes through `profile_upsert`, the app loads it through `profile_get`, activity days are recorded, crawler titles are prerendered for all new and rewritten pages.
- Tests: app 203 pass (two new tests pin the seed rule), website 56 pass, `tsc` clean of undefined names.

## Website follow-ups (16 Sep 2026, branch revival-followups)

Merged as PR 13 (merge commit 3aebd52) and live on 16 Sep 2026; both production bundles verified changed. Built after go-live, verified in the browser on local production builds against the Supabase mock.

- **Template link where the traffic is.** The Morgenroutine article (our only page-1 result) now links the morning template twice and the ADHS template once.
- **Template pages as search pages.** `/vorlagen/morgenroutine`, `/vorlagen/abendroutine`, `/vorlagen/kleine-geschwister` carry the search phrase as the single H1, about 330 to 390 words of how-to text, a four-question FAQ with FAQPage JSON-LD and a picture of the real PDF (`website/public/vorlagen/previews/`). `/vorlagen/adhs` got the picture, the FAQ and a single H1. Shared component `VorlageGuide.tsx`; `RoutinePrintSheet` gained optional page title and intro props (sheet title becomes H2 when set). Prerendered crawler titles updated.
- **Hero visible without animation.** Headline, text and buttons start at full opacity and only move; checked in a background tab where animations do not run: headline opacity 1 at load.
- **Sibling fix.** The local game cache now records which card it belongs to (`ronki_local_owner`). A cache from another card is ignored instead of being pushed into the scanned card; a cache without an owner counts as the current card, so existing devices keep working. The app claims the cache when it assigns a token itself (setup done, token reset in the parent dashboard, tagging an existing profile). Browser test on one device: Louis, then Liam, then a fresh website card for Mia; each opened as the right child and every cloud row kept its own progress. The parent dashboard token reset path is covered by code, not clicked through (PIN).
- Tests: app 206, website 61, all green.

Note for local builds: `dist/` and `website/dist/` were last built against the mock (`127.0.0.1:54321`). They are not deployed (Vercel builds from source), but rebuild without the mock env before any manual deploy.

## Design proposal: Bilderbuch (16 Sep 2026)

Marc generated a new Ronki look with ChatGPT image generation (cobalt, red-orange, sun yellow on paper, crayon texture, hand-lettered headlines). Extracted as a design system with compatibility notes and a rollout path: [docs/design-briefs/2026-09-16-bilderbuch-design-system.md](docs/design-briefs/2026-09-16-bilderbuch-design-system.md). Website side-by-side (live vs. draft, desktop and phone, with switches for ground, cards and headline font) built 16 Sep: `docs/design-incoming/bilderbuch/2026-09-16-website-vergleich.html`, published as a private artifact for Marc. Colour tokens in the brief are measured from the original board files.

**Decisions (Marc, 16 Sep 2026):** white page ground, not paper; the start page hero as a full cobalt block; the one action card per page (template signup) inverted cobalt; Fredoka Bold for headlines (Bagel Fat One was too heavy to read); the same look in app and website. Image batch list for the art swap, to be generated on Sunday 20 Sep once image tokens are back: [docs/design-briefs/2026-09-16-bilderbuch-image-list.md](docs/design-briefs/2026-09-16-bilderbuch-image-list.md) (character sheet first, 18 website motifs, 20 app motifs).

**Built, not pushed:** website token remap committed on the local branch `design/bilderbuch` (commit 862f9eb on top of the docs commits 9ac7978 to 76942fc, base b3525dc). One Opus 5 agent (377k tokens) plus a browser pass by Fable: Fredoka and Gochi Hand self-hosted in `website/public/fonts/`, tokens remapped in `globals.css` (cream to white, teal and sage to cobalt, mustard to sun, new cobalt/sky/sky-wash/ember/sun/night/paper tokens; 444 hex values and 426 `text-teal-dark` utilities swept), `PainterlyShell` white with one faint crayon blob, hero as cobalt block with sun underline and SVG star sticker (`primitives/BilderbuchDefs.tsx`), `VorlageDownload` inverted cobalt with consent strings untouched, print sheets and `VorlagePrint` with cobalt rings and ink outlines, four PDFs and previews regenerated, article head with sky-wash chip and hand caption (`heroCaption` prop). Checked in headless Edge at 1280 and 390 on `/`, `/vorlagen`, `/vorlagen/morgenroutine`, `/ratgeber`, the Morgenroutine article and `/profil-erstellen`; fixed afterwards: footer wordmark (cobalt at 25 percent), hub PDF links (cobalt, not sun on white), "Kurz erklärt" callout (ink outline). Tests 61 green, build green. Marc agreed the board crops may be public. Next: push, PR, Vercel preview, then merge tonight or on Sunday with the new art (Marc's call). Not touched: private print posters and flyers (`PrintA4Poster*`, `PrintA6Flyer*`, `PosterShell`) keep old accents; em-dashes in the pre-existing `index.html` title and `ProfilErstellen` copy; A4 sheet step labels squeeze at 390 px (pre-existing `hyphens: auto`).

**Polish pass (17 Sep 2026, commit 79cda4f, not pushed).** Marc shared a GPT mock of a full redesign; taken from it: layout ideas only. Built by one Opus 5 agent (320k tokens) plus a Fable check: `SiteHeader` with the new `RonkiWordmark` (Fredoka text in SVG, three ember ticks) and one "Karte erstellen" pill (`cta: 'header'`), a `HandNote` per start page section, `ClosingBand` in night blue with torn crayon edge and sun stars (rendered by `Footer` unless `closing={false}`, which the article page, `/installieren` and `/profil-erstellen` pass; it has an `art` slot for a Ronki cut-out later), `AntiFeatures` in two groups with the new "Was Ronki nicht kann" list, `Sparkles` at four section corners, hero at content height without the scroll hint. Start page height 12,535 to 11,118 px at 1280 (the 8,000 to 9,000 target needs a layout change, e.g. the three storyboard beats side by side; Marc's call). Tests 61 green, build green, no horizontal overflow at 390 or 1280. Deliberately not taken from the mock: testimonials and user-count claims (nobody outside the family uses Ronki yet), the generic "Herzensprojekt" illustration in place of the real photo, cream ground and green accent, a single "Jetzt kostenlos starten" CTA, invented friends, text baked into images. Waiting for full-size art: hero as one wide cut-out scene (1.1), three routine scenes above the list mocks (1.12), Ronki beside the phone mock, Ronki in the closing band. Open: `/vorlagen/*` template pages have no header, band or footer (they never used `PainterlyShell`); band copy "Fangt klein an. Eine Karte reicht." is new and wants Marc's eye.

**Start page rebuilt (17 Sep 2026, commits 95f7032 and 92fcd89, not pushed).** Marc's verdict on the polish pass: hero, template page and article are right, the rest of the start page "feels lost", a recolour with stickers on top. So every section below the hero was rebuilt from the same kit (one Opus 5 agent, 329k tokens, plus a Fable check at 1280 and 390): ink outlines instead of shadows, one ground per section (white, paper, sky-wash, white, paper, white, night) with torn edges (`primitives/PaperEdge.tsx`, filter `bb-tear`, displacement only), sticker labels (`StickerLabel.tsx`) instead of uppercase eyebrows, text in ink. Vorher/Nachher as two tilted cards without the stress bars; Macher on paper with the framed photo and a sky-wash quote card; Ein Tag as three printed sheets side by side; Ronkis Welt and the approach merged (round sticker friends, crayon bar chart "So wird Ronki leiser"); honest list as two ink cards plus a sun sticky note; Ratgeber cards with tilted frames; the install steps moved into the night band (`ClosingBand install`, data in `lib/install-steps.ts`; `PWAInstall.tsx` and `IntrinsicMotivation.tsx` deleted); FAQ as ink cards. Hand notes and headlines no longer hyphenate. Hero art is an interim crop of the cushion scene from board 1 (`public/art/bilderbuch/hero-zuhause.webp`, 358 px source, speech bubble baked in) until the full-size file exists. Start page 11,118 to 8,908 px at 1280, 18,053 to 16,725 at 390. Tests 61 green, build green. Known weak spots: old painterly art in the Ratgeber cards and friend stickers, empty right third beside the Welt headline at 1280, long Macher prose column.

**Bausteine library and styleguide (17 Sep 2026, not pushed).** Marc's read of the rebuilt start page: a lot of good, "Ein Tag" is beautiful, but too many sections use the same white ink-outlined card, and even the science link looks like a card. Answer: a real block library. One Opus 5 agent (301k tokens) plus a Fable check. `website/src/components/bausteine/` with one import surface (`index.ts`): 1 NotebookPage (+ChecklistItem), 2 TornNote, 3 StickyNote, 4 PrintedSheet (+SheetRow, extracted from "Ein Tag" with no visual change), 5 SpeechBubble, 6 Polaroid, 7 PictureFrame, 8 IndexCard, 9 Ticket, 10 Chalkboard, 11 Ribbon, 12 MarkerHighlight and MarkerUnderline, 13 Stamp, 14 CrayonBarChart (extracted from Ronkis Welt), 15 Doodle (16 shapes), 16 DrawnLink and PillButton, 17 Spread; old primitives re-exported. Hidden page `/styleguide` (noindex, not in nav, footer, sitemap or prerender list) shows tokens, fonts, buttons, every block numbered with "Wofür" and "Nicht für", five rules with right and wrong pairs (no two equal blocks side by side, links never look like boxes, one sticky note per page, sun and ember never as text on white, hand notes only where there is room) and two demo compositions. The reading progress line now only renders on articles (`PainterlyShell readingProgress`); it was the "blue lines" in the stitched boards. Tests 61 green, build green. Next: Marc marks blocks by number, then a second pass applies them to the start page (honest list as notebook page plus torn note plus drawn link, makers photo as polaroid, FAQ answers as speech bubbles, install steps as tickets, Ratgeber teasers as index cards), about 250k tokens. Redesign total so far about 1.33M subagent tokens; Marc gave a fresh go on 17 Sep for the two library passes.

**Bausteine applied to the start page (17 Sep 2026, not pushed).** Marc approved all 17 blocks ("looks all great to me"). One Opus 5 agent (311k tokens) plus a Fable check at 1280 and 390. Vorher is a pinned `TornNote` with the ember tangle next to the cobalt card; the makers photo is a taped `Polaroid`, the quote a sky-wash `SpeechBubble`, prose capped at about 62 characters; Ein Tag untouched; Ronkis Welt got a `Ribbon`, a sun `SpeechBubble` from Ronki beside the headline (new line: "Ich bin nicht allein. Du auch nicht.", shown from 1280 px up) and a `DrawnLink`; the honest list is a `NotebookPage` (text on the ruling) next to a taped `TornNote`, the one `StickyNote` of the page, science link as `DrawnLink`; Ratgeber teasers are `IndexCard`s; FAQ answers open as `SpeechBubble`s (mechanics and JSON-LD untouched); install steps in the night band are `Ticket`s. `SpeechBubble` gained `sky-wash`, `tail="none"`, `tailEdge`, `tailAtMd`; `ChecklistItem` gained `as`. Hero stamp skipped (the eyebrow already says it). Start page 9,106 px at 1280 and 16,416 at 390. Tests 61 green, build green, no overflow at 390. Still weak: old painterly art in the index card thumbnails and friend stickers, the Ronki bubble missing between 1024 and 1279 px. Redesign total about 1.64M subagent tokens.

**Button rule (17 Sep 2026, Marc's feedback: the white hero pill "doesn't want me to click it").** One primary action per view, and it is the loudest thing on its ground: sun pill with ink text on cobalt and night, cobalt pill with white text on light grounds. Both use `.bb-press` (hard edge under the pill, lifts on hover, sinks on tap, flat when disabled, no motion under reduced motion). Secondary is a thinner white outline on dark or an ink outline on light; everything else is a `DrawnLink`. Labels stay on one line. Applied to the hero, `PillButton` (`on-dark` is now sun), `WaitlistCTA`, `VorlageDownload` (disabled state is a flat white tint, not faded yellow) and the Ratgeber feature block. The star sticker text is Fredoka Bold on four short lines, sized by line count. The rule "sun button only on night" is replaced by this one. Follow-up the same day (Marc: "we cannot have blue on blue button"): no outlined or cobalt pill on any blue ground. The hero secondary is now a white `DrawnLink` "Oder erst die Vorlage holen" (copy changed from "Vorlage holen"; `DrawnLink` gained `to` for router links), the three trust chips are a plain list with sun ticks and no outline, and on sky-wash the pill is sun (`PillButton tone="sun"`), as in "Ein Tag".

Backlog from the design work: sticker lettering as SVG so it stays centred; tracked links on the print posters; the ADHS preview vs PDF unification (follow-up 1 below).

## Follow-ups (ordered)

1. Screen preview and PDF of the ADHS template differ slightly (the PDF carries the clip lane and time bar); rendering `VorlagePrint` inside the preview frame would unify them.
2. Double opt-in and update mails once a mail provider is chosen.
3. `updatedAt` support in `RatgeberArticle` (visible "aktualisiert am" plus `dateModified` in the schema) for the two rewritten articles.
4. ~~Token switch on one device~~ fixed on 16 Sep 2026, see Website follow-ups.
5. `telemetry_events` only allows inserts for authenticated users while the app inserts with the anon key, so app telemetry is silently dropped (pre-existing). Decide whether anon inserts are wanted, then add the policy as a migration.
- **Deploys:** website and app production both sit on commit `2fa8ab5` (3 May). The July docs commits live only on `experiment/drachennest`. v2 execution never started.
- **Proposal (awaiting Marc):** 1) rebuild backend and redeploy (one evening), 2) instrument the funnel and add a home CTA to /profil-erstellen (one evening), 3) optional SEO push on the clusters Google already ranks, 4) decide against preset gates. Superseded the same night by the two gates below (60 days and 14 Nov 2026 for pull, 15 Mar 2027 for reach).

## Where things stand (7 July 2026)

The repo folder is `C:\Users\öööö\ronki` (renamed from `louis-quest-drachennest` today; git history intact, all path references in code/scripts/docs updated). Working branch `experiment/drachennest`; it has been fast-forward-pushed to `main` several times. Docs are sorted, index at [docs/README.md](docs/README.md).

**Product state:** v1 PWA is live (app.ronki.de via GH Pages, marketing site separate). QR-card auth shipped in May (website creates the profile card at ronki.de/profil-erstellen, kid scans it in the app). Louis is still the only tester; the strategic ship-blocker is non-Marc families.

**Product direction:** the v2 PRD (today) repositions Ronki routine-first: "stress-free mornings and evenings for school starters," emotional companion inside. Core loop: the kid's day and the dragon's day are the same day. Morning tasks fill Ronki's Feuer, full Feuer sends him on a timed expedition during school, he returns at evening-routine time with a memento and a voiced story, TonightRitual ends with tomorrow's hook. Soft Finch-style mechanics, hard anti-dark-pattern guardrails (count-up counters yes, calendar streaks never).

## Done (this session, 7 Jul 2026)

- **v2 PRD** written and committed: [docs/prd/RONKI-V2-PRD.md](docs/prd/RONKI-V2-PRD.md). Built from a two-track research pass (full codebase/product audit + Finch/Joon/Brili/Timo/Pok-Pok competitor research). 10 sections + Ferienmodus addendum (section 11). Key decisions locked by Marc: evolve the PWA (iOS rebuild separate), balanced soft gamification without dark patterns, routine-first positioning.
- **Claude Design handover brief**: [docs/design-briefs/2026-07-07-v2-loop-and-onboarding.md](docs/design-briefs/2026-07-07-v2-loop-and-onboarding.md). 10 wireframe explorations across 4 items (onboarding egg-first, Feuer loop, Heimkehr, Abenteuertage). Deliverables expected back in `docs/design-incoming/v2-loop/` as HTML mockups; green light before build.
- **Ferienmodus addendum** (PRD section 11): school-break mode. Idea board of 5-6 illustrated activity cards each morning (parent-configured pool), picks fill the Feuer, kid and dragon adventure together, Abenteuertage never pause. Hard rule: NOT screen-time bargaining (Funkelzeit stays dead). Candidate to ship before v2 Phase 2 since summer break starts within weeks.
- **Repo rename + docs reorg**: folder renamed, docs sorted into prd/strategy/specs/voice/design-briefs/design-incoming/archive, docs/README.md index added, all references fixed, build verified. Commit `f4e53f6` pushed to `experiment/drachennest`.

## Done (earlier sessions, still relevant)

- QR profile auth phases 1+2+2.5 + website-driven setup + trading-card design (May 2026). Spec: [docs/specs/qr-profile-auth.md](docs/specs/qr-profile-auth.md). Production blockers tracked in the second brain (website deploy, env vars, home CTA).
- Onboarding trim 16 → 4 surfaces, narrator removed (Ronki-only voice), music engine with ducking, chibi continuity, ~13 NORTHSTAR cuts (April 2026).

## In flight

- **Claude Design wireframes** for the v2 loop + onboarding (brief handed over 7 Jul). Ferienmodus addendum passed alongside for a possible 5th item.
- Nothing else is mid-build; v2 execution has not started.

## Backlog (ordered)

0. **Backend restore (blocks everything below, see the 14 Sep check).** Download data from the frozen Supabase project, create a new project, rebuild the schema (waitlist + both RPCs, site_feedback, profiles with token RLS, game_state, telemetry_events, feedback, app_evals + app_eval_counts view), set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel `ronki` and `ronki-app`, redeploy main, create one card end to end. Then funnel instrumentation: Plausible goals, profiles counter, home CTA to /profil-erstellen, sitemap entry.
1. **Ferienmodus build** (PRD 11.5 says candidate to ship first; summer break is the forcing function). Needs: card board component, dashboard toggle + activity-pool editor, RonkisTag middle-block swap, Feuer wiring.
2. **v2 Phase 1: fix the funnel.** Onboarding reorder (egg-first, name chips, camera fallback, close fix), 8 funnel events, opt-in timing fix, telemetry repairs (quest.complete on RonkisTag), section-7 cuts (Journal into Buch, Starfighter/CloudJump/TaskList deleted, dead economy fields dropped).
3. **v2 Phase 2: the return engine.** Return beat, Feuer meter, expedition appointment timing, story pool 8 → 30 voiced, tomorrow's hook, Abenteuertage feeding evolution. Voice re-record rides here (open question 1).
4. **v2 Phase 3: 30-family DACH beta.** Measure D7/D30 + loop health + short-session guardrail. Pricing after data.
5. **NORTHSTAR revision**: [docs/strategy/NORTHSTAR.md](docs/strategy/NORTHSTAR.md) still says "no streaks visible to the kid" as a blanket ban; the PRD's section 6 guardrails supersede it (count-up allowed). Edit NORTHSTAR when v2 execution starts so the docs don't contradict.
6. QR-card production blockers (website deploy, Vercel/GH-Pages env vars, home CTA to /profil-erstellen).
7. iOS-native rebuild: separate track, LCS v1 brief exists (in session history, July 2026), untouched by v2.

## Open questions (PRD section 10)

Voice re-record scope, website analytics opt-in seeding, push notifications timing, sibling profiles, iOS track.

## Key paths

- PRD: `docs/prd/RONKI-V2-PRD.md`
- Design brief: `docs/design-briefs/2026-07-07-v2-loop-and-onboarding.md`
- Strategy: `docs/strategy/` (NORTHSTAR, PATH, synthesis)
- Supabase project: `jdpxfvqaoxmnyvlxikce` (FROZEN since about 23 Aug 2026, host no longer resolves, see the 14 Sep check; profiles table, token-keyed RLS); local env in `.env.local` (gitignored), website reads it via `envDir: '..'`
- Dev servers: app `npx vite --port 5173`, website `npm run dev:web -- --port 5174` (both currently stopped after the folder rename)
