"""Lädt die Lebensmittel-Bilder (Microsoft Fluent Emoji 3D, MIT) und baut die App-Symbole.

Aufruf im Projektordner:  python tools/build_icons.py
Benötigt: Python 3 mit Pillow (pip install pillow). Nur nötig, wenn in foods.js
neue Bilder dazukommen – die fertigen Dateien liegen schon im Repo.
"""
import io
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
RAW = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/'
FOOD_SIZE = 192          # Pixel; reicht für 72 px Anzeige auf 3x-Displays nicht ganz, aber gut genug
UI_IMAGES = {            # Deko-Bilder für die Oberfläche
    'img/empty.webp': ('Basket', 256),
    'img/install.webp': ('Mobile phone with arrow', 160),
}

_cache = {}


def fluent(folder):
    """Fluent-3D-PNG als Pillow-Bild (RGBA)."""
    if folder not in _cache:
        name = folder.lower().replace(' ', '_') + '_3d.png'
        url = RAW + urllib.parse.quote(f'{folder}/3D/{name}')
        with urllib.request.urlopen(url, timeout=30) as r:
            _cache[folder] = Image.open(io.BytesIO(r.read())).convert('RGBA')
    return _cache[folder]


def save_webp(img, path, size):
    img = img.resize((size, size), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=82, method=6)


def food_icons(only=None):
    """Alle Bilder aus foods.js bauen – oder nur die Schlüssel in `only`."""
    src = (ROOT / 'foods.js').read_text(encoding='utf-8')
    # [Schlüssel, Ordner, Anzeigename, Kategorie, Stufe, …]
    entries = re.findall(r"\[\s*'([a-z_]+)'\s*,\s*'([^']+)'\s*,\s*'[^']*'\s*,\s*'[a-z]+'\s*,\s*\d", src)
    if not entries:
        sys.exit('Keine Einträge in foods.js gefunden')
    out = ROOT / 'food'
    keys = {key for key, _ in entries}
    done = 0
    for key, folder in entries:
        if only and key not in only:
            continue
        if folder == 'eigen':      # selbst gezeichnet, siehe custom_icons.py
            from custom_icons import DRAW
            img = DRAW[key]()
        else:
            img = fluent(folder)
        save_webp(img, out / f'{key}.webp', FOOD_SIZE)
        done += 1
        print(f'  {key:16} <- {folder}')
    if not only:
        # Übrig gebliebene Bilder von gelöschten Einträgen entfernen
        for f in out.glob('*.webp'):
            if f.stem not in keys:
                f.unlink()
                print(f'  entfernt: {f.name}')
    print(f'{done} Lebensmittel-Bilder')


def ui_images():
    for rel, (folder, size) in UI_IMAGES.items():
        save_webp(fluent(folder), ROOT / rel, size)
        print(f'  {rel}')


def gradient(size):
    """Frisches Grün, diagonal von hell nach dunkel."""
    top, bottom = (74, 214, 138), (18, 150, 82)
    img = Image.new('RGB', (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
    return img


def logo(size, content_scale):
    """Apfel + Wecker auf grünem Grund. content_scale = Anteil der Fläche für das Motiv."""
    base = gradient(size).convert('RGBA')
    box = size * content_scale
    apple = fluent('Red apple').resize((round(box * 0.86),) * 2, Image.LANCZOS)
    clock = fluent('Alarm clock').resize((round(box * 0.46),) * 2, Image.LANCZOS)
    ox = (size - box) / 2
    base.alpha_composite(apple, (round(ox + box * 0.02), round(ox + box * 0.04)))
    base.alpha_composite(clock, (round(ox + box * 0.56), round(ox + box * 0.56)))
    return base


def rounded(img, radius_ratio=0.22):
    mask = Image.new('L', img.size, 0)
    r = round(img.size[0] * radius_ratio)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], r, fill=255)
    out = img.copy()
    out.putalpha(mask)
    return out


def app_icons():
    d = ROOT / 'icons'
    d.mkdir(exist_ok=True)
    big = logo(1024, 0.78)
    rounded(big).resize((512, 512), Image.LANCZOS).save(d / 'icon-512.png', optimize=True)
    rounded(big).resize((192, 192), Image.LANCZOS).save(d / 'icon-192.png', optimize=True)
    rounded(big).resize((64, 64), Image.LANCZOS).save(d / 'favicon.png', optimize=True)
    # iOS rundet nur die Ecken ab; Android-„maskable“ schneidet einen Kreis aus → Motiv kleiner
    logo(1024, 0.74).convert('RGB').resize((180, 180), Image.LANCZOS).save(d / 'apple-touch-icon.png', optimize=True)
    logo(1024, 0.62).convert('RGB').resize((512, 512), Image.LANCZOS).save(d / 'maskable-512.png', optimize=True)
    print('  App-Symbole in icons/')


if __name__ == '__main__':
    # Aufruf: build_icons.py [food|ui|app] … – bei „food“ optional einzelne Schlüssel, z. B. „food aufschnitt“
    args = sys.argv[1:]
    parts = {a for a in args if a in ('food', 'ui', 'app')} or {'food', 'ui', 'app'}
    only = {a for a in args if a not in ('food', 'ui', 'app')}
    if 'food' in parts:
        food_icons(only)
    if 'ui' in parts:
        ui_images()
    if 'app' in parts:
        app_icons()
