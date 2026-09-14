#!/usr/bin/env python3
"""
Clear ONE month's disbursement rows (its 'Monthly' period), so the month can be re-loaded
cleanly — e.g. after it was loaded more than once (duplicates) or with pre-fix logic.

Deletes only the `disbursement` fact rows on that Monthly period. The period row and the
fund/location/commodity dimensions are left in place, and every other month is untouched.
After clearing, re-run the disbursement ingest ONCE; the hook's idempotency check then keeps
the month duplicate-free.

Note: this does NOT refresh fiscal-year rollups. If the month belongs to a COMPLETE fiscal
year that already has 'Fiscal Year' disbursement rows, those won't auto-update — clear them
too with clear-fy-disbursements.py and re-run so the summarizer rebuilds them.

Dry-run by default; pass --apply to delete.

Usage:
  TOKEN=<admin> python3 cms/seed/clear-month-disbursements.py 2025-12            # dry-run
  TOKEN=<admin> python3 cms/seed/clear-month-disbursements.py 2025-12 --apply    # delete

Env:
  URL    Directus base URL (default http://localhost:8056)
  TOKEN  admin token (required)
"""
import calendar
import json
import os
import re
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
MONTH = POSITIONAL[0] if POSITIONAL else None

if not TOKEN:
    sys.exit("Set TOKEN=<admin token>.")
if not MONTH or not re.match(r"^\d{4}-\d{2}$", MONTH):
    sys.exit("Usage: TOKEN=<admin> python3 clear-month-disbursements.py <YYYY-MM> [--apply]")

year, month = (int(x) for x in MONTH.split("-"))
if not 1 <= month <= 12:
    sys.exit(f"Invalid month in '{MONTH}'.")
first = f"{MONTH}-01"
last = f"{MONTH}-{calendar.monthrange(year, month)[1]:02d}"


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


# 1. Find the Monthly period for this month.
pq = urllib.parse.urlencode({
    "fields": "id,period_date,fiscal_year",
    "limit": -1,
    "filter": json.dumps({"_and": [
        {"type": {"_eq": "Monthly"}},
        {"period_date": {"_between": [first, last]}},
    ]}),
})
periods = api(f"/items/period?{pq}").get("data", [])
if not periods:
    sys.exit(f"No 'Monthly' period found for {MONTH}. Nothing to clear.")
period_ids = [p["id"] for p in periods]
fiscal_years = sorted({p.get("fiscal_year") for p in periods if p.get("fiscal_year") is not None})
print(f"Monthly period id(s) for {MONTH}: {period_ids}  (fiscal_year: {fiscal_years})")

# 2. Find the disbursement rows on that period.
dq = urllib.parse.urlencode({
    "fields": "id",
    "limit": -1,
    "filter": json.dumps({"period": {"_in": period_ids}}),
})
rows = api(f"/items/disbursement?{dq}").get("data", [])
ids = [r["id"] for r in rows]
print(f"{MONTH} disbursement rows: {len(ids)}")

if not ids:
    print("Nothing to delete.")
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

print(f"done. Deleted {deleted} disbursement rows for {MONTH}. "
      f"Re-run the disbursement ingest once to reload the month cleanly.")
if fiscal_years:
    print(f"reminder: if FY {fiscal_years} is complete and already has 'Fiscal Year' rows, "
          f"clear them with clear-fy-disbursements.py and re-run so the rollup rebuilds.")
