#!/usr/bin/env python3
"""
Fold the five legacy per-handbook TOC collections into one handbook_toc seed.

Reads the existing revenue_handbook / production_handbook / solid_minerals_handbook /
geothermal_class_1 / geothermal_class_2_3 rows from a Directus instance, resolves each
to its owning `handbooks` row by title keyword (so it survives id changes), and writes
cms/seed/handbook_toc-seed.json ready to import into the consolidated `handbook_toc`
collection (M2O `handbook` -> handbooks).

Usage:
  python3 cms/seed/export-handbook-toc.py                       # reads http://localhost:8056
  DIRECTUS_URL=http://localhost:8056 python3 cms/seed/export-handbook-toc.py
"""
import json, os, subprocess

BASE = os.environ.get("DIRECTUS_URL", "http://localhost:8056")
OUT = os.environ.get("OUT", os.path.join(os.path.dirname(__file__), "handbook_toc-seed.json"))
TOKEN = os.environ.get("DIRECTUS_TOKEN")  # optional; needed if reads aren't public

# source TOC collection -> keyword that identifies its handbooks row title
COLL_TO_KEYWORD = {
    "revenue_handbook":        "Revenue",
    "production_handbook":     "Production",
    "solid_minerals_handbook": "Solid",
    "geothermal_class_1":      "Class 1",
    "geothermal_class_2_3":    "Class 2",
}
FIELDS = ["chapter", "section", "title", "actual_page", "toc_page", "url", "sort"]


def get(path):
    # curl (not urllib) so it uses the system cert store — Python.framework on
    # macOS often can't verify TLS against cloud.gov hosts.
    cmd = ["curl", "-sS", "--fail", "--max-time", "60", f"{BASE}{path}"]
    if TOKEN:
        cmd += ["-H", f"Authorization: Bearer {TOKEN}"]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    return json.loads(out)["data"]


# Build title-keyword -> handbook uuid from the current handbooks rows.
handbooks = get("/items/handbooks?fields=id,title&limit=-1")

def resolve(keyword):
    matches = [h for h in handbooks if keyword.lower() in (h["title"] or "").lower()]
    if len(matches) != 1:
        raise SystemExit(f"Expected exactly one handbook matching '{keyword}', got {len(matches)}")
    return matches[0]["id"]


out, max_title = [], 0
for coll, keyword in COLL_TO_KEYWORD.items():
    hb = resolve(keyword)
    rows = get(f"/items/{coll}?limit=-1&sort=sort,id&fields={','.join(FIELDS)}")
    for i, r in enumerate(rows, start=1):
        title = r.get("title") or ""
        max_title = max(max_title, len(title))
        out.append({
            "handbook": hb,
            "sort": i,
            "chapter": r.get("chapter"),
            "section": r.get("section"),
            "title": title,
            "actual_page": r.get("actual_page"),
            "toc_page": r.get("toc_page"),
            "url": r.get("url"),
        })
    print(f"  {coll:26} -> {len(rows):4} rows  (handbook {hb[:8]}…)")

with open(OUT, "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"\nTotal: {len(out)} rows -> {OUT}")
if max_title > 255:
    print(f"⚠ Longest title is {max_title} chars — make handbook_toc.title a `text` field, not `string`.")
