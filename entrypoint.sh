#!/bin/sh

echo "Running database migrations..."
if npm run migrate:prod; then
  echo "Migration OK"
else
  echo "Migration FAILED with exit code $?"
  exit 1
fi

echo "Updating games..."
if npm run update-games; then
  echo "OK"
else
  echo "FAILED with exit code $?"
  exit 1
fi

echo "Starting application..."
exec npm start