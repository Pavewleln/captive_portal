#! /bin/bash

read -p "Create New Database : " databases
echo ''
read -sp "Password Database : " pswdsql
echo ''

# Update & Upgrade
sudo apt-get update -y
sudo apt-get upgrade -y

# Install module
sudo apt-get install -y wget curl npm

# Change database
# Install PostgreSQL
sudo chmod +x postgresql.sh
sudo ./postgresql.sh $pswdsql

# Install FreeRadius + PostgreSQL
sudo chmod +x freeradiuspgsql.sh
sudo ./freeradiuspgsql.sh $pswdsql $databases

# Install Web Captive Portal
sudo chmod +x webserver.sh
sudo ./webserver.sh $pswdsql $databases
