#!/usr/bin/env python3
"""Parallel fetch of GSI 2020.0 declination on 0.1° lattice (see fetch-gsi-declination-grid.mjs)."""
from __future__ import annotations

import gzip
import json
import re
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

LAT_MIN, LAT_MAX = 20.05, 49.95
LON_MIN, LON_MAX = 120.05, 153.95
STEP = 0.1
BATCH = 80
WORKERS = 10
MAX_RETRIES = 3

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src/utils/data"

n_lat = round((LAT_MAX - LAT_MIN) / STEP) + 1
n_lon = round((LON_MAX - LON_MIN) / STEP) + 1
n_cells = n_lat * n_lon


def parse_batch(html: str, expected: int) -> list[float]:
    out: list[float] = []
    for line in html.splitlines():
        if "°" not in line or "Declination" in line or "Latitude" in line:
            continue
        nums = [float(m.group(1)) for m in re.finditer(r"(\d+\.\d+)\s*°", line)]
        if len(nums) >= 3:
            out.append(nums[2])
    if len(out) != expected:
        raise RuntimeError(f"parse mismatch expected {expected} got {len(out)}")
    return out


def fetch_batch(points: list[tuple[float, float]]) -> list[float]:
    body = "\n".join(f"{i + 1}\t{lat:.4f}\t{lon:.4f}" for i, (lat, lon) in enumerate(points)) + "\n"
    last_err: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            html = subprocess.check_output(
                [
                    "curl",
                    "-sS",
                    "--max-time",
                    "120",
                    "-X",
                    "POST",
                    "https://vldb.gsi.go.jp/sokuchi/geomag/menu_04/sample.cgi",
                    "-F",
                    "infile=@-;filename=batch.in",
                ],
                input=body,
                text=True,
                errors="replace",
            )
            return parse_batch(html, len(points))
        except Exception as err:  # noqa: BLE001
            last_err = err
            time.sleep(2 * (attempt + 1))
    raise last_err if last_err else RuntimeError("fetch_batch failed")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    points: list[tuple[int, int, float, float]] = []
    for i_lat in range(n_lat):
        lat = LAT_MIN + i_lat * STEP
        for i_lon in range(n_lon):
            lon = LON_MIN + i_lon * STEP
            points.append((i_lat, i_lon, lat, lon))

    values = [0] * n_cells
    batches: list[list[tuple[int, int, float, float]]] = []
    for i in range(0, len(points), BATCH):
        batches.append(points[i : i + BATCH])

    print(f"Grid {n_lat}x{n_lon}={n_cells} workers={WORKERS} batch={BATCH}")
    started = time.time()
    done = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(fetch_batch, [(p[2], p[3]) for p in batch]): batch for batch in batches}
        for fut in as_completed(futures):
            batch = futures[fut]
            decls = fut.result()
            for j, (i_lat, i_lon, _lat, _lon) in enumerate(batch):
                idx = i_lat * n_lon + i_lon
                values[idx] = round(decls[j] * 100)
            done += len(batch)
            if done % 2000 == 0 or done == n_cells:
                elapsed = time.time() - started
                print(f"  {done}/{n_cells} ({100 * done / n_cells:.1f}%) {elapsed:.0f}s")

    raw = bytearray()
    for v in values:
        raw.extend(v.to_bytes(2, "little"))

    bin_path = OUT_DIR / "gsiGeomag2020DeclinationWest.u16"
    gz_path = OUT_DIR / "gsiGeomag2020DeclinationWest.u16.gz"
    meta_path = OUT_DIR / "gsiGeomag2020DeclinationWest.meta.json"
    bin_path.write_bytes(raw)
    gz_path.write_bytes(gzip.compress(raw))

    meta = {
        "epoch": "2020.0",
        "source": "GSI geomag menu_04 sample.cgi (declination D on 0.1° lattice; west positive)",
        "latMin": LAT_MIN,
        "latMax": LAT_MAX,
        "lonMin": LON_MIN,
        "lonMax": LON_MAX,
        "stepDeg": STEP,
        "nLat": n_lat,
        "nLon": n_lon,
        "scale": 0.01,
        "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    meta_path.write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {bin_path} ({len(raw)} bytes)")


if __name__ == "__main__":
    main()
