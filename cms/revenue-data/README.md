# Revenue Data CSV Export

This directory contains CSV exports of revenue data tables from the NRRD database for import into Directus.

## Prerequisites

1. **Cloud Foundry CLI** with the `connect-to-service` plugin installed
2. **psql** (PostgreSQL client)
3. Access to the cloud.gov space containing the database

## Establishing a Database Tunnel

1. Log in to cloud.gov:
   ```bash
   cf login -a api.fr.cloud.gov --sso
   ```

2. Target the appropriate org and space:
   ```bash
   cf target -o doi-onrr -s <space>
   ```

3. Open a tunnel to the database service:
   ```bash
   cf connect-to-service --no-client <app-name> <service-name>
   ```

   This will output connection details including:
   - Host: `localhost`
   - Port: (e.g., `62186`)
   - Database name
   - Username
   - Password

4. Save these credentials to an environment file (e.g., `~/.env.nrrd-dev`):
   ```
   DB_CLIENT=postgres
   DB_HOST=localhost
   DB_PORT=<port>
   DB_DATABASE=<database>
   DB_USER=<username>
   DB_PASSWORD=<password>
   DB_SSL__REJECT_UNAUTHORIZED=false
   ```

## Exporting Tables to CSV

Use `psql` with SSL mode required to export tables:

```bash
PGPASSWORD=<password> PGSSLMODE=require psql -h localhost -p <port> -U <username> -d <database> \
  -c "\COPY (SELECT * FROM <table_name>) TO '/path/to/output.csv' WITH CSV HEADER"
```

### Example: Exporting the revenue table

```bash
PGPASSWORD=<password> PGSSLMODE=require psql -h localhost -p <port> -U <username> -d <database> \
  -c "\COPY (SELECT * FROM revenue) TO '/path/to/cms/revenue-data/revenue.csv' WITH CSV HEADER"
```

## Cleaning Up CSV Files for Directus Import

After exporting, the CSV files typically need cleaning before import into Directus:

### 1. Remove unnecessary columns

Remove `creation_date`, `last_update_date`, and empty columns like `raw_revenue`:

```bash
# Example: Keep only columns 1-8, removing columns 9-11
cut -d',' -f1-8 revenue.csv > revenue_tmp.csv && mv revenue_tmp.csv revenue.csv
```

### 2. Convert quoted strings to numbers

If ID columns are quoted, remove the quotes:

```bash
awk -F',' 'BEGIN {OFS=","} NR==1 {print; next} {
  gsub(/"/, "", $1);
  gsub(/"/, "", $2);
  gsub(/"/, "", $3);
  gsub(/"/, "", $4);
  print
}' file.csv > file_tmp.csv && mv file_tmp.csv file.csv
```

## Tables and Their Columns

### revenue.csv
```
location_id,period_id,commodity_id,fund_id,revenue,unit,unit_abbr,duplicate_no
```

### disbursement.csv
```
legacy_commodity_id,duplicate_no,legacy_fund_id,legacy_location_id,legacy_period_id,amount,unit,unit_abbr
```

### production.csv
```
legacy_commodity_id,duplicate_no,legacy_location_id,legacy_period_id,volume,unit,unit_abbr
```

### fund.csv
```
legacy_id,disbursement_type,class,type,recipient,revenue_type,source
```

### period.csv
```
period_date,calendar_year,fiscal_month,fiscal_year,calendar_month,legacy_id,month_long,month_short,type
```

## Notes

- **SSL Required**: Cloud.gov RDS instances require SSL connections. Always use `PGSSLMODE=require` with psql.
- **Port 22 Required**: The `cf connect-to-service` command uses SSH tunneling, which requires outbound port 22. This may be blocked on guest wifi networks.
- **Large Values**: The `production.volume` column may contain values exceeding PostgreSQL's `integer` limit (2,147,483,647). Use `bigint` for this column.
