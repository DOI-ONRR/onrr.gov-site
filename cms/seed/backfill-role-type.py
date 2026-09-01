#!/usr/bin/env python3
"""
Backfill contacts_person.role_type (federal / supervisor / indian / backup / manager)
and normalize the free-string `role` (trim whitespace, unify "Back-up" -> "Backup").
Idempotent: only writes rows whose value actually changes.

Prereq (in the Directus admin first): add a `role_type` dropdown field on
contacts_person with values federal / supervisor / indian / backup / manager, and
grant Public read on it (so the frontend can select it).

role_type rules (from the free-string role):
  starts "Supervisor"          -> supervisor
  ends   "Indian"              -> indian
  ends   "Federal"             -> federal
  contains "back"+"up"         -> backup
  == "Manager"                 -> manager
  == "Primary Contact" (generic, no fed/indian marker) -> derived from the contact's
     context: Indian Services page or an Indian-flavoured tab -> indian, else federal.
The generic derivation is a heuristic — worth an eyeball before --apply.

Usage:
  DIRECTUS_TOKEN=<token> python3 cms/seed/backfill-role-type.py            # dry-run
  DIRECTUS_TOKEN=<token> python3 cms/seed/backfill-role-type.py --apply    # write
  ... --skip-normalize   # only set role_type, leave role strings as-is
Env: DIRECTUS_URL (default http://localhost:8056).
"""
import json
import os
import re
import sys
import urllib.request
import urllib.parse
from collections import defaultdict

URL = os.environ.get("DIRECTUS_URL", "http://localhost:8056").rstrip("/")
TOKEN = os.environ.get("DIRECTUS_TOKEN")
APPLY = "--apply" in sys.argv
SKIP_NORMALIZE = "--skip-normalize" in sys.argv

INDIAN_KW = ("indian", "fimo", "iesc", "iimo", "tribal")


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


def norm_role(role):
    return re.sub(r"\s+", " ", (role or "").strip()).replace("Back-up", "Backup")


def role_type(role, ctx_indian):
    r = (role or "").strip().lower()
    if r.startswith("supervisor"):
        return "supervisor"
    if r.endswith("indian"):
        return "indian"
    if r.endswith("federal"):
        return "federal"
    if "back" in r and "up" in r:
        return "backup"
    if r == "manager":
        return "manager"
    if r == "primary contact":
        return "indian" if ctx_indian else "federal"
    return "federal"


def patch_group(collection, keys, data):
    # one PATCH sets `data` on every id in `keys`
    for i in range(0, len(keys), 100):
        api(f"/items/{collection}", method="PATCH",
            body={"keys": keys[i:i + 100], "data": data})


def main():
    # Preflight: the role_type field must exist before we can read or write it.
    fields = {f["field"] for f in api("/fields/contacts_person")["data"]}
    if "role_type" not in fields:
        sys.exit(
            "contacts_person has no `role_type` field yet — add it in the admin first\n"
            "  (String, Select Dropdown: federal / supervisor / indian / backup / manager),\n"
            "  grant Public read, then re-run this script."
        )

    contacts = {c["id"]: c for c in get_all("contacts", "id,page,tab")}
    people = get_all("contacts_person", "id,role,role_type,contacts_id")

    def ctx_indian(cid):
        c = contacts.get(cid) or {}
        return c.get("page") == "Indian Services" or any(k in (c.get("tab") or "").lower() for k in INDIAN_KW)

    # role_type: group ids by target value, skipping rows already correct
    by_type = defaultdict(list)
    for p in people:
        target = role_type(p.get("role"), ctx_indian(p.get("contacts_id")))
        if p.get("role_type") != target:
            by_type[target].append(p["id"])

    print("role_type changes:")
    for t in ("federal", "supervisor", "indian", "backup", "manager"):
        print(f"  {len(by_type[t]):4}  -> {t}")

    # role normalization: group ids by new string, only where it changes
    by_role = defaultdict(list)
    if not SKIP_NORMALIZE:
        for p in people:
            new = norm_role(p.get("role"))
            if new != (p.get("role") or ""):
                by_role[new].append(p["id"])
        print("role-string normalizations:")
        for new, ids in sorted(by_role.items(), key=lambda kv: -len(kv[1])):
            print(f"  {len(ids):4}  -> {new!r}")

    if not APPLY:
        print("dry-run — re-run with --apply to write.")
        return

    for t, ids in by_type.items():
        if ids:
            patch_group("contacts_person", ids, {"role_type": t})
    for new, ids in by_role.items():
        if ids:
            patch_group("contacts_person", ids, {"role": new})
    print(f"applied: {sum(len(v) for v in by_type.values())} role_type, "
          f"{sum(len(v) for v in by_role.values())} role strings.")


if __name__ == "__main__":
    main()
