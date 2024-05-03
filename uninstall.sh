#! /bin/bash

sudo apt-get purge --auto-remove -y wget curl zip unzip freeradius freeradius-utils freeradius-postgresql postgresql postgresql-contrib nginx npm
sudo apt-get remove --auto-remove -y wget curl zip unzip freeradius freeradius-utils freeradius-postgresql postgresql postgresql-contrib nginx npm
sudo rm -r /etc/postgresql
sudo rm -r /etc/freeradius
sudo rm -r /var/www/html