# ONRR public data API

Read-only, public access to ONRR's disbursement, revenue, and production data as flat,
denormalized rows. No account, API key, or authentication is required.

The API is the REST interface of three purpose-built collections — `disbursement_flat`,
`revenue_flat`, and `production_flat` — served by Directus. Each row is fully
denormalized (the period, location, fund, and commodity labels are joined in), so you
never have to resolve foreign keys. The tables are rebuilt after each monthly data load.

- **Base URL:** `https://prod-onrr-cms.app.cloud.gov` (production)
- **Format:** JSON (default) or CSV (`?export=csv`)
- **Method:** `GET` only
- **Auth:** none

> GraphQL is not offered for these datasets — use REST (it's cached and simpler to
> support). Column names and this REST contract are stable; changes will be additive.

## Endpoints

| Dataset | Endpoint | Measure |
|---|---|---|
| Monthly disbursements | `/items/disbursement_flat` | `amount` (USD) |
| Revenue | `/items/revenue_flat` | `amount` (USD) |
| Production | `/items/production_flat` | `volume` |

### Columns

**Shared by all three** — `id`, `period_date` (YYYY-MM-DD), `calendar_year`,
`fiscal_year`, `month_long`, `period_type`, `state`, `state_name`, `county`,
`land_category`, `land_type`, `commodity`, `product`, `unit`.

- **`disbursement_flat`** adds: `fund_type`, `fund_recipient`, `fund_source`,
  `disbursement_type`, `revenue_type`, `amount`.
- **`revenue_flat`** adds: `fund_type`, `revenue_type`, `fund_source`, `amount`.
- **`production_flat`** adds: `mineral_lease_type`, `volume` (production has no fund).

Offshore rows have no `state`/`county`; check `land_category` / `land_type` instead.

## Querying

These accept the standard Directus REST query parameters:

| Param | Purpose | Example |
|---|---|---|
| `fields` | choose columns (default: all) | `fields=period_date,state_name,amount` |
| `filter` | filter rows | `filter[state_name][_eq]=Colorado` |
| `sort` | order (prefix `-` for desc) | `sort=-period_date` |
| `limit` / `offset` | paginate | `limit=100&offset=200` |
| `meta` | include the total count | `meta=filter_count` |
| `aggregate` / `groupBy` | server-side rollups | `aggregate[sum]=amount&groupBy[]=calendar_year` |
| `export` | download as a file | `export=csv` |

Common filter operators: `_eq`, `_in`, `_neq`, `_gte`, `_lte`, `_between`, `_null`,
`_contains`. Combine with `_and` / `_or`.

### Examples

Colorado disbursements in CY2024, newest first, first 100:
```
GET /items/disbursement_flat?filter[state_name][_eq]=Colorado&filter[calendar_year][_eq]=2024&sort=-period_date&limit=100
```

Total disbursed by recipient for FY2024:
```
GET /items/disbursement_flat?aggregate[sum]=amount&groupBy[]=fund_recipient&filter[fiscal_year][_eq]=2024
```

Oil production volume by state for CY2023:
```
GET /items/production_flat?aggregate[sum]=volume&groupBy[]=state_name&filter[commodity][_eq]=Oil&filter[calendar_year][_eq]=2023
```

Row count for a filter (no rows returned):
```
GET /items/revenue_flat?filter[commodity][_eq]=Gas&limit=0&meta=filter_count
```

## Bulk downloads

For a full dataset or a large slice, use `?export=csv` (or `xlsx`/`json`) rather than
deep JSON pagination:
```
GET /items/disbursement_flat?export=csv
GET /items/disbursement_flat?export=csv&filter[calendar_year][_eq]=2024&fields=period_date,state_name,fund_recipient,amount
```

## Caching & rate limits

- Responses are cached ~30 minutes and refreshed automatically after each monthly data
  load. `X-Cache-Status: HIT|MISS` shows whether a response was served from cache. Keep
  query shapes consistent for better cache hit rates.
- The API is rate-limited to protect the service. Prefer a single filtered/aggregated
  query or a CSV export over many small paginated requests; cached responses don't count
  against you the same way. Sustained abusive traffic may be throttled at the edge.

## Notes

- Data reflects the most recent monthly publication; `period_date` is the first of the
  reporting month. Recent months may be preliminary.
- Amounts are in USD; production `volume` units are in the `unit` column (e.g. `bbl`,
  `mcf`). Values can be negative (adjustments).
- Field definitions for each dataset are on its page under **Data dictionary**, e.g.
  `/revenue-data/monthly-disbursements`.
