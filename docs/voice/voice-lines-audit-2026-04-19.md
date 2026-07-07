# Ronki voice-line audit — 2026-04-19

Review pass before re-recording from scratch (new Ronki voice). Each line tagged with a recommendation. Sign off on the cuts + rewrites before we rebuild the audio bank.

**Legend:** ✅ keep as-is · ✏️ keep but rewrite · ❌ cut · 🔒 trait-gated (only fires once Louis earns the trait) · 💤 dormant (trigger never fires in code)

---

## Greetings (`hub_open`) — 12 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_greet_01 | Hey! Du bist da! Endlich! | ✅ | Warmth, specific |
| de_greet_02 | Hey! Ich hab gerade an dich gedacht! | ✅ | Intimate |
| de_greet_03 | Oh! Da bist du ja! Ich hab was entdeckt… | ✅ | Sets curiosity |
| de_greet_m01 | Guten Morgen! Ich hab schon gegähnt. | ✅ | Gentle morning character |
| de_greet_m02 | Morgens bin ich immer ein bisschen verschlafen. Du auch? | ✅ | Relatable |
| de_greet_m03 | Die Sonne ist aufgegangen! Lass uns loslegen! | ❌ | Generic motivational filler |
| de_greet_a01 | Wie war die Schule? Erzähl mir alles! | ✅ | Engaged listener |
| de_greet_a02 | Nachmittag! Ich hab den ganzen Tag auf dich gewartet. | ❌ | Reads as needy; no Ronki character |
| de_greet_e01 | Abend! Bald wird es gemütlich. | ✅ | Atmospheric |
| de_greet_e02 | Hast du heute was Cooles erlebt? Ich will alles wissen. | ✅ | Curious |
| de_greet_n01 | Gute Nacht bald! Noch ein bisschen zusammen? | ✅ | Warm closing |
| de_greet_n02 | Draußen ist es dunkel. Hier drin ist es warm. | ✅ | Cozy |

**Cuts:** 2 of 12.

---

## Sanctuary open — 7 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_sanct_01 | Du bist da! Ich bin im Kreis gelaufen vor Freude! | ✅ | Character |
| de_sanct_02 | Riechst du das? Die Wiese riecht nach Abenteuer! | ✅ | Sensory, Ronki voice |
| de_sanct_03 | Psst — hör mal! Da raschelt was im Gras! | ✅ | Atmospheric |
| de_sanct_04 | Schau mal! Eine Libelle! Die ist schneller als ich! | ✅ | Specific observation + self-deprecation |
| de_sanct_05 | Ich hab dich vermisst. War es lang? Für mich schon. | ❌ | Redundant with de_greet_02 |
| de_sanct_06 | Weißt du was? Ich hab heute versucht, einen Schmetterling zu fangen. Hat nicht geklappt. | ✅ | Signature Ronki clumsiness |
| de_sanct_07 | Mein Lieblingsplatz ist genau hier. Wo ist deiner? | ✅ | Invites conversation |

**Cuts:** 1 of 7.

---

## Weather — 7 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_w_rain_01 | Es regnet! Ich mag Regen. Pfützen sind das Beste. | ✅ | "Puddles are the best" is peak Ronki |
| de_w_rain_02 | Tropf tropf tropf! Hörst du das auch? | ✅ | Playful |
| de_w_cold_01 | Brrr! Zieh dich warm an heute! Ich hab ja Schuppen. | ✅ | Dragon detail |
| de_w_hot_01 | So warm! Ich könnte den ganzen Tag in der Sonne liegen. | ✅ | Dragon basking |
| de_w_hot_02 | Sonnenschein! Vergiss die Sonnencreme nicht! | ❌ | Violates "never lectures" rule |
| de_w_snow_01 | SCHNEE! Ich — ich hab noch nie Schnee gesehen! Naja, letztes Mal schon. | ✅ | Memorably flawed |
| de_w_clear_01 | Blauer Himmel! Der perfekte Tag für ein Abenteuer! | ❌ | Generic adventure-ad copy |

**Cuts:** 2 of 7.

---

## Quest complete 💤 — 7 lines (trigger never fires; fix separately)

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_quest_01 | Hast du das gerade geschafft? Wow! | ✅ | Surprise + warmth |
| de_quest_02 | Ja! So macht man das! 💪 | ❌ | Emoji in TTS = weird; also generic |
| de_quest_03 | Ich hab zugeguckt. Das war richtig gut. | ✅ | Intimate, non-showy praise |
| de_quest_04 | Weiter so! Ronki glaubt an dich! | ❌ | Third-person coach-talk; no character |
| de_quest_05 | Eins weniger! Du rockst das! | ❌ | Aging slang |
| de_quest_streak_01 | Drei schon? Du bist heute nicht zu stoppen! | ✅ | Specific |
| de_quest_streak_02 | Nochmal? Du machst gar keine Pause! | ❌ | Could read as critical |

**Cuts:** 4 of 7. When the trigger is wired, wire with the 3 keepers.

---

## Care actions (`care_action`) — 6 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_care_fed_01 | Mmmmm! Das war lecker! Hast du auch was gegessen? | ✅ | Bounces back to Louis |
| de_care_fed_02 | Danke! Mein Bauch ist jetzt warm und voll. | ✅ | Body-sense detail |
| de_care_pet_01 | Hihihi! Das kitzelt! Nochmal, nochmal! | ✅ | Giggle |
| de_care_pet_02 | Ahhh… das ist schön. Du hast warme Hände. | ✅ | Tenderness |
| de_care_play_01 | Spielen! Ja! Ich bin bereit! Fang mich! | ✅ | Playful challenge |
| de_care_play_02 | Haha! Ich bin schneller als du! …oder? | ✅ | Cocky-then-unsure |

**Cuts:** 0 of 6. Strongest bucket in the bank.

---

## Idle wonder 💤 — 6 lines (trigger never fires; fix separately)

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_idle_01 | Ob Wolken wirklich so weich sind, wie sie aussehen? | ✅ | Classic Ronki wonder |
| de_idle_02 | Ich hab geträumt, ich kann fliegen. Bald kann ich das wirklich! | ✅ | Aspirational |
| de_idle_03 | Was wärst du, wenn du kein Mensch wärst? Ich wäre ein… Drache. Ach, stimmt ja. | ✅ | Self-awareness joke |
| de_idle_04 | Weißt du, was ich heute gelernt habe? Dass Ameisen richtig stark sind! | ✅ | Shares facts |
| de_idle_05 | Ich hab versucht, meinen eigenen Schwanz zu fangen. Hat nicht geklappt. | ✅ | Slapstick |
| de_idle_06 | Meinst du, Fische können träumen? | ✅ | Wonder |

**Cuts:** 0 of 6. All six are Ronki's best-written category. Worth wiring the idle trigger.

---

## Arc context — 4 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_arc_cool_01 | Ich ruh mich noch aus vom letzten Abenteuer. Aber mach ruhig weiter! | ✅ | Permission-giving |
| de_arc_cool_02 | Puh! Das war aufregend. Ich brauch ein Schläfchen. | ✅ | Body-sense |
| de_arc_active_01 | Wir haben ein Abenteuer! Schau mal oben! | ✅ | Directional |
| de_arc_active_02 | Unser Abenteuer wartet! Ich bin so gespannt! | ✅ | Warm anticipation |

**Cuts:** 0 of 4.

---

## Identity language — 4 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_identity_01 💤 | Ich hab den Glühwürmchen erzählt, dass du immer deine Zähne putzt. Die waren beeindruckt! | ✅ | The magical-witness pattern, signature of the app |
| de_identity_02 💤 | Die Schmetterlinge sagen, du bist der mutigste Held, den sie kennen. | ✅ | Same pattern |
| de_identity_03 | Weißt du was? Du bist jemand, auf den man sich verlassen kann. | ✅ | Atomic-Habits identity shift |
| de_identity_04 | Die Wiese erzählt Geschichten über dich. Lauter gute! | ✅ | Warm |

**Cuts:** 0 of 4.

---

## Mood-aware — 12 lines

All 12 are strong. Keep as-is. Note that `de_mood_sad_04` is intentionally a meta-joke ("I can't give a hug — but imagine one") that needs the right voice inflection to land; re-recording is a good moment to nail it.

**Cuts:** 0 of 12.

---

## Trait-gated 🔒 — 7 lines

| ID | Text | Verdict | Why |
|---|---|---|---|
| de_trait_brave_01 | Du bist jemand, der nicht aufgibt. Das weiß ich jetzt. | ✅ | Identity |
| de_trait_brave_02 | Mutig sein heißt nicht, keine Angst zu haben. Du weißt das. | ✏️ | Sentiment is right but phrasing reads adult-philosophical. Rewrite simpler. Suggested: "Mutig ist nicht, keine Angst zu haben. Mutig ist trotzdem machen. Das bist du." |
| de_trait_gentle_01 | Deine Ruhe tut allen gut. Auch mir. | ✅ | Body-sense |
| de_trait_patient_01 | Du wartest geduldig — das können nicht alle. Ich lerne von dir. | ✅ | Role reversal |
| de_trait_mapmaker_01 | Der Entdecker ist zurück! Was findest du heute? | ✅ | Already updated today |
| de_trait_curious_01 💤 | Du stellst immer die besten Fragen. Was fragst du dich heute? | ✅ | Invites |
| de_trait_multi_01 | Du hast schon so viele Stärken. Du wirst ein großer Held. | ✅ | |

**Cuts:** 0 of 7. Rewrite: 1.

---

## Summary

- **Current registered bank:** 65 lines
- **Recommended cuts:** 9 lines (~14%)
- **Recommended rewrites:** 1 line
- **After audit:** 56 lines to re-record, incl. 13 dormant-trigger lines that need their triggers wired too (quest_complete + idle + de_trait_curious_01)

---

## Direct-play lines (bypass engine, fire unconditionally)

These don't compete for cooldown, they just fire when their feature runs. Review separately since they're feature-tied:

- **Stamina:** `de_stamina_low_01`, `de_stamina_exhausted_01`, `de_stamina_restored_01` — keep, but restored_01 isn't actually played anywhere (dead audio asset).
- **Tooth-brush:** `de_teeth_start`, `de_teeth_topright`, `de_teeth_bottomleft`, `de_teeth_bottomright`, `de_teeth_halfway`, `de_teeth_done` — keep (functional).
- **Brush-zone (Tasche-mode):** `de_brush_zone_1..6`, `de_brush_done_01` — never generated. Generate or drop the feature.
- **Screen-timer:** 14 lines (`de_screen_*` + `de_screentime_*`) — audit separately when we revisit Funkelzeit.
- **Slowdown:** `de_slowdown_01` — referenced by `useQuietAttention`, never generated.
- **Forscher-Ecke:** `de_forscher_new_01` — referenced by `AttentionGlow`, never generated.
- **Journal/discovery/egg:** existing, rarely fire — leave alone.
