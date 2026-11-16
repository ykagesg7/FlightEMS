#!/usr/bin/env python3
"""Extract Italy en-route navaids from AIP Italia ENR 4.1 PDF.

Reads a compiled pAIP PDF (ENR 4), parses ENR 4.1.1 (civil / en-route) and
ENR 4.1.2 (military aids not in the AD section) with `pdftotext -bbox`,
and writes a GeoJSON FeatureCollection in the same property shape as
FlightAcademy's Navaids_JAPAN.geojson.

Usage:
  python3 extract_enr41_navaids.py [--pdf PATH] [--out PATH] [--compare PATH]

GROSSETO (GRO) DVOR is published in ENR 4.1.1-4 with a blank coordinate
cell. The values in UNVERIFIED_COORDS (copied from the user's submitted
file) are used only for that station, flagged in metadata, and are not
AIP values. `--compare` also uses the submitted file to fill blanks and
to print a discrepancy report.
"""

from __future__ import annotations

import argparse
import html
import json
import math
import re
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

AID_TYPES = (
    "DVOR/DME",
    "TVOR/DME",
    "VOR/DME",
    "VORTAC",
    "DVOR",
    "TVOR",
    "TACAN",
    "NDB",
    "DME",
    "L",
)

# Japan / FA map convention: DVOR/TVOR/VOR/DME family -> VOR; Locator -> NDB.
TYPE_MAP = {
    "VORTAC": "VORTAC",
    "VOR/DME": "VOR",
    "DVOR/DME": "VOR",
    "TVOR/DME": "VOR",
    "DVOR": "VOR",
    "TVOR": "VOR",
    "VOR": "VOR",
    "TACAN": "TACAN",
    "NDB": "NDB",
    "L": "NDB",
    "DME": "DME",
}

# Katakana labels for the planning map (same readings as the submitted file).
KATAKANA = {
    "ALG": "アルゲーロ",
    "ANC": "アンコーナ",
    "BAR": "バーリ",
    "BOA": "ボローニャ",
    "OZE": "ボルツァーノ",
    "CDC": "カラッファ・ディ・カタンザーロ",
    "CAR": "カルボナーラ",
    "CTF": "カターニア",
    "CHI": "キオッジャ",
    "CRN": "クロトーネ",
    "DEC": "デチモマンヌ",
    "ELB": "エルバ",
    "GRO": "グロッセート",
    "LMT": "ラメーツィア・テルメ",
    "LAT": "ラティーナ",
    "MMP": "マルペンサ",
    "OST": "オスティア",
    "PAL": "パレルモ",
    "PAN": "パンテッレリーア",
    "PRT": "ペレートラ",
    "PES": "ペスカーラ",
    "PIS": "ピサ",
    "PNZ": "ポンツァ",
    "RCA": "レッジョ・カラブリア",
    "RMC": "ローマ",
    "RCH": "ロンキ・デイ・レジョナーリ",
    "SRN": "サロンノ",
    "SOR": "ソレント",
    "TAQ": "タルクイーニア",
    "TEA": "テアーノ",
    "TOP": "トリノ",
    "TRP": "トラーパニ",
    "TNT": "トレント",
    "TZO": "トレッツォ",
    "VIC": "ヴィチェンツァ",
    "VIE": "ヴィエステ",
    "VOG": "ヴォゲーラ",
    "MNL": "アメンドラ",
    "AVI": "アヴィアーノ",
    "CAM": "カメリ",
    "CEV": "チェルヴィア",
    "GHE": "ゲーディ",
    "GIO": "ジョーイア・デル・コッレ",
    "GRA": "グラッザニーゼ",
    "ISA": "イストラーナ",
    "LCC": "レッチェ",
    "PIA": "ピアチェンツァ",
    "TPR": "プラティカ・ディ・マーレ",
    "RIV": "リヴォルト",
    "SIG": "シゴネラ",
}

# AIP ENR 4.1.1-4 publishes GROSSETO DVOR with a blank antenna-coordinate
# cell (confirmed on the page image). These numbers are copied from the
# submitted dataset and are NOT taken from the AIP.
UNVERIFIED_COORDS = {
    ("GRO", "VOR"): (11.0717, 42.7597),
}

DMS_RE = re.compile(
    r"^(\d{2,3})°(\d{2})'(\d{2})''([NSEW])$"
)
IDENT_RE = re.compile(r"^[A-Z]{3}$")
CHAN_RE = re.compile(r"^(\d{1,3})([XY])$")
FREQ_RE = re.compile(r"^\d{2,4}\.\d{1,2}$")
VAR_RE = re.compile(r"^\(?\d+°$|^E-\d|^E-\d.+\)$|^\d+°$")
AIRAC_RE = re.compile(r"(\d{2}\s+[A-Z]{3}\s+\d{4})")
AMD_RE = re.compile(r"\(A\d+/\d+\)")
ENR_PAGE_RE = re.compile(r"ENR\s+(4\.1\.\d+)\s*-\s*(\d+)")

HEADER_WORDS = {
    "ENR", "AIP", "Italia", "AIRAC", "effective", "date", "RADIOAIUTI",
    "ALLA", "NAVIGAZIONE", "IN", "ROTTA", "RADIO", "NAVIGATION", "AIDS",
    "ENROUTE", "RADIOASSISTENZE", "MILITARI", "NON", "CONTENUTE",
    "NELLA", "PARTE", "AD", "MILITARY", "NOT", "INCLUDED", "SECTION",
    "Nome", "della", "stazione", "Station", "name", "Tipo", "di", "radio",
    "assistenza", "Type", "of", "aid", "ID", "FREQ", "Orario", "Coordinate",
    "Elevazione", "antenna", "Operational", "hours", "Antenna", "site",
    "coordinates", "Elevation", "DME", "nominale", "Limitazioni",
    "Designated", "operational", "coverage", "Limitations", "Interesse",
    "FRA", "Relevance", "Note", "Remarks", "Note", "Copertura",
    "operativa", "VAR", "ENAV", "Roma", "Legend", "for", "relevance:",
    "(E):", "(X):", "(I):", "(A):", "(D):", "Horizontal", "Entry",
    "Exit", "point,", "Intermediate", "Arrival", "Connecting",
    "Departure", "(WGS84)", "(VAR", "VOR)", "AMSL", "NIL",
}

CRS = {
    "type": "name",
    "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
}


def dms_to_deg(token: str) -> float:
    m = DMS_RE.match(token)
    if not m:
        raise ValueError(token)
    deg, minute, sec, hemi = m.groups()
    val = int(deg) + int(minute) / 60.0 + int(sec) / 3600.0
    if hemi in "SW":
        val = -val
    return val


def round4(val: float) -> float:
    return round(val + 0.0, 4)


def fmt_coord(val: float) -> str:
    return f"{val:.4f}"


def fmt_freq(val: float) -> str:
    s = f"{val:.2f}".rstrip("0")
    if s.endswith("."):
        s += "0"
    return s


def haversine_m(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def run_pdftotext_bbox(pdf: Path, first: int, last: int) -> str:
    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp:
        out = Path(tmp.name)
    try:
        subprocess.run(
            [
                "pdftotext",
                "-bbox",
                "-f",
                str(first),
                "-l",
                str(last),
                str(pdf),
                str(out),
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        return out.read_text(encoding="utf-8", errors="replace")
    finally:
        out.unlink(missing_ok=True)


def parse_pages(bbox_html: str) -> list[dict]:
    chunks = re.split(r"<page\s+", bbox_html)[1:]
    pages = []
    for idx, chunk in enumerate(chunks, start=1):
        hw = re.search(r'width="([^"]+)" height="([^"]+)"', chunk)
        width = float(hw.group(1)) if hw else 595.275
        height = float(hw.group(2)) if hw else 841.889
        words = []
        for m in re.finditer(
            r'<word xMin="([^"]+)" yMin="([^"]+)" xMax="([^"]+)" yMax="([^"]+)">([^<]*)</word>',
            chunk,
        ):
            x0, y0, x1, y1 = map(float, m.group(1, 2, 3, 4))
            text = html.unescape(m.group(5))
            words.append(
                {"x0": x0, "y0": y0, "x1": x1, "y1": y1, "yc": (y0 + y1) / 2, "t": text}
            )
        pages.append({"pdf_page": idx, "width": width, "height": height, "words": words})
    return pages


def page_header(page: dict) -> dict:
    texts = " ".join(w["t"] for w in page["words"] if w["y0"] < 80 or w["y0"] > 800)
    # Also search all words; AIRAC is in the header, amendment often in the footer.
    all_text = " ".join(w["t"] for w in page["words"])
    airac = None
    m = AIRAC_RE.search(all_text)
    if m:
        airac = m.group(1)
    amd = None
    m = AMD_RE.search(all_text)
    if m:
        amd = m.group(0)
    enr = None
    m = ENR_PAGE_RE.search(all_text)
    if m:
        enr = f"ENR {m.group(1)}-{m.group(2)}"
        section = m.group(1)
        sheet = int(m.group(2))
    else:
        section = None
        sheet = None
    return {"airac": airac, "amendment": amd, "enr_page": enr, "section": section, "sheet": sheet}


def is_type_word(w: dict) -> bool:
    if w["x0"] >= 120:
        return False
    return w["t"] in AID_TYPES


def station_windows(page: dict) -> list[tuple[float, float, dict]]:
    """Return (y_min, y_max, type_word) for each aid on the page."""
    types = [w for w in page["words"] if is_type_word(w)]
    types.sort(key=lambda w: w["yc"])
    # Footer / header bounds.
    ys = [w["y0"] for w in page["words"] if w["t"] in {"1", "2", "3"} and w["y0"] < 250]
    header_end = max(ys) + 8 if ys else 200.0
    footer_ys = [w["y0"] for w in page["words"] if w["t"] in {"ENAV", "Roma"} and w["y0"] > 750]
    footer_start = min(footer_ys) - 5 if footer_ys else 800.0
    windows = []
    for i, tw in enumerate(types):
        if i == 0:
            y_min = header_end
        else:
            y_min = (types[i - 1]["yc"] + tw["yc"]) / 2.0
        if i == len(types) - 1:
            y_max = footer_start
        else:
            y_max = (tw["yc"] + types[i + 1]["yc"]) / 2.0
        windows.append((y_min, y_max, tw))
    return windows


def in_band(w: dict, y_min: float, y_max: float) -> bool:
    return (w["yc"] >= y_min) and (w["yc"] < y_max)


def clean_name(parts: list[str]) -> str:
    name = " ".join(parts)
    name = re.sub(r"\s+", " ", name).strip()
    name = re.sub(r"/\s+", "/", name)
    return name


def parse_station(page: dict, y_min: float, y_max: float, type_word: dict, header: dict) -> dict:
    band = [w for w in page["words"] if in_band(w, y_min, y_max)]
    aip_type = type_word["t"]

    name_parts = []
    for w in sorted(band, key=lambda z: (z["y0"], z["x0"])):
        if w["x0"] >= 95:
            continue
        if w["t"] in AID_TYPES:
            continue
        if VAR_RE.match(w["t"]):
            continue
        if w["t"] in HEADER_WORDS or w["t"] in {"H24", "MHZ", "KHZ", "CH"}:
            continue
        if re.match(r"^\(?\d+°", w["t"]):
            continue
        name_parts.append(w["t"])
    name = clean_name(name_parts)

    ident = None
    ident_candidates = [
        w for w in band
        if IDENT_RE.match(w["t"]) and 90 <= w["x0"] <= 140 and w["t"] not in HEADER_WORDS
    ]
    if ident_candidates:
        ident_candidates.sort(key=lambda w: abs(w["yc"] - type_word["yc"]))
        ident = ident_candidates[0]["t"]

    freq = None
    freq_unit = None
    for w in band:
        if FREQ_RE.match(w["t"]) and 100 <= w["x0"] <= 180:
            freq = float(w["t"])
            # unit: nearest MHZ/KHZ in band
            break
    for w in band:
        if w["t"] in {"MHZ", "KHZ"} and 100 <= w["x0"] <= 200:
            freq_unit = w["t"]
            break

    ch = None
    for w in band:
        m = CHAN_RE.match(w["t"])
        if m and 120 <= w["x0"] <= 180:
            ch = m.group(1) + m.group(2).lower()
            break
    # "CH 43Y" may be a single token already handled; also "CH" + number
    if ch is None:
        left = [w for w in band if w["x0"] < 200]
        left.sort(key=lambda z: (z["y0"], z["x0"]))
        joined = " ".join(w["t"] for w in left)
        m = re.search(r"\bCH\s*(\d{1,3})([XYxy])\b", joined)
        if m:
            ch = m.group(1) + m.group(2).lower()

    lats = []
    lons = []
    for w in sorted(band, key=lambda z: (z["y0"], z["x0"])):
        if not DMS_RE.match(w["t"]):
            continue
        if w["x0"] < 180:
            continue
        val = dms_to_deg(w["t"])
        if w["t"].endswith("N") or w["t"].endswith("S"):
            lats.append((w["yc"], val, w["t"]))
        else:
            lons.append((w["yc"], val, w["t"]))

    coords = []
    for i in range(min(len(lats), len(lons))):
        lat = lats[i][1]
        lon = lons[i][1]
        coords.append((round4(lon), round4(lat), lats[i][2], lons[i][2]))

    # Prefer the VOR / DVOR / TVOR antenna when a second (DME or TACAN) site exists.
    chosen = coords[0] if coords else None

    return {
        "aip_type": aip_type,
        "map_type": TYPE_MAP[aip_type],
        "name2": name,
        "id": ident,
        "freq": freq,
        "freq_unit": freq_unit,
        "ch": ch,
        "coords": coords,
        "chosen": chosen,
        "enr_page": header["enr_page"],
        "section": header["section"],
        "airac": header["airac"],
        "amendment": header["amendment"],
        "pdf_page": page["pdf_page"],
    }


def extract(pdf: Path) -> tuple[list[dict], list[dict]]:
    # ENR 4.1.1 is PDF pages 1-12, ENR 4.1.2 is 13-18 (18 is blank).
    html_text = run_pdftotext_bbox(pdf, 1, 18)
    pages = parse_pages(html_text)
    stations = []
    page_meta = []
    for page in pages:
        header = page_header(page)
        if not header["section"] or not header["section"].startswith("4.1"):
            continue
        page_meta.append(
            {
                "pdf_page": page["pdf_page"],
                "enr_page": header["enr_page"],
                "airac_effective_date": header["airac"],
                "amendment": header["amendment"],
            }
        )
        for y_min, y_max, tw in station_windows(page):
            st = parse_station(page, y_min, y_max, tw, header)
            stations.append(st)
    return stations, page_meta


def fill_unverified_coords(stations: list[dict], fill_path: Path | None) -> list[str]:
    """Fill blank coordinates from a submitted GeoJSON. Returns notes."""
    notes = []
    fill = {}
    if fill_path and fill_path.is_file():
        data = json.loads(fill_path.read_text(encoding="utf-8"))
        for feat in data.get("features", []):
            p = feat.get("properties") or {}
            geom = feat.get("geometry") or {}
            key = (p.get("id"), p.get("type"))
            coords = geom.get("coordinates")
            if coords and len(coords) >= 2:
                fill[key] = (float(coords[0]), float(coords[1]))
    for st in stations:
        if st["chosen"] is not None:
            continue
        key = (st["id"], st["map_type"])
        src = None
        if key in fill:
            lon, lat = fill[key]
            src = fill_path.name if fill_path else "submitted file"
        elif key in UNVERIFIED_COORDS:
            lon, lat = UNVERIFIED_COORDS[key]
            src = "UNVERIFIED_COORDS (submitted file; not in AIP)"
        if src:
            st["chosen"] = (round4(lon), round4(lat), None, None)
            st["coord_source"] = (
                "submitted_unverified; AIP leaves the antenna coordinate cell blank"
            )
            notes.append(
                f"{st['id']} ({st['name2']} {st['aip_type']}): coordinates not published "
                f"in {st['enr_page']}; filled from submitted values "
                f"(not in AIP) as [{lon:.4f}, {lat:.4f}] (unverified)."
            )
        else:
            st["coord_source"] = "missing; AIP leaves the antenna coordinate cell blank"
            notes.append(
                f"{st['id']} ({st['name2']} {st['aip_type']}): coordinates not published "
                f"in {st['enr_page']}; not filled."
            )
    return notes


def feature_from_station(st: dict, generated: str) -> dict:
    props = {
        "type": st["map_type"],
        "name1": KATAKANA.get(st["id"], ""),
        "name2": st["name2"],
        "id": st["id"],
    }
    if st["ch"]:
        props["ch"] = st["ch"]
    if st["freq"] is not None:
        # Keep a JSON number (int or float), not a string.
        freq = st["freq"]
        # Normalize 113.80 -> 113.8 etc. via rounding to 2 dp first.
        freq = round(freq, 2)
        if abs(freq - round(freq, 1)) < 1e-9:
            freq = round(freq, 1)
        props["freq"] = freq
    feat = {
        "type": "Feature",
        "properties": props,
        "geometry": {
            "type": "Point",
            "coordinates": [
                st["chosen"][0] if st["chosen"] else None,
                st["chosen"][1] if st["chosen"] else None,
            ],
        },
    }
    return feat


def dumps_geojson(obj: dict) -> str:
    """Pretty-print GeoJSON with 4-dp coordinates and compact freqs."""

    def enc(o, indent=0) -> str:
        sp = "  " * indent
        sp1 = "  " * (indent + 1)
        if isinstance(o, dict):
            if not o:
                return "{}"
            parts = []
            for k, v in o.items():
                parts.append(f'{sp1}{json.dumps(k, ensure_ascii=False)}: {enc(v, indent+1)}')
            return "{\n" + ",\n".join(parts) + "\n" + sp + "}"
        if isinstance(o, list):
            # coordinates pair
            if len(o) == 2 and all(isinstance(x, (int, float)) or x is None for x in o):
                a = "null" if o[0] is None else fmt_coord(o[0])
                b = "null" if o[1] is None else fmt_coord(o[1])
                return f"[{a}, {b}]"
            if not o:
                return "[]"
            parts = [sp1 + enc(v, indent + 1) for v in o]
            return "[\n" + ",\n".join(parts) + "\n" + sp + "]"
        if isinstance(o, float):
            # freqs and other floats
            if abs(o - round(o, 1)) < 1e-9:
                return fmt_freq(o)
            return fmt_freq(o)
        return json.dumps(o, ensure_ascii=False)

    return enc(obj) + "\n"


def build_collection(stations: list[dict], page_meta: list[dict], notes: list[str], pdf: Path, generated: str) -> dict:
    features = [feature_from_station(st, generated) for st in stations]
    source_pages = []
    for pm in page_meta:
        if pm["enr_page"]:
            source_pages.append(
                f"{pm['enr_page']} (PDF p.{pm['pdf_page']}, AIRAC {pm['airac_effective_date']}, {pm['amendment']})"
            )
    meta = {
        "source": "AIP Italia ENR 4.1.1 RADIO NAVIGATION AIDS - ENROUTE; ENR 4.1.2 MILITARY RADIO AIDS NOT INCLUDED IN AD SECTION",
        "source_file": pdf.name,
        "source_pages": source_pages,
        "airac": "Compiled pAIP: ENR 4.1 sheets have different AIRAC effective dates (see source_pages). Newest ENR 4.1 sheets in this file: 06 AUG 2026 (A08/26). Oldest ENR 4.1.2 sheets: 28 NOV 2024 (A12/24).",
        "generated": generated,
        "coordinate_policy": "WGS84. For VOR/DME, DVOR/DME, TVOR/DME and VORTAC, the VOR/DVOR/TVOR antenna is used when a second DME or TACAN antenna is published. Rounded to 4 decimal degrees.",
        "type_policy": "Map 'type' follows Navaids_JAPAN.geojson: VOR (including VOR/DME, DVOR/DME, TVOR/DME, DVOR), VORTAC, TACAN, NDB (including Locator 'L'). AIP published type is not stored on the feature.",
        "counts": {
            "features": len(features),
            "by_map_type": _count(features),
            "by_aip_type": _count_aip(stations),
        },
        "notes": notes,
    }
    return {
        "type": "FeatureCollection",
        "crs": CRS,
        "metadata": meta,
        "features": features,
    }


def _count(features: list[dict]) -> dict:
    out: dict[str, int] = {}
    for f in features:
        t = f["properties"]["type"]
        out[t] = out.get(t, 0) + 1
    return out


def _count_aip(stations: list[dict]) -> dict:
    out: dict[str, int] = {}
    for s in stations:
        t = s["aip_type"]
        out[t] = out.get(t, 0) + 1
    return out


def compare(stations: list[dict], submitted_path: Path) -> list[str]:
    data = json.loads(submitted_path.read_text(encoding="utf-8"))
    sub = []
    for feat in data.get("features", []):
        p = feat["properties"]
        lon, lat = feat["geometry"]["coordinates"]
        sub.append(
            {
                "type": p.get("type"),
                "id": p.get("id"),
                "name2": p.get("name2"),
                "ch": (p.get("ch") or None),
                "freq": p.get("freq"),
                "lon": lon,
                "lat": lat,
            }
        )

    def key(id_, typ):
        return (id_, typ)

    # Match by (id, map_type).
    aip_map = {}
    for s in stations:
        aip_map.setdefault(key(s["id"], s["map_type"]), []).append(s)
    sub_map = {}
    for s in sub:
        sub_map.setdefault(key(s["id"], s["type"]), []).append(s)

    lines = []
    only_aip = [k for k in aip_map if k not in sub_map]
    only_sub = [k for k in sub_map if k not in aip_map]
    if only_aip:
        lines.append("Missing from submitted (present in AIP ENR 4.1):")
        for k in only_aip:
            for s in aip_map[k]:
                lines.append(f"  + {s['aip_type']} {s['id']} {s['name2']} ({s['enr_page']})")
    if only_sub:
        lines.append("Extra in submitted (not in AIP ENR 4.1.1 / 4.1.2):")
        for k in only_sub:
            for s in sub_map[k]:
                lines.append(f"  - {s['type']} {s['id']} {s['name2']} ch={s['ch']} freq={s['freq']} [{s['lon']}, {s['lat']}]")

    lines.append("Field differences on matched stations:")
    any_diff = False
    for k in sorted(aip_map, key=lambda x: (x[0], x[1])):
        if k not in sub_map:
            continue
        # 1-1 expected
        a = aip_map[k][0]
        b = sub_map[k][0]
        diffs = []
        if a["name2"] != b["name2"]:
            diffs.append(f"name2 AIP={a['name2']!r} submitted={b['name2']!r}")
        ach, bch = a["ch"] or None, b["ch"] or None
        if ach != bch:
            diffs.append(f"ch AIP={ach} submitted={bch}")
        af, bf = a["freq"], b["freq"]
        if af is None and bf is None:
            pass
        elif af is None or bf is None or abs(float(af) - float(bf)) > 1e-6:
            diffs.append(f"freq AIP={af} submitted={bf}")
        if a["chosen"] is None:
            diffs.append(
                f"coords AIP=(blank in {a['enr_page']}) submitted=[{b['lon']}, {b['lat']}]"
            )
        else:
            dlon = abs(a["chosen"][0] - float(b["lon"]))
            dlat = abs(a["chosen"][1] - float(b["lat"]))
            dist = haversine_m(a["chosen"][0], a["chosen"][1], float(b["lon"]), float(b["lat"]))
            if dlon > 0.002 or dlat > 0.002:
                diffs.append(
                    f"coords AIP=[{a['chosen'][0]:.4f}, {a['chosen'][1]:.4f}] "
                    f"submitted=[{b['lon']}, {b['lat']}] "
                    f"Δlon={dlon:.4f} Δlat={dlat:.4f} dist={dist:.1f} m"
                )
            elif dist > 1:
                # record small residuals only if meaningful, not as discrepancies > 0.002
                pass
        # AIP type vs map type note is not a submitted error when submitted used VOR+ch.
        if diffs:
            any_diff = True
            lines.append(f"  * {a['map_type']} {a['id']} ({a['enr_page']}, AIP {a['aip_type']}): " + "; ".join(diffs))
    if not any_diff:
        lines.append("  (none for ident/type/freq/channel; no coordinate difference > 0.002 deg)")
    return lines


def main(argv: list[str] | None = None) -> int:
    here = Path(__file__).resolve().parent
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--pdf", type=Path, default=here / "AIS_ITALY_ENR_4.pdf")
    p.add_argument("--out", type=Path, default=here / "Navaids_ITALY_checked.geojson")
    p.add_argument(
        "--compare",
        type=Path,
        default=None,
        help="Submitted GeoJSON to compare against, and to fill GROSSETO coords if the AIP cell is blank.",
    )
    p.add_argument("--generated", default=None, help="ISO date for metadata.generated (default: today).")
    args = p.parse_args(argv)

    if not args.pdf.is_file():
        print(f"PDF not found: {args.pdf}", file=sys.stderr)
        return 2

    stations, page_meta = extract(args.pdf)
    generated = args.generated or date.today().isoformat()

    fill_path = args.compare
    notes = [
        "PISA (PIS) 379 kHz and GRAZZANISE (GRA) 343 kHz are published as L (Locator); typed as NDB for the map.",
        "No standalone DME is published in ENR 4.1.1 or ENR 4.1.2.",
    ]
    notes.extend(fill_unverified_coords(stations, fill_path))

    # Flag DEC TACAN etc. only in compare output, not as a hard-coded note here,
    # except a general reminder about AD-only military aids.
    notes.append(
        "ENR 4.1.2 lists only military radio aids that are not in the AD section. "
        "Aids published solely in AD are outside this extract."
    )

    missing_id = [s for s in stations if not s["id"]]
    if missing_id:
        print("ERROR: stations without ident:", missing_id, file=sys.stderr)
        return 1

    collection = build_collection(stations, page_meta, notes, args.pdf, generated)
    args.out.write_text(dumps_geojson(collection), encoding="utf-8")
    print(f"Wrote {len(stations)} features to {args.out}")

    # Brief inventory to stdout.
    from collections import Counter
    print("AIP types:", dict(Counter(s["aip_type"] for s in stations)))
    print("Map types:", dict(Counter(s["map_type"] for s in stations)))
    if fill_path and fill_path.is_file():
        print("\n".join(compare(stations, fill_path)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
