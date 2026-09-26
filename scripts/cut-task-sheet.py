"""Cut a 4 x 3 Higgsfield task-picture sheet into 256 px transparent webp files.

The model paints "transparent background" as a baked-in grey checkerboard
(two near-greys, about 253 and 234). This script removes it:
  1. candidate background = near-neutral pixels in the checker's brightness range;
  2. connected regions of candidates are background if they touch the cell edge
     (the outside) or if they contain both checker tones (a checker patch seen
     through a closed gap, such as a bag handle loop);
  3. single-tone white regions inside an outline (socks, drawstrings) stay.
Each object is then trimmed, fitted into 232 px and centred on a 256 px canvas,
like the existing tasks/*.webp.

Run: python scripts/cut-task-sheet.py <sheet.png> <out_dir> name1 name2 ... name12
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

sheet_path, out_dir, *names = sys.argv[1:]
if len(names) != 12:
    sys.exit('need exactly 12 names, row by row')
out = Path(out_dir)
out.mkdir(parents=True, exist_ok=True)

img = np.asarray(Image.open(sheet_path).convert('RGB')).astype(np.int16)
H, W, _ = img.shape
cw, ch = W // 4, H // 3

for i, name in enumerate(names):
    r, c = divmod(i, 4)
    cell = img[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
    mx, mn = cell.max(axis=2), cell.min(axis=2)
    neutral = (mx - mn) <= 12
    candidate = neutral & (mn >= 222)
    labels, n = ndimage.label(candidate)
    bg = np.zeros_like(candidate)
    edge_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    for lab in range(1, n + 1):
        region = labels == lab
        if lab in edge_labels:
            bg |= region
            continue
        # A checker patch seen through a closed gap holds both checker greys in
        # large shares. Measured on the 26 Sep sheet: the gym bag's handle loop is
        # 22% dark tone and 40% light tone; every white paint area with crayon grain
        # (socks, slipper trim, toilet, paint palette) has under 3% dark tone.
        tones = mx[region]
        on_light = np.count_nonzero(np.abs(tones - 253) <= 2)
        on_dark = np.count_nonzero(np.abs(tones - 234) <= 2)
        if on_light >= 0.1 * tones.size and on_dark >= 0.1 * tones.size:
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
    print(f'{name}: {crop.width}x{crop.height}, background regions {int(bg.sum())} px')
