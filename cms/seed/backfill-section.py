#!/usr/bin/env python3
"""
Backfill contacts.section from the legacy tab/accordion pair: section = accordion
or tab (the finer split wins). Idempotent: only writes rows whose section changes.

Prereq (in the Directus admin first): add a `section` string field on `contacts`.
After this backfill you can drop the `tab` and `accordion` fields (and their
contacts-tab-select / contacts-accordion-select interface extensions).

Usage:
  DIRECTUS_TOKEN=<token> python3 cms/seed/backfill-section.py            # dry-run
  DIRECTUS_TOKEN=<token> python3 cms/seed/backfill-section.py --apply
Env: DIRECTUS_URL (default http://localhost:8056).
"""
import json
import os
import sys
import urllib.request
import urllib.parse
from collections import defaultdict

URL = os.environ.get("DIRECTUS_URL", "http://localhost:8056").rstrip("/")
TOKEN = os.environ.get("DIRECTUS_TOKEN")
APPLY = "--apply" in sys.argv


def api(path, method="GET", body=None):
    if not TOKEN:
        sys.exit("Set DIRECTUS_TOKEN to a Directus static/admin token.")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{URL}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            msg = json.load(e).get("errors", [{}])[0].get("message", "")
        except Exception:
            msg = e.read().decode(errors="replace")[:200]
        sys.exit(f"Directus error {e.code} on {method} {path}:\n  {msg}")


def get_all(collection, fields):
    q = urllib.parse.urlencode({"fields": fields, "limit": -1})
    return api(f"/items/{collection}?{q}")["data"]


def patch_group(collection, keys, data):
    for i in range(0, len(keys), 100):
        api(f"/items/{collection}", method="PATCH", body={"keys": keys[i:i + 100], "data": data})


def main():
    fields = {f["field"] for f in api("/fields/contacts")["data"]}
    if "section" not in fields:
        sys.exit("contacts has no `section` field yet — add it (String) in the admin, then re-run.")

    rows = get_all("contacts", "id,tab,accordion,section")

    # group ids by target section, skipping rows already correct
    by_section = defaultdict(list)
    for r in rows:
        target = r.get("accordion") or r.get("tab") or None
        if r.get("section") != target:
            by_section[target].append(r["id"])

    changes = sum(len(v) for v in by_section.values())
    print(f"rows: {len(rows)}   section changes: {changes}")
    for target, ids in sorted(by_section.items(), key=lambda kv: -len(kv[1])):
        print(f"  {len(ids):4}  -> {target!r}")

    if not changes:
        print("nothing to do.")
        return
    if not APPLY:
        print("dry-run — re-run with --apply to write.")
        return

    for target, ids in by_section.items():
        patch_group("contacts", ids, {"section": target})
    print(f"applied: {changes} rows.")


if __name__ == "__main__":
    main()
