#!/bin/bash
set -e

echo "🌱 Seeding Database..."
pnpm prisma db seed

echo "✅ Seeding Complete!"
