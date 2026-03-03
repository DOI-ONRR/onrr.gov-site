# Migrating Directus Flows Between Environments

This guide covers how to copy flow configurations from one environment to another (e.g., preview → dev) using a direct PostgreSQL dump of the `directus_flows` and `directus_operations` tables.

---

## Prerequisites

- [Cloud Foundry CLI (`cf`)](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) installed and authenticated
- [`psql`](https://www.postgresql.org/download/) installed locally
- [`pg_dump`](https://www.postgresql.org/docs/current/app-pgdump.html) installed locally
- Access to both source and target environment service instances

---

## Step 1: Open a Tunnel to the Source Database

Use the CF service connect plugin to open a local tunnel to the source database. This example targets the `preview` environment:

```bash
cf connect-to-service --no-client preview-onrr-cms preview-onrr-psql
```

This will output a local port, username, password, and database name. Take note of these — you'll use them to construct the connection string in the next step.

The tunnel will remain open as long as the terminal session is active. **Keep this terminal open** and proceed in a new terminal tab.

---

## Step 2: Export Flows from the Source Database

Using the credentials from Step 1, export the flow-related tables:

```bash
pg_dump "postgres://<username>:<password>@localhost:<port>/<dbname>" \
  -t directus_flows \
  -t directus_operations \
  --data-only \
  --column-inserts \
  -f flows_export.sql
```

Replace `<username>`, `<password>`, `<port>`, and `<dbname>` with the values output in Step 1.

---

## Step 3: Review the Export for Environment-Specific Values

Before importing, open `flows_export.sql` and check for any hardcoded values that differ between environments, such as:

- Internal URLs or API endpoints
- Webhook URLs
- Access tokens or secrets embedded in operation options

Use `sed` or a text editor to swap these out as needed. For example:

```bash
sed -i 's/preview-onrr-cms.app.cloud.gov/dev-onrr-cms.app.cloud.gov/g' flows_export.sql
```

---

## Step 4: Open a Tunnel to the Target Database

In a new terminal, open a tunnel to the target environment. Close the previous tunnel first if your system limits concurrent sessions, or use a separate terminal tab.

```bash
cf connect-to-service --no-client <target-app-name> <target-db-service-name>
```

Note the new connection credentials output for the target database.

---

## Step 5: Clear Existing Flows on the Target (Optional but Recommended)

If you want a clean replacement rather than an append, truncate the existing flow tables on the target. Connect to the target database:

```bash
psql "postgres://<username>:<password>@localhost:<port>/<dbname>"
```

Then run:

```sql
TRUNCATE directus_flows CASCADE;
```

The `CASCADE` will automatically clear `directus_operations` since it has a foreign key dependency on `directus_flows`.

Exit `psql` with `\q`.

---

## Step 6: Import Flows into the Target Database

```bash
psql "postgres://<username>:<password>@localhost:<port>/<dbname>" \
  < flows_export.sql
```

---

## Step 7: Verify the Import

Connect to the target database and confirm the flows and operations are present:

```bash
psql "postgres://<username>:<password>@localhost:<port>/<dbname>"
```

```sql
SELECT id, name, status, trigger FROM directus_flows;
SELECT id, name, type, flow FROM directus_operations;
```

---

## Step 8: Set Flow Status on Target

If flows were `active` in the source environment and you want to hold off on activating them in the target, update their status:

```sql
UPDATE directus_flows SET status = 'inactive';
```

Re-enable individual flows by ID once you've confirmed they're configured correctly for the target environment:

```sql
UPDATE directus_flows SET status = 'active' WHERE id = '<flow-uuid>';
```

---

## Notes

- UUIDs are preserved during the database dump, so all operation chains (resolve/reject links between nodes) remain intact.
- This process does **not** migrate webhook secrets or environment variables stored outside the database — those must be managed separately via CF environment variables or the Directus admin UI.
- `directus schema snapshot` covers schema structure only and does **not** include flow or operation data. Run a schema snapshot separately if you also need to promote schema changes.
