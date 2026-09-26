"""Cut a Higgsfield task-picture sheet into 256 px transparent webp files.

The model paints "transparent background" as a baked-in grey checkerboard
(two near-greys, about 253 and 234, squares of roughly 18 to 22 px that are
not exactly regular). This script removes it:
  1. candidate background = near-neutral pixels in the checker's brightness range;
  2. regions of candidates that touch the cell edge are background (the outside);
  3. the checker grid (square size and phase, per axis) is measured on that
     known background; a closed region (a bag handle loop, a gap between
     objects) is background only if its light and dark pixels sit where the
     grid predicts and it holds both greys in real shares. Drawn white or grey
     shading (socks, a switch rocker, a toilet) does not follow the grid, and a
     single-tone detail inside one square lacks the second grey, so both stay.
Each object is then trimmed, fitted into 232 px and centred on a 256 px canvas,
like the existing tasks/*.webp.

Run: python scripts/cut-task-sheet.py <sheet.png> <out_dir> [--grid 4x3] name1 name2 ...
(names row by row; the default grid is 4 columns by 3 rows)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

sheet_path, out_dir, *rest = sys.argv[1:]
cols, rows = 4, 3
if rest[:1] == ['--grid']:
    cols, rows = (int(v) for v in rest[1].lower().split('x'))
    rest = rest[2:]
names = rest
if len(names) != cols * rows:
    sys.exit(f'need exactly {cols * rows} names, row by row')
out = Path(out_dir)
out.mkdir(parents=True, exist_ok=True)

img = np.asarray(Image.open(sheet_path).convert('RGB')).astype(np.int16)
H, W, _ = img.shape
mx_all, mn_all = img.max(axis=2), img.min(axis=2)
candidate_all = ((mx_all - mn_all) <= 12) & (mn_all >= 222)
dark_all = mx_all < 244

# Known background: candidate regions touching any cell edge.
cw, ch = W // cols, H // rows
known_bg = np.zeros((H, W), bool)
for i in range(cols * rows):
    r, c = divmod(i, cols)
    sl = (slice(r * ch, (r + 1) * ch), slice(c * cw, (c + 1) * cw))
    lab, n = ndimage.label(candidate_all[sl])
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    known_bg[sl] |= np.isin(lab, list(edge))


def fit_axis(profile):
    """Square size and phase of a 1-D checker profile (mean darkness per column or row)."""
    x = np.arange(profile.size)
    valid = ~np.isnan(profile)
    x, p = x[valid], profile[valid] - np.nanmean(profile)
    best = (-1.0, 20.0, 0.0)
    for s in np.arange(12.0, 32.0, 0.05):
        for ph in np.arange(0.0, 2 * s, 0.5):
            wave = np.where(np.floor((x + ph) / s) % 2 == 0, 1.0, -1.0)
            score = abs(float(np.dot(wave, p)))
            if score > best[0]:
                best = (score, s, ph)
    return best[1], best[2]


# Profiles need one row or column of squares at a time, so fit on a band.
band = slice(0, max(8, int(H * 0.02)))
colprof = np.array([dark_all[band, x][known_bg[band, x]].mean() if known_bg[band, x].any() else np.nan for x in range(W)])
sx, px = fit_axis(colprof)
bandx = slice(0, max(8, int(W * 0.02)))
rowprof = np.array([dark_all[y, bandx][known_bg[y, bandx]].mean() if known_bg[y, bandx].any() else np.nan for y in range(H)])
sy, py = fit_axis(rowprof)
yy, xx = np.mgrid[0:H, 0:W]
parity = ((np.floor((xx + px) / sx) + np.floor((yy + py) / sy)) % 2).astype(bool)
# Which parity is the dark tone: decide on the known background.
if np.mean(dark_all[known_bg] == parity[known_bg]) < 0.5:
    parity = ~parity
fit_quality = np.mean(dark_all[known_bg] == parity[known_bg])
print(f'checker grid: {sx:.2f} x {sy:.2f} px, fit on known background {fit_quality:.2%}')

for i, name in enumerate(names):
    r, c = divmod(i, cols)
    sl = (slice(r * ch, (r + 1) * ch), slice(c * cw, (c + 1) * cw))
    cell = img[sl]
    mx, mn = mx_all[sl], mn_all[sl]
    labels, n = ndimage.label(candidate_all[sl])
    bg = known_bg[sl].copy()
    for lab in range(1, n + 1):
        region = labels == lab
        if bg[region].any() or region.sum() < 80:
            continue
        # Background only when the region follows the checker grid AND holds both
        # checker greys in real shares. Grid agreement alone would erase a small
        # single-tone white detail that happens to sit inside a light square
        # (Astra code review, PR 26); two tones alone would erase drawn grey
        # shading such as a switch rocker.
        dark_share = np.mean(dark_all[sl][region])
        agree = np.mean(dark_all[sl][region] == parity[sl][region])
        if agree >= 0.85 and 0.1 <= dark_share <= 0.9:
            bg |= region
    # swallow the thin anti-aliased seam between background and outline
    bg = ndimage.binary_dilation(bg, iterations=1) & (mn >= 205) & ((mx - mn) <= 18) | bg
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    rgba = np.dstack([cell.astype(np.uint8), alpha])
    ys, xs = np.nonzero(alpha)
    crop = Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    crop.thumbnail((232, 232), Image.LANCZOS)
    canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    canvas.paste(crop, ((256 - crop.width) // 2, (256 - crop.height) // 2), crop)
    canvas.save(out / f'{name}.webp', 'WEBP', quality=90, method=6)
    print(f'{name}: {crop.width}x{crop.height}')
