#!/usr/bin/env bash
# Sync do catálogo + commit/push se houver mudanças.
# Usado pelo timer local (cron/systemd). O runner do GitHub não usa este script.
set -uo pipefail
cd "$(dirname "$0")/.."

code=0
python3 scripts/sync_catalog.py || code=$?

# 2 = bloqueado (nenhum endpoint respondeu); nada a fazer
if [ "$code" -eq 2 ]; then
    echo "sync bloqueado — catálogo mantido"
    exit 0
fi
if [ "$code" -ne 0 ]; then
    exit "$code"
fi

git add data/catalog.json
if git diff --staged --quiet; then
    echo "sem mudanças no catálogo"
    exit 0
fi

git -c user.name=CineStream -c user.email=cinestream@local \
    commit -m "chore: sync catalog $(date -u +%Y-%m-%dT%H:%MZ)"
git push origin main
