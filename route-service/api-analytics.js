// Usage analytics for the public data API (data.onrr.gov/<dataset> and onrr.gov/data/<dataset>).
//
// API consumers are programs, not browsers, so the client-side GA4/GTM tagging on the site can't
// see them — usage has to be captured server-side, here at the route-service, the single choke
// point every data-API request passes through. One Express middleware records each request when
// its response finishes:
//
//   1. Always: a structured JSON log line to stdout (cloud.gov captures stdout, so this needs no
//      new service binding or infra). `cf logs` / a log drain can aggregate it, and it carries
//      enough to answer "how much, which datasets, which filters, how fast, how many consumers".
//   2. Optional: a GA4 Measurement Protocol event, only when GA4_API_MEASUREMENT_ID +
//      GA4_API_SECRET are set — so the API's usage can show up in a GA4 property (use a SEPARATE
//      property from the site's, so machine traffic doesn't pollute human session/user metrics).
//
// Privacy: the client IP (X-Forwarded-For) is never stored raw — it's hashed with a per-process
// (or configured) salt into a short pseudonymous id, enough to count distinct consumers in a
// window without retaining an identifier. Query strings are public-data filter/sort/paging params
// (no PII), so they're logged as-is for "what are people querying".
//
// Everything is wrapped so analytics can never break or slow the proxied response: byte counting
// degrades to 0 on error, the GA4 call is fire-and-forget with a short timeout, and the whole
// finish handler is in a try/catch.

const https = require('https');
const crypto = require('crypto');

// Classify a request by host + path, mirroring the routing in index.js. Returns whether it's a
// data-API request, how it was reached ('host' = data.onrr.gov, 'alias' = /data/...), and the
// friendly dataset segment ('' for the API index at the root).
function classifyRequest(host, originalUrl) {
  const path = (originalUrl || '').split('?')[0];
  const h = (host || '').split(':')[0].toLowerCase();
  if (h.split('.')[0] === 'data') {
    return { isDataApi: true, via: 'host', dataset: path.split('/')[1] || '' };
  }
  if (path === '/data' || path.startsWith('/data/')) {
    return { isDataApi: true, via: 'alias', dataset: path.split('/')[2] || '' };
  }
  return { isDataApi: false };
}

// Pseudonymous consumer id: hash of the first X-Forwarded-For IP with a salt. 'unknown' when no
// IP is present. Short slice — we want "distinct consumers", not a reversible identifier.
function hashClient(xff, salt) {
  const ip = String(xff || '').split(',')[0].trim();
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(`${salt}|${ip}`).digest('hex').slice(0, 12);
}

// The structured log record (one JSON line per data-API request).
function buildLogRecord({ now, dataset, via, method, status, durationMs, bytes, query, ua, client }) {
  return {
    evt: 'data_api',
    ts: new Date(now).toISOString(),
    dataset: dataset || '(index)',
    via,
    method,
    status,
    duration_ms: durationMs,
    bytes,
    query: query || '',
    ua: ua || '',
    client,
    // Flat, single-token tags so OpenSearch full-text search can count by dimension precisely
    // without JSON field parsing. Its standard analyzer keeps underscores inside a token but
    // splits on `-`/`:`/`"`/space, so each `ds_…`/`via_…`/`st_…`/`m_…` is one searchable term that
    // can't collide with query-string content. In Discover: count a dataset with
    // `@message: "ds_revenue"`, errors with `st_503`, or combine (`ds_revenue st_404`); pick
    // @timestamp → Visualize for a per-dataset count over time. Dataset names are normalized to
    // alphanumerics+underscore (e.g. federal-sales → ds_federal_sales) so they stay one token.
    tags: `ds_${datasetTag(dataset)} via_${via} st_${status} m_${String(method || '').toLowerCase()}`,
  };
}

// Normalize a dataset name into a single analyzer-safe token body (lowercase, non-alphanumerics
// collapsed to underscore). Empty (the API index) becomes 'index'.
function datasetTag(dataset) {
  const t = String(dataset || 'index').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return t || 'index';
}

// The GA4 Measurement Protocol body. Params are kept low-cardinality (no raw query string) so the
// event stays reportable; the pseudonymous client doubles as the MP client_id.
function buildGa4Payload({ client, dataset, via, method, status }) {
  return {
    client_id: client === 'unknown' ? 'anonymous' : client,
    events: [{
      name: 'api_request',
      params: {
        dataset: dataset || '(index)',
        via,
        method,
        status: String(status),
      },
    }],
  };
}

// Fire-and-forget POST to the GA4 Measurement Protocol. Resolves (never rejects) regardless of
// outcome; a short timeout keeps a slow/unreachable endpoint from piling up sockets.
function sendGa4(payload, { measurementId, apiSecret }) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify(payload);
      const req = https.request(
        {
          hostname: 'www.google-analytics.com',
          path: `/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
          timeout: 2000,
        },
        (res) => { res.resume(); res.on('end', resolve); },
      );
      req.on('error', () => resolve());
      req.on('timeout', () => { req.destroy(); resolve(); });
      req.write(body);
      req.end();
    } catch {
      resolve();
    }
  });
}

// Express middleware factory. Options (all optional):
//   salt           — IP-hash salt (default: random per process; set API_USAGE_SALT for a stable id)
//   measurementId  — GA4 MP measurement id (enables the GA4 feed when paired with apiSecret)
//   apiSecret      — GA4 MP api secret
//   log            — sink for the JSON record (default: console.log as a JSON line)
//   sendGa4        — override the GA4 sender (for tests)
//   now            — clock (for tests)
function apiUsageMiddleware(opts = {}) {
  const salt = opts.salt || crypto.randomBytes(8).toString('hex');
  const ga4 = opts.measurementId && opts.apiSecret
    ? { measurementId: opts.measurementId, apiSecret: opts.apiSecret }
    : null;
  const log = opts.log || ((rec) => console.log(JSON.stringify(rec)));
  const sender = opts.sendGa4 || sendGa4;
  const now = opts.now || (() => Date.now());

  return function apiUsage(req, res, next) {
    let cls;
    try { cls = classifyRequest(req.headers.host, req.originalUrl); } catch { cls = { isDataApi: false }; }
    if (!cls.isDataApi) return next();

    const start = now();
    let bytes = 0;
    try {
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);
      res.write = (chunk, ...rest) => {
        if (chunk) { try { bytes += Buffer.byteLength(chunk); } catch { /* non-measurable chunk */ } }
        return origWrite(chunk, ...rest);
      };
      res.end = (chunk, ...rest) => {
        if (chunk && typeof chunk !== 'function') { try { bytes += Buffer.byteLength(chunk); } catch { /* ignore */ } }
        return origEnd(chunk, ...rest);
      };
    } catch { /* leave bytes at 0 if the response can't be wrapped */ }

    res.on('finish', () => {
      try {
        const qIndex = String(req.originalUrl || '').indexOf('?');
        const query = qIndex >= 0 ? req.originalUrl.slice(qIndex + 1) : '';
        const client = hashClient(req.headers['x-forwarded-for'], salt);
        log(buildLogRecord({
          now: start,
          dataset: cls.dataset,
          via: cls.via,
          method: req.method,
          status: res.statusCode,
          durationMs: now() - start,
          bytes,
          query,
          ua: req.headers['user-agent'],
          client,
        }));
        if (ga4) {
          sender(buildGa4Payload({ client, dataset: cls.dataset, via: cls.via, method: req.method, status: res.statusCode }), ga4);
        }
      } catch { /* analytics must never affect the response */ }
    });

    next();
  };
}

module.exports = { classifyRequest, hashClient, datasetTag, buildLogRecord, buildGa4Payload, sendGa4, apiUsageMiddleware };
