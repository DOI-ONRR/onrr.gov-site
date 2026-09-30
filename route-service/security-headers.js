// Who may frame pages served through the route service: the site itself, plus
// this environment's CMS so its live preview can embed the site. Set per
// environment with FRAME_ANCESTORS (space-separated CSP sources).
const DEFAULT_FRAME_ANCESTORS = "'self'";

function frameAncestors(env = process.env) {
  const value = (env.FRAME_ANCESTORS || '').trim();
  return value ? `'self' ${value}` : DEFAULT_FRAME_ANCESTORS;
}

// Headers to send to the browser for a proxied response. The upstream
// Content-Security-Policy is kept (Directus sends `default-src 'none'` for
// /assets, which stops script in uploaded SVG/HTML files from running on the
// site's origin); a frame-ancestors directive is only added when the upstream
// policy doesn't have one.
function securityHeaders(upstreamHeaders, env = process.env) {
  const headers = { ...upstreamHeaders };
  const directive = `frame-ancestors ${frameAncestors(env)}`;
  const csp = headers['content-security-policy'];

  if (!csp) {
    headers['content-security-policy'] = directive;
  } else if (!/(^|;)\s*frame-ancestors(\s|;|$)/i.test(csp)) {
    headers['content-security-policy'] = `${csp.replace(/;\s*$/, '')}; ${directive}`;
  }

  // Legacy fallback for browsers without frame-ancestors support.
  headers['x-frame-options'] = 'SAMEORIGIN';
  return headers;
}

module.exports = { securityHeaders, frameAncestors };
