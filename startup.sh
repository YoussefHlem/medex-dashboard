#!/bin/bash
# Azure App Service startup script for Next.js standalone mode

# Set Node.js environment
export NODE_ENV=production
export PORT=${PORT:-8080}

# Start the Next.js standalone server
echo "Starting Next.js standalone server on port $PORT"
node server.js