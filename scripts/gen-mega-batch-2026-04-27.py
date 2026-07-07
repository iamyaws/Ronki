# -*- coding: utf-8 -*-
"""Mega-batch audio gen for the 27 Apr 2026 voice push.

Single-script generator for ~70 voicelines across the surfaces Marc
flagged as silent. Eleonore narrates framing, Harry voices Ronki.
Run from drachennest worktree.
"""
import os, sys, json, urllib.request, urllib.error
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

REPO = Path(r"C:\Users\öööö\ronki")
ENV_PATH = Path(r"C:\Users\öööö\louis-quest\.env.local")
MODEL_ID = "eleven_multilingual_v2"

ELEONORE = {
    "voice_id": "jO00l6thH9mRUIF1vSux",
    "settings": {"stability": 0.75, "similarity_boost": 0.75, "style": 0.20, "use_speaker_boost": True},
}
HARRY = {
    "voice_id": "SOYHLrjzK2X1ezoPC6cr",
    "settings": {"stability": 0.40, "similarity_boost": 0.80, "style": 0.55, "use_speaker_boost": True},
}
ELEONORE_LULLABY = {
    "voice_id": "jO00l6thH9mRUIF1vSux",
    "settings": {"stability": 0.85, "similarity_boost": 0.75, "style": 0.10, "use_speaker_boost": True},
}

# ─── Lines ──────────────────────────────────────────────────────────
# All texts use double quotes so internal apostrophes don't break parsing.
# Real UTF-8 umlauts. No emojis.

LINES = [
    # A. ERSTE FUNKE
    ("narrator/teach_fire_intro_01", ELEONORE,
     "Ronki ist gerade geschlüpft. Zeig ihm, wie man Luft holt."),
    ("ronki/de_teach_fire_smoke_01", HARRY,
     "Oh. Nur Rauch. War zu kurz, glaub ich."),
    ("narrator/teach_fire_tryagain_01", ELEONORE,
     "Nochmal. Diesmal lang Luft anhalten."),
    ("ronki/de_teach_fire_celebrate_01", HARRY,
     "Jaaa! Schau! Ich kann das."),
    ("narrator/teach_fire_done_01", ELEONORE,
     "Du hast es ihm beigebracht. Das vergisst er nicht."),

    # B. CREATURE LORE — 20 howMet
    ("ronki/de_creature_lore_forest_0", HARRY,
     "Ich war zum ersten Mal im Wald unterwegs. Er saß auf einem Pilz und hat mir den Weg gezeigt. Seitdem treffen wir uns oft."),
    ("ronki/de_creature_lore_forest_1", HARRY,
     "Wir waren schon ein paar Mal im Wald, da sah ich plötzlich einen Farnwedel wackeln. Aber kein Wind. Dann schaute er mich an und tanzte weiter."),
    ("ronki/de_creature_lore_forest_2", HARRY,
     "Wir sind schon oft an ihm vorbeigelaufen, ohne ihn zu sehen. Nach vielen Tagen hat er gebrummt. Das war sein Hallo."),
    ("ronki/de_creature_lore_forest_3", HARRY,
     "Ganz am Ende unseres ersten Abenteuers, als alles vorbei war, sah ich zwei kleine Augen zwischen den Pilzen. Er hat gewartet, bis er sicher war, dass wir Freunde sind."),
    ("ronki/de_creature_lore_forest_4", HARRY,
     "Du hast so oft dran gearbeitet, Tag für Tag. Irgendwann hat Baumbart zu mir gesagt: Der kleine Mensch ist dran geblieben. Zeig ihn mir. Und da war er, langsam aus dem Stamm heraus."),
    ("ronki/de_creature_lore_forest_5", HARRY,
     "Nachdem du und Pilzhüter euch wiedergetroffen habt, kam Mr. Shroom um die Ecke. Er hat den Hut gelüftet und gesagt: Freunde vom Pilzhüter sind auch meine Freunde."),
    ("ronki/de_creature_lore_forest_6", HARRY,
     "Du hast deine Abende so oft ruhig ausklingen lassen. An einem besonders stillen Abend ist Pilz-Jeti aus dem Dickicht gekommen. Ich mag Kinder, die gut Abschied vom Tag nehmen, hat er leise gebrummt."),
    ("ronki/de_creature_lore_sky_0", HARRY,
     "Als ich mich an die Spiele gewagt habe, flog er plötzlich vorbei. Er hat einmal gekreischt und ist mitgekommen. Jetzt spielen wir zusammen."),
    ("ronki/de_creature_lore_sky_1", HARRY,
     "Eines Morgens, als der Himmel besonders blau war, flog Larson direkt über uns einen Looping. Und noch einen. Wir haben beide gelacht. Seitdem kommt er manchmal vorbei."),
    ("ronki/de_creature_lore_water_0", HARRY,
     "Ich habe viele Tage lang auf dich aufgepasst und daran gedacht, dass du genug trinkst. Irgendwann schwamm er aus dem Mondlicht zu mir. Er wollte uns kennenlernen."),
    ("ronki/de_creature_lore_water_1", HARRY,
     "Als du zum ersten Mal etwas in dein Tagebuch geschrieben hast, hörte ich vom Teich ein Platschen. Da war er, auf einer Seerose, und hat mir zugewinkt."),
    ("ronki/de_creature_lore_water_2", HARRY,
     "Du hast dich an einem Tag besonders lieb um die Katze gekümmert. Gefüttert, gestreichelt, gespielt. Da kam sie aus dem Wasser und zeigte mir ihren Kristall. Das ist ihr größter Schatz."),
    ("ronki/de_creature_lore_water_3", HARRY,
     "Nach einem besonders großen Abenteuer sah ich sie plötzlich im Nebel stehen. Sie hat mir etwas geschenkt. Dann war sie wieder weg, als wäre sie nie da gewesen."),
    ("ronki/de_creature_lore_dream_0", HARRY,
     "Als du zum ersten Mal aufgeschrieben hast, wie du dich fühlst, kam er aus dem Mondlicht zu mir. Er hat genickt, als hätte er es gewusst."),
    ("ronki/de_creature_lore_dream_1", HARRY,
     "Du hast dreimal in dein Tagebuch geschrieben. Beim dritten Mal flog sie an meinem Fenster vorbei und blieb stehen. Seitdem wissen wir, dass sie auf mutige Kinder aufpasst."),
    ("ronki/de_creature_lore_dream_2", HARRY,
     "Nach zwei großen Abenteuern schaute ich nach oben und sah einen Stern fallen. Nur war es kein Stern. Er landete sanft und nickte mir zu."),
    ("ronki/de_creature_lore_dream_3", HARRY,
     "Nachdem du oft und oft geträumt hast, kam Brie vorbei. Deine Träume sind schön, hat sie gesagt und einen kleinen Krug aufgemacht. Ein warmes Licht kam heraus."),
    ("ronki/de_creature_lore_hearth_0", HARRY,
     "Als deine Katze groß und stark wurde, kam er vom Kamin zu uns. Er legte sich daneben und schlief ein. Jetzt gehört er einfach dazu."),
    ("ronki/de_creature_lore_hearth_1", HARRY,
     "Wir saßen am Kamin und dachten, wir wären allein. Dann hat jemand ganz leise geknistert. Er saß zwischen den Holzscheiten und winkte."),
    ("ronki/de_creature_lore_hearth_2", HARRY,
     "Du hast alle fünf Knobel-Abenteuer geschafft. Am Ende stand Doktor Funkel einfach da, schaute durch seine Lupe und sagte: Ah. Du bist angekommen."),

    # C. PWA INSTALL
    ("ronki/de_pwa_install_01", HARRY,
     "Pack mich mit aufs Handy. Dann find ich dich morgen schneller wieder."),

    # D. ALL-DONE STRONG (engine bank)
    ("ronki/de_alldone_strong_01", HARRY,
     "Du hast wirklich alles geschafft. Alles. Du bist jemand, der das einfach durchzieht."),
    ("ronki/de_alldone_strong_02", HARRY,
     "Schau dich an. Heute hast du nichts liegen gelassen."),
    ("ronki/de_alldone_strong_03", HARRY,
     "Ich kann gar nicht stillsitzen. Du hast heute wirklich alles gemacht."),
    ("ronki/de_alldone_strong_04", HARRY,
     "Mein Bauch kribbelt. Du hast es geschafft. Komplett."),
    ("ronki/de_alldone_strong_05", HARRY,
     "Ich erzähl das später den Glühwürmchen. Sie werden mir nicht glauben."),

    # E. NIGHTSTRIP / RonkisTag
    ("narrator/tag_intro_01", ELEONORE,
     "Ein guter Tag. Schau zurück mit mir."),
    ("ronki/de_tag_warmth_01", HARRY,
     "Heute war schön. Wirklich. Ich habs gemerkt."),

    # F. TONIGHT — narrator + invite + 10 stories
    ("narrator/tonight_intro_01", ELEONORE,
     "Heute Abend. Wir schauen kurz raus, du und ich."),
    ("ronki/de_tonight_invite_01", HARRY,
     "Komm. Wir setzen uns. Ich will dir was erzählen."),
    ("ronki/de_tonight_story_0", HARRY,
     "Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald."),
    ("ronki/de_tonight_story_1", HARRY,
     "Mama-Drache hat mir gezeigt, wie man die Sterne zählt, wenn man nicht einschlafen kann. Sie hat aber bei sechzehn aufgehört."),
    ("ronki/de_tonight_story_2", HARRY,
     "Im Morgenwald war heute ein Reh. Es hat mich angeschaut, als wüsste es was, das ich nicht weiß."),
    ("ronki/de_tonight_story_3", HARRY,
     "Heute morgen hat es nach Regen gerochen, obwohl es gar nicht geregnet hat. Komisch."),
    ("ronki/de_tonight_story_4", HARRY,
     "Manchmal denk ich, der Mond schaut zurück. Glaubst du das auch?"),
    ("ronki/de_tonight_story_5", HARRY,
     "Ich hab heute eine Eichel gefunden, die wie ein Hut aussieht. Ich hab sie liegen lassen, falls eine Eule sie braucht."),
    ("ronki/de_tonight_story_6", HARRY,
     "Weißt du was lustig ist, mein Schwanz war heute schneller wach als ich. Ich musste warten, bis der Rest mich einholt."),
    ("ronki/de_tonight_story_7", HARRY,
     "Wenn ich die Augen zumache, seh ich manchmal noch das Feuer von unserem Lagerfeuer. Auch wenn es längst aus ist."),
    ("ronki/de_tonight_story_8", HARRY,
     "Heute hat ein kleiner Wind durch die Höhle geschaut. Ich glaub er hat sich nur kurz ausgeruht."),
    ("ronki/de_tonight_story_9", HARRY,
     "Wir haben heute viel zusammen erlebt, oder? Ich erinner mich an alles. Versprochen."),

    # F2. BeiRonkiSein — same 10 stories already exist via BeiRonkiSein STORIES.
    # Reuse the tonight_story_* files; component patches to call playLocalized.

    # G. SCHLAFLIED — Eleonore spoken lullaby (~30s loop-friendly)
    ("lullaby/tonight_lullaby_01", ELEONORE_LULLABY,
     "Schlaf, kleines Kind. Die Sterne wachen für dich. "
     "Die Welt ist müde. Du bist warm. Du bist sicher. "
     "Schlaf, kleines Kind. Mama-Drache passt auf. "
     "Die Sterne wachen. Du schläfst ein. "
     "Schlaf, kleines Kind. Schlaf. Schlaf jetzt ein."),

    # H. NAVBAR TAP — 5
    ("ronki/de_nav_tap_nest", HARRY, "Komm rein. Hier ist es gemütlich."),
    ("ronki/de_nav_tap_heute", HARRY, "Mal schauen, was heute dran ist."),
    ("ronki/de_nav_tap_ronki", HARRY, "Du willst mich besuchen? Schön."),
    ("ronki/de_nav_tap_tagebuch", HARRY, "Schreib was Schönes. Ich les zu."),
    ("ronki/de_nav_tap_laden", HARRY, "Hier tauschst du Sterne gegen schöne Sachen."),

    # I. RONKI ROOM TAP — 10
    ("ronki/de_room_tap_0", HARRY, "Hi! Du bist da."),
    ("ronki/de_room_tap_1", HARRY, "Hihi! Das kitzelt."),
    ("ronki/de_room_tap_2", HARRY, "Magst du was spielen?"),
    ("ronki/de_room_tap_3", HARRY, "Ich hab grad an Wolken gedacht."),
    ("ronki/de_room_tap_4", HARRY, "Riech mal. Es riecht nach Holz."),
    ("ronki/de_room_tap_5", HARRY, "Mein Schwanz ist kürzer als meine Hörner. Glaub ich."),
    ("ronki/de_room_tap_6", HARRY, "Bist du müde? Ich auch ein bisschen."),
    ("ronki/de_room_tap_7", HARRY, "Ich freu mich, wenn du da bist."),
    ("ronki/de_room_tap_8", HARRY, "Schau mal, ein Funke ist gerade vorbei."),
    ("ronki/de_room_tap_9", HARRY, "Du strahlst heut. Schön."),

    # J. KARTE / Morgenwald map — 3
    ("ronki/de_karte_0", HARRY, "Ich bin heute voller Vorfreude."),
    ("ronki/de_karte_1", HARRY, "Wenn ich da hingeh, find ich bestimmt was Schönes."),
    ("ronki/de_karte_2", HARRY, "Komm, schau mit mir, wo ich heute langlauf."),

    # K. EXPEDITION PACK + DEPART — Ronki narrates as he sets off
    ("ronki/de_expedition_pack_01", HARRY,
     "Ich schnapp mir meinen Rucksack. Bis zum Nachmittag."),
    ("ronki/de_expedition_pack_02", HARRY,
     "Stift, Notizbuch, ein bisschen Brot. Ich glaub das reicht."),
    ("ronki/de_expedition_depart_01", HARRY,
     "Ich geh los. Bis später, bring dir was mit."),
    ("ronki/de_expedition_depart_02", HARRY,
     "Tschüss erstmal. Ich pass auf mich auf."),
    ("ronki/de_expedition_walk_01", HARRY,
     "Hier riecht es schon anders. Nach Wald."),
    ("ronki/de_expedition_return_01", HARRY,
     "Ich bin wieder da. Schau, was ich gefunden hab."),
]


def load_api_key():
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            if line.startswith("ELEVENLABS_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("ELEVENLABS_API_KEY missing")


def gen(api_key, profile, text):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{profile['voice_id']}"
    body = json.dumps({
        "text": text, "model_id": MODEL_ID,
        "language_code": "de", "voice_settings": profile["settings"],
    }, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "xi-api-key": api_key,
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "audio/mpeg",
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8", errors="replace")
        if "language_code" in body_err.lower():
            body2 = json.dumps({"text": text, "model_id": MODEL_ID, "voice_settings": profile["settings"]},
                               ensure_ascii=False).encode("utf-8")
            req2 = urllib.request.Request(url, data=body2, method="POST", headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "audio/mpeg",
            })
            with urllib.request.urlopen(req2, timeout=120) as r:
                return r.read()
        raise RuntimeError(f"HTTP {e.code}: {body_err}")


def main():
    api_key = load_api_key()
    print(f"Mega-batch: {len(LINES)} lines")
    ok, fail = 0, 0
    for i, (rel_path, profile, text) in enumerate(LINES, 1):
        out = REPO / "public" / "audio" / f"{rel_path}.mp3"
        out.parent.mkdir(parents=True, exist_ok=True)
        preview = text[:50].replace("\n", " ")
        print(f"[{i:02d}/{len(LINES)}] {rel_path:<42} {preview}")
        try:
            audio = gen(api_key, profile, text)
            out.write_bytes(audio)
            ok += 1
        except Exception as e:
            print(f"           FAIL: {e}")
            fail += 1
    print(f"\nDone: {ok} ok, {fail} failed")


if __name__ == "__main__":
    main()
