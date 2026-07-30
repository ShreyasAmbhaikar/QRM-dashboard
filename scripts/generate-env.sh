#!/bin/bash
set -e

if [ ! -f .env.production ]; then
    echo "Creating .env.production..."
    cp .env.example .env.production
    SECRET=$(openssl rand -base64 32)
    sed -i "s/development_secret_key_change_in_prod_32chars/$SECRET/g" .env.production
    echo "✅ .env.production generated with new NEXTAUTH_SECRET!"
else
    echo "ℹ️ .env.production already exists."
fi
