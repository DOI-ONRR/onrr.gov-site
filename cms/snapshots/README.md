# Directus Schema Snapshots

This directory contains Directus schema snapshots used for database migrations.

## Taking a Snapshot from a Remote Database

When connecting to a cloud.gov database through a tunnel (via `cf connect-to-service`), you need to run the snapshot command from a clean directory to avoid the local `.env` file overriding your connection settings.

### Prerequisites

1. **Create an environment file** (e.g., `~/.env.upgrade`) with your remote database credentials:

   ```
   DB_CLIENT=pg
   DB_HOST=127.0.0.1
   DB_PORT=<tunnel_port>
   DB_DATABASE=<database_name>
   DB_USER=<username>
   DB_PASSWORD=<password>
   DB_SSL__REJECT_UNAUTHORIZED=false
   ```

   The `DB_SSL__REJECT_UNAUTHORIZED=false` setting is required because cloud.gov RDS instances require SSL connections, but use AWS certificates that aren't in the default trust store.

2. **Establish a tunnel** to the remote database:

   ```bash
   cf connect-to-service --no-client <app-name> <service-name>
   ```

   Note the port number provided (e.g., 62477).

### Taking the Snapshot

Run this command to take a snapshot from the remote database:

```bash
(cd /tmp && rm -rf directus-snapshot && mkdir directus-snapshot && cd directus-snapshot && cp ~/Developer/ONRR/.env.upgrade .env && npx directus schema snapshot ./snapshot.yaml && cp ./snapshot.yaml /path/to/onrr.gov-site/cms/snapshots/current.yaml)
```

Or as separate steps:

```bash
# 1. Create a clean temp directory
cd /tmp
rm -rf directus-snapshot
mkdir directus-snapshot
cd directus-snapshot

# 2. Copy your env file
cp ~/Developer/ONRR/.env.upgrade .env

# 3. Take the snapshot
npx directus schema snapshot ./snapshot.yaml

# 4. Copy to the project
cp ./snapshot.yaml /path/to/onrr.gov-site/cms/snapshots/current.yaml
```

### Why This Works

- **Clean directory**: Running from `/tmp` avoids the local `cms/.env` file, which would override your remote database settings.
- **SSL settings**: Cloud.gov RDS requires SSL. Without `DB_SSL__REJECT_UNAUTHORIZED=false`, Directus will either:
  - Fail with "no pg_hba.conf entry... no encryption" (no SSL)
  - Fail with "self-signed certificate in certificate chain" (SSL without this setting)

### Troubleshooting

If you see errors like:
- `no pg_hba.conf entry for host "10.x.x.x"` - SSL is not enabled; add `DB_SSL__REJECT_UNAUTHORIZED=false`
- `self-signed certificate in certificate chain` - Add `DB_SSL__REJECT_UNAUTHORIZED=false`
- Missing collections in snapshot - The command may have used the local database; ensure you're running from a directory without a `.env` file
