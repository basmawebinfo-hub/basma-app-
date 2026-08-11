# Usage: python lime-count.py <prefix>
# Counts lime-hued pixels in the Phase H viewport screenshots
# (KIMI_TASKS/reports/shots-phase-h/<prefix>-*.png) and prints each
# image's lime coverage as a % of the viewport. "Painted area" per the
# Phase H spec: hue-based, NOT opacity-weighted — a dimmed lime pixel
# still counts.
import sys
from pathlib import Path

from PIL import Image

prefix = sys.argv[1] if len(sys.argv) > 1 else "before"
shots = Path(__file__).resolve().parent.parent / "reports" / "shots-phase-h"

def lime_pct(png: Path) -> float:
    im = Image.open(png).convert("RGB")
    w, h = im.size
    px = im.load()
    lime = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            mx, mn = max(r, g, b), min(r, g, b)
            if mx == 0:
                continue
            sat = (mx - mn) / mx
            if sat < 0.35:
                continue  # near-black surfaces carry a faint hue; exclude them
            # hue of the lime family: green-dominant, red next, blue low
            if g > r > b and g >= 60:
                lime += 1
    return lime / (w * h) * 100

for png in sorted(shots.glob(f"{prefix}-*.png")):
    print(f"{png.name}: {lime_pct(png):.2f}%")
