#!/bin/bash

# Get IP address
ip_address=$(hostname -I | cut -d' ' -f1)

# Copy html folder to /var/www/html
sudo cp -r ~/captive_portal/config/postgresql/web/html /var/www/html

# Change values in .env file
sed -i "s|WEB_URL=http://localhost:80|WEB_URL=http://$ip_address:80|" ~/captive_portal/config/postgresql/web/server/.env
sed -i "s|REDIRECT_OAUTH_URL=http://localhost:4000|REDIRECT_OAUTH_URL=http://$ip_address:4000|" ~/captive_portal/config/postgresql/web/server/.env
sed -i "s|BACKEND_URL=http://localhost:4000|BACKEND_URL=http://$ip_address:4000|" ~/captive_portal/config/postgresql/web/server/.env

# Install dependencies and start the server
cd ~/captive_portal/config/postgresql/web/server
npm install typescript

# Try starting the server up to 2 times
for i in 1 2; do
    echo "Starting the server (attempt $i)..."
    npm run serve &
    sleep 5  # Wait for server to start
    if curl -s http://$ip_address:4000 >/dev/null; then
        echo "The server is now running."
        echo ">>> Finished configuring and starting the web server <<<"
        exit 0  # Server started successfully, exit the script
    else
        echo "Failed to start the server."
        # Clear log file
        rm -f ~/captive_portal/config/postgresql/web/server/logs/*.log
    fi
done

# If the server failed to start after 2 attempts, run uninstall.sh
echo "The server failed to start after 2 attempts. Running uninstall.sh..."
sudo chmod +x uninstall.sh
sudo ./uninstall.sh
