#!/bin/bash
echo ">>> Installing FreeRadius <<<"
if [ -z $1 ]
then
	echo ''
	read -sp "Confirm PostgreSQL password : " paswd
else
	paswd=$1
fi
[[ -z $paswd ]] && { echo "Password is required!"; exit 1; }

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
if [ -z $2 ]
then
	echo ''
	read -p "Create database name : " db
else
	db=$2
fi
[[ -z $db ]] && { echo "Database is required!"; exit 1; }

# Create Database PostgreSQL
echo ">>> Create Database"
sudo -u postgres psql -c "CREATE DATABASE $db;"

# Import Schema
sudo -u postgres psql $db < ~/captive_portal/config/postgresql/schema.sql
sudo -u postgres psql $db < ~/captive_portal/config/postgresql/setup.sql
sudo -u postgres psql $db < ~/captive_portal/config/postgresql/data.sql

# Config Sites Default
sudo mv /etc/freeradius/$RADIUS_VERSION/sites-available/default /etc/freeradius/$RADIUS_VERSION/sites-available/default.back
sudo cp ~/captive_portal/config/default /etc/freeradius/$RADIUS_VERSION/sites-available/default

# Config Sites Tunnel
sudo mv /etc/freeradius/$RADIUS_VERSION/sites-available/inner-tunnel /etc/freeradius/$RADIUS_VERSION/sites-available/inner-tunnel.back
sudo cp ~/captive_portal/config/inner-tunnel /etc/freeradius/$RADIUS_VERSION/sites-available/inner-tunnel

# Config database
sudo mv /etc/freeradius/$RADIUS_VERSION/mods-available/sql /etc/freeradius/$RADIUS_VERSION/mods-available/sql.back
sudo cp ~/captive_portal/config/postgresql/sql /etc/freeradius/$RADIUS_VERSION/mods-available/sql
sed -i "s/portalpass/$paswd/" /etc/freeradius/$RADIUS_VERSION/mods-available/sql
sed -i "s/portaldb/$db/" /etc/freeradius/$RADIUS_VERSION/mods-available/sql

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
