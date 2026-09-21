# Database backup & restore runbook

The scheduled backup workflow (`.github/workflows/db-backup.yml`) dumps the production
database and stores it **encrypted**, in a **private, in-boundary S3 bucket** — never as a
public GitHub artifact. A `pg_dump` contains credential material (password hashes, static API
tokens, TFA secrets, sessions), so it must be treated as secret.

---

## Part A — One-time setup for the new pipeline

1. **Create the encryption keypair** (holder of the private key can restore):
   ```sh
   age-keygen -o backup-identity.txt        # prints "Public key: age1..."
   ```
   Put the `age1...` public key in `.github/backup/age-recipients.txt` (replace the placeholder),
   commit it. Store `backup-identity.txt` in the team secrets vault — **not** in git — and delete
   the local copy. Add more `age1...` lines if multiple people should be able to restore.

2. **Create a PRIVATE S3 bucket** in each space you back up (default service name `onrr-backups`
   in `prod`). Use a **private** plan — never `basic-public`, and never reuse the app's asset
   bucket (its objects are served publicly at `/assets`):
   ```sh
   cf target -o doi-onrr -s prod
   cf create-service s3 basic onrr-backups
   ```

3. **Confirm GitHub secrets** `CF_USERNAME` / `CF_PASSWORD` exist and belong to an account with
   Space Developer on the target space.

4. **Smoke test:** run the workflow manually (Actions → Database Backup → Run workflow), confirm
   an object appears at `s3://<bucket>/db-backups/prod/onrr-psql/<timestamp>.sql.gz.age`, then do
   a test restore (Part C) into a scratch database to prove the key + dump are good.

---

## Part B — Restore

1. **Get S3 credentials** (short-lived service key):
   ```sh
   cf target -o doi-onrr -s prod
   cf create-service-key onrr-backups restore-tmp
   cf service-key onrr-backups restore-tmp        # copy access_key_id / secret_access_key / region / bucket / endpoint
   ```

2. **Download the backup:**
   ```sh
   AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... AWS_DEFAULT_REGION=... \
     aws s3 cp "s3://<bucket>/db-backups/prod/onrr-psql/<timestamp>.sql.gz.age" . \
     --endpoint-url https://<endpoint>
   ```

3. **Decrypt + decompress** (needs the private identity from the vault):
   ```sh
   age -d -i backup-identity.txt "<timestamp>.sql.gz.age" | gunzip > backup.sql
   ```

4. **Load into a target database** (a fresh/scratch service for verification, or the intended
   target). Get the target's connection string from its service key, then:
   ```sh
   psql "$TARGET_DB_URL" -f backup.sql
   ```

5. **Clean up:** `cf delete-service-key onrr-backups restore-tmp`, and delete the local
   `backup.sql*` files.

---

## Notes

- **Retention** is enforced by the workflow: backups older than `RETENTION_DAYS` (default 90) under
  each dataset prefix are pruned each run. Adjust the env value in the workflow.
- **Why age (asymmetric):** the runner only ever holds the *public* key, so a compromised runner
  can't decrypt past backups; only the offline private identity can.
- **Scope:** the workflow backs up one DB service per run (`db-service` input, default `onrr-psql`
  in `cf-space` `prod`). Dispatch with different inputs to back up another space/service.
