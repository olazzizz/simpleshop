#!/bin/bash
# Trigger an on-demand database backup and download it locally.
# Usage: ./scripts/db-backup.sh [release-name]
# Example: ./scripts/db-backup.sh simpleshop

set -euo pipefail

RELEASE=${1:-simpleshop}
JOB_NAME="${RELEASE}-backup-manual-$(date +%Y%m%d%H%M%S)"
OUTFILE="simpleshop-backup-$(date +%Y%m%d-%H%M%S).sql.gz"

read -r -p "Trigger a backup for release '${RELEASE}' and download it locally? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# Trigger the in-cluster backup job (writes to the backups PVC)
echo "Triggering in-cluster backup job: $JOB_NAME"
kubectl create job "$JOB_NAME" --from="cronjob/${RELEASE}-backup"
kubectl wait --for=condition=complete "job/${JOB_NAME}" --timeout=120s
echo "In-cluster backup complete."

# Also dump directly to a local file
echo "Downloading backup to: $OUTFILE"
kubectl exec "deployment/${RELEASE}-postgres" -- \
  pg_dump -U simpleshop simpleshop | gzip > "$OUTFILE"

echo "Done. Local backup saved to: $OUTFILE"
