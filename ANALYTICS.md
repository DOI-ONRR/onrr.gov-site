# Analytics

One reference for every analytics event this project emits, the parameters each carries, and the
Google Tag Manager (GTM) / GA4 wiring behind them. Two surfaces:

- **Frontend (`frontend-nuxt/`)** — client-side events pushed to the GTM `dataLayer`, forwarded to
  GA4 by GTM tags.
- **Public data API (`route-service/`)** — server-side usage analytics (API consumers are programs,
  not browsers, so client-side tagging can't see them).

---

## How the frontend layer works

- **GTM container / GA4 property:** configured per environment, not hard-coded here — see the GTM
  admin and the deploy environment config for the specific container and measurement IDs.
- **Enablement:** the container id is read at runtime from `NUXT_PUBLIC_GTM_ID`
  (`nuxt.config.js` → `runtimeConfig.public.gtmId`). When unset (local/dev), the GTM plugin is a
  **no-op** — nothing loads and `dataLayer` is never created, so every `trackEvent` call is a safe
  no-op too. Each environment supplies its own id.
- **Plugin:** `app/plugins/gtm.client.js` (client-only) bootstraps GTM, pushes `page_view`, and
  hosts the delegated click listener for `file_download` / `outbound_click`.
- **Composable:** `app/composables/useAnalytics.js` → `const { trackEvent } = useAnalytics()`;
  `trackEvent(name, params)` pushes `{ event: name, ...params }`. SSR-safe / no-op when disabled.
- **We own page views:** the GA4 "Google Tag" has **`send_page_view: false`** — our `page_view`
  event is the single source. Keep GA4 **Enhanced Measurement** toggles for *Page views*, *File
  downloads*, *Outbound clicks*, and *Site search* **OFF**, or they double-count events we send
  ourselves.

### Frontend events

| Event | Fires when | Parameters | Source |
| --- | --- | --- | --- |
| `page_view` | initial (hydrated) route + every in-app navigation | `page_path`, `page_title`, `navigation_type` (`initial` \| `spa`) | `plugins/gtm.client.js` |
| `feedback_open` | feedback modal opens | `page_path` | `components/FeedbackModal.vue` |
| `feedback_submit` | feedback submitted successfully | `feedback_helpful` (`Yes`\|`No`), `feedback_has_comment` (bool), `page_path` | `components/FeedbackModal.vue` |
| `dataset_filter` | a dataset preview filter settles (debounced 800ms) | `dataset`, `filter_period`, `filters_used` (comma list of active filter keys), `filter_count`, `page_path` | `composables/useQueryFilters.js` (`useUrlFilterSync`) |
| `dataset_download` | a dataset download CTA is clicked | `dataset`, `download_type` (`full_csv`\|`curated`\|`filtered_csv`\|`preview_csv`), `file_format`, `page_path` | `components/DatasetDownloads.vue` + `components/previews/*` (`trackDatasetDownload`) |
| `file_download` | click on a link to a file anywhere on the site | `file_name`, `file_extension`, `link_url`, `link_text`, `page_path` | `plugins/gtm.client.js` |
| `outbound_click` | click on a link leaving ONRR's own domains | `link_url`, `link_domain`, `link_text`, `page_path` | `plugins/gtm.client.js` |
| `search` | site search submitted (to Search.gov) | `search_term`, `page_path` | `components/SiteSearchForm.vue` |
| `page_not_found` | a 404 error page renders | `page_path` (attempted), `referrer` | `app/error.vue` |
| `page_error` | a non-404 error page renders (503 outage, 500, …) | `error_code`, `page_path` | `app/error.vue` |

#### Notes & invariants

- `dataset` is the page's last path segment (e.g. `monthly-disbursements`) and is **identical**
  on `dataset_filter` and `dataset_download`, so they join into a per-dataset funnel.
- A filter change is a query-only `router.replace` on the same page key (`route.path`), so it does
  **not** fire a `page_view`.
- `file_download`, `outbound_click`, and `dataset_download` are **mutually exclusive** on a given
  click: file links win over outbound; dataset export URLs are extension-less and carry no
  `download` attribute, so they're owned by `dataset_download` only.
- "Outbound" uses a registrable-domain compare, so our own subdomains (`data.onrr.gov`) count as
  **internal**; `pay.gov`, `search.usa.gov`, etc. are outbound.
- `page_error` is a *user-impact* metric, not an outage alarm: it lags like all GA4 reports and
  only fires when our own error page renders (a CloudFront/route-service outage never runs this JS).

---

## Public data API analytics (`route-service/`)

Captured server-side in `route-service/api-analytics.js` (`apiUsageMiddleware`, wired in
`index.js`) at the single choke point for `data.onrr.gov/<dataset>` and `onrr.gov/data/<dataset>`.
On each data-API request's response `finish`:

1. **Always** — a structured JSON log line to stdout (cloud.gov captures stdout; no service
   binding required):

   ```json
   {"evt":"data_api","ts":"…","dataset":"revenue","via":"host","method":"GET",
    "status":200,"duration_ms":3,"bytes":28,"query":"limit=2","ua":"curl/8.1","client":"88a3def4769f",
    "tags":"ds_revenue via_host st_200 m_get"}
   ```

   | Field | Meaning |
   | --- | --- |
   | `dataset` | friendly dataset name (`(index)` for the API root) |
   | `via` | `host` (data.onrr.gov) or `alias` (onrr.gov/data/…) |
   | `method`, `status` | HTTP method and final response status |
   | `duration_ms`, `bytes` | response time and body size |
   | `query` | raw query string (public-data filter/sort/paging params) |
   | `ua` | User-Agent (curl vs library vs browser) |
   | `client` | **pseudonymous** consumer id — a salted hash of the client IP, never the raw IP |
   | `tags` | flat `ds_…`/`via_…`/`st_…`/`m_…` tokens for precise full-text counting (see below) |

   **Viewing it:**

   - `cf logs <env>-onrr-route-service --recent | grep '"evt":"data_api"'` is for **spot checks /
     live debugging only**. `--recent` is *not* a time window — it dumps Loggregator's in-memory
     ring buffer (a limited number of recent lines per instance), which churns in seconds-to-minutes
     on a busy app, is lost on restart/rescheduling, and is never a complete history. (Drop
     `--recent` to tail live instead.)
   - For **durable, queryable history** (days/weeks, aggregation, charts): use **cloud.gov central
     logging** (OpenSearch Dashboards at `logs.fr.cloud.gov`, cloud.gov SSO → pick your org tenant).
     App stdout is shipped there automatically — no drain needed. In **Discover**, scope with filters
     `@cf.space`, `@cf.app` (the route-service app), `@source.type: "APP"`, then full-text search
     `@message`. Counting by dataset uses the `tags` tokens: `@message: "ds_revenue"` (exact, no
     collision with query-string text), errors with `st_503`, combined with `ds_revenue st_404`;
     pick `@timestamp` → **Visualize** for a per-dataset count over time. (The nested JSON isn't
     field-parsed, so a single faceted bar chart grouped by dataset needs one query per value — the
     `ds_…` tokens just make each query exact and trivial.) A **syslog drain** can also stream the
     logs to your own long-term store. These are the authoritative sources; `--recent` is not.

2. **Optional** — a GA4 **Measurement Protocol** `api_request` event, sent **only** when both
   `GA4_API_MEASUREMENT_ID` and `GA4_API_SECRET` are set. Params: `dataset`, `via`, `method`,
   `status` (low-cardinality; the raw query is never sent to GA4). Fire-and-forget, 2s timeout.

**Environment variables** (route-service, per env):

| Var | Purpose |
| --- | --- |
| `GA4_API_MEASUREMENT_ID` | GA4 MP measurement id — enables the GA4 feed (with the secret) |
| `GA4_API_SECRET` | GA4 MP API secret (Admin → Data streams → Measurement Protocol API secrets) |
| `API_USAGE_SALT` | IP-hash salt; set a stable random value for consumer ids that persist across restarts (optional) |

> Use a **separate GA4 property** for the API feed — machine traffic distorts the site property's
> user/session metrics.

**Caching caveat:** CloudFront fronts the route-service, so cache hits could bypass origin
counting. API traffic is high-cardinality (distinct query strings → distinct cache keys → mostly
misses), so origin counting is close to complete. For exact totals, add `Cache-Control: no-store`
to the data-API responses (perf trade-off) or read CloudFront access logs.

---

## GTM configuration reference

Naming convention used in the container: `DLV - <param>` (Data Layer Variable), `CE - <event>`
(Custom Event trigger), `GA4 - <event>` (GA4 Event tag), `CONST - GA4 Measurement ID`.

**Data Layer Variables** (Variable Name → Data Layer Variable Name, exact, case-sensitive):

```text
DLV - page_path            → page_path
DLV - page_title           → page_title
DLV - navigation_type      → navigation_type
DLV - feedback_helpful     → feedback_helpful
DLV - feedback_has_comment → feedback_has_comment
DLV - dataset              → dataset
DLV - filter_period        → filter_period
DLV - filters_used         → filters_used
DLV - filter_count         → filter_count
DLV - download_type        → download_type
DLV - file_format          → file_format
DLV - file_name            → file_name
DLV - file_extension       → file_extension
DLV - link_url             → link_url
DLV - link_domain          → link_domain
DLV - link_text            → link_text
DLV - search_term          → search_term
DLV - referrer             → referrer
DLV - error_code           → error_code
```

**Triggers:** one Custom Event trigger per event above (`CE - <event>`, Event name = the event name
exactly). The pageview tag triggers on the `page_view` custom event — **not** the native All Pages
trigger. (In a shared container, condition it on `navigation_type = spa`.)

**Tags:** one GA4 Event tag per event (`GA4 - <event>`), Measurement ID
`{{CONST - GA4 Measurement ID}}`, parameters mapped from the matching `DLV - *` variables, firing on
its `CE - <event>` trigger.

---

## GA4 configuration

**Custom dimensions** (Admin → Custom definitions → event-scoped; exact param names; **not
retroactive**, register before you want the breakdown):

- `navigation_type`, `feedback_helpful`, `feedback_has_comment`
- `dataset`, `filter_period`, `filters_used`, `filter_count`, `download_type`, `file_format`
- `error_code`, `referrer`

Built-in / no registration needed: `page_path`/`page_title` (standard), `search_term` and the
`file_download` / outbound link params (`link_url`, `link_domain`, `link_text`, `file_name`,
`file_extension`) are GA4-recognized for their recommended events.

**Key events** (mark the genuine successes, not everything): `feedback_submit`, `dataset_download`,
and/or `file_download`. Leave `page_view`, `feedback_open`, `dataset_filter`, `search`,
`outbound_click`, `page_not_found`, `page_error` as regular events. Set via Admin → Key events (by
name, works before data arrives) or the Events table toggle (after the event appears).

**Example exploration — feedback completion rate:** Explore → Funnel exploration → closed funnel,
Step 1 `feedback_open`, Step 2 `feedback_submit`; count by Sessions; optional breakdown by
`page_path` or `feedback_helpful`.

---

## Privacy / PII

- **No free text to GA4.** The feedback comment is never sent — only `feedback_has_comment` (bool).
- `search_term` **is** sent (GA4's recommended shape); switch to a term-less `search` event if
  search-term retention is a concern.
- The data API never logs raw client IPs — only a salted hash (`client`).
- Query strings logged for the API are public-data filter/sort/paging params (no PII).

---

## Verifying

- **GA4 DebugView** (Admin → DebugView) with GTM Preview / Tag Assistant active shows events +
  params in real time. **Realtime** report for live counts. Standard reports & Explorations lag
  ~24–48h and are not retroactive.
- **Frontend, locally:** run the mock API + `nuxt dev` with `NUXT_PUBLIC_GTM_ID` set to any value,
  drive the page with headless Chromium, and read `window.dataLayer` (wrap `dataLayer.push` to
  capture events). See the dataset-preview mock at `frontend-nuxt/e2e/mock-api/`.
- **Data API:** `node --test` in `route-service/` covers the middleware; `cf logs` shows live
  `data_api` lines after deploy.
