#!/bin/bash
set -e
cd backend
npm install
npm run build
# Run migrations after build so the production DB schema is created/updated
# This exits non-zero on migration failure which surfaces in Railway logs
# Debug: print which DB env vars are present (don't print secrets)
if [ -n "$DATABASE_URL" ]; then
	echo "DATABASE_URL is set"
else
	echo "DATABASE_URL is NOT set"
fi
echo "PGHOST=${PGHOST:-<unset>} PGPORT=${PGPORT:-<unset>} PGDATABASE=${PGDATABASE:-${POSTGRES_DB:-<unset>}} PGUSER=${PGUSER:-${POSTGRES_USER:-<unset>}}"

# Run migrations (exits non-zero on failure)
npm run migrate
npm start
