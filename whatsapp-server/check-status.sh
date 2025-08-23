#!/usr/bin/env bash
# Script simple para verificar el endpoint de status
set -e
URL="http://localhost:3001/api/whatsapp/status"
echo "Comprobando $URL"
curl -s $URL | jq . || true
