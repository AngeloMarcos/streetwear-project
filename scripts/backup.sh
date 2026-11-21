#!/bin/sh
# Backup diário do banco e das fotos. Agendado no cron da VPS:
#   40 3 * * * cd /opt/bloco && sh scripts/backup.sh >> backups/backup.log 2>&1
# Usa o docker-compose da VPS (Traefik). Em outro servidor: COMPOSE="docker compose" sh scripts/backup.sh
set -eu
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
COMPOSE=${COMPOSE:-"docker compose -f docker-compose.vps.yml -p bloco"}
mkdir -p backups
STAMP=$(date +%Y%m%d-%H%M)
DB="backups/db-$STAMP.sql.gz"
UP="backups/uploads-$STAMP.tar.gz"

$COMPOSE exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "backups/.db-$STAMP.sql"
# o dump só vale se terminou inteiro
if ! tail -n 5 "backups/.db-$STAMP.sql" | grep -q "PostgreSQL database dump complete"; then
  rm -f "backups/.db-$STAMP.sql"; echo "ERRO backup $STAMP: dump do banco incompleto"; exit 1
fi
gzip -c "backups/.db-$STAMP.sql" > "$DB" && rm -f "backups/.db-$STAMP.sql"
$COMPOSE exec -T app tar czf - -C /app uploads > "$UP" || echo "aviso: sem fotos enviadas para copiar"
[ -s "$UP" ] || rm -f "$UP"

# mantém os últimos 14 dias
find backups -name '*.gz' -mtime +14 -delete
echo "backup ok $STAMP banco=$(du -h "$DB" | cut -f1)"
