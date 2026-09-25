# Finch teardown for Ronki (25 September 2026)

_Sources: Marc's screen recording of a fresh Finch install (`OnboardingFinch.mov.mp4`, 2 min 24 s, 51 frames read), the App Breakdown #55 video on Finch (YouTube xjhy91FlemQ, 11 Mar 2026, full transcript read), the screensdesign.com teardown of 10 onboarding screens, and the Finch section of `docs/prd/RONKI-V2-PRD.md` (7 Jul 2026 research). Frame contact sheets stay outside the repo (the repo is public and the frames are Finch's screens)._

## 1. The recorded sequence, screen by screen

| # | Time | Screen | What the user does | What it teaches |
|---|---|---|---|---|
| 1 | 0:00 | App Store: "Meet your new self care best friend" | opens | The promise is a friend, not a tracker |
| 2 | 0:03 | Splash: the grey bird, "Finch" | waits | One mascot, nothing else |
| 3 | 0:06 | "You found a Finch Egg!" plus one line of lore, pick pronouns | taps one of three, "Hatch egg" | You *found* something. The button says hatch, not sign up |
| 4 | 0:10 | Hatch with confetti | watches | Payoff in seconds |
| 5 | 0:14 | "You hatched a baby! What do you want to name her?" Field is **pre-filled** ("Tweeby"), a **Shuffle** button, "Next" | keeps or shuffles | The name is never an empty field |
| 6 | 0:30 | The chick speaks for the first time: "Cheep cheep, thanks for hatching me. It's so much brighter out here! But what is a 'name'?" Two answer chips | taps one (both are right) | **The pet asks you.** From minute one you teach it |
| 7 | 0:35 | "I am Peaches, hear me cheep!" Two reward chips: "+4.2 Compassion", "+125 Rainbow Stones" | Next | Your answer changed the pet. Growth is visible at once |
| 8 | 0:40 | "Do you also have a name?" | types own name | The pet wants to know *you* |
| 9 | 0:47 | "Daily check-ins. Help Peaches gain energy to develop her personality and grow! Build mindful habits to send Peaches on daily adventures!" | Next | The whole loop in one picture and two sentences |
| 10 | 0:51 | "Get support from Peaches", a mock notification: "From Peaches: I believe in you, cheep!" | Turn on / Maybe later | Notifications are the pet's voice, warm, never guilt |
| 11 | 1:05 | Email, skippable | skip | |
| 12 | 1:10 | "Start your self-care journey. Pick one easy goal to do every day with Peaches." A list of small goals with icons (drink water, make my bed, wash my face, 5 jumping jacks) | taps three | **The user picks the first goals.** Small, concrete, ticked green |
| 13 | 1:25 | Paywall with a trial timeline | skip | (not relevant for Ronki) |
| 14 | 1:28 | Full-colour card: "Day 1. Happy Monday! Baby Peaches thinks today is a special day! Help Baby Peaches gain full energy today so she can go out to explore and grow!" | "Start today" | Day one is an event |
| 15 | 1:30 | A quote, then "How are you feeling right now?" five faces | taps a face | One-tap mood, no words |
| 16 | 1:35 | Widget pitch, 4-step tutorial | No thanks | (Ronki equivalent: home-screen install for the parent) |
| 17 | 1:45 | **Home**: the pet in its room (nest, window, door), "Baby Peaches", "Day 1", place "Finchie Forest", **energy bar already at 5/10**, "3 goals left for today!", each goal shows "+5 energy" and a tick | ticks goals | One screen holds the pet, the meter and the list. The meter starts half full |
| 18 | 1:50 | Peaches' Mailbox, "The Weekly Feels" | glance | (newsletter, not relevant) |
| 19 | 2:04 | "Woohoo! Energized for Day 1. Peaches finished munching on Bread and feels a little stronger! Peaches is ready to go exploring today to learn something new!" | Done | Full meter is a moment with a small story |
| 20 | 2:13 | The background turns into a forest, "Adventuring... 8:00:34", sheet: "Peaches has started a new adventure! Peaches will have something to share with you after she completes today's adventure. Each adventure helps Peaches grow up! **1/7 adventures to evolve into toddler**" | Got it | **The appointment.** The pet leaves, the world changes, it will come back with something. Growth is counted in adventures and the next step is shown |

Two minutes from install to a pet that is out on its first adventure. The user did three small goals, and the first adventure started on day one because the meter was pre-filled halfway.

## 2. What the breakdown adds (beyond the recording)

- "Hatch a new pet" replaces "Create account"; everything before the paywall is investment, not setup.
- The trait picker animates the pet's feelings as you tap; "Sushi gained logic" after a no-wrong-answer question.
- Goal sheet: complete, **skip**, **snooze**. Skipping is a normal action, not a failure.
- After the first completion a neighbour visits (Mr. Pickles) and you can send him good vibes. Warmth from a second character, unasked.
- Full energy feels like a Pokémon evolution beat: the pet grows a little, you get stones, then you send it off.
- While away, the home background changes and the pet is gone for 8 hours. The reviewer: "a very high chance that I'm actually going to open the app to see what the adventure was about."
- The profile "passport" is called the best screen in the app: age in days, "pals with" the human, the human's name, weight, personality that grows with how you interact, collections (micropets, discoveries, places, foods).
- The shop sells outfits and furniture for stones; stones also come from inviting friends. Rerolls every 6 hours.
- Streak from day 1, a commitment streak, two streak repairs. The reviewer himself argues these can hurt: one missed day after 30 and the user never returns.

## 3. Why Finch works (the ten mechanics under the surface)

1. **Invest before friction.** Egg, hatch and name come before any account, form or payment.
2. **Care inversion.** Your small actions give *the pet* energy. You are not scoring yourself; you are looking after someone.
3. **The pet talks and asks.** It asks what a name is, asks your name, learns traits from your answers. It is a relationship, not a checklist with a mascot.
4. **Suggestion first, typing last.** Pre-filled name with shuffle, answer chips, a goal list to pick from. Nothing starts empty.
5. **One loop, one meter, one screen.** Pet, energy bar and today's goals share the home screen. Everything else lives behind tabs.
6. **The cold start is solved on purpose.** Day 1 starts at half energy, so the first adventure happens on the first day.
7. **The appointment.** The pet leaves for hours, the room changes, it comes back with something to share. The reason to return is curiosity, not fear of loss.
8. **Growth counted in adventures, next step visible.** "1/7 adventures to evolve into toddler". Absence never subtracts.
9. **Forgiving by design.** Skip and snooze are first-class; the pet never dies and never sulks.
10. **Pride of ownership.** The passport and the dress-up make the pet *yours*: its age, its traits, its places, its things.

## 4. What must not come across to Ronki

Kids of 5 to 8 feel loss harder than adults (PRD section 3.3). These stay out, permanently:

- Day-1 streaks, commitment streaks, streak repairs, any "broken" state.
- Rerolls, timed shop rotations, randomised rewards.
- Referral currency, friend invites, email capture, paywalls in the kid flow.
- Self-diagnosis questionnaires (Finch asks about ADHD and anxiety; Ronki never asks a child that).
- Session-lengthening surfaces: infinite lists, a shop to browse, "one more thing" prompts.
- Guilt notifications. If Ronki ever sends one, it is parent-controlled, off by default, content-forward ("Ronki ist zurück").

## 5. The translation rule for Ronki

Finch's loop maps onto a school day almost without change, which is why the v2 PRD adopted it in July: **the kid's morning fills Ronki's fire, a full fire sends Ronki out while the kid is at school, and he is back at evening routine time with a story.** What Finch adds on top of the PRD, and what the recording makes concrete:

| Finch detail | Ronki shape |
|---|---|
| Pre-filled name + Shuffle | Six voiced name chips (built 25 Sep) |
| The pet's first question with two right answers | Ronki's first question to the kid, answered by tapping a picture; Ronki learns it and the passport remembers it |
| "Do you also have a name?" | Ronki says the kid's name out loud (the parent typed it); the kid confirms with one tap |
| One screen explains the loop | One picture: tasks warm the fire, a warm fire means an adventure |
| Pick your easy goals | The kid picks the pictures of the first morning things; the parent can change them later |
| Day 1 is special and starts half full | "Heute ist unser erster Tag!" The fire starts half warm, so the first adventure happens today |
| Home = pet + meter + list | Nest = Ronki + fire + the next things to do, nothing else loud |
| Adventure with countdown and changed room | Ronki flies out; the nest shows he is away and when he is back (sun and moon, not a clock, for pre-readers) |
| "1/7 adventures to evolve" | Adventure dots on the fire: "Noch 4 Abenteuer, dann wird Ronki größer" |
| Passport | Ronki's page: name, days old, friend of {kid}, adventures, places, treasures, things learned from the kid |
