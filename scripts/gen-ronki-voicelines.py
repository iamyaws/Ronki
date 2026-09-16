"""Generate the full Ronki voice bank from docs/voice/ronki-voicelines.md.

Single source of truth: docs/voice/ronki-voicelines.md. The doc holds two JSON
code blocks — voice profiles + the line list — and this script parses
them, routes each line to the right output directory based on the
character (`ronki` → public/audio/ronki/, `drachenmutter` →
public/audio/narrator/), and generates an MP3 per line via ElevenLabs.

Replaces the older split (gen-ronki-voice-bank.py + gen-ronki-voice-bank-en.py
+ gen-ritual-audio.py + gen-pilzhueter-audio.py + ...) with one consolidated
pipeline. Old scripts kept in repo for reference / one-off re-runs.

Usage:
  python scripts/gen-ronki-voicelines.py              # print plan, no API calls
  python scripts/gen-ronki-voicelines.py --smoke      # 3 umlaut + voice + routing check
  python scripts/gen-ronki-voicelines.py --full       # all 50 lines, skip existing MP3s
  python scripts/gen-ronki-voicelines.py --full --regen   # overwrite everything

Env: ELEVENLABS_API_KEY in .env.local (falls back to .env).
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Hardcoded base because Python on Windows mangles __file__ paths that
# contain umlauts. Same workaround the other gen scripts use.
# This is the drachennest worktree's copy — points at drachennest paths
# so MeetRonki audio lands here, not on main. The .env.local can stay
# on the main worktree (shared API key); we fall through to main if the
# drachennest copy is missing.
_REPO = 'C:\\Users\\öööö\\ronki'
_MAIN = 'C:\\Users\\öööö\\louis-quest'
DOC_PATH = _REPO + '\\docs\\ronki-voicelines.md'
ENV_CANDIDATES = [
    _REPO + '\\.env.local', _REPO + '\\.env',
    _MAIN + '\\.env.local', _MAIN + '\\.env',
]

MODEL_ID = 'eleven_multilingual_v2'


# ─── Markdown parser ─────────────────────────────────────────────────────────
#
# The doc has two fenced ```json code blocks: profiles, then lines. We pull
# them in order rather than naming them — keeps the doc clean (no "BEGIN
# PROFILES" markers) and the parser tiny.

_FENCE_RE = re.compile(r'```json\s*\n(.*?)\n```', re.DOTALL)


def parse_doc(path):
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    blocks = _FENCE_RE.findall(src)
    if len(blocks) < 2:
        raise RuntimeError(
            f'Expected ≥2 ```json blocks in {path}, got {len(blocks)}. '
            'Profiles must be the first JSON block, lines the second.'
        )
    try:
        profiles = json.loads(blocks[0])
    except json.JSONDecodeError as e:
        raise RuntimeError(f'First JSON block (profiles) parse error: {e}') from e
    try:
        lines = json.loads(blocks[1])
    except json.JSONDecodeError as e:
        raise RuntimeError(f'Second JSON block (lines) parse error: {e}') from e

    # Optional smoke subset can be in the 3rd block. Nice-to-have, not required.
    smoke_ids = []
    if len(blocks) >= 3:
        try:
            smoke_ids = json.loads(blocks[2])
        except json.JSONDecodeError:
            smoke_ids = []

    if not isinstance(profiles, dict) or not isinstance(lines, list):
        raise RuntimeError('Profiles must be an object, lines must be a list.')

    # Default smoke if doc doesn't define one — first 3 lines.
    if not smoke_ids:
        smoke_ids = [l.get('id') for l in lines[:3] if l.get('id')]

    return profiles, lines, smoke_ids


# ─── Plumbing ────────────────────────────────────────────────────────────────


def load_api_key():
    for path in ENV_CANDIDATES:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for raw in f:
                    line = raw.strip()
                    if line.startswith('ELEVENLABS_API_KEY='):
                        return line.split('=', 1)[1].strip('"').strip("'")
                    if line.startswith('VITE_ELEVENLABS_API_KEY='):
                        return line.split('=', 1)[1].strip('"').strip("'")
        except FileNotFoundError:
            continue
    raise RuntimeError(
        'ELEVENLABS_API_KEY not found (tried: ' + ', '.join(ENV_CANDIDATES) + ')'
    )


def output_path(profile, line_id):
    """Resolve the MP3 path for a line, given its character profile."""
    out_dir = profile['output_dir']
    if not os.path.isabs(out_dir):
        out_dir = os.path.join(_REPO, out_dir.replace('/', os.sep))
    return os.path.join(out_dir, f'{line_id}.mp3')


def detect_lang(line_id):
    """Hint the multilingual model. de_* → 'de', en_* → 'en', else infer none.

    Narrator IDs (parent_zone_intro / ritual_* / onboarding_welcome) carry
    no lang prefix but the script content is always German today. Default
    to 'de' when no en_ prefix is present.
    """
    if line_id.startswith('en_'):
        return 'en'
    return 'de'


def generate(api_key, voice_id, voice_settings, text, language_code, out_path):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    body = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'language_code': language_code,
        'voice_settings': voice_settings,
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
            # Some tiers reject language_code — retry without it.
            body2 = json.dumps({
                'text': text,
                'model_id': MODEL_ID,
                'voice_settings': voice_settings,
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

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(audio)
    return len(audio)


def run_batch(api_key, profiles, lines_to_run, label, regen=False):
    print(f'\n▶ {label}: {len(lines_to_run)} line(s)')
    print(f'  Doc: {DOC_PATH}')
    if regen:
        print('  Mode: regen (overwrite existing MP3s)')
    else:
        print('  Mode: skip-existing (only generates missing MP3s)')
    print('')

    ok = 0
    fail = 0
    skipped = 0
    for i, line in enumerate(lines_to_run, 1):
        line_id = line.get('id')
        character = line.get('character')
        text = line.get('text', '')
        if not line_id or not character or not text:
            print(f'[{i:02d}] ✗ missing id/character/text — skipped')
            fail += 1
            continue
        profile = profiles.get(character)
        if not profile:
            print(f'[{i:02d}] {line_id} ✗ no profile for character "{character}"')
            fail += 1
            continue

        out_path = output_path(profile, line_id)
        preview = text if len(text) < 56 else text[:53] + '…'
        char_tag = profile.get('voice_name', character)[:14]
        if not regen and os.path.exists(out_path) and os.path.getsize(out_path) > 1024:
            print(f'[{i:02d}/{len(lines_to_run)}] {line_id:<28} skip (exists)')
            skipped += 1
            continue
        print(f'[{i:02d}/{len(lines_to_run)}] {line_id:<28} [{char_tag}] {preview}')
        try:
            size = generate(
                api_key,
                voice_id=profile['voice_id'],
                voice_settings=profile['settings'],
                text=text,
                language_code=detect_lang(line_id),
                out_path=out_path,
            )
            print(f'   ✓ {size // 1024} KB')
            ok += 1
        except Exception as e:
            print(f'   ✗ {e}')
            fail += 1
        if i < len(lines_to_run):
            time.sleep(0.7)

    tail = f', {skipped} skipped' if skipped else ''
    print(f'\n{label} done: {ok} ok, {fail} failed{tail}')
    return ok, fail


# ─── CLI ─────────────────────────────────────────────────────────────────────


def main():
    ap = argparse.ArgumentParser(
        description='Generate Ronki + Drachenmutter audio from docs/voice/ronki-voicelines.md',
    )
    ap.add_argument('--smoke', action='store_true',
                    help='Generate only the 3-line smoke subset (umlaut + voice + routing check).')
    ap.add_argument('--full', action='store_true',
                    help='Generate the full bank.')
    ap.add_argument('--regen', action='store_true',
                    help='Overwrite existing MP3s instead of skipping (use with --full or --smoke).')
    args = ap.parse_args()

    profiles, lines, smoke_ids = parse_doc(DOC_PATH)

    if not args.smoke and not args.full:
        # Plan-only — no API calls
        print(f'Ronki voicelines pipeline — DB: {DOC_PATH}')
        print(f'  Profiles: {", ".join(profiles.keys())}')
        print(f'  Lines:    {len(lines)}')
        # Quick character distribution count
        counts = {}
        for line in lines:
            c = line.get('character', '?')
            counts[c] = counts.get(c, 0) + 1
        for char, n in counts.items():
            out = profiles.get(char, {}).get('output_dir', '?')
            print(f'    {char:<16} {n:>3} → {out}')
        print(f'  Smoke:    {len(smoke_ids)} line(s)')
        print('')
        print('Run with --smoke first, then --full.')
        return

    api_key = load_api_key()

    if args.smoke:
        smoke_lines = [l for l in lines if l.get('id') in smoke_ids]
        run_batch(api_key, profiles, smoke_lines, 'SMOKE TEST', regen=args.regen)
        print('\nListen to the smoke files. If umlauts + both output dirs look right, run --full.')
        return

    if args.full:
        run_batch(api_key, profiles, lines, 'FULL BANK', regen=args.regen)


if __name__ == '__main__':
    main()
