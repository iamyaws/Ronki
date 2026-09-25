"""Generate Ronki's Finch-pass voice lines (26 Sep 2026).

Reads every line and trip from src/data/finchLines.de.json and records it
in Harry's voice with the model and settings of gen-ronki-voice-bank.py,
into THIS repo's public/audio/ronki/ (the bank script's own OUTPUT_DIR
points at the old louis-quest folder). The API key is read by the bank
module from its .env file and never printed. Existing files are skipped.

Usage (from the repo root):
  python scripts/gen-finch-voice.py --smoke     # two lines, to check key and voice
  python scripts/gen-finch-voice.py             # everything missing
  python scripts/gen-finch-voice.py --check     # local Whisper check of every file (openai-whisper)

Lines use their "spoken" text when present (names are never voiced).
Trips become trip_story_NN and trip_hook_NN.
"""
import argparse
import importlib.util
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA = os.path.join(REPO, 'src', 'data', 'finchLines.de.json')
OUT = os.path.join(REPO, 'public', 'audio', 'ronki')


def load_bank():
    spec = importlib.util.spec_from_file_location('voicebank', os.path.join(HERE, 'gen-ronki-voice-bank.py'))
    vb = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(vb)  # the bank only runs its batches under __main__
    vb.OUTPUT_DIR = OUT
    return vb


def all_lines():
    with open(DATA, encoding='utf-8') as f:
        data = json.load(f)
    items = []
    for line_id, line in data['lines'].items():
        items.append((f'de_{line_id}', line.get('spoken') or line['text']))
    for trip in data['trips']:
        nn = trip['id'][1:]
        items.append((f'de_trip_story_{nn}', trip['story']))
        items.append((f'de_trip_hook_{nn}', trip['hook']))
    for file_id, text in items:
        if '—' in text or '–' in text:
            raise SystemExit(f'dash in {file_id}: {text!r}')
        if '{' in text:
            raise SystemExit(f'unfilled name placeholder in the spoken text of {file_id}: {text!r}')
    return items


def norm(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = re.sub(r"[^a-zäöüß ]+", ' ', s)
    return ' '.join(s.split())


def check(items):
    import whisper  # openai-whisper, installed on this machine
    model = whisper.load_model('large-v3-turbo')
    bad = []
    for file_id, text in items:
        path = os.path.join(OUT, f'{file_id}.mp3')
        if not os.path.exists(path):
            print(f'  MISSING {file_id}')
            bad.append(file_id)
            continue
        heard = model.transcribe(path, language='de', fp16=False)['text'].strip()
        want, got = norm(text).split(), norm(heard).split()
        hit = sum(1 for w in want if w in got)
        score = hit / max(1, len(want))
        flag = 'ok  ' if score >= 0.8 else 'LOW '
        if score < 0.8:
            bad.append(file_id)
        print(f'  {flag}{score:.2f} {file_id}: heard {heard!r}')
    print(f'{len(items) - len(bad)} of {len(items)} ok')
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--smoke', action='store_true')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--only', nargs='*', help='file ids (de_...) to (re)generate, overwriting')
    args = ap.parse_args()

    items = all_lines()
    if args.check:
        bad = check(items)
        return 1 if bad else 0

    vb = load_bank()
    key = vb.load_api_key()
    print(f'Voice {vb.VOICE_NAME} ({vb.VOICE_ID}), model {vb.MODEL_ID}, out {OUT}')
    todo = items[:2] if args.smoke else items
    if args.only:
        wanted = set(args.only)
        todo = [it for it in items if it[0] in wanted]
    for file_id, text in todo:
        path = os.path.join(OUT, f'{file_id}.mp3')
        if os.path.exists(path) and not args.only:
            print(f'  skip {file_id} (exists)')
            continue
        _, size = vb.generate(key, file_id, text)
        print(f'  ok   {file_id}: {size // 1024} KB  {text!r}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
