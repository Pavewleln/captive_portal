#!/bin/bash

echo ">>> Installing PostgreSQL <<<"
pswd='radius'
# Set some variables
POSTGRE_VERSION=15

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Listen for localhost connections
sed -i -E 's/^#?(listen_addresses\s*=\s*)'\''localhost'\''/\1'\''*'\''/'  /etc/postgresql/$POSTGRE_VERSION/main/postgresql.conf

# Start & Enable PostgreSQL
sudo systemctl start postgresql.service
sudo systemctl enable postgresql.service

# Create new password superuser "postgres"
su - postgres -c "psql -U postgres -d postgres -c \"alter user postgres with password '$pswd';\""

# Make sure changes are reflected by restarting
sudo service postgresql restart

echo ">>> Finished Installing PostgreSQL <<<"
sleep 2