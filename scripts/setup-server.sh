#!/bin/bash
set -e

echo "🚀 Starting VPS Provisioning..."

# Update system
apt update && apt upgrade -y
apt install -y curl git ufw ufw-docker fail2ban certbot

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "✅ VPS Provisioning Complete!"
