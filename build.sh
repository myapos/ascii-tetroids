#!/usr/bin/env bash

# Build script for ascii-tetroids
# Bundles TypeScript code and copies assets to dist/

set -e

echo "Building ascii-tetroids..."

# Clean up previous build
echo "Cleaning dist folder..."
rm -rf dist/
mkdir -p dist

# Bundle TypeScript with esbuild
esbuild index-new.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=dist/index-new.js \
  --banner:js='#!/usr/bin/env node' \
  --minify

# Copy static assets
cp inputSample.txt dist/
cp -r src/audio/sounds dist/sounds

echo "Build complete! Output in dist/"
