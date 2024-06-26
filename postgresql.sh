#!/bin/bash

echo ">>> Installing PostgreSQL <<<"
if [ -z $1 ]
then
	echo ''
	read -sp "Confirm PostgreSQL password : " pswd
else
	pswd=$1
fi
[[ -z $pswd ]] && { echo "Password is required!"; exit 1; }

# Set some variables
POSTGRE_VERSION=15

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Listen for localhost connections
sed -i -E 's/^#?(listen_addresses\s*=\s*)'\''localhost'\''/\1'\''*'\''/'  /etc/postgresql/$POSTGRE_VERSION/main/postgresql.conf
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                trust/' /etc/postgresql/15/main/pg_hba.conf
echo "host    all             radius          0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf > /dev/null

# Start & Enable PostgreSQL
sudo systemctl start postgresql.service
sudo systemctl enable postgresql.service

# Create new password superuser "postgres"
su - postgres -c "psql -U postgres -d postgres -c \"alter user postgres with password '$pswd';\""

# Make sure changes are reflected by restarting
sudo service postgresql restart

echo ">>> Finished Installing PostgreSQL <<<"
sleep 2