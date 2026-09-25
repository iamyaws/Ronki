# Ronki growth engine: design

_25 Sep 2026. Approved by Marc the same day, including the plan gate (6 agents, about 650k subagent tokens). Written by Fable after a review of the site, backend and services._

## Why this exists

Marc got mails that Ronki services went inactive. The review below confirmed it and found more. The goal of this work: keep the backend and measurement alive, finish the site revamp, and build one engine for search and social that sends parents to ronki.de, so the two decision gates get a fair test.

## Review findings (25 Sep 2026)

**Backend and services**

| Service | State on 25 Sep | Effect |
|---|---|---|
| Supabase `jdpxfvqaoxmnyvlxikce` | Warned 22 Sep, paused 23 Sep, second pause this year. Restored by Fable on 25 Sep via the Supabase connector (ACTIVE_HEALTHY, `leads_count` returns 200). | Card creation, template signup, waitlist, feedback and app sync were dead from 23 to 25 Sep. |
| Keep-alive workflow | Ran green on 16 Sep (manual) and 21 Sep (scheduled, GitHub delayed it from 06:17 to 12:56 UTC). Supabase flagged the project the next day anyway. | One weekly RPC call does not count as "sufficient activity". The alarm could not fire because the call itself succeeded. |
| Plausible | Trial ended; account inactive; stats deleted around 23 Oct 2026. The script still loads on every page. | No measurement for either gate, and the three goals were never created. |
| Mail provider | None. | Addresses with `wants_updates = true` cannot be mailed. |
| Git | `C:\Users\öööö\ronki\.git` points to a worktree entry in `louis-quest` that no longer exists. `main` in `louis-quest` is 21 commits behind origin. (Corrected 25 Sep: `design/bilderbuch` was already on GitHub; the first check listed branches before fetching.) | No git in the working folder. Repaired 25 Sep 2026: the folder is a registered worktree again, working tree matched the branch exactly. |
| Vercel `pitch-engine`, `yaws-pass-site` | Paused 14 Sep via the REST API. | Not Ronki. Looks deliberate; no action. |

**Search (Search Console, 13 Jun to 12 Sep 2026)**

- 15 clicks, 1,403 impressions. Ranked only for "ronki" (position 7.1, not first) and the Morgenroutine article (position 6.5).
- Topic queries show up but sit far back: "abendroutine kinder" 92.9, "kind trödelt" 41.7, "kleinkind trödelt morgens" 20.9.
- Reach gate needs 500 visitors a month by Jan/Feb 2027; today it is about 5. Search alone will not close that in four months, so social carries the early traffic.
- Base is solid: 35 URLs in the sitemap, 11 Ratgeber articles, 4 templates, 4 tools. No own social channels.

## Decisions (Marc, 25 Sep 2026)

1. **Backend:** stay on the free plan with a daily ping. If Supabase sends another pause warning within three weeks of the change, move to Pro ($25 a month).
2. **Analytics:** Umami Cloud free replaces Plausible.
3. **Channels:** TikTok, Instagram, YouTube Shorts. Pinterest was offered and declined.
4. **On camera:** Ronki as the running character, Marc to camera 1 to 2 times a week. No children's faces or names, ever.
5. **Gates:** gate 1 (pull) moves from 14 Nov to **15 Dec 2026**. Gate 2 (reach) stays **15 Mar 2027**. Gate 2 counts **all unpaid visitors** (search plus social, no ads), reported by source.
6. **Engine shape:** one topic everywhere, every two weeks (option A of three).
7. **Mail provider:** Brevo free (EU, double opt-in built in). Proposed by Fable inside the approved Part 1; Marc can still swap it when creating the account.

## Part 1: Foundation (25 to 27 Sep, Fable solo)

1. **Daily keep-alive.** `supabase-keepalive.yml` runs daily and calls two different RPCs (`leads_count` and `waitlist_count`). Stop rule as in decision 1.
2. **Umami.** Swap the Plausible script and the event helper for Umami; keep the three events ("CTA Klick", "Karte erstellt", "Vorlage Download") and their properties; add UTM tags per channel. Marc creates the account, guided one step at a time. Confirm the free tier's limits (events, retention) at signup and write them into HANDOFF.
3. **Back up the redesign.** Push `design/bilderbuch` to GitHub. Reconnect `C:\Users\öööö\ronki` to git without losing uncommitted files (compare the folder against the branch before any repair). Fast-forward `main` in `louis-quest`.
4. **Brevo.** Marc creates the account. Leads with `wants_updates = true` go to Brevo, which sends the double opt-in mail. No mail goes to anyone who has not confirmed. Privacy policy section `#vorlagen` updated to name Brevo.
5. **Gate date.** PRD section 12, HANDOFF and the HQ Fristen register move gate 1 to 15 Dec 2026 and record the gate 2 visitor definition.

## Part 2: Site revamp (weeks of 28 Sep and 5 Oct)

1. **Character sheet first**, made with Codex image generation, base prompt from `docs/design-briefs/2026-09-16-bilderbuch-image-list.md`, no text in images. Site art and every social video use it. Marc approves the sheet before anything else is generated.
2. **The 18 website motifs** from the same list. Every prompt is logged in `docs/design-briefs/` and shown to Marc.
3. **Finish Bilderbuch:** new art into the hero, Ratgeber index cards, friend stickers and the closing band. PR, Vercel preview, Marc's OK, merge, then check the live bundle hash changed.
4. **SEO repairs, aimed at the brand search:** title without the em-dash that names the parent's problem; meta description about calm mornings and evenings, not about dark patterns; Organization and WebSite schema with `sameAs` links to the three channels once they exist; `dateModified` for rewritten articles (HANDOFF follow-up 3); `/vorlagen/*` pages inside `PainterlyShell` with header and footer; every article links its template.
5. **`/hallo` link-in-bio page:** noindex, not in the sitemap. Shows the current topic, its template and the card CTA, with UTM links per channel.
6. **Real phone check** of load speed and layout before launch.

## Part 3: The engine

### Topic map (drafted; the keyword research confirms or reorders it)

| Fortnight starts | Topic | Site piece |
|---|---|---|
| 19 Oct | Kind trödelt morgens, plus a one-off clock-change post pair on 22 to 24 Oct (clocks change 25 Oct) | Refresh `/ratgeber/morgen-troedeln`, morning template |
| 2 Nov | Dark mornings and getting dressed without a fight | New page, small template |
| 16 Nov | Ronki Advent routine calendar | New printable template, live before late-November printing |
| 30 Nov | Keeping the rhythm into the holidays | New or refreshed page |
| Jan to Mar 2027 | Restart after the holidays, screen time without tricks, brushing teeth, Einschulung 2027 prep, ADHS mornings, siblings | Mostly refreshes of existing pages and templates |

Keyword research (one Sonnet agent): about 40 German queries grouped into these topics, with search intent, what ranks today, and the questions parents ask. Inputs: the Search Console export in `docs/analytics/gsc-2026-09-14/`, a fresh export if Marc pulls one, and live search results via Firecrawl. Refresh priority goes to pages already seen at positions 8 to 30.

### Two-week rhythm

- **Mon:** Fable writes the topic brief (search phrase, parent questions, what ranks, our angle).
- **Tue to Thu:** Fable drafts the site page and template in German; Marc reviews. Fable writes the slate: 6 video scripts, 2 carousels, captions.
- **Weekend:** Marc films his 2 clips in one phone session (about 45 minutes) and drops them into the slate folder.
- **Sunday:** Marc schedules everything in the free native tools (TikTok web, Meta Business Suite, YouTube Studio), about 20 minutes, and does the weekly check.

### Formats (one 9:16 file serves TikTok, Reels and Shorts)

1. **"Ronkis Morgen"**, 15 to 25 seconds: Ronki acts out the problem from the child's side, in his ElevenLabs voice, and ends with one tip.
2. **"Papa baut einen Drachen"**, 30 to 60 seconds: Marc to camera. Why he built Ronki, what worked this week, what did not.
3. **"Eine Sache für morgen früh"**, about 20 seconds: one concrete tip, with the printed template in adult hands.
4. **Instagram carousel**, 6 to 8 slides from the article, template on the last slide.

Cadence: 3 videos a week plus 1 carousel a week.

### Render script

One script turns a slate entry (JSON: lines, image references, timings) plus Ronki images plus the voice into a 9:16 MP4 with burned-in captions and an end card with the `/hallo` URL. For Marc's raw clips it adds captions (ElevenLabs speech to text) and the same end card. Output goes into the slate folder, ready to schedule. Built by one Opus agent; lives in `scripts/`.

### Mail

Parents who confirm the double opt-in get three short mails: day 1, how to hang the routine up; day 4, what to do when it stalls; day 10, meet Ronki and make a card. Copy in German, reviewed by Marc.

### Rules for every post and page

- No children's faces or names. Adult hands are fine.
- No testimonials, user counts or quotes we do not have.
- No fake urgency, no countdowns, no "only today".
- Ronki never nags, shames or guilt-trips; he makes the hard part easy, then steps aside (see the positioning note in memory and NORTHSTAR).
- Claims in articles carry sources; posts only repeat claims the article backs.
- TikTok business account, so music only from the Commercial Music Library.
- German, "du" to parents, plain language, no em-dashes.

### Marc's time

About 2.5 hours a week (filming, reviews, scheduling, weekly check), plus about 10 minutes a day answering comments in the first weeks.

## Part 4: Timeline and measurement

| When | What |
|---|---|
| 25 to 27 Sep | Part 1 |
| Week of 28 Sep | Character sheet, Marc's OK, 18 motifs. Keyword research. Marc creates the three accounts after Fable checks handle availability. |
| Week of 5 Oct | Art swap, SEO repairs, `/hallo`, preview and merge. Render script. Brevo double opt-in and the three mails. |
| Week of 12 Oct | First slate, Marc films, Astra launch review (social rules plus first slate), fixes, scheduling. |
| **Mon 19 Oct** | **Launch.** |
| End of Nov | Drop the weakest video format, double the strongest. |
| 15 Dec 2026 | Gate 1 (pull). |
| 15 Mar 2027 | Gate 2 (reach): average of Jan and Feb 2027, unpaid visitors by source, plus 100 addresses. |

**Weekly check (Sunday, 10 minutes):** views, profile visits and link clicks per channel; Umami visits by UTM source; cards made (`profiles`), template downloads and opt-ins (`leads`).

## Agent and token plan (approved 25 Sep 2026)

| Step | Who | Model | Tokens |
|---|---|---|---|
| Part 1, SEO repairs, Brevo wiring, first slate, all checks | Fable solo | Fable 5 | about 250k main session |
| Character sheet, then 18 motifs | 2 Codex runs | GPT image | Codex quota |
| Keyword research | 1 agent | Sonnet 5, low effort | about 150k |
| Art swap and `/hallo` | 1 agent | Opus | about 300k |
| Render script | 1 agent | Opus | about 200k |
| Launch review | 1 Astra pass | GPT-6 Astra, medium | Codex quota |

Total: 6 agents, about 650k subagent tokens, run one after another. After launch, each fortnight is Fable solo at about 100k plus Codex images and ElevenLabs credits. Any step that runs more than 25 percent over its estimate stops and reports before continuing.

## Not doing

- No paid ads. No Higgsfield credits unless Marc asks for motion clips later.
- No Pinterest (declined 25 Sep).
- No v2 app work before the gates.
- No changes to `/en`.

## Open items

1. **Ronki's voice.** `scripts/gen-ritual-voice-pack.py` marks Harry (`SOYHLrjzK2X1ezoPC6cr`) as the locked Ronki voice; `gen-screentime-audio.py` and `gen-stamina-audio.py` still use Callum. Confirm Harry before the first Ronki scene, and update the voice casting memory.
2. **Handles.** Check `ronki` on TikTok, Instagram and YouTube before Marc creates the accounts; fallbacks `ronki.de`, `ronkidrache`.
3. **Umami free-tier limits** confirmed at signup.
4. **ElevenLabs credits** checked before the first slate.
5. **App telemetry** (`telemetry_events` rejects anon inserts, HANDOFF follow-up 5) stays out of scope unless gate 1 needs it.
