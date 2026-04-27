"""Generate the English Ronki voice bank in Harry's voice.

Companion to gen-ronki-voice-bank.py (DE). Produces MP3s for all 30 lines
currently defined in src/companion/lines/en.ts so that English-speaking
kids have a functional base on first-use. EN audio didn't exist before
this script (only text bubbles, silent playback on EN devices).

Scope mirrors en.ts 1:1:
  - 6 greetings (+1 time-of-day each: morning/afternoon/evening/night)
  - 6 sanctuary-open
  - 4 weather
  - 4 quest-complete (incl. 1 streak variant)
  - 3 care actions
  - 4 idle wonder
  - 3 arc phases
  = 30 lines

Not in scope (EN bank is narrower than DE — separate content expansion):
  - mood-aware (12 lines DE-only)
  - trait-gated (7 DE-only)
  - identity (4 DE-only)
  - all_done celebration (8 DE-only)
  - freund_met (6 DE-only)
  - direct-play (stamina/teeth/screen/etc. — DE-only, feature audio)

Voice: Harry (`SOYHLrjzK2X1ezoPC6cr`) — same as Ronki DE so a bilingual
family gets a consistent character when switching languages.

Name-placeholder handling: two lines carry `{name}!` tokens for
text-bubble personalisation. Audio can't do dynamic names, so we render
those two with the name-stripped version that matches what the bubble
shows when childName is empty. Consistency over surprise.
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ─── Config ──────────────────────────────────────────────────────────────────

VOICE_ID = 'SOYHLrjzK2X1ezoPC6cr'  # Harry — same voice as DE for consistency
VOICE_NAME = 'Harry'
MODEL_ID = 'eleven_multilingual_v2'

# Same settings as DE — Harry's creaky young texture is the "Ronki voice"
# regardless of language, and kids who swap DE↔EN should hear continuity.
VOICE_SETTINGS = {
    'stability': 0.40,
    'similarity_boost': 0.80,
    'style': 0.55,
    'use_speaker_boost': True,
}

OUTPUT_DIR = r'C:\Users\öööö\louis-quest\public\audio\ronki'
ENV_PATH = r'C:\Users\öööö\louis-quest\.env.local'


# ─── Lines ───────────────────────────────────────────────────────────────────
#
# IDs match src/companion/lines/en.ts exactly. Audio text is what Harry
# actually says — matches bubble text except for the two {name} lines where
# we use the name-stripped form (bubble personalises dynamically via the
# substituteName helper; audio stays generic).

EN_LINES = {
    # Mirrors src/companion/lines/en.ts after the 2026-04-26 northstar pass.
    # Engine-routed only (direct-play stays in DIRECT_PLAY_EN below).

    # Greetings
    'en_greet_01':           'You’re here! Finally!',
    'en_greet_morning_01':   'Morning! I just yawned too.',
    'en_greet_afternoon_01': 'How was school? Tell me.',
    'en_greet_evening_01':   'Evening. It’s about to get cosy.',
    'en_greet_night_01':     'Dark outside. Warm in here.',

    # Sanctuary
    'en_sanct_01': 'You’re here! I was running in circles.',
    'en_sanct_02': 'Smell that? The meadow smells like adventure.',
    'en_sanct_03': 'You know what? I tried catching a butterfly today. Didn’t go great.',

    # Weather
    'en_w_rain_01': 'It’s raining! Puddles are the best.',
    'en_w_cold_01': 'Brrr! Bundle up. I’ve got scales, I’m fine.',
    'en_w_hot_01':  'So warm. I’m lying in the sun all day.',
    'en_w_snow_01': 'Snow! I’ve never— okay, yes, last year. Still beautiful.',

    # Idle
    'en_idle_01': 'Do you think clouds are as soft as they look?',
    'en_idle_02': 'I tried catching my own tail. Didn’t work.',
    'en_idle_03': 'What would you be if you weren’t a person? I’d be a… dragon. Oh wait, right.',

    # Mood
    'en_mood_sad_01':     'Hey... I’m a bit quiet today too. Want to just sit together?',
    'en_mood_tired_01':   'I’m yawning too. Let’s take it slow today.',
    'en_mood_happy_01':   'You’re glowing today. What happened?',
    'en_mood_okay_01':    'Somewhere-in-between is good too. Not every day has to sparkle.',
    'en_mood_worried_01': 'Did something happen? You can tell me — or just be here.',

    # Quest complete
    'en_quest_01':        'Did you just do that? Nice.',
    'en_quest_02':        'I was watching. That was really really good.',
    'en_quest_streak_01': 'Three already. You’re keeping a steady pace, I like that.',

    # All done — calm celebration
    'en_alldone_recognition_01': 'All done today. I see it, I see it.',
    'en_alldone_recognition_02': 'Today was a good day with you. Let’s sit a moment.',

    # Care
    'en_care_fed_01':  'Mmmm! Yum! Did you eat too?',
    'en_care_pet_01':  'Hihihi! That tickles! Again.',
    'en_care_play_01': 'Play! Come, catch me!',

    # Freund met
    'en_freund_met_01': 'Look who’s here.',
    'en_freund_met_02': 'My heart goes thumpthumpthump. That happens with new friends.',

    # Identity
    'en_identity_01': 'I told the fireflies you always brush your teeth. They were really impressed.',
    'en_identity_03': 'You know what? You’re someone who can be counted on. I’ve noticed that.',

    # Trait-gated
    'en_trait_brave_01':  'You’re someone who doesn’t give up. I know that now.',
    'en_trait_gentle_01': 'Your calm is good for everyone. Me too.',

    # Arc context (paused, harmless to keep)
    'en_arc_cooldown_01': 'I’m still resting from the last adventure. But you keep going!',
    'en_arc_cooldown_02': 'Phew, that was something. I need a little nap.',
    'en_arc_active_01':   'We’re in the middle of an adventure! Look up top.',
    'en_arc_active_02':   'Our adventure is waiting! I’m so excited.',

    # ── Character pass (2026-04-27) — fills silent prod surfaces.
    #    Mirrors the new DE entries; same triggers, kid-friendly EN.
    # Reward approved
    'en_reward_approved_01': 'You earned this. Go enjoy it.',
    'en_reward_approved_02': 'Off your stars go. Have fun.',

    # Gefühlsecke picker
    'en_gefuehl_pick_gut_01':        'Glad you’re feeling good.',
    'en_gefuehl_pick_wuetend_01':    'Angry is okay. Let’s breathe.',
    'en_gefuehl_pick_traurig_01':    'That’s allowed. I’m listening.',
    'en_gefuehl_pick_aengstlich_01': 'Everyone gets scared. Me too.',
    'en_gefuehl_pick_muede_01':      'Tired is smart. Rest a bit.',

    # Gefühlsecke tool wrap
    'en_gefuehl_done_gut_01':        'You’re shining. It rubs off on me too.',
    'en_gefuehl_done_wuetend_01':    'Good breathing. You’ve got this now.',
    'en_gefuehl_done_traurig_01':    'Thank you for showing me.',
    'en_gefuehl_done_aengstlich_01': 'Strong and still. Like a tree.',
    'en_gefuehl_done_muede_01':      'Sleep well. See you tomorrow.',

    # Evolution reveal
    'en_evolution_reveal_01': 'Look! I look different!',
    'en_evolution_reveal_02': 'I got bigger. Still feels the same inside.',
}

# Direct-play lines — played from feature code by ID, not via engine pick.
# When a user is in EN mode, the feature code calls playLocalized(baseId)
# which resolves to en_{baseId}; this dict is the EN side of that pair.
DIRECT_PLAY_EN = {
    # ── Stamina (MiniGames) ──
    'en_stamina_low_01':       'Phew, I\u2019m getting tired of flying. But one more\u2019s okay, I think.',
    'en_stamina_exhausted_01': 'I\u2019m all pooped out. Can you play without me for a bit?',
    'en_stamina_restored_01':  'All rested! Let\u2019s get going again.',

    # ── Screen timer ──
    'en_screen_start': 'Your Sparkle Time\u2019s going. Have fun!',
    'en_screen_half':  'Halfway through your time. All good?',
    'en_screen_5min':  'Five minutes left. Let it wind down nicely.',
    'en_screen_2min':  'Just two minutes left. Almost time to put it down.',
    'en_screen_1min':  'One minute. Final stretch!',
    'en_screen_done':  'Time\u2019s up. Great job \u2014 see you soon!',
    'en_screen_eyes':  'Look away for a sec. Eyes want a break too.',
    'en_screen_eyes2': 'Blink. Window, wall, far away.',
    'en_screen_eyes3': 'Don\u2019t forget to blink.',

    # ── Screentime tier milestones ──
    'en_screentime_50_01':   'We still have a bit of time together. What feels fun?',
    'en_screentime_20_01':   'Our time\u2019s almost up. Want to do something special with it?',
    'en_screentime_10_01':   'One minute, then we pause. You\u2019re doing great.',
    'en_screentime_done_01': 'Great job! See you later.',

    # ── Tooth brushing timeline ──
    'en_teeth_start':       'Brush time! We start top-left.',
    'en_teeth_topright':    'Top right. Small circles.',
    'en_teeth_bottomleft':  'Now bottom left.',
    'en_teeth_bottomright': 'Last corner. Bottom right.',
    'en_teeth_halfway':     'Halfway through. You\u2019re doing great.',
    'en_teeth_done':        'Done! Super clean.',

    # ── Brushing — mid-session variety (parallel to de_teeth_mid_*) ──
    'en_teeth_mid_01':      'Don\u2019t stop! The back corners are tricky.',
    'en_teeth_mid_02':      'Tiny circles! Pea-sized.',
    'en_teeth_mid_03':      'Hmm. My teeth are itchy too. Maybe we should both brush.',
    'en_teeth_mid_04':      'Don\u2019t forget the back! The brush is happy for every corner.',

    # ── Brushing — Ronki brushes too ──
    'en_teeth_ronki_01':    'I\u2019m brushing too! Dragon toothbrushes are a special kind.',
    'en_teeth_ronki_02':    'My teeth are tiny and sharp. But I still have to brush.',
    'en_teeth_ronki_03':    'Wait \u2014 where\u2019s my toothbrush? Ah, under the rock.',

    # ── Brushing — done variants ──
    'en_teeth_done_02':     'Done! I can see your teeth glitter from here.',
    'en_teeth_done_03':     'Two minutes done! That\u2019s longer than I can hold my breath.',

    # ── Journal ──
    'en_journal_done_01': 'You wrote that beautifully.',
    'en_journal_done_02': 'Your day sounds like something good.',
    'en_journal_done_03': 'Thanks for sharing. I\u2019ll remember that.',

    # ── Discovery ──
    'en_discover_creature': 'Look! A new friend! Let\u2019s get to know them.',

    # ── Egg (feature currently paused) ──
    'en_egg_found': 'Oh! An egg! Where did that come from?',
    'en_egg_hatch': 'It\u2019s moving! Something\u2019s about to happen!',
}

# Umlaut-heavy smoke-test isn't relevant for EN. Small 3-line sanity check
# covering different tones (greeting + sanctuary + care) so we can confirm
# the voice reads English naturally before committing to the full batch.
SMOKE_IDS = [
    'en_greet_any_01',   # "Hey! I was waiting for you!"
    'en_sanct_04',       # "Look over there — a dragonfly!"
    'en_care_play_01',   # "Play! Play! I'm the fastest."
]


# ─── Plumbing ────────────────────────────────────────────────────────────────

def load_api_key():
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for raw in f:
            line = raw.strip()
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
            if line.startswith('VITE_ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
    raise RuntimeError('ELEVENLABS_API_KEY not found in .env')


def generate(api_key, line_id, text):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}'
    body = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'language_code': 'en',  # nudge the multilingual model toward EN
        'voice_settings': VOICE_SETTINGS,
    }, ensure_ascii=False).encode('utf-8')

    req = urllib.request.Request(
        url, data=body, method='POST',
        headers={
            'xi-api-key': api_key,
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'audio/mpeg',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            audio = resp.read()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='replace')
        if 'language_code' in err_body.lower():
            # Some tiers reject language_code — retry without it, model auto-detects.
            body2 = json.dumps({
                'text': text,
                'model_id': MODEL_ID,
                'voice_settings': VOICE_SETTINGS,
            }, ensure_ascii=False).encode('utf-8')
            req2 = urllib.request.Request(
                url, data=body2, method='POST',
                headers={
                    'xi-api-key': api_key,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'audio/mpeg',
                },
            )
            with urllib.request.urlopen(req2, timeout=90) as resp:
                audio = resp.read()
        else:
            raise RuntimeError(f'HTTP {e.code}: {err_body}') from e

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f'{line_id}.mp3')
    with open(out_path, 'wb') as f:
        f.write(audio)
    return out_path, len(audio)


def run_batch(api_key, lines_dict, label, skip_existing=False):
    print(f'\n▶ {label}: {len(lines_dict)} lines')
    print(f'  Voice: {VOICE_NAME} ({VOICE_ID})')
    print(f'  Model: {MODEL_ID} · language=en')
    print(f'  Output: {OUTPUT_DIR}')
    if skip_existing:
        print(f'  Mode:   skip-existing (only regenerates missing files)')
    print('')

    ok = 0
    fail = 0
    skipped = 0
    for i, (line_id, text) in enumerate(lines_dict.items(), 1):
        preview = text if len(text) < 60 else text[:57] + '…'
        target = os.path.join(OUTPUT_DIR, f'{line_id}.mp3')
        if skip_existing and os.path.exists(target) and os.path.getsize(target) > 1024:
            print(f'[{i:02d}/{len(lines_dict)}] {line_id:<28} skip (exists)')
            skipped += 1
            continue
        print(f'[{i:02d}/{len(lines_dict)}] {line_id:<28} {preview}')
        try:
            path, size = generate(api_key, line_id, text)
            print(f'   ✓ {size // 1024} KB')
            ok += 1
        except Exception as e:
            print(f'   ✗ {e}')
            fail += 1
        if i < len(lines_dict):
            time.sleep(0.7)

    tail = f', {skipped} skipped' if skip_existing else ''
    print(f'\n{label} done: {ok} ok, {fail} failed{tail}')
    return ok, fail


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--smoke', action='store_true',
                    help='Generate 3 sanity-check lines only (quick listen-test)')
    ap.add_argument('--full', action='store_true',
                    help='Generate the full EN bank (30 lines)')
    ap.add_argument('--skip-existing', action='store_true',
                    help='Only regenerate lines whose MP3 is missing')
    args = ap.parse_args()

    if not args.smoke and not args.full:
        print(f'EN Ronki voice bank — {VOICE_NAME}')
        print(f'  Engine lines:  {len(EN_LINES)}')
        print(f'  Direct-play:   {len(DIRECT_PLAY_EN)}')
        print(f'  Total:         {len(EN_LINES) + len(DIRECT_PLAY_EN)}')
        print(f'  Smoke subset:  {len(SMOKE_IDS)}')
        print('\nRun with --smoke first, then --full.')
        return

    api_key = load_api_key()

    if args.smoke:
        smoke = {k: EN_LINES[k] for k in SMOKE_IDS if k in EN_LINES}
        run_batch(api_key, smoke, 'SMOKE TEST (EN)')
        print('\nListen to the 3 files. If Harry reads English naturally, run --full.')
        return

    if args.full:
        skip = args.skip_existing
        ok1, fail1 = run_batch(api_key, EN_LINES, 'ENGINE-ROUTED LINES (EN)', skip_existing=skip)
        ok2, fail2 = run_batch(api_key, DIRECT_PLAY_EN, 'DIRECT-PLAY LINES (EN)', skip_existing=skip)
        total_ok = ok1 + ok2
        total_fail = fail1 + fail2
        print(f'\n━━━ Full EN batch: {total_ok} ok, {total_fail} failed ━━━')


if __name__ == '__main__':
    main()
