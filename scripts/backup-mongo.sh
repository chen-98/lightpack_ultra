#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-lighterpack}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT="${BACKUP_DIR}/${TIMESTAMP}-${DB_NAME}.archive.gz"

mkdir -p "$BACKUP_DIR"

docker compose exec -T mongo mongodump \
    --db "$DB_NAME" \
    --archive \
    --gzip > "$OUTPUT"

echo "MongoDB backup written to ${OUTPUT}"
