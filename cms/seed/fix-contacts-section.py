#!/usr/bin/env python3
"""
One-off cleanup of contacts.section for the oil-gas-reporting topic:
  1. Fix the typo "Onshore& Offshore" -> "Onshore & Offshore" (wherever it appears).
  2. Label the unlabeled Royalty half of oil-gas-reporting: section null -> "Royalty"
     (those rows are the merged old Oil & Gas Royalty page; the Production rows already
     carry the Onshore & Offshore section).
Idempotent: only writes rows whose section actually changes.

Usage:
  DIRECTUS_TOKEN=<token> python3 cms/seed/fix-contacts-section.py           # dry-run
  DIRECTUS_TOKEN=<token> python3 cms/seed/fix-contacts-section.py --apply
Env: DIRECTUS_URL (default http://localhost:8056).
"""
import json
import os
import sys
import urllib.request
import urllib.parse

URL = os.environ.get("DIRECTUS_URL", "http://localhost:8056").rstrip("/")
TOKEN = os.environ.get("DIRECTUS_TOKEN")
APPLY = "--apply" in sys.argv

TYPO, TYPO_FIXED = "Onshore& Offshore", "Onshore & Offshore"
ROYALTY_TOPIC, ROYALTY_LABEL = "oil-gas-reporting", "Royalty"


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


def find_ids(filter_obj):
    q = urllib.parse.urlencode({"fields": "id", "limit": -1, "filter": json.dumps(filter_obj)})
    return [r["id"] for r in api(f"/items/contacts?{q}")["data"]]


def patch(ids, section):
    for i in range(0, len(ids), 100):
        api("/items/contacts", method="PATCH", body={"keys": ids[i:i + 100], "data": {"section": section}})


def main():
    fields = {f["field"] for f in api("/fields/contacts")["data"]}
    if "section" not in fields:
        sys.exit("contacts has no `section` field.")

    # 1. typo fix (global)
    typo_ids = find_ids({"section": {"_eq": TYPO}})
    # 2. Royalty label (oil-gas-reporting rows still missing a section)
    royalty_ids = find_ids({
        "_and": [
            {"topics": {"contact_topics_id": {"slug": {"_eq": ROYALTY_TOPIC}}}},
            {"section": {"_null": True}},
        ]
    })

    print(f"  {len(typo_ids):4}  section {TYPO!r} -> {TYPO_FIXED!r}")
    print(f"  {len(royalty_ids):4}  {ROYALTY_TOPIC} section null -> {ROYALTY_LABEL!r}")

    if not (typo_ids or royalty_ids):
        print("nothing to do.")
        return
    if not APPLY:
        print("dry-run — re-run with --apply to write.")
        return

    if typo_ids:
        patch(typo_ids, TYPO_FIXED)
    if royalty_ids:
        patch(royalty_ids, ROYALTY_LABEL)
    print(f"applied: {len(typo_ids) + len(royalty_ids)} rows.")


if __name__ == "__main__":
    main()
