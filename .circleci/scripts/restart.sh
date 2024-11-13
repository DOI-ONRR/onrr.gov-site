#!/bin/bash

wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -

echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

sudo apt-get update

sudo apt-get install cf8-cli

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s prod

cf restart --strategy=rolling prod-onrr-frontend