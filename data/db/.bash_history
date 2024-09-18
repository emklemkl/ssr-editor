ls
 mongo mongodb://mongodb/
cd data/db/
ls
mongo
ls
ls
# Import the MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
# Create the MongoDB source list
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
# Update package lists
sudo apt-get update
# Install the MongoDB client only
sudo apt-get install -y mongodb-org-shell
sudo !
! sudo
# Import the MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
# Create the MongoDB source list
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
# Update package lists
apt-get update
# Install the MongoDB client only
apt-get install -y mongodb-org-shell
mongo --version
