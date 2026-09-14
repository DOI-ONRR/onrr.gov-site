#!/usr/bin/env python3
"""
Clear the fiscal-year disbursement rows for ONE fiscal year, so the revenue-data-update
hook's create-once FY summarizer (loadFiscalYearDisbursement) will re-create them on the
next disbursement ingest.

It deletes only the `disbursement` fact rows attached to the year's `period.type =
'Fiscal Year'` row — the period row itself is left in place (the summarizer attaches new
rows to that existing period and does NOT create it). Monthly disbursement rows are
untouched.

Dry-run by default (counts only); pass --apply to delete.

Usage:
  TOKEN=<admin> python3 cms/seed/clear-fy-disbursements.py 2024              # dry-run
  TOKEN=<admin> python3 cms/seed/clear-fy-disbursements.py 2024 --apply      # delete

Env:
  URL    Directus base URL (default http://localhost:8056)
  TOKEN  admin token (required)
"""
import json
import os
import ssl
import sys
import urllib.parse
import urllib.request

# python.org's macOS Python ships without a CA bundle; use certifi when available so an
# https:// URL (e.g. a remote instance) doesn't fail CERTIFICATE_VERIFY_FAILED.
try:
    import certifi
    _CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _CTX = ssl.create_default_context()

URL = os.environ.get("URL", "http://localhost:8056").rstrip("/")
TOKEN = os.environ.get("TOKEN")
APPLY = "--apply" in sys.argv
POSITIONAL = [a for a in sys.argv[1:] if not a.startswith("-")]
YEAR = POSITIONAL[0] if POSITIONAL else None

if not TOKEN:
    sys.exit("Set TOKEN=<admin token>.")
if not YEAR or not YEAR.isdigit():
    sys.exit("Usage: TOKEN=<admin> python3 clear-fy-disbursements.py <fiscal_year> [--apply]")
YEAR = int(YEAR)


def api(path, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        URL + path,
        data=data,
        method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, context=_CTX) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"Directus {method} {path} -> {e.code}: {e.read().decode(errors='replace')[:300]}")


# 1. Find the 'Fiscal Year' period row(s) for this year.
pq = urllib.parse.urlencode({
    "fields": "id,fiscal_year",
    "limit": -1,
    "filter": json.dumps({"_and": [{"type": {"_eq": "Fiscal Year"}}, {"fiscal_year": {"_eq": YEAR}}]}),
})
periods = api(f"/items/period?{pq}").get("data", [])
if not periods:
    sys.exit(
        f"No 'Fiscal Year' period row for {YEAR} — nothing to clear, and the summarizer "
        f"needs that period row to exist. (Check the year, or seed the FY period first.)"
    )
period_ids = [p["id"] for p in periods]
print(f"Fiscal Year period id(s) for {YEAR}: {period_ids}")

# 2. Find the disbursement rows attached to those period(s).
dq = urllib.parse.urlencode({
    "fields": "id",
    "limit": -1,
    "filter": json.dumps({"period": {"_in": period_ids}}),
})
rows = api(f"/items/disbursement?{dq}").get("data", [])
ids = [r["id"] for r in rows]
print(f"FY {YEAR} disbursement rows: {len(ids)}")

if not ids:
    print("Nothing to delete — this year has no FY disbursement rows, so the summarizer will "
          "already (re)create them on the next ingest.")
    sys.exit(0)

if not APPLY:
    print("dry-run — re-run with --apply to delete these rows.")
    sys.exit(0)

# 3. Delete in batches (Directus deletes an array of primary keys).
BATCH = 100
deleted = 0
for i in range(0, len(ids), BATCH):
    chunk = ids[i:i + BATCH]
    api("/items/disbursement", method="DELETE", body=chunk)
    deleted += len(chunk)
    print(f"  deleted {deleted}/{len(ids)}")

print(f"done. Deleted {deleted} FY {YEAR} disbursement rows. "
      f"Re-run the disbursement ingest to re-summarize this year.")
