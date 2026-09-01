#!/usr/bin/env bash
#
# Seed upcoming events into a Directus instance from events-upcoming.json.
#
# Usage:
#   DIRECTUS_TOKEN=<your-token> bash cms/seed/seed-events.sh
#   DIRECTUS_TOKEN=<token> DIRECTUS_URL=http://localhost:8056 bash cms/seed/seed-events.sh
#
# Get a token in Directus: your user menu → "Token" (generate a static token),
# or use an existing admin static token. Reads/creates run as that user.
#
# Directus batch-creates every record in the JSON array in a single POST.
set -euo pipefail

URL="${DIRECTUS_URL:-http://localhost:8056}"
: "${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN to a Directus static/admin token}"

DIR="$(cd "$(dirname "$0")" && pwd)"
DATA="$DIR/events-upcoming.json"

echo "Seeding $(python3 -c "import json;print(len(json.load(open('$DATA'))))") events → $URL/items/events"

curl -fSS -X POST "$URL/items/events" \
  -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary "@$DATA" \
  | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(f'Created {len(d)} events:'); [print(f\"  #{e['id']}  [{e['event_category']}]  {e['title']}\") for e in d]"
