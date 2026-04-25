#!/usr/bin/env bash
# Restore Medusa Postgres from db/dump.sql.gz into the DATABASE_URL in .env.
# Destructive — drops and recreates the schema. Only run on a fresh box
# during migration, never on a live store.
#
# Usage:  ./scripts/restore-db.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f db/dump.sql.gz ]]; then
  echo "error: db/dump.sql.gz not found" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "error: .env not found" >&2
  exit 1
fi

DBURL=$(grep -oP '^DATABASE_URL=\K.*' .env)
if [[ -z "$DBURL" ]]; then
  echo "error: DATABASE_URL missing from .env" >&2
  exit 1
fi

# Parse db name out of postgres://user:pwd@host[:port]/dbname?...
DBNAME=$(echo "$DBURL" | sed -E 's#^postgres(ql)?://[^/]+/([^?]+).*#\2#')
echo "Restoring into database: $DBNAME"
echo "This will DROP and recreate the schema. Type the DB name to confirm:"
read -r confirm
if [[ "$confirm" != "$DBNAME" ]]; then
  echo "aborted." >&2
  exit 1
fi

# Drop schema clean. Connect to postgres maintenance DB to drop+recreate
# the target one.
ADMINURL=$(echo "$DBURL" | sed -E "s#/${DBNAME}([?]|\$)#/postgres\1#")

psql "$ADMINURL" -c "DROP DATABASE IF EXISTS \"$DBNAME\";"
psql "$ADMINURL" -c "CREATE DATABASE \"$DBNAME\";"

echo "Loading dump..."
zcat db/dump.sql.gz | psql "$DBURL"
echo "done."
