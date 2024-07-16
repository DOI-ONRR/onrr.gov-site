#!/bin/bash

wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -

echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

sudo apt-get update

sudo apt-get install cf8-cli

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s dev

cf install-plugin -f https://github.com/cloud-gov/cf-service-connect/releases/download/1.1.0/cf-service-connect-linux-amd64

bash ~/project/.circleci/scripts/tunnel.sh dev-onrr-psql dev-onrr-cms

source ~/.tunnelrc

pg_dump --user=$Username --host=$Host --port=$Port --dbname=$Name --verbose --no-acl --no-owner -Fc > /tmp/onrr_database_backup.pg | echo $s?

exit 0