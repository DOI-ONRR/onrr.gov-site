// Server-side file-download tracking for the route-service.
//
// Complements the client-side `file_download` event (frontend-nuxt app/plugins/gtm.client.js),
// which only fires on an on-page click. This catches the blind spot that layer can't see: direct
// hits, bookmarks, deep links, hotlinks and anything that requests a proxied document without
// ever loading a tagged page.
//
// Scope: successful GET deliveries of DOCUMENTS served through the CMS proxy — /document,
// /press-releases, /reporter-letters, /unbundling. Not /items (JSON, not a file) and not /assets
// (inline page images + curated dataset exports, the latter already owned by the client
// `dataset_download` event).
//
// Mutually exclusive with the client listener, by Referer: a request whose Referer is one of our
// own hosts almost always began as an on-page click already counted client-side, so GA4 is sent
// only when the Referer is absent or off-site. Obvious crawlers are excluded from GA4 too. Every
// delivery is still logged (with onsite/bot flags) for ops visibility.
//
// Identity: prefer the first-party `_ga` cookie's client id (present on a direct same-domain hit,
// so the event joins the visitor's real GA4 session); fall back to a salted IP hash otherwise.
// Events go to the site WEB property via Measurement Protocol (GA4_WEB_MEASUREMENT_ID /
// GA4_WEB_API_SECRET), tagged `measurement_source: 'server'` so they segment from client events.

const { hashClient, sendGa4 } = require('./api-analytics');

const DOC_PREFIXES = ['/document', '/press-releases', '/reporter-letters', '/unbundling'];
const FILE_EXTENSIONS = new Set([
  'pdf', 'csv', 'xls', 'xlsx', 'xlsm', 'doc', 'docx', 'ppt', 'pptx',
  'txt', 'rtf', 'zip', '7z', 'gz', 'xml', 'json',
]);

// Known crawlers / non-browser agents, plus a few link-preview fetchers and HTTP libraries. An
// absent/empty UA is treated as a bot too (real browsers always send one). Kept deliberately
// broad: excluding a few real users is cheaper than inflating download counts with automated hits.
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|pinterest|vkshare|w3c_validator|whatsapp|telegram|google-read-aloud|headlesschrome|lighthouse|pingdom|uptimerobot|monitis|ahrefs|semrush|mj12|dotbot|petalbot|applebot|yandex|baiduspider|duckduckbot|gptbot|ccbot|claudebot|bytespider|python-requests|curl|wget|axios|node-fetch|go-http-client|libwww|java\/|okhttp/i;

// Classify a request path as a document download (pure; unit-testable).
function classifyDownload(originalUrl) {
  const path = String(originalUrl || '').split('?')[0];
  const prefix = DOC_PREFIXES.find((p) => path === p || path.startsWith(p + '/'));
  if (!prefix) return { isDownload: false };
  const file = decodeURIComponent(path.split('/').pop() || '');
  const ext = file.includes('.') ? file.split('.').pop().toLowerCase() : '';
  // /document/* always serves a document; the other endpoints require a known file extension so
  // their bare/index paths (e.g. the redirected bare /press-releases) don't count.
  if (prefix !== '/document' && !FILE_EXTENSIONS.has(ext)) return { isDownload: false };
  return { isDownload: true, file: file || path, ext };
}

// True if the Referer is one of our own hosts — i.e. the download likely began as an on-page
// click the client listener already recorded. Missing/unparseable Referer counts as off-site.
function isOnsiteReferer(referer, ownSuffixes) {
  if (!referer) return false;
  try {
    const host = new URL(referer).hostname.toLowerCase();
    return ownSuffixes.some((s) => host === s || host.endsWith('.' + s));
  } catch { return false; }
}

function isLikelyBot(ua) {
  const s = (ua || '').trim();
  if (!s) return true; // no UA -> not a real browser
  return BOT_RE.test(s);
}

// Extract the GA4 client id from a request Cookie header's `_ga` value, or null. The cookie looks
// like `_ga=GA1.1.1234567890.1680000000`; GA4's client_id is the trailing `<rand>.<timestamp>`.
function gaClientIdFromCookie(cookieHeader) {
  if (typeof cookieHeader !== 'string' || !cookieHeader) return null;
  const m = cookieHeader.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!m) return null;
  const parts = decodeURIComponent(m[1]).split('.');
  if (parts.length < 4) return null; // expect GA1.<ver>.<rand>.<ts>
  const id = parts.slice(2).join('.');
  return /^\d+\.\d+$/.test(id) ? id : null;
}

// Express middleware factory. Options (all optional):
//   salt          — IP-hash salt (API_USAGE_SALT) for the fallback client id
//   measurementId — web-property GA4 MP measurement id (enables the feed with apiSecret)
//   apiSecret     — web-property GA4 MP api secret
//   ownHosts      — our own host suffixes for the Referer test (default ['onrr.gov'])
//   log/sendGa4/now — overridable sink/sender/clock for tests
function downloadAnalyticsMiddleware(opts = {}) {
  const salt = opts.salt || '';
  const ga4 = opts.measurementId && opts.apiSecret
    ? { measurementId: opts.measurementId, apiSecret: opts.apiSecret }
    : null;
  const ownSuffixes = opts.ownHosts || ['onrr.gov'];
  const log = opts.log || ((rec) => console.log(JSON.stringify(rec)));
  const sender = opts.sendGa4 || sendGa4;
  const now = opts.now || (() => Date.now());

  return function downloadAnalytics(req, res, next) {
    if (req.method !== 'GET') return next();
    const cls = classifyDownload(req.originalUrl);
    if (!cls.isDownload) return next();

    const start = now();
    res.on('finish', () => {
      try {
        // Count only a real delivery. 206 covers ranged/resumed downloads; 301/304/404/5xx aren't.
        if (res.statusCode !== 200 && res.statusCode !== 206) return;

        const onsite = isOnsiteReferer(req.headers['referer'], ownSuffixes);
        const bot = isLikelyBot(req.headers['user-agent']);
        const client = gaClientIdFromCookie(req.headers['cookie'])
          || hashClient(req.headers['x-forwarded-for'], salt);
        const toGa4 = Boolean(ga4) && !onsite && !bot;

        log({
          evt: 'file_download',
          '@timestamp': new Date(start).toISOString(),
          file_name: cls.file,
          file_extension: cls.ext,
          path: String(req.originalUrl).split('?')[0],
          status: res.statusCode,
          onsite,
          bot,
          ga4: toGa4,
          client,
          ua: req.headers['user-agent'],
          tags: `dl_${cls.ext || 'none'} ${onsite ? 'onsite' : 'offsite'} ${bot ? 'bot' : 'human'} st_${res.statusCode}`,
        });

        // GA4 only for the blind spot: off-site/direct, non-bot deliveries — so client and server
        // events stay mutually exclusive in the web property.
        if (toGa4) {
          sender({
            client_id: client,
            events: [{
              name: 'file_download',
              params: {
                file_name: cls.file,
                file_extension: cls.ext,
                measurement_source: 'server',
                engagement_time_msec: 1,
              },
            }],
          }, ga4);
        }
      } catch { /* analytics must never affect the response */ }
    });

    next();
  };
}

module.exports = {
  classifyDownload,
  isOnsiteReferer,
  isLikelyBot,
  gaClientIdFromCookie,
  downloadAnalyticsMiddleware,
};
