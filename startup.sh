#!/bin/bash
# Azure App Service startup script for Next.js standalone mode

# Set Node.js environment
export NODE_ENV=production
export PORT=${PORT:-8080}

# Debug: Check current directory and files
echo "=== STARTUP DEBUG INFORMATION ==="
echo "Current working directory: $(pwd)"
echo "Contents of current directory:"
ls -la
echo "Contents of .next directory:"
ls -la .next/ 2>/dev/null || echo ".next directory not found"
echo "Contents of .next/server directory:"
ls -la .next/server/ 2>/dev/null || echo ".next/server directory not found"
echo "Contents of .next/static directory:"
ls -la .next/static/ 2>/dev/null || echo ".next/static directory not found"
echo "BUILD_ID file:"
cat .next/BUILD_ID 2>/dev/null || echo "BUILD_ID file not found"
echo "Required server files:"
cat .next/required-server-files.json 2>/dev/null || echo "required-server-files.json not found"

# Run deployment verification if available
if [ -f "verify-deployment.js" ]; then
    echo "Running deployment verification:"
    node verify-deployment.js
fi

echo "=================================="

# Start the Next.js standalone server
echo "Starting Next.js standalone server on port $PORT"
node server.js
