#!/usr/bin/env python3
"""
Backfill the contacts <-> contact_topics M2M junction from each contact's legacy
`page` string. Idempotent: skips (contact, topic) pairs that already exist.

Prereqs (do these in the Directus admin first):
  1. Create the `contact_topics` collection and seed it:
       DIRECTUS_TOKEN=<token> bash cms/seed/seed.sh contact_topics cms/seed/contact-topics.json
  2. Add an M2M field named `topics` on `contacts` -> related `contact_topics`.
     Accept Directus's default junction: collection `contacts_contact_topics`
     with fields `contacts_id` and `contact_topics_id` (override via env if you
     named them differently).

Usage:
  DIRECTUS_TOKEN=<token> python3 cms/seed/backfill-contact-topics.py            # dry-run (preview)
  DIRECTUS_TOKEN=<token> python3 cms/seed/backfill-contact-topics.py --apply    # write junction rows

Env overrides: DIRECTUS_URL (default http://localhost:8056),
  JUNCTION (contacts_contact_topics), LEFT_FK (contacts_id), RIGHT_FK (contact_topics_id).
"""
import json
import os
import sys
import urllib.request
import urllib.parse

URL = os.environ.get("DIRECTUS_URL", "http://localhost:8056").rstrip("/")
TOKEN = os.environ.get("DIRECTUS_TOKEN")
JUNCTION = os.environ.get("JUNCTION", "contacts_contact_topics")
LEFT_FK = os.environ.get("LEFT_FK", "contacts_id")
RIGHT_FK = os.environ.get("RIGHT_FK", "contact_topics_id")
APPLY = "--apply" in sys.argv

# legacy `contacts.page` -> `contact_topics.slug`
PAGE_TO_SLUG = {
    "Getting Started": "getting-started",
    "System Access": "system-access",
    "Oil & Gas Royalty": "oil-gas-reporting",
    "Oil & Gas Production": "oil-gas-reporting",
    "Oil & Gas Rent": "oil-gas-rent",
    "Leases & Agreements": "leases-agreements",
    "Solid Minerals": "solid-minerals",
    "Geothermal": "geothermal",
    "Payments": "payments-debt",
    "Indian Services": "indian-services",
    "Compliance & Enforcement": "compliance-enforcement",
    "Valuation & Pricing": "valuation-pricing",
    "Information Requests": "information-requests",
    "Contact Info Updates": "information-requests",
    "Website Feedback": "information-requests",
}


def api(path, method="GET", body=None):
    if not TOKEN:
        sys.exit("Set DIRECTUS_TOKEN to a Directus static/admin token.")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{URL}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def get_all(collection, fields):
    q = urllib.parse.urlencode({"fields": fields, "limit": -1})
    return api(f"/items/{collection}?{q}")["data"]


def main():
    # slug -> topic id
    topics = get_all("contact_topics", "id,slug")
    slug_to_id = {t["slug"]: t["id"] for t in topics}
    missing_slugs = set(PAGE_TO_SLUG.values()) - set(slug_to_id)
    if missing_slugs:
        sys.exit(f"contact_topics is missing slugs {sorted(missing_slugs)} — seed it first.")

    contacts = get_all("contacts", "id,page")

    # existing pairs, to stay idempotent
    existing = get_all(JUNCTION, f"{LEFT_FK},{RIGHT_FK}")
    have = {(e[LEFT_FK], e[RIGHT_FK]) for e in existing}

    rows, unmapped = [], {}
    for c in contacts:
        page = c.get("page")
        slug = PAGE_TO_SLUG.get(page)
        if not slug:
            unmapped[page] = unmapped.get(page, 0) + 1
            continue
        pair = (c["id"], slug_to_id[slug])
        if pair in have:
            continue
        have.add(pair)
        rows.append({LEFT_FK: c["id"], RIGHT_FK: slug_to_id[slug]})

    print(f"contacts: {len(contacts)}  existing junction rows: {len(existing)}")
    print(f"new junction rows to create: {len(rows)}")
    if unmapped:
        print("  WARNING unmapped page values (skipped):")
        for p, n in sorted(unmapped.items()):
            print(f"    {n:4}  {p!r}")

    if not rows:
        print("nothing to do.")
        return
    if not APPLY:
        print("dry-run — re-run with --apply to write.")
        return

    created = api(f"/items/{JUNCTION}", method="POST", body=rows)["data"]
    print(f"created {len(created)} junction row(s).")


if __name__ == "__main__":
    main()
