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

Stop all active connections to database
`docker exec -it database psql -U directus -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'directus' AND pid <> pg_backend_pid();"`

Create tunnel to cloud.gov to access db
`cf ssh -N -L ${PORT}:${DB_HOST}:${PORT} ${APP_NAME}`

Update cms
`cf push my-app-name`

Execute pg_dump from docker container
`docker exec -it database bash -c 'pg_dump -Fc --verbose --username=directus --format=c > ./backup/database_dump.pg'`

Connect to psql instance in cloud.gov  
`psql postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME}`

Backup dev database to local machine  
`pg_dump postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME} --verbose --no-acl --no-owner -Fc -f ./backup/dev_database_backup.pg`

Restore local docker container db from dev backup
`docker exec -it database bash -c 'pg_restore -d postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME} --verbose --clean --no-password --no-owner --no-acl ./backup/dev_database_backup.pg'`

Restore dev db from local file  
`pg_restore -d 'postgres://${DB_USER}:${DB_PASSWRORD}@${HOST}:${PORT}/${DB_NAME}' --verbose --clean --no-password --no-owner --no-acl ./backup/docker_database_dump.pg`

Setup aws configuration  
`
SERVICE_INSTANCE_NAME=your-s3-service-instance-name-here
KEY_NAME=your-service-key-name-here

cf create-service-key "${SERVICE_INSTANCE_NAME}" "${KEY_NAME}"
S3_CREDENTIALS=`cf service-key "${SERVICE_INSTANCE_NAME}" "${KEY_NAME}" | tail -n +2`

export AWS_ACCESS_KEY_ID=`echo "${S3_CREDENTIALS}" | jq -r .access_key_id`
export AWS_SECRET_ACCESS_KEY=`echo "${S3_CREDENTIALS}" | jq -r .secret_access_key`
export BUCKET_NAME=`echo "${S3_CREDENTIALS}" | jq -r .bucket`
export AWS_DEFAULT_REGION=`echo "${S3_CREDENTIALS}" | jq -r '.region'``
