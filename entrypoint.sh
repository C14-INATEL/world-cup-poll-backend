#!/bin/sh
set -e

echo "Running database migrations..."
npm run migrate:prod
echo "Migration OK"

echo "Running seed..."
npm run seed:games
echo "Seed OK"

echo "Starting application..."
exec npm start