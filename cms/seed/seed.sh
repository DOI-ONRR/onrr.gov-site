#!/usr/bin/env bash
#
# Seed any Directus collection from a JSON array file (batch create).
#
# Usage:
#   DIRECTUS_TOKEN=<token> bash cms/seed/seed.sh <collection> <json-file>
#   DIRECTUS_TOKEN=<token> bash cms/seed/seed.sh handbooks cms/seed/handbooks-index.json
#   DIRECTUS_TOKEN=<token> DIRECTUS_URL=http://localhost:8056 bash cms/seed/seed.sh events cms/seed/events-upcoming.json
#
# Get a token in Directus: your user menu → "Token" (generate a static token),
# or use an existing admin static token. Reads/creates run as that user.
set -euo pipefail

URL="${DIRECTUS_URL:-http://localhost:8056}"
: "${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN to a Directus static/admin token}"
COLLECTION="${1:?Usage: seed.sh <collection> <json-file>}"
FILE="${2:?Usage: seed.sh <collection> <json-file>}"

echo "Seeding $(python3 -c "import json;print(len(json.load(open('$FILE'))))") item(s) → $URL/items/$COLLECTION"

curl -fSS -X POST "$URL/items/$COLLECTION" \
  -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary "@$FILE" \
  | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(f'Created {len(d)} item(s).'); [print(f\"  #{e.get('id')}  {e.get('title','')}\") for e in d]"
