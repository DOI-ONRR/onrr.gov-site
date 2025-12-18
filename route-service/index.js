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

function proxyRequest(req, res, options, isGraphQL = false) {
  const proxyRequest = https.request(options, (proxyRes) => {
    if (proxyRes.statusCode >= 400) {
      console.error("External Server Error", proxyRes.statusCode);
      return res.status(proxyRes.statusCode).send("Error from external server");
    }

    res.writeHead(proxyRes.statusCode, proxyRes.headers);

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

app.all('*', (req, res) => {
  const requestedPath = req.originalUrl.split('?')[0];
  const isProxyPath = PROXY_PATHS.some(path => requestedPath.startsWith(path));

  if (requestedPath === '/graphql') {
    try {
      const postData = JSON.stringify({
        query: req.body.query,
        variables: req.body.variables || {},
      });

      const options = {
        hostname: CMS_HOST,
        port: PORT,
        path: req.originalUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
        },
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