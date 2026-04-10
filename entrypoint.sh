#!/bin/sh
set -e

echo "Running database migrations..."
node dist/src/infrastructure/db/migrate.js

echo "Running seed..."
node dist/src/scripts/seed-games.js

echo "Starting application..."
exec node dist/src/server.js
