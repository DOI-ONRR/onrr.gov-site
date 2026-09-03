const express = require('express');
const https = require('https');
const { URL } = require('url');

const app = express();
app.use(express.json());

const CMS_HOST = process.env.CMS_HOST;
const FRONTEND_HOST = process.env.FRONTEND_HOST;
const PORT = 61443;

const PROXY_PATHS = [
  '/assets', '/items', '/document', '/press-releases',
  '/reporter-letters', '/unbundling'
];

// Public data API. Friendly dataset names -> the denormalized flat collections in the CMS.
// Exposed two ways, both mapping here: the `data.onrr.gov` subdomain (host-based, e.g.
// data.onrr.gov/disbursements) and a path alias on the main domain (onrr.gov/data/
// disbursements). Keeping the map here hides both `/items/` and the internal `_flat`
// suffix from consumers. Read-only (GET); everything else is rejected before the CMS.
const DATASET_MAP = {
  disbursements: 'disbursement_flat',
  revenue: 'revenue_flat',
  production: 'production_flat',
};
const DOCS_URL = 'https://onrr.gov/developers';

function proxyRequest(req, res, options, isGraphQL = false) {
  const proxyRequest = https.request(options, (proxyRes) => {
    if (proxyRes.statusCode >= 400) {
      console.error("External Server Error", proxyRes.statusCode);
      return res.status(proxyRes.statusCode).send("Error from external server");
    }

    // Override X-Frame-Options to allow embedding in CMS
    const headers = { ...proxyRes.headers };
    headers['x-frame-options'] = 'SAMEORIGIN';
    headers['content-security-policy'] = "frame-ancestors 'self' https://preview-onrr-cms.app.cloud.gov";

    res.writeHead(proxyRes.statusCode, headers);

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