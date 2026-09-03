module.exports = function (env) {
  const vcap_services = JSON.parse(env.VCAP_SERVICES)
  const vcap_application = JSON.parse(env.VCAP_APPLICATION)

  const redis = vcap_services['aws-elasticache-redis']?.[0]?.credentials

  return {
    PORT: process.env.PORT || 8055,
    PUBLIC_URL: `https://${ vcap_application.uris[0] }`,
    LOG_STYLE: "pretty",

    KEY: vcap_application.application_id,
    SECRET: vcap_application.application_version,

    DB_CLIENT: "pg",
    DB_HOST: vcap_services['aws-rds'][0].credentials.host,
    DB_PORT: vcap_services['aws-rds'][0].credentials.port,
    DB_DATABASE: vcap_services['aws-rds'][0].credentials.name,
    DB_USER: vcap_services['aws-rds'][0].credentials.username,
    DB_PASSWORD: vcap_services['aws-rds'][0].credentials.password,
    DB_SSL: true,
    STORAGE_LOCATIONS: "aws",
    STORAGE_AWS_DRIVER: "s3",
    STORAGE_AWS_KEY: vcap_services['s3'][0].credentials.access_key_id,
    STORAGE_AWS_SECRET: vcap_services['s3'][0].credentials.secret_access_key,
    STORAGE_AWS_ENDPOINT: vcap_services['s3'][0].credentials.endpoint,
    STORAGE_AWS_BUCKET: vcap_services['s3'][0].credentials.bucket,
    STORAGE_AWS_REGION: vcap_services['s3'][0].credentials.region,
    
    // Redis-backed cache + synchronization only when an elasticache service is
    // bound. Instances without Redis (e.g. the single-instance upgrade box) run
    // with caching disabled and the default in-memory synchronization store.
    ...(redis
      ? {
          CACHE_ENABLED: true,
          CACHE_STORE: 'redis',
          CACHE_AUTO_PURGE: true,
          CACHE_TTL: '30m',
          CACHE_STATUS_HEADER: 'X-Cache-Status',

          REDIS: `rediss://:${encodeURIComponent(redis.password)}@${redis.host}:${redis.port}`,

          SYNCHRONIZATION_STORE: 'redis',
          SYNCHRONIZATION_NAMESPACE: 'directus-sync',

          // Origin rate-limit backstop for the public data API. GLOBAL (not per-IP):
          // behind CloudFront -> route-service the client IP arrives only inside a
          // multi-hop X-Forwarded-For chain (with rotating CloudFront edge IPs), so a
          // per-IP limiter here can't key reliably. Per-IP throttling belongs at the
          // edge (CloudFront/WAF, which sees the real client IP); this is just a shared
          // (Redis-backed, counted across both prod instances) ceiling that protects the
          // DB from a runaway. Most repeat traffic is absorbed by the 30m response cache,
          // so this should rarely trip — tune POINTS/DURATION once there's real load data.
          RATE_LIMITER_GLOBAL_ENABLED: true,
          RATE_LIMITER_GLOBAL_STORE: 'redis',
          RATE_LIMITER_GLOBAL_POINTS: 1000,
          RATE_LIMITER_GLOBAL_DURATION: 1,
        }
      : {
          CACHE_ENABLED: false,
        }),

    ADMIN_EMAIL: `${vcap_application.organization_name}@onrr.gov`,
    ADMIN_PASSWORD: vcap_application.organization_id,

    EMAIL_SENDMAIL_NEW_LINE: "unix",
    EMAIL_SENDMAIL_PATH: "/usr/sbin/sendmail",
    EMAIL_FROM: "no-reply@directus.io", 
    EMAIL_TRANSPORT: "sendmail",
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    // Directus v12 license key. Set the secret per-app via `cf set-env <app>
    // LICENSE_KEY <key>` (not committed). Activates against this instance's
    // PUBLIC_URL on first use. Do NOT also set LICENSE_TOKEN — one or the other.
    LICENSE_KEY: env.LICENSE_KEY,
    MAX_RELATIONAL_DEPTH: 200,
    CORS_ENABLED: true,
    CMS_TOKEN: env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_AUTH_TOKEN,
    FLOWS_ENV_ALLOW_LIST: "UPSTREAM_URL,PUBLIC_URL,CMS_TOKEN,DIRECTUS_PUBLIC_HOST",

    SERVER_KEEP_ALIVE_TIMEOUT: 90000 // in ms; must match proxy_read_timeout value in frontend nginx config
  }
};