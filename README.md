# Office of Natural Resources Revenue (ONRR)

This includes complete code for the Office of Natural Resources Revenue Site, including the following components:
- Directus CMS 
- VueJs frontend using Vuetify

## Getting Started

### Clone repository into directory
- ```git clone git@github.com:ONRR/onrr.gov-site.git```
- Add .env file outside of the repository.

### Initializing
Commands should be run in the main directory of the repository. Commands in Windows should be run with git bash.
```bash
npm run install
npm run init
```
### Starting and Stopping
```bash
npm run start
```
```bash
npm run stop
```
## Commands
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
