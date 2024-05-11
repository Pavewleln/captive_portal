#!/bin/bash

# Install webserver
sudo apt-get install -y nginx

echo ">>> Installing Webserver <<<"
if [ -z $1 ]
then
    echo ''
    read -sp "PostgreSQL password : " paswd
else
    paswd=$1
fi
[[ -z $paswd ]] && { echo "Password is required!"; exit 1; }

if [ -z $2 ]
then
    echo ''
    read -p "PostgreSQL database name : " db
else
    db=$2
fi
[[ -z $db ]] && { echo "Database name is required!"; exit 1; }

# Get IP address
ip_address=$(hostname -I | cut -d' ' -f1)

# Change values in .env file
sed -i "s|WEB_URL=http://localhost:80|WEB_URL=http://$ip_address:80|" ~/captive_portal/portal/server/.env
sed -i "s|REDIRECT_OAUTH_URL=http://localhost:4000|REDIRECT_OAUTH_URL=http://$ip_address:4000|" ~/captive_portal/portal/server/.env
sed -i "s|BACKEND_URL=http://localhost:4000|BACKEND_URL=http://$ip_address:4000|" ~/captive_portal/portal/server/.env
sed -i "s|POSTGRESQL_HOST=localhost|POSTGRESQL_HOST=$ip_address|" ~/captive_portal/portal/server/.env
sed -i "s|POSTGRESQL_DATABASE=portal|POSTGRESQL_DATABASE=$db|" ~/captive_portal/portal/server/.env
sed -i "s|POSTGRESQL_PASSWORD=portalpass|POSTGRESQL_PASSWORD=$paswd|" ~/captive_portal/portal/server/.env
sed -i "s|const url = 'http://localhost:4000'|const url = 'http://$ip_address:4000'|" ~/captive_portal/portal/html/js/utils/config.js


# Copy html folder to /var/www/html
sudo rm -rf /var/www/html
sudo cp -r ./portal/html /var/www/html

echo "Starting server"

# Install dependencies and start the server
cd ~/captive_portal/portal/server
echo "Starting the server..."
npm install
npm run serve