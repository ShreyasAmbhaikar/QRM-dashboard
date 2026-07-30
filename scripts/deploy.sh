#!/usr/bin/env bash
set -e

echo "🚀 Deploying QRM Dashboard Production Stack..."

# 1. Pull latest code
git pull origin main

# 2. Build Docker images
docker compose -f docker-compose.yml build --no-cache

# 3. Database migrations
docker compose run --rm app npx prisma migrate deploy

# 4. Start production services
docker compose -f docker-compose.yml up -d

echo "✅ Production deployment complete!"
