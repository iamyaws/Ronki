# Own read of the integrated Finch pass (26 Sep 2026, before Astra's code reply)

Browser walk on the dev server (375 x 812, DEV clock), fresh device, no card: Monday 07:10, then 17:05. Written before reading `astra-code-r1.txt`.

Works as specced: egg shelf first with the quiet card line; hatch clip; name chips; "Ich bin Funki! Und wie heißt du?" plus the parent ask with the pill at once; parent step (headline, loop lines, routine picker with 5 plus 4, evening chips, tip line, card link); handoff "Jetzt bist du wieder dran!"; "Hallo Mia! Jetzt kenn ich dich."; teach beat round 1 spark, round 2 flame, "Das hast du mir gezeigt."; FirstDayIntro three beats with the morning start line; Nest with the room, Ronki in the nest, his spoken task ask, fire 2 of 5 on day 1, Jetzt card with the task picture, "Später", two tabs; three tasks fill the fire, "Mein Feuer ist ganz warm!", DepartureSheet with stones and "Tschüss, Funki!"; empty nest and postcard; at 17:05 Ronki back in the nest with "Ich bin wieder da!", gift, TreasureReveal (Ahornblatt, Birkenpfad, story, stones), shelf; evening feelings ask; Traurig gives the sad reply and the sit offer; four evening tasks fill the evening fire, "Mein Feuer ist warm. Jetzt werd ich müde."; moon pill into TonightRitual. The Alpha banner no longer carries "DE ▸ EN" or "Rückmeldung".

Findings:

| ID | Severity | Where | Finding | Fix |
|---|---|---|---|---|
| O1 | SHOULD | RoomHub return beat | On the first day the Nest greets with "Guten Morgen! Ich hab von dir geträumt." right after the kid met Ronki. | No return line on the onboarding day (mark greeted silently). |
| O2 | SHOULD | DepartureSheet, TreasureReveal | `scenes/morgenwald.webp` is a painting of Ronki holding the maple leaf. Laid behind the cloud Ronki it shows two dragons; behind every treasure it shows the maple leaf. | Sky ground for both; the Morgenwald painting becomes the postcard picture on the AwayCard. |
| O3 | SHOULD | RoomHub away state | At 07:15, right after "Jetzt geht dein Tag los", the Nest offers the afternoon task "Bewegen" as a Jetzt card. The send-off should let the child put the tablet down. | While Ronki is away in the morning block: only the postcard, no task card. Afternoon tasks from the day block on. |
| O4 | SHOULD | TonightRitual | On the evening Ronki came back from the Birkenpfad with the maple leaf, the ritual tells one of the ten old lines ("Im Morgenwald war heute ein Reh..."), a different trip. Two stories for one day. | When a trip came back today, the ritual retells today's trip story (voiced `trip_story_NN`); the old lines only on days without a trip. |
| O5 | none | dev server | The page reloaded mid-ritual: Vite watches `docs/` and reloaded when a review file was written. Not an app bug. | none |
