#!/usr/bin/env bash
#
# recreate-rerun-revenue-update-flow.sh — (re)create the "Rerun revenue data update" manual flow.
#
# The flow is a Directus DB record (not code), so it must be created in each environment. The code it
# depends on — the `rerun-revenue-data-update` operation extension — deploys with the CMS (build:all),
# so deploy the CMS to the target env FIRST, then run this against that env.
#
# It adds a Manual-trigger flow on the revenue_data_update collection, shown as a button on the item
# detail page: open a previously-run item (success or error) and click "Rerun revenue data update".
# The item is re-run in-process from its stored dataset/period/file and its result/status are updated
# in place — no new revenue_data_update item is created.
#
# Usage:
#   API_URL=https://<cms-host> ADMIN_TOKEN=<admin-static-token> cms/scripts/recreate-rerun-revenue-update-flow.sh
#
# Idempotency: this creates a NEW flow each run. To avoid duplicates, delete the old one first (in the
# Data Studio under Settings > Flows, or DELETE /flows/<id>).
set -euo pipefail
: "${API_URL:?set API_URL to the target CMS base URL}"
: "${ADMIN_TOKEN:?set ADMIN_TOKEN to an admin static token for the target env}"

auth=(-H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json")

FLOW=$(curl -s "${auth[@]}" -X POST "$API_URL/flows" -d '{
  "name":"Rerun revenue data update",
  "icon":"replay",
  "color":"#2ECDA7",
  "description":"Re-run the selected revenue_data_update item(s) in place from the stored dataset, period, and file.",
  "status":"active",
  "trigger":"manual",
  "accountability":"all",
  "options":{"collections":["revenue_data_update"],"location":"item"}
}' | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")

OP=$(curl -s "${auth[@]}" -X POST "$API_URL/operations" -d "{
  \"flow\":\"$FLOW\",
  \"key\":\"rerun_revenue_data_update\",
  \"name\":\"Rerun revenue data update\",
  \"type\":\"rerun-revenue-data-update\",
  \"position_x\":19,\"position_y\":1,
  \"options\":{\"keys\":\"{{\$trigger.body.keys}}\"}
}" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")

curl -s "${auth[@]}" -X PATCH "$API_URL/flows/$FLOW" -d "{\"operation\":\"$OP\"}" -o /dev/null

echo "Created flow $FLOW with operation $OP on $API_URL"
echo "If the operation failed to create, confirm the 'rerun-revenue-data-update' extension is deployed there."
