#!/usr/bin/env python3
"""
public/F2icon.png のチェッカー／グレー系背景をアルファで透過する（再実行可）。
Pillow 必須: pip install Pillow
"""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow が必要です: pip install Pillow") from None


def should_be_transparent(r: int, g: int, b: int) -> bool:
    """彩度が低く明るいピクセル（白〜薄灰のチェッカー）を背景とみなす。"""
    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = 0.0 if mx == 0 else (mx - mn) / mx
    light = (r + g + b) / 3
    # ほぼ白
    if light >= 232 and sat <= 0.18:
        return True
    # 薄灰〜中間灰（チェッカー市松の暗マス含む）
    if 100 <= light <= 238 and sat <= 0.14:
        return True
    return False


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    path = root / "public" / "F2icon.png"
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


if __name__ == "__main__":
    main()
