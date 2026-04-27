"""Generate 4 Drachenmutter narrator audio lines for the Pilzhüter arc via ElevenLabs.

Voice: Eleonore | Reflective & Gentle Guide (jO00l6thH9mRUIF1vSux),
locked 2026-04-27 (replaced Bella → Charlotte → Eleonore as the
Drachenmutter voice). German-native, slow narrator settings.
Uses real UTF-8 umlauts (not "ae" substitutes) for proper German pronunciation.
"""
import os
import sys
import time
import urllib.request
import urllib.error
import json

# Force UTF-8 stdout for Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VOICE_ID = 'jO00l6thH9mRUIF1vSux'  # Eleonore | Reflective & Gentle Guide (Drachenmutter)
MODEL_ID = 'eleven_multilingual_v2'
OUTPUT_DIR = r'C:\Users\öööö\louis-quest\public\audio\narrator'
ENV_PATH = r'C:\Users\öööö\louis-quest\.env.local'

VOICE_SETTINGS = {
    'stability': 0.75,
    'similarity_boost': 0.75,
    'style': 0.20,
    'use_speaker_boost': True,
}

LINES = [
    {
        'filename': 'arc_pilzhueter_b1_intro.mp3',
        'text': 'Ich muss dir was erzählen. Als Ronki ganz klein war, hat er sich im Wald verlaufen. Zwischen den großen Wurzeln. Da kam ein alter Pilzhüter und hat ihn gefunden. Der Pilzhüter hat ihm den Weg gezeigt, und sie wurden Freunde. Dann ist der Wald gewachsen, und sie haben sich aus den Augen verloren. Bis heute.',
    },
    {
        'filename': 'arc_pilzhueter_b2_gift.mp3',
        'text': 'Der Pilzhüter möchte euch etwas schenken. Er sagt: wenn sich alles zu groß anfühlt, könnt ihr ein Baum werden. Probiert es gemeinsam aus.',
    },
    {
        'filename': 'arc_pilzhueter_b3_realife.mp3',
        'text': 'Der Pilzhüter hat einen Wunsch für dich. Probier die Baum-Pose morgen früh, vor dem Zähneputzen. Nur einmal. Nur für dich.',
    },
    {
        'filename': 'arc_pilzhueter_b4_callback.mp3',
        'text': 'Der Pilzhüter war heute hier. Er hat nach dir gefragt, und er hat eine Botschaft hinterlassen: du musst nicht jeden Tag ein Baum sein. Aber wenn sich die Welt mal zu groß anfühlt, weißt du, was du tun kannst.',
    },
]


def load_api_key():
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
            if line.startswith('VITE_ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
    raise RuntimeError('ELEVENLABS_API_KEY not found in .env')


def generate_audio(api_key, voice_id, text, filename):
    """Always overwrite — this script's job is to (re)generate the bank.
    Skip-existing was the previous behaviour; removed during the 27 Apr 2026
    Drachenmutter recast since old Bella audio needed replacement.
    """
    out_path = os.path.join(OUTPUT_DIR, filename)

    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    body = {
        'text': text,
        'model_id': MODEL_ID,
        'voice_settings': VOICE_SETTINGS,
    }
    data = json.dumps(body).encode('utf-8')

    req = urllib.request.Request(
        url,
        data=data,
        method='POST',
        headers={
            'xi-api-key': api_key,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            audio_bytes = resp.read()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'HTTP {e.code} for {filename}: {err_body}')

    with open(out_path, 'wb') as f:
        f.write(audio_bytes)
    print(f'OK: {filename} -> {len(audio_bytes)} bytes')


def main():
    api_key = load_api_key()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for i, line in enumerate(LINES):
        print(f'[{i+1}/{len(LINES)}] "{line["text"][:50]}..."')
        generate_audio(api_key, VOICE_ID, line['text'], line['filename'])
        if i < len(LINES) - 1:
            time.sleep(0.6)
    print('DONE')


if __name__ == '__main__':
    main()
