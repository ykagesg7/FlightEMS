#!/usr/bin/env python3
"""
public 以下の PNG の白〜薄灰背景をアルファ透過（再実行可）。
例: python scripts/transparent_public_png.py F2favicon.png airplane.png
Pillow 必須: pip install Pillow
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow が必要です: pip install Pillow") from None


def should_be_transparent(r: int, g: int, b: int) -> bool:
    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = 0.0 if mx == 0 else (mx - mn) / mx
    light = (r + g + b) / 3
    # ほぼ白
    if light >= 232 and sat <= 0.18:
        return True
    # 薄灰〜中間灰（エクスポート時のチェッカー市松の暗マスは明度 ~128 付近になりやすい）
    if 100 <= light <= 238 and sat <= 0.14:
        return True
    return False


def process_file(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"見つかりません: {path}")
    img = Image.open(path).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if should_be_transparent(r, g, b):
                px[x, y] = (r, g, b, 0)
    img.save(path, "PNG", optimize=True)
    print(f"OK: {path}")


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    public = root / "public"
    names = sys.argv[1:] if len(sys.argv) > 1 else ["F2favicon.png", "airplane.png"]
    for name in names:
        process_file(public / name)


if __name__ == "__main__":
    main()
