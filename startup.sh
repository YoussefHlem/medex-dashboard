#!/bin/bash
# Azure startup script to install dependencies and start the application

echo "Starting deployment setup..."

# Navigate to the application directory
cd /home/site/wwwroot

# Install production dependencies
echo "Installing production dependencies..."
npm install --production --silent

# Start the application
echo "Starting the application..."
node server.js
