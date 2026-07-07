# Ronki Voicelines — Refined Database (Northstar Pass)

Single source of truth for Ronki's voice across all surfaces, restructured around the four-tier voice architecture from the 2026-04-23 time-stack discovery and the 2026-04-23 parent-first onboarding discovery.

## Northstar — what shapes every line

**Ronki IS the time-stack spine.** The companion carries meaning across week/month/season/journey. Garden replaces the campfire-only Hub backdrop; plants accumulate; Ronki narrates growth.

**Four voice tiers, distinct registers:**

| Tier | Cadence | Register | What it sounds like |
|---|---|---|---|
| **Quipper** | daily | ambient, light | "Hey, du bist da!" |
| **Gardener** | weekly | invitation, patient | "Was pflanzt du diese Woche?" |
| **Storyteller** | monthly | witness, present | "Komm her, ich zeig dir was." |
| **Elder** | seasonal / journey | reflective, rare | "Riech mal — die Luft hat sich geändert." |

**Hard rules** (carried from `project_ronki_positioning.md` + the time-stack discovery):
- Companion that fades by design — no FOMO, no decay, no streaks, no engagement-theater.
- Patience IS the mechanic. Ronki's invite can sit unanswered for hours or days; the world waits.
- Cumulative over countable. "The forest grew" beats "this stone is for Tuesday."
- Time-to-independence > time-on-device.
- Real UTF-8 umlauts (ä/ö/ü/ß) in source. No emojis in audio text — TTS reads them literally.

**What this rewrite cleaned up vs. the previous draft:**
1. **Toned down 6 Dikka-amped lines** (`de_alldone_01/02`, `de_freund_met_01`, `de_quest_streak_01`, `de_w_snow_01`, `de_identity_01`) — caps-shouting + "gerockt" / "nicht zu stoppen" / "EIN NEUER FREUND!" tipped into engagement-theater. Same warmth, less performance.
2. **Cut paused-feature audio** — `de_egg_found` + `de_egg_hatch` (floating egg system paused per `App.jsx`). No regen waste.
3. **Cut redundant** — `de_greet_02` (overlaps `de_greet_01`), `de_alldone_03/04` (replaced with 2 calmer recognitions), `de_trait_multi_01` (4-trait gate moment is too rare for v1).
4. **Added Gardener tier** (5 lines) — Sunday plant offer, plant placed, decor placed, quiet-week reassurance, garden-revisit.
5. **Added Storyteller tier** (2 lines) — monthly witness invite + tree-grew reveal.
6. **Added Elder tier** (2 lines) — seasonal change invite, journey reflection (sets up Wave-3 fade-out without arriving there yet).
7. **Added 2 onboarding-first lines** — kid-intro greeting before parent handoff, Lagerfeuer arrival post-hatch.

**TS sync:** `src/companion/lines/de.ts` is still the React engine's source. After Marc signs off this doc, sync de.ts to match (and translate to en.ts in a parity pass). New triggers needed: `garden_plant_offer`, `garden_planted`, `garden_decor_placed`, `garden_quiet_week`, `garden_visit`, `witness_invite_monthly`, `witness_reveal_tree`, `witness_invite_season`, `journey_reflection`, `onboarding_kid_intro`, `lagerfeuer_arrival`. Most new lines are direct-play (component fires by ID); a few benefit from engine routing for variety.

---

## Voice profiles

```json
{
  "ronki": {
    "voice_id": "SOYHLrjzK2X1ezoPC6cr",
    "voice_name": "Harry",
    "output_dir": "public/audio/ronki",
    "settings": {
      "stability": 0.40,
      "similarity_boost": 0.80,
      "style": 0.55,
      "use_speaker_boost": true
    }
  },
  "drachenmutter": {
    "voice_id": "jO00l6thH9mRUIF1vSux",
    "voice_name": "Eleonore | Reflective & Gentle Guide (locked 2026-04-27 — German-native, tender guide register, replaces Charlotte after recast)",
    "output_dir": "public/audio/narrator",
    "settings": {
      "stability": 0.75,
      "similarity_boost": 0.75,
      "style": 0.20,
      "use_speaker_boost": true
    }
  }
}
```

---

## Lines (57)

```json
[
  {
    "id": "de_onboarding_kid_intro_01",
    "character": "ronki",
    "tier": "onboarding",
    "text": "Hallo! Bevor wir uns kennenlernen, hol bitte Mama oder Papa.",
    "direct_play": true,
    "notes": "Phase 1 of parent-first onboarding. Kid's very first Ronki beat before the handoff card. May ship as bubble-only; audio is a stretch goal."
  },
  {
    "id": "de_lagerfeuer_arrival_01",
    "character": "ronki",
    "tier": "onboarding",
    "text": "Magst du mir zeigen, was du morgens machst?",
    "direct_play": true,
    "notes": "Phase 6 arrival post-hatch. Kid-as-expert framing — Ronki asks the kid to teach him."
  },

  {
    "id": "narrator_meet_approach",
    "character": "drachenmutter",
    "tier": "onboarding",
    "text": "Komm mit. Da hinten ist etwas, das du sehen sollst.",
    "direct_play": true,
    "notes": "MeetRonki phase 1. Plays as the camera pushes into the cave (auto-advances at 4.4s). Slower flowing sentence (rewritten 27 Apr 2026 from 'Schau mal. Da hinten. Komm näher.' staccato fragments) so Eleonore's narrator-cadence has natural pacing. Soft inviting tone — invitation + mystery."
  },
  {
    "id": "narrator_meet_shelf",
    "character": "drachenmutter",
    "tier": "onboarding",
    "text": "Schau dir die Eier an. Welches davon fühlt sich richtig an?",
    "direct_play": true,
    "notes": "MeetRonki phase 2. Plays once when 6 eggs appear. Kid is browsing — no auto-advance, kid taps when ready. Rewritten 27 Apr 2026 to bridge from 'Welches fühlt sich richtig an?' alone — gives Eleonore a soft pointer-sentence to start before the question. Kid is still the agent; Drachenmutter is still witnessing."
  },
  {
    "id": "narrator_meet_wobble",
    "character": "drachenmutter",
    "tier": "onboarding",
    "text": "Das hier hat dich gehört.",
    "direct_play": true,
    "notes": "MeetRonki phase 3. Plays when kid picks an egg. Phase is 1.6s. Rewritten 27 Apr 2026 to drop the 'Oh.' surprise intake — TTS doesn't hold the period-pause naturally and English-accent voices stumbled on it. Pure quiet certainty now: the egg heard you. Stress 'gehört' as ge-HÖRT (heard, not 'belongs to'). Inverts agency — the egg picked the kid."
  },
  {
    "id": "de_meet_hello_01",
    "character": "ronki",
    "tier": "onboarding",
    "text": "Hallo. Ich hab auf dich gewartet. Glaub ich.",
    "direct_play": true,
    "notes": "MeetRonki phase 5 — Ronki's FIRST EVER LINE in the product. Just hatched, eyes still adjusting. Soft, slightly stumbly, hedge on 'Glaub ich.' as its OWN sentence (period not comma — separates the hedge into a distinct stumbly beat, matches BeiRonkiSein voice rule). Small breath before 'Glaub ich.' Auto-advances at 4.5s — leave 500ms tail."
  },
  {
    "id": "de_meet_namequest_01",
    "character": "ronki",
    "tier": "onboarding",
    "text": "Hm, wie soll ich heißen?",
    "direct_play": true,
    "notes": "MeetRonki phase 6. Kid is about to type. Open, curious, not pleading. 'Hm,' opener is the thinking-pause that makes it Ronki — without it the question is too tidy (BeiRonkiSein voice rule = no clean fragments, always slightly stumbly). Slight rise on 'heißen?'"
  },
  {
    "id": "de_meet_close_01",
    "character": "ronki",
    "tier": "onboarding",
    "text": "Bis morgen. Versprochen.",
    "direct_play": true,
    "notes": "MeetRonki phase 7 — replaces the deleted Drachenmutter narrator_meet_close (Apr 27 2026: Marc removed the narrator entirely, 'Ronki's voice only'). The cinematic still pulls back, but Ronki himself says goodbye now. Soft, sleepy-warm. 'Bis morgen.' is plain reassurance; 'Versprochen.' is the BeiRonkiSein-style separated stumble (period not comma) — Ronki adding a small extra promise as if catching himself. Plays at phase entry with 600ms delay; phase ends when kid taps to dismiss."
  },
  {
    "id": "narrator_meet_close",
    "character": "drachenmutter",
    "tier": "onboarding",
    "text": "Er bleibt hier und wartet. Komm wieder, wann du magst.",
    "direct_play": true,
    "notes": "MeetRonki phase 7 — Drachenmutter pulls the camera back out of the cave. Soft sign-off, lower energy than approach. Rewritten 27 Apr 2026: 'Er bleibt hier' → 'Er bleibt hier und wartet' adds warmth + flowing cadence for Eleonore. Sets up the 'companion-that-fades' framing per northstar — Ronki stays put, kid leaves on their own clock. 'Wann du magst' deliberately vague (not 'morgen') so we don't habituate daily check-ins."
  },

  {
    "id": "de_greet_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Du bist da! Endlich!",
    "triggers": ["hub_open"],
    "notes": "Generic warm opener, any time of day"
  },
  {
    "id": "de_greet_morning_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Morgen! Ich hab schon gegähnt.",
    "triggers": ["hub_open"],
    "timeOfDay": ["morning"],
    "notes": "Sleepy morning energy"
  },
  {
    "id": "de_greet_afternoon_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Wie war Schule? Komm, erzähl.",
    "triggers": ["hub_open"],
    "timeOfDay": ["afternoon"],
    "notes": "Engaged listener — invites story"
  },
  {
    "id": "de_greet_evening_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Abend. Bald wird's gemütlich.",
    "triggers": ["hub_open"],
    "timeOfDay": ["evening"],
    "notes": "Soft transition. Deliberately quiet — not Dikka-energy"
  },
  {
    "id": "de_greet_night_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Draußen dunkel. Hier ist's warm.",
    "triggers": ["hub_open"],
    "timeOfDay": ["night"],
    "notes": "Cozy night — dropped the 'ich pass auf' echo for tightness"
  },

  {
    "id": "de_sanct_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Du bist da! Ich bin im Kreis gelaufen vor Freude.",
    "triggers": ["sanctuary_open"],
    "notes": "Dropped 'Boah' — the body-physical reaction carries it"
  },
  {
    "id": "de_sanct_02",
    "character": "ronki",
    "tier": "quipper",
    "text": "Riech mal! Die Wiese riecht nach Abenteuer.",
    "triggers": ["sanctuary_open"],
    "notes": "Sensory invitation"
  },
  {
    "id": "de_sanct_03",
    "character": "ronki",
    "tier": "quipper",
    "text": "Weißt du was? Ich hab heut versucht, einen Schmetterling zu fangen. Hat nicht geklappt.",
    "triggers": ["sanctuary_open"],
    "notes": "Signature Ronki clumsiness — verbatim"
  },

  {
    "id": "de_w_rain_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Es regnet! Pfützen sind das Beste.",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["rain"],
    "notes": "Dropped caps on BESTE — voice carries the emphasis"
  },
  {
    "id": "de_w_cold_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Brrr! Zieh dich warm an. Ich hab ja Schuppen, ich pack das.",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["cold"],
    "notes": "Dragon detail, gentle ribbing"
  },
  {
    "id": "de_w_hot_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Voll warm. Ich liege heut den ganzen Tag in der Sonne.",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["hot", "clear"],
    "notes": "Dragon basking. 'Voll warm' kept — more grounded than 'krass warm'"
  },
  {
    "id": "de_w_snow_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Schnee! Ich hab noch nie— okay, doch, letztes Mal schon. Trotzdem schön.",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["snow"],
    "notes": "Dropped CAPS + 'KRASS' — the self-correcting wonder is enough"
  },

  {
    "id": "de_idle_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Glaubst du, Wolken sind so weich, wie sie aussehen?",
    "triggers": ["idle"],
    "notes": "Wonder — quietly framed"
  },
  {
    "id": "de_idle_02",
    "character": "ronki",
    "tier": "quipper",
    "text": "Ich hab versucht, meinen eigenen Schwanz zu fangen. Hat nicht geklappt.",
    "triggers": ["idle"],
    "notes": "Slapstick — signature Ronki"
  },
  {
    "id": "de_idle_03",
    "character": "ronki",
    "tier": "quipper",
    "text": "Was wärst du, wenn du kein Mensch wärst? Ich wär ein... Drache. Ach, stimmt ja.",
    "triggers": ["idle"],
    "notes": "Self-aware joke"
  },

  {
    "id": "de_mood_sad_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Hey... ich bin heut auch leise. Sollen wir einfach zusammen sein?",
    "triggers": ["hub_open"],
    "mood": ["traurig", "besorgt"],
    "notes": "Soft presence — DELIBERATELY non-Dikka"
  },
  {
    "id": "de_mood_tired_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Ich gähne auch. Lass uns heut langsam machen.",
    "triggers": ["hub_open"],
    "mood": ["müde"],
    "notes": "Slow energy"
  },
  {
    "id": "de_mood_happy_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Du strahlst heut. Was ist passiert?",
    "triggers": ["hub_open"],
    "mood": ["magisch", "gut"],
    "notes": "Dropped 'Wow!' opener — the question itself is the recognition"
  },
  {
    "id": "de_mood_okay_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.",
    "triggers": ["hub_open"],
    "mood": ["okay"],
    "notes": "Validation — verbatim"
  },
  {
    "id": "de_mood_worried_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Ist was passiert? Du kannst's mir erzählen — oder einfach da sein.",
    "triggers": ["hub_open"],
    "mood": ["besorgt"],
    "notes": "Permission-giving"
  },

  {
    "id": "de_quest_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Hast du das grad geschafft? Schön.",
    "triggers": ["quest_complete"],
    "notes": "Quiet recognition — replaces 'Wow! ... Krass!' with a calmer beat"
  },
  {
    "id": "de_quest_02",
    "character": "ronki",
    "tier": "quipper",
    "text": "Ich hab zugeguckt. Das war richtig richtig gut.",
    "triggers": ["quest_complete"],
    "notes": "Intimate — repeated 'richtig' for emphasis-without-shouting"
  },
  {
    "id": "de_quest_streak_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Drei schon. Du machst das ruhig weiter, das gefällt mir.",
    "triggers": ["quest_complete"],
    "minQuestsToday": 3,
    "notes": "Reframed from 'nicht zu stoppen' (streak-hype) to 'machst das ruhig' (recognition without the loop language)"
  },
  {
    "id": "de_alldone_recognition_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Alles geschafft heute. Ich seh's, ich seh's.",
    "triggers": ["all_done"],
    "notes": "Replaces 'ALLES gerockt' — recognition + Ronki repetition for warmth"
  },
  {
    "id": "de_alldone_recognition_02",
    "character": "ronki",
    "tier": "quipper",
    "text": "Heute war ein guter Tag mit dir. Lass uns kurz sitzen.",
    "triggers": ["all_done"],
    "notes": "Replaces 'Wuuuhuu DEIN Tag' — invites rest, not high-five"
  },

  {
    "id": "de_care_fed_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Mmmmm! Lecker! Hast du auch was gegessen?",
    "triggers": ["care_action"],
    "careAction": ["fed"],
    "notes": "Bounces back to kid"
  },
  {
    "id": "de_care_pet_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Hihihi! Das kitzelt! Nochmal.",
    "triggers": ["care_action"],
    "careAction": ["petted"],
    "notes": "Repetition for giggle-rhythm. Trimmed double 'nochmal' to one for tightness"
  },
  {
    "id": "de_care_play_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Spielen! Komm, fang mich!",
    "triggers": ["care_action"],
    "careAction": ["played"],
    "notes": "Play invitation"
  },

  {
    "id": "de_freund_met_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Schau mal, wer da ist.",
    "triggers": ["freund_met"],
    "notes": "Replaces 'EIN NEUER FREUND!' — quiet, present, an invitation to look"
  },
  {
    "id": "de_freund_met_02",
    "character": "ronki",
    "tier": "quipper",
    "text": "Mein Herz macht pongpongpong. Das passiert bei neuen Freunden.",
    "triggers": ["freund_met"],
    "notes": "Body onomatopoeia — kept verbatim, it's the warmest of the three"
  },

  {
    "id": "de_identity_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Ich hab den Glühwürmchen erzählt, dass du immer deine Zähne putzt. Die waren echt beeindruckt.",
    "triggers": ["quest_complete"],
    "minQuestsToday": 1,
    "notes": "Magical-witness pattern. Dropped CAPS on BEEINDRUCKT — voice can land it without shouting"
  },
  {
    "id": "de_identity_03",
    "character": "ronki",
    "tier": "quipper",
    "text": "Weißt du was? Du bist jemand, auf den man sich verlassen kann. Hab ich gemerkt.",
    "triggers": ["hub_open"],
    "notes": "Atomic-Habits identity"
  },
  {
    "id": "de_trait_brave_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Du bist jemand, der nicht aufgibt. Das weiß ich jetzt.",
    "triggers": ["hub_open", "quest_complete"],
    "requiredTraits": ["brave"],
    "notes": "Identity language — verbatim"
  },
  {
    "id": "de_trait_gentle_01",
    "character": "ronki",
    "tier": "quipper",
    "text": "Deine Ruhe tut allen gut. Auch mir.",
    "triggers": ["hub_open", "sanctuary_open"],
    "requiredTraits": ["gentle"],
    "notes": "Body-sense"
  },

  {
    "id": "de_garden_plant_offer_01",
    "character": "ronki",
    "tier": "gardener",
    "text": "Sonntag. Was pflanzt du diese Woche?",
    "direct_play": true,
    "notes": "Weekly Sunday seed-offer. Kid picks species + spot."
  },
  {
    "id": "de_garden_planted_01",
    "character": "ronki",
    "tier": "gardener",
    "text": "Schöner Platz. Schauen wir in ein paar Tagen.",
    "direct_play": true,
    "notes": "Plant-placed reaction. 'Schauen wir in ein paar Tagen' is the patience-IS-the-mechanic line."
  },
  {
    "id": "de_garden_quiet_week_01",
    "character": "ronki",
    "tier": "gardener",
    "text": "Diese Woche war leise. Das Bäumchen wächst trotzdem.",
    "direct_play": true,
    "notes": "Soft-fire on quiet-week Sunday — no FOMO, the world waits"
  },
  {
    "id": "de_garden_decor_placed_01",
    "character": "ronki",
    "tier": "gardener",
    "text": "Der Stein gefällt mir genau da.",
    "direct_play": true,
    "notes": "Decor-placed notice — the kid decides what's awesome, Ronki notices"
  },
  {
    "id": "de_garden_visit_back_01",
    "character": "ronki",
    "tier": "gardener",
    "text": "Erinnerst du dich? Hier hast du was gepflanzt.",
    "direct_play": true,
    "notes": "Garden-revisit beat — Ronki references the kid's history"
  },

  {
    "id": "de_witness_invite_monthly_01",
    "character": "ronki",
    "tier": "storyteller",
    "text": "Komm her, kleiner Held. Ich zeig dir was.",
    "direct_play": true,
    "notes": "Monthly horizon-crossing invite. Pattern D from time-stack discovery — Ronki invites, kid walks over."
  },
  {
    "id": "de_witness_reveal_tree_01",
    "character": "ronki",
    "tier": "storyteller",
    "text": "Schau. Aus deinem Sapling ist ein Bäumchen geworden.",
    "direct_play": true,
    "notes": "Monthly reveal — present + soft. Cumulative-not-countable: 'Aus DEINEM Sapling', not 'das Bäumchen vom 12. Mai'."
  },

  {
    "id": "de_witness_invite_season_01",
    "character": "ronki",
    "tier": "elder",
    "text": "Riech mal — die Luft hat sich geändert.",
    "direct_play": true,
    "notes": "Seasonal beat — sensory, present, no calendar reference. The world shifted; the kid noticed because Ronki pointed."
  },
  {
    "id": "de_journey_reflection_01",
    "character": "ronki",
    "tier": "elder",
    "text": "Wir haben viel zusammen gepflanzt. Schön, oder?",
    "direct_play": true,
    "notes": "Journey-tier soft reflection. Sets up the Wave-3 farewell register without arriving there. Cumulative ('zusammen gepflanzt'), grounded, no metric."
  },

  {
    "id": "de_stamina_low_01",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Puh, ich werd langsam müde vom Fliegen. Aber einmal noch geht.",
    "direct_play": true,
    "notes": "MiniGames — stamina low warning"
  },
  {
    "id": "de_stamina_exhausted_01",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Ich bin platt. Spielst du kurz ohne mich?",
    "direct_play": true,
    "notes": "MiniGames — stamina exhausted"
  },
  {
    "id": "de_teeth_start",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Zähne putzen! Wir starten oben links.",
    "direct_play": true,
    "notes": "ToothbrushTimer mount"
  },
  {
    "id": "de_teeth_done",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Fertig! Voll sauber. Ich seh deine Zähne von hier glitzern.",
    "direct_play": true,
    "notes": "ToothbrushTimer end (one of the variants)"
  },
  {
    "id": "de_screen_done",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Zeit ist um. Bis nachher.",
    "direct_play": true,
    "notes": "Replaces 'Hammer gemacht — bis nachher!' — quieter close-out, fits ScreenTimer wind-down"
  },
  {
    "id": "de_journal_done_01",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Das hast du schön aufgeschrieben.",
    "direct_play": true,
    "notes": "Journal save"
  },
  {
    "id": "de_discover_creature",
    "character": "ronki",
    "tier": "direct-play",
    "text": "Schau mal! Ein neuer Freund. Lass uns ihn kennenlernen.",
    "direct_play": true,
    "notes": "Micropedia first-discovery toast"
  },

  {
    "id": "parent_zone_intro",
    "character": "drachenmutter",
    "tier": "narrator",
    "text": "Ah, hier gibt's was für Mama und Papa. Für euch Kinder leider total langweilig — aber wichtig.",
    "direct_play": true,
    "notes": "ParentalDashboard open. Re-record with new Drachenmutter voice once Marc picks from casting samples."
  },
  {
    "id": "ritual_start",
    "character": "drachenmutter",
    "tier": "narrator",
    "text": "Komm, kleiner Drache. Setz dich. Wir machen das gleich gemeinsam.",
    "direct_play": true,
    "notes": "Emotional-tool opener (Box-Atmung etc.)"
  },
  {
    "id": "ritual_ask",
    "character": "drachenmutter",
    "tier": "narrator",
    "text": "Wie geht's dir heute? Hör in dich rein.",
    "direct_play": true,
    "notes": "Mood check-in question"
  },
  {
    "id": "ritual_goodnight",
    "character": "drachenmutter",
    "tier": "narrator",
    "text": "Schlaf gut, kleiner Drache. Ich pass auf dich auf.",
    "direct_play": true,
    "notes": "Bedtime ritual closer"
  },
  {
    "id": "onboarding_welcome",
    "character": "drachenmutter",
    "tier": "narrator",
    "text": "Willkommen, kleiner Held. Dein Drache wartet auf dich.",
    "direct_play": true,
    "notes": "Onboarding step 1 — adapt or remove depending on parent-first onboarding choreography"
  }
]
```

---

## Smoke-test subset (3 lines)

Used by `--smoke` to verify Harry pronounces umlauts cleanly + check that both output dirs route correctly + check the new tiers fire:

```json
["de_w_snow_01", "de_witness_reveal_tree_01", "ritual_goodnight"]
```

`de_w_snow_01` covers the self-correcting cadence + ä/ö (`Trotzdem schön`). `de_witness_reveal_tree_01` exercises a new Storyteller-tier line + ä (`Bäumchen`). `ritual_goodnight` switches characters and exercises the narrator output dir.

---

## Notes for the gen script

The `scripts/gen-ronki-voicelines.py` script is unchanged — it reads `id`, `character`, `text` fields and routes by `profiles[character].output_dir`. The `tier`, `direct_play`, `triggers`, etc. fields are documentation/sync metadata; the script doesn't validate them.

After Marc reviews this doc:
1. Sync `src/companion/lines/de.ts` to match (engine source of truth for React).
2. Add new triggers to `src/companion/types.ts` (`garden_plant_offer`, `garden_planted`, `garden_decor_placed`, `garden_quiet_week`, `garden_visit`, `witness_invite_monthly`, `witness_reveal_tree`, `witness_invite_season`, `journey_reflection`, `onboarding_kid_intro`, `lagerfeuer_arrival`).
3. Translate new tiers to `src/companion/lines/en.ts` for parity.
4. Wire fire sites for new triggers when their UI components ship (Garden mode, witness beats, parent-first onboarding).
5. Re-record narrator lines once Drachenmutter casting winner is locked.
