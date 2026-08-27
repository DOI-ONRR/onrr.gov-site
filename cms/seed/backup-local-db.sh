#!/usr/bin/env bash
#
# backup-local-db.sh — dump the local Directus Postgres (running in Docker) to a
# timestamped plain-SQL file. The pre-conversion safety net for schema migrations.
#
# Usage:
#   bash cms/seed/backup-local-db.sh
#
# Restore into a fresh DB:
#   psql -U directus -d <target-db> -f <file>.sql
#
# Env overrides (defaults match the local dev setup):
#   CONTAINER=database  DB_USER=directus  DB_NAME=directus
#   BACKUP_DIR="$HOME/Developer/ONRR/db-backups"
set -euo pipefail

CONTAINER="${CONTAINER:-database}"
DB_USER="${DB_USER:-directus}"
DB_NAME="${DB_NAME:-directus}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/Developer/ONRR/db-backups}"

# Sanity: container running + DB reachable.
if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Error: container '$CONTAINER' is not running (set CONTAINER=…)." >&2
  exit 1
fi
if ! docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc 'SELECT 1' >/dev/null 2>&1; then
  echo "Error: can't reach DB '$DB_NAME' as '$DB_USER' in '$CONTAINER'." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/local-${DB_NAME}-$(date +%Y%m%d-%H%M%S).sql"

echo "Dumping '$DB_NAME' from '$CONTAINER' → $FILE"
docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fp --no-owner --no-acl > "$FILE"

# Verify it landed and finished cleanly (pg_dump writes this marker last).
if ! tail -5 "$FILE" | grep -q "PostgreSQL database dump complete"; then
  echo "Error: dump did not complete cleanly — check $FILE" >&2
  exit 1
fi

SIZE=$(ls -lh "$FILE" | awk '{print $5}')
TABLES=$(grep -c '^CREATE TABLE' "$FILE" || true)
echo "OK — $SIZE, $TABLES tables."
echo "$FILE"
