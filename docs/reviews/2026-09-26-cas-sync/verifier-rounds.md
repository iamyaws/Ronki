# Claude adversarial verifier: seven rounds on the CAS client (26 Sep 2026)

One Opus agent, resumed each round, ran its own vitest experiments (from round 2 with the real supabase-js client and an in-process fake fetch; never against supabase.co). Every finding below has a regression test in `src/utils/storage.cas.test.ts` or `src/utils/mergeState.test.ts` that fails on the code before its fix.

| Round | Findings | Fix commit |
|---|---|---|
| 1 | F2 BLOCKER a merge the hide flush ignores was overwritten by the next write (= Astra CAS-01); F1 HIGH `totalQuestCompletions` flattened to 0; F3 two writes of one page merged against each other; F4 a landed write without its answer merged against itself; F5 keepsakes twice, games and badges lost; F6 any error naming the function downgraded to the old write | 80e1b2b |
| 2 | R2-1 HIGH supabase-js reports a network failure as an error with an empty code, not a throw; R2-2 HIGH a lagging local copy undid progress at cold start; R2-3 a previous page's write landing after a restart; R2-4 a hung request blocked every later save; R2-5 a second unanswered write replaced the first; R2-6 a trip tie undid a new evening start | 13fa4fd, c25d6aa |
| 3 | R3-1 BLOCKER a full 20-id list dropped the base for every offline write; R3-2 HIGH a boot whose read failed wiped the bookkeeping; R3-3 the merge without a base took back Sterne | 7e96e52 |
| 4 | R4-1 MEDIUM the cap of 10 unanswered writes evicted the one that had landed; R4-2 LOW designed fallback after 20 foreign writes (kept); R4-3 LOW local copy size | f49d99a |
| 5 | R5-1 MEDIUM writes a gateway refuses without a code (while reads work) wedged the sync | 0e2c734 |
| 6 | R6-1 LOW a stuck upload was given up on but not aborted; R6-2 LOW a clock set forward aged a write early; R6-3 LOW a clock set back paused saves | 06608fe |
| 7 | CLEAN: nothing at MEDIUM or above; the real postgrest builder honours the abort signal | |

Still open, documented or accepted: after 20 or more writes by other devices following a lost answer, this device's gains merge without a base (larger balance, nothing counted twice); the merge without a base keeps the larger balance; saves paused while offline are not retried by a timer (the next change, the pagehide flush or the next start sends them); Marc accepted that rewards from the same event outside task ticks can be counted twice in a race.

Tokens: about 470k for the verifier across the seven rounds, plus two Astra passes on the ChatGPT plan.
