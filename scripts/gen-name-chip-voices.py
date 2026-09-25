"""Generate the name-chip voice lines for the MeetRonki naming step.

Marc's go on 25 Sep 2026: six chips give Ronki a nickname, and each chip is
read aloud in Ronki's voice when tapped, so a pre-reader can pick by ear
(PRD section 5.2). Reuses Harry's voice, model and settings from
gen-ronki-voice-bank.py; the API key is read from the same .env file and
never printed.

Usage (from the repo root): python scripts/gen-name-chip-voices.py
Writes public/audio/ronki/de_name_chip_<id>.mp3 and skips existing files.
The ids and texts must match NAME_CHIPS in
src/components/drachennest/MeetRonki.jsx.
"""
import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

spec = importlib.util.spec_from_file_location('voicebank', os.path.join(HERE, 'gen-ronki-voice-bank.py'))
vb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vb)  # the bank only runs its batches under __main__
vb.OUTPUT_DIR = os.path.join(REPO, 'public', 'audio', 'ronki')

LINES = {
    'de_name_chip_ronki': 'Hmm... Ronki?',
    'de_name_chip_funki': 'Hmm... Funki?',
    'de_name_chip_flaemmchen': 'Hmm... Flämmchen?',
    # Glut and Knisti came out unclear as a single word (Whisper heard
    # 'Glott' and 'Christi'); said twice they transcribe cleanly.
    'de_name_chip_glut': 'Hmm... Glut. Gluut?',
    'de_name_chip_pieks': 'Hmm... Pieks?',
    'de_name_chip_knisti': 'Hmm... Knisti. Knis-ti?',
}


def main():
    key = vb.load_api_key()
    print(f'Voice {vb.VOICE_NAME} ({vb.VOICE_ID}), model {vb.MODEL_ID}, out {vb.OUTPUT_DIR}')
    for line_id, text in LINES.items():
        path = os.path.join(vb.OUTPUT_DIR, f'{line_id}.mp3')
        if os.path.exists(path):
            print(f'  skip {line_id} (exists)')
            continue
        out, size = vb.generate(key, line_id, text)
        print(f'  ok   {line_id}: {size // 1024} KB  "{text}"')


if __name__ == '__main__':
    sys.exit(main())
