#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh /path/to/backup.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="docker-postgres-1"

echo "⚠️ Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U postgres

echo "✅ Database restore complete!"
