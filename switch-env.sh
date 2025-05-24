#!/bin/bash

MODE=$1

if [ "$MODE" = "ngrok" ]; then
    echo "Switching to ngrok configuration..."
    
    # Get ngrok URL from user
    read -p "Enter your ngrok URL (e.g., https://your-url.ngrok-free.app): " NGROK_URL
    
    # Extract domain from URL
    NGROK_DOMAIN=$(echo $NGROK_URL | sed 's|https://||' | sed 's|/.*||')
    
    # Create temp env file with substituted values
    sed "s|\[your-ngrok-url\]|$NGROK_URL|g; s|\[your-ngrok-domain\]|$NGROK_DOMAIN|g" .env.ngrok > .env.temp
    
    # Backup current .env
    mv .env .env.local.backup
    
    # Move temp file to .env
    mv .env.temp .env
    
    echo "Switched to ngrok configuration"
    echo "Your ngrok URL: $NGROK_URL"
    echo "Your ngrok domain: $NGROK_DOMAIN"

elif [ "$MODE" = "local" ]; then
    echo "Switching to local configuration..."
    
    if [ -f .env.local.backup ]; then
        mv .env.local.backup .env
        echo "Restored local configuration"
    else
        echo "No local backup found (.env.local.backup)"
        exit 1
    fi

else
    echo "Usage: ./switch-env.sh [local|ngrok]"
    exit 1
fi

# Clear Laravel cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "Done! Remember to restart your Laravel and Vite servers."
