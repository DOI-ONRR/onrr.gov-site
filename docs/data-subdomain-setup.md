# Provisioning `data.onrr.gov` (public data API subdomain)

The public data API is served under `data.onrr.gov`. The **route-service already answers for
this host** — `route-service/index.js` routes any request whose `Host` begins with `data.`
to the flat dataset collections (see `DATASET_MAP`). What's left is infrastructure: give
`data.onrr.gov` a TLS cert + CDN and point it at the route-service, exactly the way
`www.onrr.gov` is set up today.

> Until these steps are done, the subdomain won't resolve. In the meantime the same data is
> reachable through the path alias on the existing domain: `https://onrr.gov/data/<name>`
> (e.g. `https://onrr.gov/data/disbursements`).

## Prerequisites

- `cf` CLI logged in to the correct org/space (the user runs `cf login`; do not script
  credentials).
- Confirm how `www.onrr.gov` is wired first, and mirror it:
  ```
  cf routes
  cf service www-onrr-domain        # or however the www external-domains service is named
  ```

## Steps

1. **Create the external-domains (CDN + TLS) service for the subdomain.** cloud.gov's
   external-domains broker provisions an ACME certificate and a CloudFront distribution.
   Match the plan used for `www.onrr.gov`:
   ```
   cf create-service external-domains-production domain data-onrr-domain \
     -c '{"domains": "data.onrr.gov"}'
   ```
   Provisioning is asynchronous (can take a while); poll with `cf service data-onrr-domain`.

2. **DNS: request the CNAME from DOI.** cloud.gov will give you a target host of the form
   `data.onrr.gov.external-domains-production.cloud.gov`. Have DOI DNS create:
   ```
   data.onrr.gov.  CNAME  data.onrr.gov.external-domains-production.cloud.gov.
   ```
   (Same pattern as `www.onrr.gov`, which CNAMEs to `www.onrr.gov.external-domains-production.cloud.gov`.)

3. **Map the route to the route-service app** so traffic for the host reaches it. The
   durable way in this repo is to add the route to the route-service manifest
   (`route-service/main.manifest.yml`), alongside `onrr.gov` / `www.onrr.gov`:
   ```yaml
   routes:
     - route: onrr.gov
     - route: www.onrr.gov
     - route: data.onrr.gov
   ```
   Then redeploy the route-service. (Add this line only after step 1's external-domains
   service exists, or the push can fail on an unknown domain.) For a one-off without a
   redeploy: `cf map-route prod-onrr-route-service data.onrr.gov`.

4. **Confirm the route-service picks up the host.** No code change is needed — it keys off
   the `Host` header. Once DNS resolves and the CDN cert is issued, verify:
   ```
   curl -s "https://data.onrr.gov/"                       # -> {"datasets":[...],"docs":...}
   curl -s "https://data.onrr.gov/disbursements?limit=1"  # -> one denormalized row
   curl -s "https://data.onrr.gov/nope"                   # -> 404 {"error":...}
   ```

5. **Point the docs at it.** The `/developers` page and its "Run" links read
   `NUXT_PUBLIC_DATA_API_BASE` (default `https://data.onrr.gov`). No change needed if the
   default is correct; override per-env if the host differs before DNS is live.

## Notes

- The route-service enforces read-only (`GET`/`HEAD`; other methods → 405) and only maps the
  three known datasets (unknown → 404) before anything reaches the CMS.
- Per-IP rate limiting belongs at the edge (CloudFront/WAF), which sees the real client IP;
  the origin only has a shared global backstop (see `cms/config.js`).
- The subdomain and the `onrr.gov/data/<name>` alias share one mapping, so they always stay
  in sync.
