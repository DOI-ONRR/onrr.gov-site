#!/bin/bash

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s prod

bash ./scripts/tunnel.sh onrr-psql prod-onrr-cms

source ../../.tunnelrc

pg_restore --user=$Username --host=$Host --port=$Port --clean  --no-owner --no-acl --dbname=$Name --no-password /tmp/onrr_database_backup.pg || echo $?

return 0