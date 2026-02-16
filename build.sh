#!/bin/bash
set -e
echo "Building Portionist backend..."
cd backend
npm install
npm run build
echo "Build complete!"
