#!/usr/bin/env python3
"""
Migrate one CMS page + its full block tree from a source Directus to a destination,
preserving ids. Works for ANY page: the M2A block junctions are discovered from
/relations at runtime and walked recursively (pages -> page_blocks -> block, and
container blocks like tab_blocks / card_blocks / expansion_panels -> their own
junctions -> nested blocks). Item payloads carry real columns only (no aliases),
so relationships rebuild from the migrated junction rows.

Prereqs on the DESTINATION (must already exist): the page's parent page, any M2O
target a block points at (e.g. collection_block.contact_topic), and any file the
content references. Order is items -> page -> junctions, so FKs resolve.

Usage:
  SRC_URL=http://localhost:8056  SRC_TOKEN=<admin> \
  DEST_URL=https://<upgrade>     DEST_TOKEN=<admin> \
  python3 cms/seed/migrate-page.py <page-id>            # dry-run
  ... --apply                                           # write
"""
import json
import os
import sys
import urllib.request
import urllib.parse

SRC_URL = os.environ.get("SRC_URL", "http://localhost:8056").rstrip("/")
SRC_TOKEN = os.environ.get("SRC_TOKEN")
DEST_URL = (os.environ.get("DEST_URL") or "").rstrip("/")
DEST_TOKEN = os.environ.get("DEST_TOKEN")
APPLY = "--apply" in sys.argv
WIPE = "--wipe" in sys.argv  # delete this page's tree from DEST first (for a clean re-run)
ARGS = [a for a in sys.argv[1:] if not a.startswith("-")]
PAGE_ID = ARGS[0] if ARGS else os.environ.get("PAGE_ID")

AUDIT = {"user_created", "date_created", "user_updated", "date_updated"}


def api(base, token, path, method="GET", body=None):
    if not token:
        sys.exit("Missing token (set SRC_TOKEN / DEST_TOKEN).")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{base}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read()  # DELETE returns 204 No Content (empty body)
            return json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        try:
            msg = json.load(e).get("errors", [{}])[0].get("message", "")
        except Exception:
            msg = e.read().decode(errors="replace")[:200]
        sys.exit(f"Directus error {e.code} on {method} {path}:\n  {msg}")


def columns(collection):
    # Real (non-alias) columns only, minus audit — so payloads never carry O2M/M2A
    # aliases (which would trigger nested creates of not-yet-existing junction rows).
    fs = api(SRC_URL, SRC_TOKEN, f"/fields/{collection}")["data"]
    return [f["field"] for f in fs if f.get("type") != "alias" and f["field"] not in AUDIT]


def src_items(collection, filt=None, ids=None):
    cols = columns(collection)
    q = {"fields": ",".join(cols), "limit": -1}
    if "sort" in cols:
        q["sort"] = "sort"
    if filt:
        q["filter"] = json.dumps(filt)
    if ids is not None:
        if not ids:
            return []
        q["filter"] = json.dumps({"id": {"_in": list(ids)}})
    return api(SRC_URL, SRC_TOKEN, f"/items/{collection}?{urllib.parse.urlencode(q)}")["data"]


def strip(rows):
    return [{k: v for k, v in r.items() if k not in AUDIT} for r in rows]


def m2a_nesting():
    """Discover every M2A block junction from /relations, so this works for ANY block
    type — not just the ones on one page. Returns parent collection -> [(junction, fk)].
    An M2A junction has an `item` relation with a one_collection_field plus a parent M2O."""
    rels = api(SRC_URL, SRC_TOKEN, "/relations")["data"]
    juncs = {r["collection"] for r in rels
             if r.get("field") == "item" and (r.get("meta") or {}).get("one_collection_field")}
    out = {}
    for r in rels:
        j = r["collection"]
        if j in juncs and r.get("field") != "item" and r.get("related_collection") and not j.endswith("_test"):
            out.setdefault(r["related_collection"], []).append((j, r["field"]))
    return out


def collect():
    nesting = m2a_nesting()          # parent -> [(junction, parent_fk)]
    items, jrows, seen = {}, {}, set()

    # BFS the block tree from the page through every M2A junction (recurses into
    # container blocks like tab_blocks / card_blocks / expansion_panels).
    frontier = [("pages", [PAGE_ID])]
    while frontier:
        parent, pids = frontier.pop()
        for junction, fk in nesting.get(parent, []):
            rows = src_items(junction, filt={fk: {"_in": list(pids)}})
            if not rows:
                continue
            jrows.setdefault(junction, []).extend(rows)
            by_coll = {}
            for r in rows:
                by_coll.setdefault(r["collection"], []).append(r["item"])
            for coll, cids in by_coll.items():
                items.setdefault(coll, set()).update(cids)
                fresh = [i for i in cids if (coll, i) not in seen]
                for i in fresh:
                    seen.add((coll, i))
                if coll in nesting and fresh:      # a container block → recurse
                    frontier.append((coll, fresh))

    data = {"pages": strip([src_items("pages", ids={PAGE_ID})[0]])}
    for coll, ids in items.items():
        data[coll] = strip(src_items(coll, ids=ids))
    for j, rows in jrows.items():
        data[j] = strip(rows)

    # item collections (no FKs among them) -> page -> junctions (reference both)
    order = sorted(items.keys()) + ["pages"] + sorted(jrows.keys())
    return data, order


def main():
    if not PAGE_ID:
        sys.exit("Pass the page id as an argument.")
    data, order = collect()
    print(f"Collected for page {PAGE_ID}:")
    for c in order:
        print(f"  {len(data[c]):4}  {c}")
    print(f"  note: page parent = {data['pages'][0].get('parent')} (must exist on dest)")

    if not (APPLY or WIPE):
        print("dry-run — set DEST_URL/DEST_TOKEN and re-run with --apply to write.")
        return
    if not (DEST_URL and DEST_TOKEN):
        sys.exit("Set DEST_URL and DEST_TOKEN to write.")

    # WIPE: delete the tree from DEST in reverse order (junctions/children first),
    # only the ids that actually exist there — so it's safe after a partial run.
    if WIPE:
        for c in reversed(order):
            ids = [r["id"] for r in data[c]]
            if not ids:
                continue
            q = urllib.parse.urlencode({"fields": "id", "limit": -1, "filter": json.dumps({"id": {"_in": ids}})})
            existing = [r["id"] for r in api(DEST_URL, DEST_TOKEN, f"/items/{c}?{q}")["data"]]
            if existing:
                api(DEST_URL, DEST_TOKEN, f"/items/{c}", method="DELETE", body=existing)
                print(f"  wiped {len(existing):4}  {c}")

    if APPLY:
        for c in order:
            rows = data[c]
            if not rows:
                continue
            for i in range(0, len(rows), 100):
                api(DEST_URL, DEST_TOKEN, f"/items/{c}", method="POST", body=rows[i:i + 100])
            print(f"  wrote {len(rows):4}  {c}")
    print("done.")


if __name__ == "__main__":
    main()
