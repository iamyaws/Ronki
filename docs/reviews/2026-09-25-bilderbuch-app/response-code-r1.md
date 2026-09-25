# Response to Astra's code review, round 1 (25 Sep 2026)

Astra's verbatim output: `astra-code-r1.launch.txt` (adversarial review, base `fe9efd7`, scope branch, verdict NOT YET). Own read written first: `own-read-code-r1.md`.

| ID | Astra | Response | What changed |
|---|---|---|---|
| R1 BLOCKER | A failed image load adds the URL to a session-wide set, so a flaky connection can hide Ronki until reload | **AGREE** (independent: own read point 2 found the same) | `MoodChibi.jsx`: the shared `MISSING` set is gone. Each instance walks its own fallback list, the list restarts on remount, when the candidates change, and on the browser's `online` event. |
| R2 SHOULD | Stage 1 always shows the baby art, so tools that switch a hatchling from worried to calm (GedankenWolkenTool, HoermomentTool) show no change | **AGREE** | `resolveRonkiArt`: stage 1 shows the baby art only for calm and happy; every other mood shows its own expression, drawn smaller (the existing 0.82 scale). Test updated with the worried and heavy cases. |
| R3 SHOULD | `variant` is ignored while MeetRonki and RonkiCompendium still offer colours; keep variant-aware rendering until a migration exists | **PARTLY** | Kept: Ronki is always red-orange (plan section 5; the Bilderbuch brief makes ember Ronki's colour and Marc chose "the same look everywhere"). Six recoloured art sets would be six times the art and would drift. Fixed: nothing may promise a colour that no longer shows. `RonkiCompendium` section 1 ("Sechs Farben") now shows the four eggs and the hatchling with the line "Heraus kommt immer Ronki"; lane B owns MeetRonki and collapses the egg choice to four eggs without a colour promise. The saved `companionVariant` field stays untouched, so no migration is needed and the choice can come back if Marc wants it. Listed as a decision for Marc in the handoff. |

Not a finding but checked: Astra confirms navigation handlers and celebration gating are unchanged (own read point 3 asked for exactly that).

Open for round 2: only R3, if Marc wants variant colours back.
