#!/bin/bash

# Function to check if a port is in use
check_port() {
    lsof -i:"$1" >/dev/null 2>&1
    return $?
}

# Kill existing processes
echo "Cleaning up existing processes..."
kill -9 $(lsof -ti:8001) 2>/dev/null
kill -9 $(lsof -ti:5173) 2>/dev/null

# Clear Laravel cache
echo "Clearing Laravel cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Build Vite assets
echo "Building Vite assets..."
npm run build

# Start Laravel server with explicit host
echo "Starting Laravel server..."
php artisan serve --port=8001 --host=127.0.0.1 &
LARAVEL_PID=$!

# Start Vite dev server
echo "Starting Vite server..."
npm run dev &
VITE_PID=$!

# Wait for Laravel to start
echo "Waiting for Laravel server to start..."
while ! check_port 8001; do
    sleep 1
done
echo "Laravel server is running on port 8001"

# Wait for Vite to start
echo "Waiting for Vite server to start..."
while ! check_port 5173; do
    sleep 1
done
echo "Vite server is running on port 5173"

# Create required nginx directories
echo "Creating nginx directories..."
mkdir -p logs tmp
chmod 777 logs tmp

# Start Nginx with our configuration
echo "Starting Nginx reverse proxy..."
nginx -c "$(pwd)/ngrok.nginx.conf" -p "$(pwd)" 

# Verify nginx is running
if ! ps aux | grep -q "[n]ginx"; then
    echo "Error: Nginx failed to start"
    exit 1
fi
echo "Nginx is running"

# Start ngrok tunnel
echo "Starting ngrok tunnel..."
ngrok http 8001 \
    --config=none \
    --hostname=${TEMP_APP_URL#https://} \
    --log=stdout \
    --log-level=debug

# Cleanup function
cleanup() {
    echo "Cleaning up processes..."
    nginx -s quit 2>/dev/null
    kill $LARAVEL_PID $VITE_PID 2>/dev/null
    rm -rf logs/* tmp/*
}

# Register cleanup on script exit
trap cleanup EXIT INT TERM
