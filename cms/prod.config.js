module.exports = function(env) {
  const vcap_services = JSON.parse(env.VCAP_SERVICES)
  const vcap_application = JSON.parse(env.VCAP_APPLICATION)

  console.log('env ----------> ', env)

  return {
    PORT: process.env.PORT || 8055,
    PUBLIC_URL: `https://${ vcap_application.uris[0] }`,
    LOG_LEVEL: "info",
    LOG_STYLE: "pretty",

    KEY: vcap_application.application_id,
    SECRET: vcap_application.application_version,

    DB_CLIENT: "pg",
    DB_HOST: vcap_services['aws-rds'][0].credentials.host,
    DB_PORT: vcap_services['aws-rds'][0].credentials.port,
    DB_DATABASE: vcap_services['aws-rds'][0].credentials.name,
    DB_USER: vcap_services['aws-rds'][0].credentials.username,
    DB_PASSWORD: vcap_services['aws-rds'][0].credentials.password,
    STORAGE_LOCATIONS: "aws",
    STORAGE_AWS_DRIVER: "s3",
    STORAGE_AWS_KEY: vcap_services['s3'][0].credentials.access_key_id,
    STORAGE_AWS_SECRET: vcap_services['s3'][0].credentials.secret_access_key,
    STORAGE_AWS_ENDPOINT: vcap_services['s3'][0].credentials.endpoint,
    STORAGE_AWS_BUCKET: vcap_services['s3'][0].credentials.bucket,
    STORAGE_AWS_REGION: vcap_services['s3'][0].credentials.region,
    
    // CACHE_ENABLED: true,
    // CACHE_STORE: "redis",
    // CACHE_REDIS: "redis://cache:6379",
    CACHE_AUTO_PURGE: true,
    ADMIN_EMAIL: `${ vcap_application.organization_name }@onrr.gov`,
    ADMIN_PASSWORD: vcap_application.organization_id,
    
    EMAIL_SENDMAIL_NEW_LINE: "unix",
    EMAIL_SENDMAIL_PATH: "/usr/sbin/sendmail",
    EMAIL_FROM: "no-reply@directus.io", 
    EMAIL_TRANSPORT: "sendmail",
    GITHUB_TOKEN: env.GITHUB_TOKEN,

    // https://github.com/directus/directus/releases
    CORS_ENABLED: true,
    CORS_ORIGIN: 'array:https://prod-onrr-cms.app.cloud.gov,https://prod-onrr-frontend.app.cloud.gov,https://beta.onrr.gov,http://0.0.0.0:8055'
  }
};
