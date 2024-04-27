#!/bin/bash
echo ">>> Installing FreeRadius <<<"

# default version
RADIUS_VERSION='3.0'

# Install FreeRadius
sudo apt-get install -y freeradius freeradius-utils freeradius-postgresql

cd /etc/freeradius/$RADIUS_VERSION/mods-enabled
sudo ln -s ../mods-available/sql sql
sudo ln -s ../mods-available/sqlcounter sqlcounter
sed -i 's/^#\s*\(.*\$INCLUDE mods-enabled\/sql\)/\1/' /etc/freeradius/$RADIUS_VERSION/radiusd.conf
cd

# Create Database PostgreSQL
echo ">>> Create Database"
sudo -u postgres psql -c "CREATE DATABASE radius;"

# Import Schema
sudo -u postgres psql radius < /etc/freeradius/$RADIUS_VERSION/mods-config/sql/main/postgresql/schema.sql
sudo -u postgres psql radius < /etc/freeradius/$RADIUS_VERSION/mods-config/sql/main/postgresql/setup.sql


# Config Sites Default
sudo mv /etc/freeradius/$RADIUS_VERSION/sites-available/default /etc/freeradius/$RADIUS_VERSION/sites-available/default.back
sudo cp ~/captive_portal/config/default /etc/freeradius/$RADIUS_VERSION/sites-available/default

# Config Sites Tunnel
sudo mv /etc/freeradius/$RADIUS_VERSION/sites-available/inner-tunnel /etc/freeradius/$RADIUS_VERSION/sites-available/inner-tunnel.back
sudo cp ~/captive_portal/config/inner-tunnel /etc/freeradius/$RADIUS_VERSION/sites-available/inner-tunnel

# Config database
sudo mv /etc/freeradius/$RADIUS_VERSION/mods-available/sql /etc/freeradius/$RADIUS_VERSION/mods-available/sql.back
sudo cp ~/captive_portal/config/postgresql/sql /etc/freeradius/$RADIUS_VERSION/mods-available/sql

# Config sqlcounter
sudo mv /etc/freeradius/$RADIUS_VERSION/mods-available/sqlcounter /etc/freeradius/$RADIUS_VERSION/mods-available/sqlcounter.back
sudo cp ~/captive_portal/config/sqlcounter /etc/freeradius/$RADIUS_VERSION/mods-available/sqlcounter

# Add query sqlcounter
sudo cp ~/captive_portal/config/postgresql/accessperiod.conf /etc/freeradius/$RADIUS_VERSION/mods-config/sql/counter/postgresql/accessperiod.conf
sudo cp ~/captive_portal/config/postgresql/quotalimit.conf /etc/freeradius/$RADIUS_VERSION/mods-config/sql/counter/postgresql/quotalimit.conf

# Change Group
sudo chgrp -h freerad /etc/freeradius/$RADIUS_VERSION/mods-enabled/sql
sudo pkill radius

# Start & Enable FreeRadius
sudo systemctl start freeradius
sudo systemctl enable freeradius

echo ">>> Finished Installing FreeRadius <<<"
sleep 2
