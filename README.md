# Office of Natural Resources Revenue (ONRR)

This includes complete code for the Office of Natural Resources Revenue Site, including the following components:
- Directus CMS 
- VueJs frontend using Vuetify

## Getting Started

### Clone repository into directory
`git clone git@github.com:ONRR/onrr.gov-site.git`

After cloning the repository to your local environment, follow these steps to standup the onrr.gov site on your local machine. Please note that these instructions are specific to MacOS. Mac-specific instructions will be noted as needed.
***

###Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/). 
- Install [PostgreSQL command line tools](https://www.postgresql.org/download/).
- Install the [Cloud Foundry command line interface (CLI)](https://cloud.gov/docs/getting-started/setup/) and login to cloud.gov via the CLI.
- Install the cf-service-connect plugin for connecting to cloud.gov RDS service instances. Instructions are available [here](https://github.com/cloud-gov/cf-service-connect#usage). 

---
###Instructions
1. Create a .env file and save it in the directory where the onrr.gov-site repository is located. This file should include the following variables:
    ```
    POSTGRES_USER=directus
    POSTGRES_PASSWORD=<password>
    POSTGRES_DATABASE=directus

    DB_CLIENT=pg
    DB_HOST=host.docker.internal
    DB_PORT=5432
    DB_DATABASE=directus
    DB_USER=directus
    DB_PASSWORD=<password>

    CACHE_ENABLED=true
    CACHE_STORE=redis
    CACHE_REDIS=redis://cache:6379

    PORT=8055
    PUBLIC_URL=http://localhost:8055
    CORS_ENABLED=true
    CORS_ORIGIN=true

    MAX_RELATIONAL_DEPTH=2000
    ```

2. Clone the CMS database from either the dev or prod environments. Be sure to do this after a user account has been added for you, otherwise you won't be able to login.
    ```
    cf connect-to-service -no-client prod-onrr-cms onrr-psql
    ...
    Host: localhost
    Port: ...
    Username: ...
    Password: ...
    Name: ...
    ```
    The above command opens a tunnel to the service. Once the tunnel is open, open a new command window and enter the following to export the CMS database.
    ```
    pg_dump -F c \
      --no-acl \
      --no-owner \
      -f backup.pg \
      postgresql://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/${NAME}
    ```
    Be sure to substitute the variables in this command with the values output when opening the tunnel above. When this command completes, the backup file will be available in your current working directory.

3. Start the database docker container. Run the following command from the `onrr.gov-site/database` directory.
    ```
    docker-compose up
    ```
    This command can  be run with the `-d` flag, but it is suggested to run without for troubleshooting purposes.
4. Load the database backup into the containerized database.
    ```
    docker cp path/to/backup.pg database:/backup
    docker exec database pg_restore backup/backup.pg -c -U directus -d directus
    ```
5. Start the CMS docker container. Run the following command from the `onrr.gov-site/cms` directory.
    ```
    docker-compose up
    ```
    When the CMS container is up and running, you can go to http://localhost:8055 in your browser and login with your Directus credentials.
6. Install frontend npm dependencies. Run `npm install` from the `onrr.gov-site/frontend` directory.
7. Start the frontend. Run `npm run serve` from the `onrr.gov-site/frontend` directory. The local website can be accessed at http://localhost:8080.


#### Commands
All commands are run with npm.
```bash 
npm run [command]
```
- ascii: Displays ascii art for ONRR
- clean: Starts clean instances of CMS and database
- clear: Clears database and CMS
- cmstart: Starts CMS
- dbbackup: Dumps the database
- dbrestore: Restores the database
- dbstart: Starts the database
- frontend: Starts the frontend
- init: Runs first time setup
- install: Installs ```run-script-os``` to allow scripts for different Operating Sytems. Also installs frontend dependencies.
- psql: Opens database bash
- restart: Stops and restarts CMS, database, and frontend
- start: Starts CMS, database, and frontend
- stop: Stops CMS, database, and frontend
