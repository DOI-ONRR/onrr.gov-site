# Office of Natural Resources Revenue (ONRR)

This includes complete code for the Office of Natural Resources Revenue Site, including the following components:
- Directus CMS 
- VueJs frontend using Vuetify

## Clone repo into directory
- git clone https://github.com/ONRR/onrr.gov-site.git
- add .env file outside of repo

- get updated directus release version 

## Start up postgres database
- cd database docker compose up -d

## Verified that there is a directus database
- Window users -- use winty for interactivity on windows
- [winpty] docker exec -it database bash
- psql -U directus

## View docker container details like IP address host
- docker inspect database

## Restore database from dev backup
- Windows users -- use winty for interactivity on windows
- [winpty] docker exec -it database bash -c 'pg_restore --verbose  --user=directus --host=host.docker.internal --clean  --no-owner --no-acl --dbname=directus ./backup/dev_database_backup.pg'

## Start up directus
- cd cms docker compose up -d

## Start up frontend
- cd frontend npm install
- cd frontend npm serve