#!/usr/bin/env bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/qrm-dashboard"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating PostgreSQL Database Backup ($TIMESTAMP)..."
docker exec qrm-postgres pg_dump -U postgres qrm_db > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Retain last 30 daily backups
find "$BACKUP_DIR" -type f -name "db_backup_*.sql" -mtime +30 -delete

echo "✅ Backup successfully saved to $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
