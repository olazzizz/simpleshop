#!/bin/bash
# Restore the database from a local backup file.
# Usage: ./scripts/db-restore.sh <backup-file.sql.gz> [release-name]
# Example: ./scripts/db-restore.sh simpleshop-backup-20240101-020000.sql.gz simpleshop

set -euo pipefail

BACKUP_FILE=${1:-}
RELEASE=${2:-simpleshop}

if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: $0 <backup-file.sql.gz> [release-name]"
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Error: file not found: $BACKUP_FILE"
  exit 1
fi

DEPLOY="${RELEASE}-postgres"

read -r -p "Restore '$BACKUP_FILE' into deployment/${DEPLOY}? This will overwrite existing data. [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo "Restoring $BACKUP_FILE into deployment/${DEPLOY}..."
gunzip -c "$BACKUP_FILE" | kubectl exec -i "deployment/${DEPLOY}" -- \
  psql -U simpleshop simpleshop

echo "Restore complete."
