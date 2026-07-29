#!/usr/bin/env bash
#
# schema-apply-http.sh — apply a Directus schema snapshot through the HTTP API
# (/schema/diff -> /schema/apply) instead of the `directus schema apply` CLI.
#
# WHY: the CLI runs in a standalone process that never bootstraps the Directus
# license, so it falls back to the free-tier "core" entitlements and rejects
# schema changes with e.g. "collections limit exceeded" — even when the instance
# has a valid unlimited license. The HTTP endpoints execute in the running,
# licensed server process, so they respect your license.
#
# Usage:
#   DIRECTUS_URL=https://upgrade-onrr-cms.app.cloud.gov \
#   DIRECTUS_TOKEN=<admin-static-or-access-token> \
#   ./schema-apply-http.sh [snapshot.yaml] [--dry-run] [--force]
#
# Args:
#   snapshot.yaml   Snapshot to apply (default: current.yaml next to this script).
#   --dry-run       Compute + summarize the diff but do NOT apply.
#   --force         Add ?force=true (skips the vendor/version + drift hash guards).
#
# Requires: curl, jq. Env: DIRECTUS_URL, DIRECTUS_TOKEN.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SNAPSHOT="$SCRIPT_DIR/current.yaml"
DRY_RUN=false
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --force)   FORCE=true ;;
    -h|--help) sed -n '2,26p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)        echo "Unknown option: $arg" >&2; exit 2 ;;
    *)         SNAPSHOT="$arg" ;;
  esac
done

: "${DIRECTUS_URL:?Set DIRECTUS_URL to the running Directus base URL}"
: "${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN to an admin token}"
command -v curl >/dev/null || { echo "curl is required" >&2; exit 1; }
command -v jq   >/dev/null || { echo "jq is required" >&2; exit 1; }
[ -f "$SNAPSHOT" ] || { echo "Snapshot not found: $SNAPSHOT" >&2; exit 1; }

BASE="${DIRECTUS_URL%/}"
QS=""; $FORCE && QS="?force=true"
AUTH=(-H "Authorization: Bearer $DIRECTUS_TOKEN")

# --- 1) diff: upload the snapshot as a file. A non-application/json MIME type is
#        parsed server-side as YAML, so current.yaml goes as-is (no conversion). ---
echo "→ Diffing $(basename "$SNAPSHOT") against $BASE ..."
diff_resp="$(curl -sS -w $'\n%{http_code}' -X POST "$BASE/schema/diff$QS" \
  "${AUTH[@]}" -F "file=@$SNAPSHOT;type=application/yaml")"
diff_code="$(tail -n1 <<<"$diff_resp")"
diff_body="$(sed '$d' <<<"$diff_resp")"

# No diff -> server returns 204 / empty body.
if [ "$diff_code" = "204" ] || [ -z "$diff_body" ] || [ "$(jq -r '.data // empty' <<<"$diff_body" 2>/dev/null)" = "" ]; then
  if [ "$diff_code" = "200" ] || [ "$diff_code" = "204" ]; then
    echo "✓ No schema changes — already up to date."
    exit 0
  fi
  echo "✗ Diff failed (HTTP $diff_code):" >&2
  echo "$diff_body" | jq . 2>/dev/null || echo "$diff_body" >&2
  exit 1
fi

# --- summarize ---
echo "→ Changes:"
jq -r '.data.diff as $d |
  "   collections: \((($d.collections)//[])|length)  fields: \((($d.fields)//[])|length)  relations: \((($d.relations)//[])|length)"' <<<"$diff_body"
jq -r 'def kn($k): if $k=="N" then "add" elif $k=="D" then "delete" elif $k=="E" then "edit" else ($k // "?") end;
  .data.diff.collections[]? | "     • \(.collection): \(kn(.diff[0].kind))"' <<<"$diff_body"

if $DRY_RUN; then
  echo "✓ Dry run — not applied. Re-run without --dry-run to apply."
  exit 0
fi

# --- 2) apply: send the { hash, diff } object. Upload it as a JSON file (multipart)
#        to sidestep the JSON request-body size limit on large diffs. ---
echo "→ Applying ..."
apply_tmp="$(mktemp)"; trap 'rm -f "$apply_tmp"' EXIT
jq -c '.data' <<<"$diff_body" > "$apply_tmp"

apply_resp="$(curl -sS -w $'\n%{http_code}' -X POST "$BASE/schema/apply$QS" \
  "${AUTH[@]}" -F "file=@$apply_tmp;type=application/json")"
apply_code="$(tail -n1 <<<"$apply_resp")"
apply_body="$(sed '$d' <<<"$apply_resp")"

if [ "$apply_code" = "200" ] || [ "$apply_code" = "204" ]; then
  echo "✓ Schema applied."
else
  echo "✗ Apply failed (HTTP $apply_code):" >&2
  echo "$apply_body" | jq . 2>/dev/null || echo "$apply_body" >&2
  exit 1
fi
