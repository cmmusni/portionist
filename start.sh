#!/bin/bash
set -e
cd backend
npm install
npm run build
# Run migrations after build so the production DB schema is created/updated
# This exits non-zero on migration failure which surfaces in Railway logs
npm run migrate
npm start
