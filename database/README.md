# directus database

Backing-up a Project  
1. Make a copy of the files within each storage adapter, and store them in a safe place
2. Make a copy of the Env file ( /api/.env), and store it in a safe place
3. Create a database dump

Start up docker conatiner  
`docker-compose up -d`

Bring down docker container  
`docker-compose down`

List docker containers  
`docker ds`

Login into docker conatiner  
`docker exec -it <container_name> bash`

Run sql script inside container
`docker exec -it <container_name> psql -U <db_user> -d <database> -f /file/to/load.sql`

Create backup of database in docker using pg_dumpall   
`docker exec -t <container_name> pg_dumpall -c -U <db_user> > dump.sql`

Restore database  
`cat dump.sql | docker exec -i <container_name> psql -U directus`  

Drop database  
`docker exec -it database psql -U directus -d postgres -c "DROP DATABASE directus;"`

Create database  
`docker exec -it database psql -U directus -d postgres -c "CREATE DATABASE directus;"`

Create tunnel to cloud.gov to access db  
`cf ssh -N -L ${PORT}:${DB_HOST}:${PORT} ${APP_NAME}`

Execute pg_dump from docker container
`docker exec -it database bash -c 'pg_dump -Fc --verbose --username=directus --format=c > ./backup/database_dump.pg'`  

Connect to psql instance in cloud.gov  
`psql postgres://${DB_USER}:${DB_PASSWORD}@${HOST}:${PORT}/${DB_NAME}`

Backup dev database to local machine  
`pg_dump postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME} --verbose --no-acl --no-owner -Fc -f ./backup/dev_database_backup.pg`

Restore local docker container db from dev backup
`docker exec -it database bash -c 'pg_restore -d postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME} --verbose --clean --no-password --no-owner --no-acl ./backup/dev_database_backup.pg'`

Restore dev db from local file  
`pg_restore -d 'postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME}' --verbose --clean --no-password --no-owner --no-acl  ./backup/docker_database_dump.pg`

Update table in dev
`psql -U ${DB_USER} -d 'postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME}' -f ./path/to/file.sql`

