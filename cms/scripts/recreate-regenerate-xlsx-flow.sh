#!/usr/bin/env bash
#
# recreate-regenerate-xlsx-flow.sh — (re)create the "Regenerate download XLSX" manual flow.
#
# The flow is a Directus DB record (not code), so it must be created in each environment. The code it
# depends on — the `regenerate-dataset-xlsx` operation extension — deploys with the CMS (build:all),
# so deploy the CMS to the target env FIRST, then run this against that env.
#
# It adds a Manual-trigger flow on the dataset_metadata collection (list page): select one or more
# datasets in the table, click "Regenerate download XLSX", and each selected dataset's downloadable
# Excel file is rebuilt in-process from current data/dictionary/notes (same file id — stable link).
#
# Usage:
#   API_URL=https://<cms-host> ADMIN_TOKEN=<admin-static-token> cms/scripts/recreate-regenerate-xlsx-flow.sh
#
# Idempotency: this creates a NEW flow each run. To avoid duplicates, delete the old one first (in the
# Data Studio under Settings > Flows, or DELETE /flows/<id>).
set -euo pipefail
: "${API_URL:?set API_URL to the target CMS base URL}"
: "${ADMIN_TOKEN:?set ADMIN_TOKEN to an admin static token for the target env}"

auth=(-H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json")

FLOW=$(curl -s "${auth[@]}" -X POST "$API_URL/flows" -d '{
  "name":"Regenerate download XLSX",
  "icon":"sync",
  "color":"#2ECDA7",
  "description":"Rebuild the selected dataset(s) downloadable Excel file from current data, dictionary, and notes.",
  "status":"active",
  "trigger":"manual",
  "accountability":"all",
  "options":{"collections":["dataset_metadata"],"location":"collection","requireSelection":true}
}' | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")

OP=$(curl -s "${auth[@]}" -X POST "$API_URL/operations" -d "{
  \"flow\":\"$FLOW\",
  \"key\":\"regenerate_xlsx\",
  \"name\":\"Regenerate XLSX\",
  \"type\":\"regenerate-dataset-xlsx\",
  \"position_x\":19,\"position_y\":1,
  \"options\":{\"keys\":\"{{\$trigger.body.keys}}\"}
}" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")

curl -s "${auth[@]}" -X PATCH "$API_URL/flows/$FLOW" -d "{\"operation\":\"$OP\"}" -o /dev/null

echo "Created flow $FLOW with operation $OP on $API_URL"
echo "If the operation failed to create, confirm the 'regenerate-dataset-xlsx' extension is deployed there."
