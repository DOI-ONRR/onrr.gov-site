const express = require('express');
const https = require('https');
const { URL } = require('url');
const { securityHeaders } = require('./security-headers');
const { apiUsageMiddleware } = require('./api-analytics');
const { createRedirectStore, buildLocation } = require('./redirects');
const { downloadAnalyticsMiddleware } = require('./download-analytics');

const app = express();
app.use(express.json());

// Public data-API usage analytics (data.onrr.gov/<dataset> and onrr.gov/data/<dataset>). Logs one
// structured JSON line per API request to stdout; also emits a GA4 Measurement Protocol event when
// GA4_API_MEASUREMENT_ID + GA4_API_SECRET are set (use a separate GA4 property from the site's).
// No-op for every non-data request, and fully guarded so it can't affect the proxied response.
app.use(apiUsageMiddleware({
  salt: process.env.API_USAGE_SALT,
  measurementId: process.env.GA4_API_MEASUREMENT_ID,
  apiSecret: process.env.GA4_API_SECRET,
}));

const CMS_HOST = process.env.CMS_HOST;
const FRONTEND_HOST = process.env.FRONTEND_HOST;
const PORT = 61443;

const PROXY_PATHS = [
  '/assets', '/items', '/document', '/press-releases',
  '/reporter-letters', '/unbundling'
];

// Published Directus redirects, cached in-process. Only consulted for requests the route-service
// would otherwise proxy to the CMS (the PROXY_PATHS above) — those bypass the redirect-aware
// frontends, so a redirect whose old_url sits under a proxy prefix (e.g. the bare
// /press-releases) can only be enforced here. The CMS is reached the same way as every other
// proxied request: https on the internal CMS_HOST:PORT.
const redirectStore = createRedirectStore({ cmsBaseUrl: `https://${CMS_HOST}:${PORT}` });

// Public data API. Friendly dataset names -> the denormalized flat collections in the CMS.
// Exposed two ways, both mapping here: the `data.onrr.gov` subdomain (host-based, e.g.
// data.onrr.gov/disbursements) and a path alias on the main domain (onrr.gov/data/
// disbursements). Keeping the map here hides both `/items/` and the internal `_flat`
// suffix from consumers. Read-only (GET); everything else is rejected before the CMS.
const DATASET_MAP = {
  disbursements: 'disbursement_flat',
  revenue: 'revenue_flat',
  production: 'production_flat',
  // federal_sales is already a flat, denormalized collection, so it maps to itself.
  'federal-sales': 'federal_sales',
  // federal_revenue_by_company is likewise a flat, denormalized collection.
  'federal-revenue-by-company': 'federal_revenue_by_company',
};
const DOCS_URL = 'https://onrr.gov/developers';

function proxyRequest(req, res, options, isGraphQL = false) {
  const proxyRequest = https.request(options, (proxyRes) => {
    if (proxyRes.statusCode >= 400) {
      console.error("External Server Error", proxyRes.statusCode);
      return res.status(proxyRes.statusCode).send("Error from external server");
    }

    // Keep the upstream CSP (e.g. Directus's default-src 'none' on /assets) and
    // allow this environment's CMS to frame the site for live preview.
    res.writeHead(proxyRes.statusCode, securityHeaders(proxyRes.headers));

    proxyRes.pipe(res);

    proxyRes.on('error', (proxyErr) => {
      console.error('Error in proxied response:', proxyErr);
      handleError(res, 'Error in proxied response.');
    });
  });

  proxyRequest.on('error', (err) => {
    console.error('Error proxying request:', err);
    handleError(res, 'Error proxying request.');
  });

  proxyRequest.on('timeout', () => {
    console.error('Timeout proxying request');
    handleError(res, 'Timeout proxying request.');
  });

  if (!isGraphQL) {
      req.pipe(proxyRequest);
  } else {
      proxyRequest.write(options.body);
      proxyRequest.end();
  }
}

function handleError(res, message) {
  if (!res.headersSent) {
    res.status(500).send(message);
  }
}

// Rewrite a friendly data-API request onto the CMS flat collection and proxy it.
// `seg` is the dataset segment (e.g. "disbursements"); the query string is preserved.
function handleDataApi(req, res, seg) {
  // Read-only surface.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'This API is read-only; use GET.' });
  }
  // Root of the data surface: a small index of what's available.
  if (!seg) {
    return res.status(200).json({ datasets: Object.keys(DATASET_MAP), docs: DOCS_URL });
  }
  const collection = DATASET_MAP[seg];
  if (!collection) {
    return res.status(404).json({
      error: `Unknown dataset "${seg}".`,
      datasets: Object.keys(DATASET_MAP),
      docs: DOCS_URL,
    });
  }
  const qIndex = req.originalUrl.indexOf('?');
  const queryString = qIndex >= 0 ? req.originalUrl.slice(qIndex) : '';

  const options = {
    hostname: CMS_HOST,
    port: PORT,
    path: `/items/${collection}${queryString}`,
    method: req.method,
    headers: {
      'Accept': req.headers['accept'] || '*/*',
      'Accept-Encoding': req.headers['accept-encoding'] || 'identity',
      'Accept-Language': req.headers['accept-language'] || 'en-US',
      'X-Forwarded-For': req.headers['x-forwarded-for'],
    },
  };
  proxyRequest(req, res, options);
}

// Redirect enforcement for proxy-prefix paths (see redirectStore above). Runs before the proxy
// catch-all so an exact-path redirect (e.g. bare /press-releases -> /about/public-affairs) wins,
// while a real proxied file (/press-releases/<file>.pdf — no matching row) falls through
// untouched. GET/HEAD only; the public data API (data host / /data alias) is never content, so
// it is skipped. Never throws: redirectStore.resolve fails open to no-match.
app.use(async (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  if (host.split('.')[0] === 'data') return next();

  const requestedPath = req.originalUrl.split('?')[0];
  if (!PROXY_PATHS.some(path => requestedPath.startsWith(path))) return next();

  const target = await redirectStore.resolve(requestedPath);
  if (!target) return next();

  const qIndex = req.originalUrl.indexOf('?');
  const search = qIndex >= 0 ? req.originalUrl.slice(qIndex) : '';
  return res.redirect(301, buildLocation(target, search));
});

// Server-side file-download tracking (see download-analytics.js). After the redirect middleware
// so a 301'd path never counts; before the proxy so it observes every proxied document delivery.
// Fills the client listener's blind spot (direct/deep-link/crawler hits) and feeds the same GA4
// web property, de-duped by Referer. No-op unless the GA4_WEB_* vars are set (cf set-env).
app.use(downloadAnalyticsMiddleware({
  salt: process.env.API_USAGE_SALT,
  measurementId: process.env.GA4_WEB_MEASUREMENT_ID,
  apiSecret: process.env.GA4_WEB_API_SECRET,
  ownHosts: ['onrr.gov'],
}));

app.all('*', (req, res) => {
  const requestedPath = req.originalUrl.split('?')[0];
  const isProxyPath = PROXY_PATHS.some(path => requestedPath.startsWith(path));

  // Public data API: data.onrr.gov/<name> (host-based) or onrr.gov/data/<name> (alias).
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  const isDataHost = host.split('.')[0] === 'data';
  if (isDataHost) {
    return handleDataApi(req, res, requestedPath.split('/')[1] || '');
  }
  if (requestedPath === '/data' || requestedPath.startsWith('/data/')) {
    return handleDataApi(req, res, requestedPath.split('/')[2] || '');
  }

  if (requestedPath === '/graphql') {
    try {
      const postData = JSON.stringify({
        query: req.body.query,
        variables: req.body.variables || {},
      });

      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      };

      // Forward authorization header if present
      if (req.headers['authorization']) {
        headers['Authorization'] = req.headers['authorization'];
      }

      const options = {
        hostname: CMS_HOST,
        port: PORT,
        path: req.originalUrl,
        method: 'POST',
        headers,
        body: postData,
      };

      proxyRequest(req, res, options, true);

    } catch (err) {
      console.error("Invalid URL or request body:", err);
      return res.status(400).send('Invalid URL or request body provided.');
    }
  } else if (isProxyPath) {
    const options = new URL(`https://${CMS_HOST}:${PORT}${req.originalUrl}`);
    options.method = req.method;
    options.headers = {
      'Accept': req.headers['accept'] || '*/*',
      'Accept-Encoding': req.headers['accept-encoding'] || 'identity',
      'Accept-Language': req.headers['accept-language'] || 'en-US',
      'X-Forwarded-For': req.headers['x-forwarded-for'],
    };

    proxyRequest(req, res, options);
  } else {
    const options = {
      hostname: FRONTEND_HOST,
      port: PORT,
      path: req.originalUrl,
      method: req.method,
    };

    proxyRequest(req, res, options);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Route service listening on port ${port}`);
});