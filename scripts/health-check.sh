#!/bin/bash
set -e

URL="http://localhost:3000/api/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")

if [ "$STATUS" -eq 200 ]; then
    echo "🟢 Health check OK ($STATUS)"
    exit 0
else
    echo "🔴 Health check FAILED ($STATUS)"
    exit 1
fi
