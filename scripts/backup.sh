#!/bin/sh
# Backup diário do banco e das fotos. Agende no cron da VPS:
#   0 4 * * * cd /opt/bloco && sh scripts/backup.sh >> backups/backup.log 2>&1
set -e
cd "$(dirname "$0")/.."
. ./.env
mkdir -p backups
STAMP=$(date +%Y%m%d-%H%M)
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "backups/db-$STAMP.sql.gz"
docker compose exec -T app tar czf - -C /app uploads > "backups/uploads-$STAMP.tar.gz"
# mantém os últimos 14 dias
find backups -name '*.gz' -mtime +14 -delete
echo "backup ok $STAMP"
