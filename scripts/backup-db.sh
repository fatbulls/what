#!/usr/bin/env bash
# Snapshot the Medusa Postgres DB into the repo for migration / disaster
# recovery. Stays in `db/dump.sql.gz` (single-file) so each backup
# overwrites the previous — git history keeps the timeline.
#
# Usage:   ./scripts/backup-db.sh
# Restore: ./scripts/restore-db.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "error: .env not found in repo root" >&2
  exit 1
fi

DBURL=$(grep -oP '^DATABASE_URL=\K.*' .env)
if [[ -z "$DBURL" ]]; then
  echo "error: DATABASE_URL missing from .env" >&2
  exit 1
fi

mkdir -p db
TS=$(date +%Y-%m-%dT%H:%M:%S%z)

echo "Dumping Medusa DB → db/dump.sql.gz ($TS)"
pg_dump \
  --no-owner --no-acl --quote-all-identifiers \
  "$DBURL" | gzip -9 > db/dump.sql.gz.tmp

mv db/dump.sql.gz.tmp db/dump.sql.gz

ROWS=$(zcat db/dump.sql.gz | grep -c '^COPY ' || true)
SIZE=$(du -h db/dump.sql.gz | cut -f1)
echo "done — $SIZE, $ROWS COPY blocks"
echo
echo "Commit + push:"
echo "  git add db/dump.sql.gz && git commit -m 'db: snapshot $TS' && git push"
