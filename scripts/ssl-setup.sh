#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./ssl-setup.sh yourdomain.com"
    exit 1
fi

DOMAIN="$1"
echo "🔒 Provisioning Let's Encrypt SSL Certificate for $DOMAIN..."

certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

echo "✅ SSL Certificate Provisioned for $DOMAIN!"
