#! /bin/bash

# Update & Upgrade
sudo apt-get update -y
sudo apt-get upgrade -y

# Install modul
sudo apt-get install -y wget curl git zip unzip

# Install webserver
sudo apt-get install -y nginx

# Change database
# Install PostgreSQL
sudo chmod +x postgresql.sh
sudo ./postgresql.sh

# Install FreeRadius + PostgreSQL
sudo chmod +x freeradiuspgsql.sh
sudo ./freeradiuspgsql.sh

# Install Web Captive Portal
sudo chmod +x web.sh
#sudo ./web.sh
