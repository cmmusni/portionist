#!/bin/bash
set -e

echo "=== START.SH EXECUTION BEGIN at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
echo "Current directory: $PWD"
echo "Script location: $0"

cd backend
echo "Changed to backend directory: $(pwd)"

# Run migrations first
echo "=== RUNNING MIGRATIONS at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
npm run migrate

# Then start the app
echo "=== STARTING APP SERVER at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
npm start
echo "=== START.SH EXECUTION END at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
