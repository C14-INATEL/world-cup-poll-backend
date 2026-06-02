#!/bin/sh
set -e

echo "Running database migrations..."
node dist/src/scripts/migrate.js
echo "Migration OK"

echo "Running seed..."
node dist/src/scripts/seed-games.js
echo "Seed OK"

echo "Starting application..."
exec node dist/src/server.js