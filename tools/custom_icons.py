"""Eigene Bilder im Stil der Fluent-3D-Emoji für Lebensmittel, die es dort nicht gibt.

Wird von build_icons.py benutzt (Einträge mit Ordner 'eigen' in foods.js).
Gezeichnet wird doppelt so groß und dann verkleinert – so werden die Kanten weich.
"""
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = 2048
_grid = None


def _yx():
    global _grid
    if _grid is None:
        _grid = np.mgrid[0:S, 0:S].astype(np.float32)
    return _grid


def px(*v):
    """Anteile (0..1) in Pixel umrechnen."""
    return [round(x * S) for x in v]


def box_c(cx, cy, w, h):
    return px(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)


def mask_ellipse(box, blur=0):
    m = Image.new('L', (S, S), 0)
    ImageDraw.Draw(m).ellipse(box, fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur)) if blur else m


def radial(box, inner, outer, focus=(0.38, 0.32), spread=0.9, power=1.2):
    """Farbverlauf von innen (Lichtpunkt oben links) nach außen."""
    yy, xx = _yx()
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    cx, cy = x0 + w * focus[0], y0 + h * focus[1]
    d = np.sqrt(((xx - cx) / (w * spread)) ** 2 + ((yy - cy) / (h * spread)) ** 2)
    t = np.clip(d, 0, 1)[..., None] ** power
    rgb = np.array(inner, np.float32) * (1 - t) + np.array(outer, np.float32) * t
    alpha = np.full((S, S, 1), 255, np.float32)
    return Image.fromarray(np.concatenate([rgb, alpha], axis=2).astype(np.uint8), 'RGBA')


def linear(top, bottom, y0, y1):
    yy, _ = _yx()
    t = np.clip((yy - y0 * S) / ((y1 - y0) * S), 0, 1)[..., None]
    rgb = np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t
    alpha = np.full((S, S, 1), 255, np.float32)
    return Image.fromarray(np.concatenate([rgb, alpha], axis=2).astype(np.uint8), 'RGBA')


def paint(base, fill, mask, opacity=1.0):
    if opacity < 1:
        mask = mask.point(lambda v: round(v * opacity))
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    layer.paste(fill, (0, 0), mask)
    base.alpha_composite(layer)


def solid(color):
    return Image.new('RGBA', (S, S), tuple(color) + (255,))


def shadow(base, box, blur, opacity, dx=0, dy=0):
    b = [box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy]
    paint(base, solid((60, 30, 20)), mask_ellipse(b, blur), opacity)


def highlight(base, box, blur, opacity):
    paint(base, solid((255, 255, 255)), mask_ellipse(box, blur), opacity)


def salami(base, cx, cy, w, h, seed):
    rnd = random.Random(seed)
    shadow(base, box_c(cx + w * 0.05, cy + h * 0.2, w * 0.96, h * 0.86), S * 0.014, 0.5)
    # Scheibendicke
    side = box_c(cx, cy + h * 0.08, w, h)
    paint(base, radial(side, (140, 30, 44), (84, 14, 26)), mask_ellipse(side))
    # Pelle
    top = box_c(cx, cy, w, h)
    paint(base, radial(top, (150, 36, 50), (104, 20, 34)), mask_ellipse(top))
    # Fleisch
    meat = box_c(cx, cy - h * 0.005, w * 0.91, h * 0.89)
    paint(base, radial(meat, (238, 86, 88), (182, 36, 58), spread=0.8, power=1.4), mask_ellipse(meat))
    # Fettstückchen: viele kleine, helle Punkte
    fat = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(fat)
    for _ in range(46):
        a = rnd.uniform(0, 6.283)
        r = rnd.uniform(0.05, 0.92) ** 0.8
        fx = cx + np.cos(a) * r * w * 0.4
        fy = cy + np.sin(a) * r * h * 0.39
        s = rnd.uniform(0.011, 0.024)
        d.ellipse(box_c(fx, fy, s * rnd.uniform(0.9, 1.6), s * rnd.uniform(0.6, 0.9)), fill=255)
    fat = Image.composite(fat, Image.new('L', (S, S), 0), mask_ellipse(box_c(cx, cy, w * 0.86, h * 0.84)))
    paint(base, solid((255, 232, 224)), fat.filter(ImageFilter.GaussianBlur(S * 0.0012)))
    # Glanz oben links
    highlight(base, box_c(cx - w * 0.16, cy - h * 0.2, w * 0.4, h * 0.2), S * 0.018, 0.3)


def half_moon(w_img, box, keep_top=True):
    """Ellipsen-Maske, nur obere (oder untere) Hälfte – für gefaltete Schinkenscheiben."""
    m = mask_ellipse(box)
    cut = Image.new('L', (S, S), 0)
    mid = (box[1] + box[3]) // 2
    ImageDraw.Draw(cut).rectangle([0, 0, S, mid] if keep_top else [0, mid, S, S], fill=255)
    return Image.composite(m, Image.new('L', (S, S), 0), cut)


def ham(base, cx, cy, w, h):
    """Gefaltete Scheibe Kochschinken: Halbmond mit hellem Fettrand."""
    outer = box_c(cx, cy, w, h)
    shadow(base, box_c(cx + w * 0.03, cy + h * 0.06, w * 0.96, h * 0.16), S * 0.01, 0.45)
    paint(base, radial(outer, (255, 240, 234), (240, 204, 196)), half_moon(base, outer))
    inner = box_c(cx, cy + h * 0.025, w * 0.93, h * 0.9)
    paint(base, radial(inner, (252, 186, 186), (226, 120, 132), focus=(0.4, 0.2), spread=0.75), half_moon(base, inner))
    # Faltkante unten etwas dunkler
    edge = box_c(cx, cy + h * 0.02, w, h * 0.12)
    paint(base, solid((214, 110, 124)), mask_ellipse(edge, S * 0.004), 0.55)
    highlight(base, box_c(cx - w * 0.15, cy - h * 0.3, w * 0.34, h * 0.14), S * 0.016, 0.4)


def gherkin(base, cx, cy, w, h, angle):
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    b = box_c(0.5, 0.5, w, h)
    paint(layer, radial(b, (156, 196, 74), (70, 116, 34), focus=(0.4, 0.25), spread=0.8), mask_ellipse(b))
    bumps = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(bumps)
    rnd = random.Random(7)
    for _ in range(14):
        fx = 0.5 + rnd.uniform(-0.4, 0.4) * w
        fy = 0.5 + rnd.uniform(-0.28, 0.28) * h
        d.ellipse(box_c(fx, fy, 0.012, 0.012), fill=255)
    paint(layer, solid((58, 96, 28)), Image.composite(bumps, Image.new('L', (S, S), 0), mask_ellipse(b)), 0.6)
    highlight(layer, box_c(0.5 - w * 0.08, 0.5 - h * 0.22, w * 0.6, h * 0.22), S * 0.01, 0.45)
    layer = layer.rotate(angle, resample=Image.BICUBIC, center=(S // 2, S // 2))
    sh = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    shadow(sh, box_c(0.5, 0.56, w * 0.95, h * 0.7), S * 0.012, 0.45)
    sh = sh.rotate(angle, resample=Image.BICUBIC, center=(S // 2, S // 2))
    off = (round((cx - 0.5) * S), round((cy - 0.5) * S))
    base.alpha_composite(sh, off)
    base.alpha_composite(layer, off)


def aufschnitt():
    base = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # Rundes Holzbrett mit Kante und Schatten
    shadow(base, box_c(0.5, 0.63, 0.94, 0.66), S * 0.03, 0.3)
    edge = box_c(0.5, 0.585, 0.95, 0.7)
    paint(base, linear((196, 128, 66), (150, 90, 42), 0.3, 0.95), mask_ellipse(edge))
    board = box_c(0.5, 0.55, 0.95, 0.7)
    paint(base, radial(board, (248, 210, 150), (218, 158, 94), focus=(0.38, 0.28), spread=1.0), mask_ellipse(board))
    grain = Image.new('L', (S, S), 0)
    g = ImageDraw.Draw(grain)
    for i, k in enumerate((0.34, 0.52, 0.7, 0.86)):
        g.arc(box_c(0.5, 0.55, 0.95 * k, 0.7 * k), 205 + i * 6, 325 - i * 4, fill=255, width=round(S * 0.0045))
    paint(base, solid((204, 146, 84)), grain.filter(ImageFilter.GaussianBlur(S * 0.002)), 0.6)
    # Schinken hinten, drei Salamischeiben davor, Gewürzgurke vorne links
    ham(base, 0.6, 0.36, 0.52, 0.42)
    ham(base, 0.73, 0.47, 0.4, 0.33)
    salami(base, 0.3, 0.47, 0.42, 0.33, 1)
    salami(base, 0.46, 0.6, 0.42, 0.33, 2)
    salami(base, 0.67, 0.68, 0.42, 0.33, 3)
    gherkin(base, 0.2, 0.72, 0.3, 0.12, 28)
    return base


DRAW = {'aufschnitt': aufschnitt}


if __name__ == '__main__':
    img = aufschnitt()
    img.resize((512, 512), Image.LANCZOS).save('aufschnitt-preview.png')
    print('aufschnitt-preview.png')
