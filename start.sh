#!/bin/bash
set -e

echo "=== START.SH EXECUTION BEGIN at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
echo "Current directory: $PWD"
echo "Script location: $0"

cd backend
echo "Changed to backend directory: $(pwd)"

echo "Running: npm install"
npm install

echo "Running: npm run build"
npm run build
# Run migrations after build so the production DB schema is created/updated
# This exits non-zero on migration failure which surfaces in Railway logs
# Debug: print which DB env vars are present (don't print secrets)
echo "=== DATABASE CONFIGURATION CHECK ==="
if [ -n "$DATABASE_URL" ]; then
	echo "DATABASE_URL is set"
else
	echo "DATABASE_URL is NOT set"
fi
echo "PGHOST=${PGHOST:-<unset>} PGPORT=${PGPORT:-<unset>} PGDATABASE=${PGDATABASE:-${POSTGRES_DB:-<unset>}} PGUSER=${PGUSER:-${POSTGRES_USER:-<unset>}}"

# Run migrations (exits non-zero on failure)
echo "=== RUNNING MIGRATIONS at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
npm run migrate

echo "=== STARTING APP SERVER at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
npm start
echo "=== START.SH EXECUTION END at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
