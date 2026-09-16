import type { VoiceLine } from '../types';

/**
 * Ronki's voice — engine-routed line bank, German.
 *
 * Source of truth for content + tone: docs/voice/ronki-voicelines.md (the northstar
 * voice rewrite, 2026-04-26). This file is the React-engine-readable version
 * of the engine-routed subset of that doc — direct-play lines (stamina,
 * teeth, screen, journal, garden, witness, elder, onboarding, narrator) live
 * in feature code via VoiceAudio.playLocalized(...) and are NOT registered
 * here. Direct-play registration would let the random picker surface them
 * out of context (e.g. "Sonntag. Was pflanzt du?" on a Tuesday hub_open).
 *
 * Character: Ronki = Louis's age in dragon years. Curious, easily amazed,
 * a little clumsy, full of wonder. Short sentences. Strong opinions about
 * small things (puddles are great). Never lectures. Celebrates alongside
 * Louis, never above him. Quiet in mood-sad / evening / night moments.
 *
 * Identity-language lines ("Ich hab den Glühwürmchen erzählt…") shift
 * motivation from external reward to self-concept (Atomic Habits).
 *
 * Direct-play audio IDs (NOT registered here, played by feature code):
 *   stamina_low_01 / stamina_exhausted_01
 *   teeth_start / teeth_topright / teeth_bottomleft / teeth_bottomright
 *     / teeth_halfway / teeth_done / teeth_done_02 / teeth_done_03
 *     / teeth_mid_01..04 / teeth_ronki_01..03
 *   screen_start / screen_half / screen_5min / screen_2min / screen_1min
 *     / screen_done / screen_eyes / screen_eyes2 / screen_eyes3
 *     / screentime_50_01 / screentime_20_01 / screentime_10_01 / screentime_done_01
 *   journal_done_01 / journal_done_02 / journal_done_03
 *   discover_creature
 *   parent_zone_intro / ritual_start / ritual_ask / ritual_goodnight
 *     / onboarding_welcome (Drachenmutter narrator — public/audio/narrator/)
 *   onboarding_kid_intro_01 / lagerfeuer_arrival_01 (Ronki onboarding,
 *     fired by App.jsx onboarding orchestrator)
 *   garden_plant_offer_01 / garden_planted_01 / garden_quiet_week_01
 *     / garden_decor_placed_01 / garden_visit_back_01
 *   witness_invite_monthly_01 / witness_reveal_tree_01
 *     / witness_invite_season_01 / journey_reflection_01
 */

export const linesDe: VoiceLine[] = [
  // ═══════════════════════════════════════
  // GREETINGS — Hub open
  // ═══════════════════════════════════════
  { id: 'de_greet_01', text: 'Du bist da! Endlich!', triggers: ['hub_open'] },
  { id: 'de_greet_morning_01', text: 'Morgen! Ich hab schon gegähnt.', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'de_greet_afternoon_01', text: 'Wie war Schule? Komm, erzähl.', triggers: ['hub_open'], timeOfDay: ['afternoon'] },
  { id: 'de_greet_evening_01', text: 'Abend. Bald wird\'s gemütlich.', triggers: ['hub_open'], timeOfDay: ['evening'] },
  { id: 'de_greet_night_01', text: 'Draußen dunkel. Hier ist\'s warm.', triggers: ['hub_open'], timeOfDay: ['night'] },

  // ═══════════════════════════════════════
  // SANCTUARY — Ronki's home
  // ═══════════════════════════════════════
  { id: 'de_sanct_01', text: 'Du bist da! Ich bin im Kreis gelaufen vor Freude.', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_02', text: 'Riech mal! Die Wiese riecht nach Abenteuer.', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_03', text: 'Weißt du was? Ich hab heut versucht, einen Schmetterling zu fangen. Hat nicht geklappt.', triggers: ['sanctuary_open'] },

  // ═══════════════════════════════════════
  // WEATHER — context-aware observations
  // ═══════════════════════════════════════
  { id: 'de_w_rain_01', text: 'Es regnet! Pfützen sind das Beste.', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
  { id: 'de_w_cold_01', text: 'Brrr! Zieh dich warm an. Ich hab ja Schuppen, ich pack das.', triggers: ['hub_open', 'sanctuary_open'], weather: ['cold'] },
  { id: 'de_w_hot_01', text: 'Voll warm. Ich liege heut den ganzen Tag in der Sonne.', triggers: ['hub_open', 'sanctuary_open'], weather: ['hot', 'clear'] },
  { id: 'de_w_snow_01', text: 'Schnee! Ich hab noch nie— okay, doch, letztes Mal schon. Trotzdem schön.', triggers: ['hub_open', 'sanctuary_open'], weather: ['snow'] },

  // ═══════════════════════════════════════
  // IDLE — wonder
  // ═══════════════════════════════════════
  { id: 'de_idle_01', text: 'Glaubst du, Wolken sind so weich, wie sie aussehen?', triggers: ['idle'] },
  { id: 'de_idle_02', text: 'Ich hab versucht, meinen eigenen Schwanz zu fangen. Hat nicht geklappt.', triggers: ['idle'] },
  { id: 'de_idle_03', text: 'Was wärst du, wenn du kein Mensch wärst? Ich wär ein… Drache. Ach, stimmt ja.', triggers: ['idle'] },

  // ═══════════════════════════════════════
  // MOOD-AWARE — soft when down, upbeat when happy
  // ═══════════════════════════════════════
  { id: 'de_mood_sad_01',     text: 'Hey... ich bin heut auch leise. Sollen wir einfach zusammen sein?', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'de_mood_tired_01',   text: 'Ich gähne auch. Lass uns heut langsam machen.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'de_mood_happy_01',   text: 'Du strahlst heut. Was ist passiert?', triggers: ['hub_open'], mood: ['magisch', 'gut'] },
  { id: 'de_mood_okay_01',    text: 'Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.', triggers: ['hub_open'], mood: ['okay'] },
  { id: 'de_mood_worried_01', text: 'Ist was passiert? Du kannst\'s mir erzählen — oder einfach da sein.', triggers: ['hub_open'], mood: ['besorgt'] },

  // ═══════════════════════════════════════
  // QUEST COMPLETE — recognition, not hype
  // ═══════════════════════════════════════
  { id: 'de_quest_01', text: 'Hast du das grad geschafft? Schön.', triggers: ['quest_complete'] },
  { id: 'de_quest_02', text: 'Ich hab zugeguckt. Das war richtig richtig gut.', triggers: ['quest_complete'] },
  { id: 'de_quest_streak_01', text: 'Drei schon. Du machst das ruhig weiter, das gefällt mir.', triggers: ['quest_complete'], minQuestsToday: 3 },

  // ═══════════════════════════════════════
  // ALL DONE — calm celebration on final-tap
  // ═══════════════════════════════════════
  { id: 'de_alldone_recognition_01', text: 'Alles geschafft heute. Ich seh\'s, ich seh\'s.', triggers: ['all_done'] },
  { id: 'de_alldone_recognition_02', text: 'Heute war ein guter Tag mit dir. Lass uns kurz sitzen.', triggers: ['all_done'] },
  // 5 stronger peak-day lines (Apr 2026 voice pass) — Marc: "all quest
  // complete needs strong ronki lines." Identity-language, body-physical
  // Ronki reactions, Dikka-warm peak energy without engagement-theater.
  { id: 'de_alldone_strong_01', text: 'Du hast wirklich alles geschafft. Alles. Du bist jemand, der das einfach durchzieht.', triggers: ['all_done'] },
  { id: 'de_alldone_strong_02', text: 'Schau dich an. Heute hast du nichts liegen gelassen.', triggers: ['all_done'] },
  { id: 'de_alldone_strong_03', text: 'Ich kann gar nicht stillsitzen. Du hast heute wirklich alles gemacht.', triggers: ['all_done'] },
  { id: 'de_alldone_strong_04', text: 'Mein Bauch kribbelt. Du hast es geschafft. Komplett.', triggers: ['all_done'] },
  { id: 'de_alldone_strong_05', text: 'Ich erzähl das später den Glühwürmchen. Sie werden mir nicht glauben.', triggers: ['all_done'] },

  // ═══════════════════════════════════════
  // CARE ACTIONS — companion interactions
  // ═══════════════════════════════════════
  { id: 'de_care_fed_01',  text: 'Mmmmm! Lecker! Hast du auch was gegessen?', triggers: ['care_action'], careAction: ['fed'] },
  { id: 'de_care_pet_01',  text: 'Hihihi! Das kitzelt! Nochmal.', triggers: ['care_action'], careAction: ['petted'] },
  { id: 'de_care_play_01', text: 'Spielen! Komm, fang mich!', triggers: ['care_action'], careAction: ['played'] },

  // ═══════════════════════════════════════
  // FREUND MET — quiet recognition, not hype
  // ═══════════════════════════════════════
  { id: 'de_freund_met_01', text: 'Schau mal, wer da ist.', triggers: ['freund_met'] },
  { id: 'de_freund_met_02', text: 'Mein Herz macht pongpongpong. Das passiert bei neuen Freunden.', triggers: ['freund_met'] },

  // ═══════════════════════════════════════
  // IDENTITY — magical witness + Atomic Habits framing
  // ═══════════════════════════════════════
  { id: 'de_identity_01', text: 'Ich hab den Glühwürmchen erzählt, dass du immer deine Zähne putzt. Die waren echt beeindruckt.', triggers: ['quest_complete'], minQuestsToday: 1 },
  { id: 'de_identity_03', text: 'Weißt du was? Du bist jemand, auf den man sich verlassen kann. Hab ich gemerkt.', triggers: ['hub_open'] },

  // ═══════════════════════════════════════
  // TRAIT-GATED — unlocks after earning the named trait
  // ═══════════════════════════════════════
  { id: 'de_trait_brave_01',  text: 'Du bist jemand, der nicht aufgibt. Das weiß ich jetzt.', triggers: ['hub_open', 'quest_complete'], requiredTraits: ['brave'] },
  { id: 'de_trait_gentle_01', text: 'Deine Ruhe tut allen gut. Auch mir.', triggers: ['hub_open', 'sanctuary_open'], requiredTraits: ['gentle'] },

  // ═══════════════════════════════════════
  // ARCS — paused per backlog_arc_offer_rework, but harmless to keep.
  // arcPhase is hardcoded to 'idle' in Hub.jsx today, so these never fire.
  // When Arcs reactivate, no audio gen needed — files already exist.
  // ═══════════════════════════════════════
  { id: 'de_arc_cool_01',   text: 'Ich ruh mich noch aus vom letzten Abenteuer. Aber mach ruhig weiter!', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'de_arc_cool_02',   text: 'Puh! Das war aufregend. Ich brauch ein Schläfchen.', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'de_arc_active_01', text: 'Wir haben ein Abenteuer! Schau mal oben!', triggers: ['hub_open'], arcPhase: 'active' },
  { id: 'de_arc_active_02', text: 'Unser Abenteuer wartet! Ich bin so gespannt!', triggers: ['hub_open'], arcPhase: 'active' },
];
