#!/bin/sh
# Vigia da loja: roda a cada 2 min pelo cron da VPS.
#   */2 * * * * cd /opt/bloco && sh scripts/watchdog.sh >> backups/watchdog.log 2>&1
# Se o site falhar 2 vezes seguidas, reinicia só o app da loja e avisa.
# Aviso no celular (opcional): instale o app ntfy, assine um tópico só seu e ponha ALERT_NTFY_TOPIC=<tópico> no .env.
set -u
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
COMPOSE=${COMPOSE:-"docker compose -f docker-compose.vps.yml -p bloco"}
URL="${SITE_URL:-https://$DOMAIN}/api/health"
STATE=backups/.watchdog-fails
mkdir -p backups

alert() {
  echo "$(date '+%F %T') $1"
  [ -n "${ALERT_NTFY_TOPIC:-}" ] && curl -s -m 10 -H "Title: Street Dreams" -d "$1" "https://ntfy.sh/$ALERT_NTFY_TOPIC" >/dev/null
  return 0
}

code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$URL")
if [ "$code" = "200" ]; then
  if [ -f "$STATE" ]; then rm -f "$STATE"; alert "Loja voltou ao ar"; fi
  exit 0
fi

fails=$(( $(cat "$STATE" 2>/dev/null || echo 0) + 1 ))
echo "$fails" > "$STATE"
echo "$(date '+%F %T') falha $fails (HTTP $code)"
if [ "$fails" -eq 2 ]; then
  alert "Loja fora do ar (HTTP $code). Reiniciando o app."
  $COMPOSE restart app
elif [ "$fails" -eq 10 ]; then
  alert "Loja continua fora do ar há 20 min. Precisa de ajuda manual."
fi
