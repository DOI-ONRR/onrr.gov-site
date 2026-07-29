# charts endpoint extension

One Directus endpoint extension that groups chart-data routes by source collection
under a shared `/charts/<collection>` prefix — rather than a separate extension per
collection. Fewer build/deploy artifacts, shared helpers, cohesive routing.

## Routing

Directus mounts each entry of the array export (`src/index.js`) at its `id`. An
`id` of `charts/<collection>` gives that collection's handler a router scoped to
`/charts/<collection>`, so route "keys" are relative:

| Handler entry              | Route in handler | Full URL                         |
| -------------------------- | ---------------- | -------------------------------- |
| `revenue`      | `/summary`                       | `/charts/revenue/summary`                      |
| `disbursement` | `/summary`                       | `/charts/disbursement/summary`                 |
| `disbursement` | `/total-monthly-disbursements`   | `/charts/disbursement/total-monthly-disbursements` |
| `disbursement` | `/calendar-year-totals`          | `/charts/disbursement/calendar-year-totals`    |
| `disbursement` | `/top-states`                    | `/charts/disbursement/top-states`              |

- `/charts/disbursement/total-monthly-disbursements?months=24` — total disbursement
  amount per month for the most recent N months (default 24, max 120), chronological,
  with month detail joined from `period`.
- `/charts/disbursement/calendar-year-totals?years=5` — total disbursement amount per full
  calendar year for the most recent N years (default 5, max 50), oldest → newest. A
  year counts only when all 12 months are present, so any in-progress year is excluded.

## Layout

```
src/
  index.js               # array export: { id: 'charts/<collection>', handler }
  collections/
    revenue.js           # (router, { database }) => router.get('/summary', …)
    disbursement.js
  lib/
    breakouts.js         # shared breakout config + join/aggregate query builders
```

## Adding a collection

1. Add `src/collections/<collection>.js` exporting `(router, context) => { … }`.
2. Register it in `src/index.js`: `{ id: 'charts/<collection>', handler }`.
3. Reuse or extend `lib/breakouts.js` for the join/aggregate logic.

## Build

```
cd src/extensions/endpoints/charts
npm install          # first time only (installs @directus/extensions-sdk)
npm run build        # bundles src → dist and copies to extensions/directus-extension-charts
```

`npm run build:charts` from `cms/` does the same; it is also included in
`build:all`. Keep `directus:extension.host` matched to the Directus major version
(currently `^12.0.0`), or the extension silently fails to load.
