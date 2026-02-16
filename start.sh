#!/bin/bash
set -e
echo "Starting Portionist backend..."
cd backend
echo "Installing dependencies..."
npm install
echo "Building TypeScript..."
npm run build
echo "Starting server..."
npm start
